import type { BlendMode, CompositorLayer } from '@stratum/engine';
import { BLEND_MULTIPLY, BLEND_NORMAL } from '@stratum/engine';

/**
 * Genera N capas de prueba por codigo (sin binario en el repo). La capa 0 es opaca de
 * borde a borde para que nunca se vea el color de "clear" del canvas; el resto alterna
 * Normal/Multiply con opacidad parcial, que es el caso de blending mas costoso en GPU.
 */
export async function createTestLayers(
  count: number,
  width = 3840,
  height = 2160,
): Promise<CompositorLayer[]> {
  const layers: CompositorLayer[] = [];

  for (let i = 0; i < count; i += 1) {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('OffscreenCanvas no devolvio un contexto 2d');
    }

    if (i === 0) {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#12324f');
      gradient.addColorStop(1, '#2b1a3d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      const hue = (i * 47) % 360;
      for (let s = 0; s < 26; s += 1) {
        const radius = 60 + ((s * 53 + i * 31) % 340);
        ctx.beginPath();
        ctx.arc((s * 337 + i * 211) % width, (s * 197 + i * 401) % height, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 70%, 55%, 0.55)`;
        ctx.fill();
      }
    }

    const blendMode: BlendMode = i === 0 || i % 2 === 0 ? BLEND_NORMAL : BLEND_MULTIPLY;
    layers.push({
      bitmap: await createImageBitmap(canvas),
      blendMode,
      opacity: i === 0 ? 1 : 0.5 + (i % 5) * 0.08,
    });
  }

  return layers;
}
