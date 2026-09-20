import { TILE_SIZE } from '@stratum/core';
import type { GpuContext } from './gpu-context';
import blendSource from './shaders/blend.wgsl?raw';
import tileCompositeSource from './shaders/tile-composite.wgsl?raw';
import { layoutVisibleTiles, type TileRect, tileKey } from './tile-grid';
import type { Size, Viewport } from './viewport';

export const BLEND_NORMAL = 0;
export const BLEND_MULTIPLY = 1;
export type BlendMode = typeof BLEND_NORMAL | typeof BLEND_MULTIPLY;

export interface CompositorLayer {
  readonly bitmap: ImageBitmap;
  readonly blendMode: BlendMode;
  readonly opacity: number;
}

const MAX_LAYERS = 20;
/**
 * Cuantas tiles nuevas se suben a GPU por frame. Sin este tope, un "ajustar a pantalla"
 * o un zoom-out grande hace visibles decenas de tiles de golpe y cada copyExternalImageToTexture
 * es, por spec, un blit interno — con 135 tiles x 20 capas eso fue un frame de minutos en
 * SwiftShader durante el spike S0-09. Repartirlo en varios frames evita el cuelgue a costa
 * de un relleno progresivo (las tiles aun no subidas simplemente no se dibujan ese frame).
 */
const UPLOAD_BUDGET_PER_FRAME = 4;
const TILE_TRANSFORM_BYTES = 32; // vec4<f32> + vec2<f32> + u32 + u32
const LAYER_PARAMS_BYTES = MAX_LAYERS * 16; // array<vec4<f32>, MAX_LAYERS>

interface ResidentTile {
  readonly texture: GPUTexture;
  readonly transformBuffer: GPUBuffer;
  readonly bindGroup: GPUBindGroup;
}

/**
 * Compone N capas por tile, con solo las tiles visibles (+margen) residentes en GPU,
 * tal como pide architecture.md §4. Es la base real del compositor de S1-03, adelantada
 * como spike S0-09 para validar si el costo de blending por tile sostiene 60 fps.
 *
 * No implementa LRU con presupuesto de VRAM (eso es S1-03): las tiles que dejan de ser
 * visibles se destruyen de inmediato en vez de conservarse por si vuelven a entrar en vista.
 */
export class TileCompositor {
  private readonly gpu: GpuContext;
  private readonly pipeline: GPURenderPipeline;
  private readonly sampler: GPUSampler;
  private readonly layerParamsBuffer: GPUBuffer;
  private readonly layers: readonly CompositorLayer[];
  private readonly resident = new Map<string, ResidentTile>();
  readonly imageSize: Size;

  private constructor(
    gpu: GpuContext,
    pipeline: GPURenderPipeline,
    sampler: GPUSampler,
    layerParamsBuffer: GPUBuffer,
    layers: readonly CompositorLayer[],
    imageSize: Size,
  ) {
    this.gpu = gpu;
    this.pipeline = pipeline;
    this.sampler = sampler;
    this.layerParamsBuffer = layerParamsBuffer;
    this.layers = layers;
    this.imageSize = imageSize;
  }

