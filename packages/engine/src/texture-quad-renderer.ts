import type { GpuContext } from './gpu-context';
import quadShader from './shaders/quad.wgsl?raw';
import { type Size, toClipTransform, type Viewport } from './viewport';

const TRANSFORM_BYTES = 16; // vec4<f32>

/**
 * Dibuja una textura como quad con zoom/pan. Es el camino minimo para medir
 * si WebGPU sostiene 60 fps con una imagen 4K (S0-08); el compositor por tiles
 * y los blend modes llegan en Sprint 1.
 */
export class TextureQuadRenderer {
  private readonly gpu: GpuContext;
  private readonly pipeline: GPURenderPipeline;
  private readonly uniformBuffer: GPUBuffer;
  private readonly bindGroup: GPUBindGroup;
  private readonly transform = new Float32Array(4);
  readonly imageSize: Size;

  private constructor(
    gpu: GpuContext,
    imageSize: Size,
    pipeline: GPURenderPipeline,
    uniformBuffer: GPUBuffer,
    bindGroup: GPUBindGroup,
  ) {
    this.gpu = gpu;
    this.imageSize = imageSize;
    this.pipeline = pipeline;
    this.uniformBuffer = uniformBuffer;
    this.bindGroup = bindGroup;
  }

  static create(gpu: GpuContext, image: ImageBitmap): TextureQuadRenderer {
    const { device } = gpu;
    const imageSize: Size = { width: image.width, height: image.height };

    const texture = device.createTexture({
      size: [image.width, image.height],
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
    device.queue.copyExternalImageToTexture({ source: image }, { texture }, [
      image.width,
      image.height,
    ]);

    const module = device.createShaderModule({ code: quadShader, label: 'quad.wgsl' });
    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: { module, entryPoint: 'vertexMain' },
      fragment: { module, entryPoint: 'fragmentMain', targets: [{ format: gpu.format }] },
      primitive: { topology: 'triangle-strip' },
    });

    const uniformBuffer = device.createBuffer({
      size: TRANSFORM_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uniformBuffer } },
        { binding: 1, resource: texture.createView() },
        // Lineal en ambos sentidos: sin mipmaps el zoom alejado aliasea,
        // por eso architecture.md §4 pide mipmaps por tile en el motor real.
        {
          binding: 2,
          resource: device.createSampler({ magFilter: 'linear', minFilter: 'linear' }),
        },
      ],
    });

    return new TextureQuadRenderer(gpu, imageSize, pipeline, uniformBuffer, bindGroup);
  }

  render(viewport: Viewport, canvasSize: Size): void {
    const { device, context } = this.gpu;
    this.transform.set(toClipTransform(viewport, this.imageSize, canvasSize));
    device.queue.writeBuffer(this.uniformBuffer, 0, this.transform);

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.13, g: 0.13, b: 0.13, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(4);
    pass.end();
    device.queue.submit([encoder.finish()]);
  }
}
