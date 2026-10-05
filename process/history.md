# Historial archivado — Stratum
> Aquí se archiva lo completado cuando memory.md supera ~150 líneas o al cerrar una fase.

## Sesión 0 — 2026-09-20
- Análisis de Compositor, mercado (Graphite, miniPaint, BitMappery, Photopea) y código de Graphite.
- Definición de posicionamiento, pilares, arquitectura y roadmap. Creación del harness.

## Sesiones 2–4 — 2026-09-21 a 2026-10-05 (archivado al cerrar S0-08/S0-09/S0-11)
### Estado de S0-08/S0-09 antes de medir en GPU real
- [ ] Sprint 0 — Fundaciones (ver process/tasks.md): quedan S0-01, S0-06 a S0-12
- [x] **S0-08 medido en GPU real (2026-10-05)**: Intel gen-9 integrada (gama baja), Chrome, 4K,
  canvas 1920x913 @1.25x → sweep **OK**: frame p50 16.70 / p95 16.90 ms, hilo principal p95 1.10 ms.
  ADR-001 se sostiene incluso en GPU integrada. (max 16983 ms = pestaña en segundo plano, ignorar.)
- [x] **S0-09 medido en GPU real (2026-10-05)**, Intel gen-9, 4K, sweep de 600 frames:
  | capas | frame p50 | frame p95 | main p95 | veredicto |
  |---|---|---|---|---|
  | 20 | 16.70 | 33.30 | 2.20 | fuera |
  | 10 | 16.70 | 32.90 | 2.80 | fuera |
  | 4  | 16.70 | 16.90 | 2.00 | OK |
  Lectura: p50 a 60 fps en todos los casos → el blending en régimen estable cabe incluso con 20 capas.
  p95 casi idéntico con 10 y 20 capas → NO escala con el loop del shader; son frames sueltos con
  subidas de tiles (4 tiles × N capas de `copyExternalImageToTexture` por frame). Conclusión para
  S1-03: el presupuesto de subida debe medirse en **capas-tile por frame** (≈16), no en tiles.
  ADR-001 se sostiene.
- [ ] **S0-08 Spike WebGPU** (detalle histórico): construido y funcionando (`pnpm dev` → http://localhost:5173/spike.html).
  Motor mínimo en `packages/engine`: `createGpuContext`, `TextureQuadRenderer` (quad.wgsl),
  `viewport.ts` (fit/zoom-bajo-el-cursor/pan, con tests) y `FrameTimer` (p50/p95/max).
  **Pendiente: correrlo en la máquina de referencia** — el contenedor no tiene GPU. El camino completo
  se validó sobre SwiftShader (CPU): p50 16.66 ms, hilo principal p95 0.82 ms. Ese número NO decide ADR-001.
  Para medir: abrir `/spike.html` y pulsar el botón, o `await window.runSpikeSweep()` en la consola.
- [ ] **S0-09 Spike compositor por tiles**: construido y funcionando (`/spike-layers.html`, admite
  `?layers=N&width=W&height=H`). Nuevo en `packages/engine`: `tile-grid.ts` (qué tiles son visibles,
  con tests), `tile-compositor.ts` (residencia GPU solo de tiles visibles + upload progresivo),
  `shaders/blend.wgsl` + `shaders/tile-composite.wgsl` (Normal/Multiply, hasta 20 capas por tile).
  **Dos bugs reales encontrados corriéndolo** (no solo leyendo el código):
  1. `copyExternalImageToTexture` exige `RENDER_ATTACHMENT` en la textura destino además de
     `COPY_DST` — sin eso todas las copias fallaban en silencio (solo warning en consola) y el
     canvas quedaba negro. Corregido en `tile-compositor.ts`.
  2. Subir todas las tiles nuevas de golpe en un frame (135 tiles × 20 capas tras "ajustar a
     pantalla") bloqueaba la página varios minutos en SwiftShader. Mitigado con
     `UPLOAD_BUDGET_PER_FRAME = 4`: el resto rellena en frames siguientes. **Esta idea de carga
     progresiva de tiles debería pasar al diseño real de la LRU de S1-03**, no quedar solo en el spike.
  **Pendiente: medir en la máquina de referencia.** SwiftShader es demasiado lento para
  `copyExternalImageToTexture` (~40 ms/copia) como para juzgar el costo de blending en régimen
  estable — solo se validó a escala reducida (`?layers=4&width=768`): compone sin costuras entre
  tiles, hilo principal p50 0.23 ms una vez subidas.

### ✅ Completado (sesión 3, 2026-09-21 cont.)
- [x] Definido presupuesto preliminar de VRAM en process/performance.md (2 GB mínimo / 4 GB+
  recomendado, estimado a partir de tiles 256×256 RGBA16F de ADR-006). **Sin medir aún** — queda
  atado al mismo pendiente de correr los sweeps de S0-08/S0-09 en máquina con GPU real.


### 🏁 Cierre de sesión 2 (2026-09-21)
Sprint 0 cerrado: S0-01, S0-02, S0-03, S0-04, S0-05, S0-06, S0-13. Quedan abiertos S0-07, S0-10,
S0-11, S0-12, y S0-08/S0-09 construidos pero sin medir en máquina con GPU real. Repo público, CI y
deploy funcionando en GitHub Actions, sitio en producción confirmado visualmente. Sin bloqueantes.
