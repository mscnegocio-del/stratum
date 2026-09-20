# Tareas y roadmap — Stratum
> Scrum light · Sprints de 2 semanas · Autor a medio tiempo con apoyo de IA
> Estados: ⬜ pendiente · 🔄 en progreso · ✅ hecho · ⛔ bloqueado

## Hitos
| Hito | Contenido | Estimado |
|---|---|---|
| v0.1 | Abrir, capas básicas, pincel, undo, exportar | fin Sprint 3 (~2 meses) |
| v0.3 | Editor usable: transformar, selecciones, máscaras, .stratum, autoguardado | fin Sprint 7 (~4 meses) |
| v0.5 | Ajustes, filtros, Command Palette completa, primer prototipo IA | fin Sprint 10 |
| v0.8 | Herramientas avanzadas + IA local completa | fin Sprint 15 |
| v1.0 | Pulido, benchmarks públicos, lanzamiento | fin Sprint 17 (~8–10 meses) |

## Épicas
E0 Fundaciones · E1 Canvas y motor · E2 Capas · E3 Historial · E4 Archivos/IO · E5 Transformar ·
E6 Selecciones · E7 Máscaras · E8 Pintura · E9 Ajustes/filtros · E10 Retoque · E11 IA local ·
E12 UX transversal (palette, HUD, contextual, i18n, a11y) · E13 Rendimiento · E14 Lanzamiento

---
## 🟦 Sprint 0 — Fundaciones (actual) · 2–3 semanas
Objetivo: base técnica y de diseño lista; riesgos de WebGPU despejados.
| ID | Tarea | Estado |
|---|---|---|
| S0-01 | Verificar soporte WebGPU por navegador (caniuse) y actualizar ADR-001 | ⬜ |
| S0-02 | Monorepo pnpm: apps/web + packages (core, engine, ui-kit, io, ai, workers, bench) | ⬜ |
| S0-03 | TS strict, Biome (lint+format), path aliases, `pnpm check` | ⬜ |
| S0-04 | Vitest + Playwright configurados con 1 test de ejemplo cada uno | ⬜ |
| S0-05 | CI GitHub Actions: check, test, build, bench (placeholder) | ⬜ |
| S0-06 | PWA base (manifest, service worker, offline) + deploy a GitHub Pages | ⬜ |
| S0-07 | Estudiar Graphite: dispatcher, brush GPU, persistence (2–3 días, notas en graphite-reference.md) | ⬜ |
| S0-08 | Spike WebGPU: textura 4K, zoom/pan 60 fps, medir | ⬜ |
| S0-09 | Spike: 20 capas tileadas con blend Normal/Multiply en WGSL | ⬜ |
| S0-10 | Diseño en Penpot/Figma: layout completo + tokens + 10 componentes clave | ⬜ |
| S0-11 | `packages/ui-kit`: tokens.css + Tailwind v4 @theme + página Kitchen Sink | ⬜ |
| S0-12 | README con posicionamiento, capturas del diseño, roadmap | ⬜ |
| S0-13 | Nombre definitivo: Stratum (verificado 2026-09-20) | ✅ |
DoD Sprint 0: spike a 60 fps medido, CI verde, diseño aprobado, deploy funcionando.

## Sprint 1 — Canvas y documento
S1-01 Core: Document, PixelLayer, Group, TileMap · S1-02 Command + History (snapshots de tiles) ·
S1-03 Engine: device, tile cache LRU, compositor Normal · S1-04 Canvas: zoom (rueda/pinch/atajos), pan (espacio), ajustar a pantalla ·
S1-05 Abrir PNG/JPEG/WebP (drop, diálogo, pegar) · S1-06 Shell UI: TitleBar, Toolbar, paneles vacíos, StatusBar

## Sprint 2 — Capas
S2-01 Panel Layers (LayerRow, drag & drop, renombrar inline, visibilidad, candado) · S2-02 Opacidad + 27 blend modes WGSL ·
S2-03 Carpetas y pass-through · S2-04 Duplicar/eliminar/combinar · S2-05 Miniaturas en OffscreenCanvas · S2-06 Tests invariantes undo

## Sprint 3 — Pincel y exportar → v0.1
S3-01 Pincel GPU (tamaño, dureza, opacidad, flujo, Shift línea) · S3-02 Borrador · S3-03 Cuentagotas + ColorPicker ·
S3-04 HUD de pincel · S3-05 Exportar PNG/JPEG/WebP con preview · S3-06 Panel History · S3-07 Demo pública + post "v0.1"

## Sprints 4–7 — Editor real → v0.3
Transformaciones no destructivas + distorsión + snapping/guías · Selecciones (marquee, lazo, poligonal) + sumar/restar ·
Máscaras de capa y clipping · Formato .stratum + autoguardado OPFS + recuperación · Pestañas multi-documento ·
Barra contextual · Recorte, tamaño de lienzo/imagen · Presión de lápiz · Benchmarks 1–3 en CI

## Sprints 8–10 — Ajustes y filtros → v0.5
Adjustment layers (Niveles, Curvas, Tono/Sat, Exposición, Mapa de degradado, Grano) con editores dedicados ·
Blur gaussiano/movimiento, ruido, invertir, corrección de lente · Command Palette completa ·
Antes/después con `\` · i18n es/en · Tema claro · **Prototipo IA: quitar fondo** (en paralelo)

## Sprints 11–13 — Herramientas avanzadas
Varita mágica (WASM si el benchmark lo exige) · Tampón de clonar · Pincel corrector puntual (PatchMatch) ·
Degradado y formas · Import PSD básico · HEIC/TIFF · Herramienta desenfocar

## Sprints 14–15 — IA local completa → v0.8
Relleno con IA (inpainting) + extender lienzo · Selección inteligente por clic · Corrector puntual con IA ·
Gestor de modelos · Benchmarks de IA

## Sprints 16–17 — Pulido y lanzamiento → v1.0
Auditoría a11y y rendimiento · Pruebas cross-browser · Landing page · Video demo 60–90 s ·
4 artículos técnicos · Benchmarks públicos vs miniPaint/Graphite · Show HN, Product Hunt, r/webdev, LinkedIn

---
## Hallazgos de usabilidad (registrar por sprint)
| Sprint | Hallazgo | Acción |
|---|---|---|

## ✅ Completado
(mover aquí las tareas cerradas; archivar a history.md al cerrar cada fase)
