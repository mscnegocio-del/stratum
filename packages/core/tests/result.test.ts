import { describe, expect, it } from 'vitest';
import { err, isOk, ok, TILE_SIZE } from '../src/index';

describe('Result', () => {
  it('envuelve un valor correcto', () => {
    const result = ok(42);
    expect(isOk(result)).toBe(true);
    expect(result).toEqual({ ok: true, value: 42 });
  });

  it('envuelve un error sin lanzar', () => {
    const result = err('archivo no soportado');
    expect(isOk(result)).toBe(false);
  });
});

describe('tiles', () => {
  it('usa tiles de 256 px (ADR-006)', () => {
    expect(TILE_SIZE).toBe(256);
  });
});
