export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** Posicion de la imagen en el canvas: esquina superior izquierda en px + escala. */
export interface Viewport {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

export const MIN_SCALE = 0.02;
export const MAX_SCALE = 32;

const clampScale = (scale: number): number => Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

export function fitToViewport(image: Size, canvas: Size, padding = 0): Viewport {
  const available: Size = {
    width: Math.max(1, canvas.width - padding * 2),
    height: Math.max(1, canvas.height - padding * 2),
  };
  const scale = clampScale(
    Math.min(available.width / image.width, available.height / image.height),
  );
  return centerAt(scale, image, canvas);
}

export function centerAt(scale: number, image: Size, canvas: Size): Viewport {
  const clamped = clampScale(scale);
  return {
    scale: clamped,
    x: (canvas.width - image.width * clamped) / 2,
    y: (canvas.height - image.height * clamped) / 2,
  };
}

/** Zoom manteniendo fijo el pixel que esta bajo el puntero. */
export function zoomAt(viewport: Viewport, pointer: Point, factor: number): Viewport {
  const scale = clampScale(viewport.scale * factor);
  const applied = scale / viewport.scale;
  return {
    scale,
    x: pointer.x - (pointer.x - viewport.x) * applied,
    y: pointer.y - (pointer.y - viewport.y) * applied,
  };
}

export function panBy(viewport: Viewport, dx: number, dy: number): Viewport {
  return { ...viewport, x: viewport.x + dx, y: viewport.y + dy };
}

/**
 * Convierte el viewport a (scaleX, scaleY, offsetX, offsetY) en clip space,
 * que es lo unico que necesita el vertex shader del quad.
 */
export function toClipTransform(
  viewport: Viewport,
  image: Size,
  canvas: Size,
): readonly [number, number, number, number] {
  return [
    (2 * image.width * viewport.scale) / canvas.width,
    (-2 * image.height * viewport.scale) / canvas.height,
    (2 * viewport.x) / canvas.width - 1,
    1 - (2 * viewport.y) / canvas.height,
  ];
}
