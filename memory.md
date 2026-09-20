# Estado actual — Stratum
> Última actualización: 2026-09-20 (sesión 2: monorepo + spike WebGPU construido)

## ✅ Completado
- [x] Análisis del repo de referencia robbietilton/Compositor (Swift/macOS, MIT)
- [x] Análisis de mercado: Graphite (~27k ⭐, nodos/vector), miniPaint (~3.3k ⭐, Canvas 2D, poco activo), BitMappery (minimalista)
- [x] Revisión de código de Graphite (commit 4813fe3) → process/graphite-reference.md
- [x] Posicionamiento definido: editor raster por capas + retoque + IA local + UX impecable
- [x] Plan y roadmap en 7 fases → process/tasks.md
- [x] Harness creado
- [x] Investigación IA del navegador (Chrome Prompt API / Gemini Nano, estable en Chrome 148): incorporada como función OPCIONAL solo de texto → ai-local.md §6, ADR-015
- [x] Revisión de modelos de IA a sept. 2026: BEN v2 como alternativa a BiRefNet; MobileSAM2 a vigilar; LaMa sin cambios → ai-local.md
- [x] Alcance de IA definido: asistencia (Photoshop CC 2018-2021), NO generativa tipo Firefly → ADR-014
- [x] Versiones del stack verificadas y fijadas (React 19.3, Vite 8, Tailwind 4.3, ONNX RT Web 1.30) → ADR-016
- [x] Nombre definitivo: **Stratum** (verificado sept. 2026: sin editores de imágenes con ese nombre; npm `stratum` tomado por protocolo de minería → publicar como `stratum-editor` o con scope)
- [x] S0-02 Monorepo pnpm creado: `apps/web` + 7 paquetes (core, engine, ui-kit, io, ai, workers, bench)
- [x] S0-03 TS strict (project references) + Biome 2.5 + alias `@/*` + `pnpm check` en verde
- [x] S0-04 Vitest 5 (3 tests en core) + Playwright 1.63 (smoke E2E, pasa en Chromium)
- [x] S0-05 CI con dos jobs: `check/test/build` y `e2e` con reporte como artefacto
- [x] Versiones del catálogo confirmadas contra npm: Vite 8.3, React 19.3, Tailwind 4.3, ONNX RT Web 1.30

## 🔄 En progreso
- [ ] Sprint 0 — Fundaciones (ver process/tasks.md): quedan S0-01, S0-06 a S0-12
- [ ] **S0-08 Spike WebGPU**: construido y funcionando (`pnpm dev` → http://localhost:5173/spike.html).
  Motor mínimo en `packages/engine`: `createGpuContext`, `TextureQuadRenderer` (quad.wgsl),
  `viewport.ts` (fit/zoom-bajo-el-cursor/pan, con tests) y `FrameTimer` (p50/p95/max).
  **Pendiente: correrlo en la máquina de referencia** — el contenedor no tiene GPU. El camino completo
  se validó sobre SwiftShader (CPU): p50 16.66 ms, hilo principal p95 0.82 ms. Ese número NO decide ADR-001.
  Para medir: abrir `/spike.html` y pulsar el botón, o `await window.runSpikeSweep()` en la consola.

## ⚠️ Decisiones vigentes clave (detalle en process/decisions.md)
- ADR-001 WebGPU como motor principal, WGSL a mano
- ADR-002 React 19 + Tailwind v4 (no Svelte, aunque Graphite lo use)
- ADR-004 TypeScript primero; Rust/WASM solo en hot paths medidos (desde Fase 4)
- ADR-006 Capas en tiles 256×256, RGBA16F lineal
- ADR-007 Undo por snapshots diferenciales de tiles (no CRDT)
- ADR-014 IA de asistencia, no generativa: si necesita servidor, está fuera de alcance
- ADR-016 Versiones fijadas; re-verificar cada 3 meses

## 🔴 Bloqueantes
- Ninguno

## ❓ Pendiente de confirmar con el autor
- Herramienta de diseño: Penpot (recomendado, open source) o Figma
- **TypeScript 7.0 ya está publicado** (port nativo a Go, compilación mucho más rápida). El monorepo
  quedó en 5.9.3 por prudencia; migrar merece su propio ADR y una rama aparte.
- Biome 2.5 cubre lint + format (reemplaza ESLint + Prettier); si se prefiere el par clásico, decidirlo
  antes de escribir más código.

## 📌 Próximos pasos (próxima sesión)
0. Re-confirmar modelos de IA (BiRefNet vs BEN v2, MobileSAM2) recién al llegar al sprint de IA, no antes.
1. **Correr el sweep de S0-08 en la máquina de referencia** y anotar aquí el resultado; recién entonces
   confirmar o revisar ADR-001. Si el p95 pasa de 16 ms, el siguiente sospechoso son los mipmaps
   (el spike samplea sin ellos, así que el zoom alejado aliasea y cuesta de más).
2. Verificar soporte actual de WebGPU por navegador (caniuse) y actualizar ADR-001 (S0-01).
3. Spike S0-09: 20 capas tileadas con blend Normal/Multiply en WGSL.
4. PWA base + deploy a GitHub Pages (S0-06).
5. Definir tokens del design system en Penpot/Figma (S0-10) y luego ui-kit + Kitchen Sink (S0-11).
