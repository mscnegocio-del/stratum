import { TILE_SIZE } from '@stratum/core';
import type { Size, Viewport } from './viewport';

export interface TileRect {
  readonly tx: number;
  readonly ty: number;
  /** Tamaño real en pixeles de imagen: las tiles de borde son mas chicas que TILE_SIZE. */
  readonly pixelWidth: number;
  readonly pixelHeight: number;
  /** Posicion y tamaño en pixeles de canvas (device pixels), listos para clip space. */
  readonly screenX: number;
  readonly screenY: number;
  readonly screenWidth: number;
  readonly screenHeight: number;
}

/**
 * Tiles visibles (+margen) para el viewport dado, con su rect de pantalla ya resuelto.
 * Es la base de la residencia GPU de architecture.md §4: "Solo tiles visibles (+margen)
 * residen en GPU". No incluye LRU ni presupuesto de VRAM (eso es S1-03).
 */
export function layoutVisibleTiles(
  viewport: Viewport,
  image: Size,
  canvas: Size,
  tileSize: number = TILE_SIZE,
  margin = 1,
): TileRect[] {
  if (image.width <= 0 || image.height <= 0 || viewport.scale <= 0) {
    return [];
  }

  const tileCountX = Math.ceil(image.width / tileSize);
  const tileCountY = Math.ceil(image.height / tileSize);

  const imageLeft = -viewport.x / viewport.scale;
  const imageTop = -viewport.y / viewport.scale;
  const imageRight = (canvas.width - viewport.x) / viewport.scale;
  const imageBottom = (canvas.height - viewport.y) / viewport.scale;

  const minTx = Math.max(0, Math.floor(imageLeft / tileSize) - margin);
  const minTy = Math.max(0, Math.floor(imageTop / tileSize) - margin);
  const maxTx = Math.min(tileCountX - 1, Math.floor(imageRight / tileSize) + margin);
  const maxTy = Math.min(tileCountY - 1, Math.floor(imageBottom / tileSize) + margin);

  const tiles: TileRect[] = [];
  for (let ty = minTy; ty <= maxTy; ty += 1) {
    for (let tx = minTx; tx <= maxTx; tx += 1) {
      const pixelWidth = Math.min(tileSize, image.width - tx * tileSize);
      const pixelHeight = Math.min(tileSize, image.height - ty * tileSize);
      tiles.push({
        tx,
        ty,
        pixelWidth,
        pixelHeight,
        screenX: tx * tileSize * viewport.scale + viewport.x,
        screenY: ty * tileSize * viewport.scale + viewport.y,
        screenWidth: pixelWidth * viewport.scale,
        screenHeight: pixelHeight * viewport.scale,
      });
    }
  }
  return tiles;
}

export function tileKey(tx: number, ty: number): string {
  return `${tx},${ty}`;
}
