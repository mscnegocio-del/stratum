import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const srcDir = join(import.meta.dirname, '../src');
const css = readFileSync(join(srcDir, 'tokens.css'), 'utf8');

/** Extrae `--nombre: #hex;` del primer bloque que empieza con `selector {`. */
function readTheme(selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`No se encontro el bloque ${selector} en tokens.css`);
  const block = css.slice(start, css.indexOf('}', start));
  const tokens = new Map<string, string>();
  for (const match of block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/gi)) {
    const [, name, value] = match;
    if (name && value) tokens.set(name, value);
  }
  return tokens;
}

function luminance(hex: string): number {
  const channel = (offset: number) => {
    const v = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const AA = 4.5;
const AA_NON_TEXT = 3; // WCAG 1.4.11: bordes de foco, iconos

// Pares texto/fondo que la UI usa de verdad. Si un token nuevo se usa como texto, agregarlo aqui.
const textPairs: ReadonlyArray<readonly [fg: string, bgs: readonly string[], min: number]> = [
  ['text-primary', ['bg-app', 'bg-canvas', 'bg-panel', 'bg-elevated', 'bg-hover', 'bg-active'], AA],
  [
    'text-secondary',
    ['bg-app', 'bg-canvas', 'bg-panel', 'bg-elevated', 'bg-hover', 'bg-active'],
    AA,
  ],
  ['text-muted', ['bg-app', 'bg-canvas', 'bg-panel'], AA],
  ['accent', ['bg-app', 'bg-panel', 'bg-elevated'], AA],
  ['accent', ['bg-hover', 'bg-active'], AA_NON_TEXT],
  ['on-accent', ['accent-fill', 'accent-fill-hover'], AA],
  ['ai', ['bg-panel', 'bg-elevated'], AA],
  ['danger', ['bg-panel', 'bg-elevated'], AA],
  ['success', ['bg-panel', 'bg-elevated'], AA],
  ['warning', ['bg-panel', 'bg-elevated'], AA],
];

describe.each([
  ['oscuro', ':root,\n[data-theme="dark"]'],
  ['claro', '[data-theme="light"]'],
])('tema %s', (_name, selector) => {
  const theme = readTheme(selector);

  it.each(textPairs.flatMap(([fg, bgs, min]) => bgs.map((bg) => [fg, bg, min] as const)))(
    '%s sobre %s cumple contraste >= %s',
    (fg, bg, min) => {
      const a = theme.get(fg);
      const b = theme.get(bg);
      expect(a, `falta --${fg}`).toBeDefined();
      expect(b, `falta --${bg}`).toBeDefined();
      expect(contrast(a as string, b as string)).toBeGreaterThanOrEqual(min);
    },
  );
});

describe('componentes', () => {
  const files = readdirSync(srcDir).filter((f) => f.endsWith('.tsx'));

  it.each(files)('%s no usa colores sueltos (solo tokens)', (file) => {
    const source = readFileSync(join(srcDir, file), 'utf8');
    expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(/i);
  });
});
