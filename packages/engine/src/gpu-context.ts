import { err, ok, type Result } from '@stratum/core';

export interface GpuContext {
  readonly device: GPUDevice;
  readonly context: GPUCanvasContext;
  readonly format: GPUTextureFormat;
  readonly adapterInfo: GPUAdapterInfo | null;
}

/**
 * Sin WebGPU la app debe avisar con honestidad en vez de degradarse en silencio
 * (architecture.md §4). Por eso esto devuelve Result y nunca lanza.
 */
export async function createGpuContext(canvas: HTMLCanvasElement): Promise<Result<GpuContext>> {
  if (!('gpu' in navigator)) {
    return err('Este navegador no expone WebGPU (navigator.gpu).');
  }

  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
  if (!adapter) {
    return err('WebGPU esta presente pero no hay adaptador disponible.');
  }

  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu');
  if (!context) {
    return err('El canvas no devolvio un contexto WebGPU.');
  }

  // Sin conversion sRGB: el spike solo hace blit. El espacio lineal RGBA16F
  // llega con el compositor real (architecture.md §4).
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'opaque' });

  return ok({ device, context, format, adapterInfo: adapter.info ?? null });
}
