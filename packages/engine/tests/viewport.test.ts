import { describe, expect, it } from 'vitest';
import {
  fitToViewport,
  MAX_SCALE,
  MIN_SCALE,
  panBy,
  toClipTransform,
  zoomAt,
} from '../src/viewport';

const IMAGE_4K = { width: 3840, height: 2160 } as const;
const CANVAS = { width: 1920, height: 1080 } as const;

describe('fitToViewport', () => {
  it('ajusta al lado mas restrictivo y centra', () => {
    const viewport = fitToViewport(IMAGE_4K, CANVAS);
    expect(viewport.scale).toBeCloseTo(0.5);
    expect(viewport.x).toBeCloseTo(0);
    expect(viewport.y).toBeCloseTo(0);
  });

  it('centra la imagen cuando sobra espacio en un eje', () => {
    const viewport = fitToViewport({ width: 1000, height: 1000 }, CANVAS);
    expect(viewport.scale).toBeCloseTo(1.08);
    expect(viewport.x).toBeCloseTo((1920 - 1080) / 2);
  });
});

describe('zoomAt', () => {
  it('mantiene fijo el punto bajo el puntero', () => {
    const start = fitToViewport(IMAGE_4K, CANVAS);
    const pointer = { x: 640, y: 400 };
    const imageUnderPointer = {
      x: (pointer.x - start.x) / start.scale,
      y: (pointer.y - start.y) / start.scale,
    };

    const zoomed = zoomAt(start, pointer, 2.5);

    expect(zoomed.x + imageUnderPointer.x * zoomed.scale).toBeCloseTo(pointer.x);
    expect(zoomed.y + imageUnderPointer.y * zoomed.scale).toBeCloseTo(pointer.y);
  });

  it('respeta los limites de escala', () => {
    const start = fitToViewport(IMAGE_4K, CANVAS);
    expect(zoomAt(start, { x: 0, y: 0 }, 10_000).scale).toBe(MAX_SCALE);
    expect(zoomAt(start, { x: 0, y: 0 }, 0.000_01).scale).toBe(MIN_SCALE);
  });
});

describe('panBy', () => {
  it('desplaza sin tocar la escala', () => {
    const moved = panBy({ x: 10, y: 20, scale: 2 }, -5, 7);
    expect(moved).toEqual({ x: 5, y: 27, scale: 2 });
  });
});

describe('toClipTransform', () => {
  it('mapea la imagen ajustada a todo el clip space', () => {
    const [scaleX, scaleY, offsetX, offsetY] = toClipTransform(
      fitToViewport(IMAGE_4K, CANVAS),
      IMAGE_4K,
      CANVAS,
    );
    // Esquina superior izquierda en (-1, 1) y la inferior derecha en (1, -1).
    expect(offsetX).toBeCloseTo(-1);
    expect(offsetY).toBeCloseTo(1);
    expect(offsetX + scaleX).toBeCloseTo(1);
    expect(offsetY + scaleY).toBeCloseTo(-1);
  });
});
