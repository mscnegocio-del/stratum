import { describe, expect, it } from 'vitest';
import { layoutVisibleTiles, tileKey } from '../src/tile-grid';

const IMAGE_4K = { width: 3840, height: 2160 } as const; // 15 tiles exactos x, 8.4375 en y
const FIT_VIEWPORT = { x: 0, y: 0, scale: 1 } as const;

describe('layoutVisibleTiles', () => {
  it('cubre toda la imagen sin margen cuando el canvas es exactamente la imagen', () => {
    const tiles = layoutVisibleTiles(FIT_VIEWPORT, IMAGE_4K, IMAGE_4K, 256, 0);
    // 15 columnas x 9 filas (la ultima fila es una tile parcial de 112 px)
    expect(tiles).toHaveLength(15 * 9);
  });

  it('recorta el tamaño en pixeles de las tiles de borde', () => {
    const tiles = layoutVisibleTiles(FIT_VIEWPORT, IMAGE_4K, IMAGE_4K, 256, 0);
    const lastRow = tiles.filter((t) => t.ty === 8);
    expect(lastRow.every((t) => t.pixelHeight === 2160 - 8 * 256)).toBe(true);
    const fullTile = tiles.find((t) => t.tx === 0 && t.ty === 0);
    expect(fullTile?.pixelWidth).toBe(256);
    expect(fullTile?.pixelHeight).toBe(256);
  });

  it('nunca genera coordenadas fuera de la grilla de la imagen', () => {
    const tiles = layoutVisibleTiles(FIT_VIEWPORT, IMAGE_4K, IMAGE_4K, 256, 3);
    expect(tiles.every((t) => t.tx >= 0 && t.ty >= 0)).toBe(true);
    expect(tiles.every((t) => t.tx < 15 && t.ty < 9)).toBe(true);
  });

  it('agranda el area visible con margen, acotado a la grilla', () => {
    const small = layoutVisibleTiles(FIT_VIEWPORT, IMAGE_4K, { width: 300, height: 300 }, 256, 0);
    const withMargin = layoutVisibleTiles(
      FIT_VIEWPORT,
      IMAGE_4K,
      { width: 300, height: 300 },
      256,
      1,
    );
    expect(withMargin.length).toBeGreaterThan(small.length);
  });

  it('no devuelve tiles cuando la imagen esta paneada fuera de vista', () => {
    const panned = { x: -100_000, y: 0, scale: 1 };
    expect(layoutVisibleTiles(panned, IMAGE_4K, { width: 800, height: 600 }, 256, 0)).toHaveLength(
      0,
    );
  });

  it('ubica la tile (0,0) en el origen de pantalla cuando el viewport no tiene offset', () => {
    const tiles = layoutVisibleTiles(FIT_VIEWPORT, IMAGE_4K, IMAGE_4K, 256, 0);
    const origin = tiles.find((t) => t.tx === 0 && t.ty === 0);
    expect(origin).toMatchObject({ screenX: 0, screenY: 0, screenWidth: 256, screenHeight: 256 });
  });

  it('escala la posicion de pantalla de una tile segun el zoom', () => {
    const tiles = layoutVisibleTiles({ x: 10, y: 20, scale: 2 }, IMAGE_4K, IMAGE_4K, 256, 0);
    const tile = tiles.find((t) => t.tx === 1 && t.ty === 0);
    expect(tile).toMatchObject({ screenX: 256 * 2 + 10, screenY: 20, screenWidth: 512 });
  });
});

describe('tileKey', () => {
  it('es estable y distingue coordenadas', () => {
    expect(tileKey(1, 2)).toBe('1,2');
    expect(tileKey(1, 2)).not.toBe(tileKey(2, 1));
  });
});