  static create(gpu: GpuContext, layers: readonly CompositorLayer[]): TileCompositor {
    const firstLayer = layers[0];
    if (layers.length === 0 || layers.length > MAX_LAYERS || !firstLayer) {
      throw new Error(
        `TileCompositor admite entre 1 y ${MAX_LAYERS} capas (recibidas: ${layers.length})`,
      );
    }
    const imageSize: Size = { width: firstLayer.bitmap.width, height: firstLayer.bitmap.height };

    const { device } = gpu;
    const module = device.createShaderModule({
      code: `${blendSource}\n${tileCompositeSource}`,
      label: 'tile-composite.wgsl',
    });
    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: { module, entryPoint: 'vertexMain' },
      fragment: { module, entryPoint: 'fragmentMain', targets: [{ format: gpu.format }] },
      primitive: { topology: 'triangle-strip' },
    });
    const sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });

    const layerParamsBuffer = device.createBuffer({
      size: LAYER_PARAMS_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const params = new Float32Array(MAX_LAYERS * 4);
    layers.forEach((layer, i) => {
      params[i * 4] = layer.blendMode;
      params[i * 4 + 1] = layer.opacity;
    });
    device.queue.writeBuffer(layerParamsBuffer, 0, params);

    return new TileCompositor(gpu, pipeline, sampler, layerParamsBuffer, layers, imageSize);
  }

  /** Sube a GPU las tiles recien visibles y libera las que salieron de vista. */
  private sync(viewport: Viewport, canvas: Size): TileRect[] {
    const visible = layoutVisibleTiles(viewport, this.imageSize, canvas);
    const visibleKeys = new Set(visible.map((rect) => tileKey(rect.tx, rect.ty)));

    for (const [key, tile] of this.resident) {
      if (!visibleKeys.has(key)) {
        tile.texture.destroy();
        tile.transformBuffer.destroy();
        this.resident.delete(key);
      }
    }

    let uploadsLeft = UPLOAD_BUDGET_PER_FRAME;
    for (const rect of visible) {
      if (uploadsLeft <= 0) {
        break;
      }
      const key = tileKey(rect.tx, rect.ty);
      if (!this.resident.has(key)) {
        this.resident.set(key, this.uploadTile(rect));
        uploadsLeft -= 1;
      }
    }

    return visible;
  }

  private uploadTile(rect: TileRect): ResidentTile {
    const { device } = this.gpu;
    const texture = device.createTexture({
      size: [TILE_SIZE, TILE_SIZE, this.layers.length],
      format: 'rgba8unorm',
      // RENDER_ATTACHMENT es obligatorio para copyExternalImageToTexture: el spec lo
      // implementa internamente como un blit, no como una copia binaria pura.
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.layers.forEach((layer, i) => {
      device.queue.copyExternalImageToTexture(
        { source: layer.bitmap, origin: { x: rect.tx * TILE_SIZE, y: rect.ty * TILE_SIZE } },
        { texture, origin: [0, 0, i] },
        [rect.pixelWidth, rect.pixelHeight],
      );
    });

    const transformBuffer = device.createBuffer({
      size: TILE_TRANSFORM_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroup = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: transformBuffer } },
        { binding: 1, resource: { buffer: this.layerParamsBuffer } },
        { binding: 2, resource: texture.createView({ dimension: '2d-array' }) },
        { binding: 3, resource: this.sampler },
      ],
    });

    return { texture, transformBuffer, bindGroup };
  }

  private writeTileTransform(tile: ResidentTile, rect: TileRect, canvas: Size): void {
    const buffer = new ArrayBuffer(TILE_TRANSFORM_BYTES);
    const view = new DataView(buffer);
    view.setFloat32(0, (2 * rect.screenWidth) / canvas.width, true);
    view.setFloat32(4, (-2 * rect.screenHeight) / canvas.height, true);
    view.setFloat32(8, (2 * rect.screenX) / canvas.width - 1, true);
    view.setFloat32(12, 1 - (2 * rect.screenY) / canvas.height, true);
    view.setFloat32(16, rect.pixelWidth / TILE_SIZE, true);
    view.setFloat32(20, rect.pixelHeight / TILE_SIZE, true);
    view.setUint32(24, this.layers.length, true);
    view.setUint32(28, 0, true);
    this.gpu.device.queue.writeBuffer(tile.transformBuffer, 0, buffer);
  }

  /** Compone el frame; devuelve cuantas tiles fueron visibles (para el HUD del spike). */
  render(viewport: Viewport, canvas: Size): number {
    const visible = this.sync(viewport, canvas);
    const { device, context } = this.gpu;

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.08, g: 0.08, b: 0.08, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });
    pass.setPipeline(this.pipeline);

    for (const rect of visible) {
      const tile = this.resident.get(tileKey(rect.tx, rect.ty));
      if (!tile) {
        continue;
      }
      this.writeTileTransform(tile, rect, canvas);
      pass.setBindGroup(0, tile.bindGroup);
      pass.draw(4);
    }

    pass.end();
    device.queue.submit([encoder.finish()]);
    return visible.length;
  }
}
