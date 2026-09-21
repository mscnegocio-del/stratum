# Estado actual — Stratum
> Última actualización: 2026-09-21 (sesión 2, cierre: S0-06 cerrado y confirmado visualmente en producción)

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
- [x] S0-01 Soporte de WebGPU revalidado (caniuse + gpuweb): ~82–85% global, Candidate Recommendation
  desde marzo 2026. ADR-001 se sostiene. Firefox en Linux y Android sigue sin WebGPU por defecto →
  el fallback WebGL2 no es opcional a corto plazo. Detalle en process/decisions.md ADR-001.
- [x] **S0-06 PWA base + deploy a GitHub Pages.** Manifiesto + service worker offline con
  `vite-plugin-pwa`/Workbox (ADR-017), verificado con Playwright (SW `activo`, la app sigue
  cargando con la red cortada). Repo pasado a público y GitHub Pages activado (Settings → Pages →
  Source: GitHub Actions) — ambos confirmados por API (`visibility: public`, `has_pages: true`).
  Deploy real disparado y **exitoso**: build + deploy en verde
  (https://github.com/mscnegocio-del/stratum/actions/runs/35549589177). Sitio publicado en
  **https://mscnegocio-del.github.io/stratum/** — **confirmado visualmente por el autor desde
  móvil**: carga "Stratum", el subtítulo y "WebGPU disponible". S0-06 cerrado end-to-end.

## 🔄 En progreso
- [ ] Sprint 0 — Fundaciones (ver process/tasks.md): quedan S0-01, S0-06 a S0-12
- [ ] **S0-08 Spike WebGPU**: construido y funcionando (`pnpm dev` → http://localhost:5173/spike.html).
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
## ⚠️ Decisiones vigentes clave (detalle en process/decisions.md)
- ADR-001 WebGPU como motor principal, WGSL a mano (revalidado en S0-01: ~82–85% soporte global;
  Firefox en Linux/Android sigue sin default → WebGL2 de fallback sigue siendo obligatorio)
- ADR-002 React 19 + Tailwind v4 (no Svelte, aunque Graphite lo use)
- ADR-004 TypeScript primero; Rust/WASM solo en hot paths medidos (desde Fase 4)
- ADR-006 Capas en tiles 256×256, RGBA16F lineal
- ADR-007 Undo por snapshots diferenciales de tiles (no CRDT)
- ADR-014 IA de asistencia, no generativa: si necesita servidor, está fuera de alcance
- ADR-016 Versiones fijadas; re-verificar cada 3 meses
- ADR-017 vite-plugin-pwa (Workbox) para el service worker, no uno escrito a mano

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
1. **Correr los sweeps de S0-08 y S0-09 en la máquina de referencia** y anotar aquí el resultado;
   recién entonces confirmar o revisar ADR-001. Si el p95 pasa de 16 ms en S0-08, el sospechoso son
   los mipmaps (sin ellos el zoom alejado aliasea y cuesta de más); si pasa en S0-09 con las tiles ya
   residentes, el sospechoso es el loop de 20 capas en el fragment shader (probar con menos capas
   vía `?layers=N` para aislar el costo).
2. Llevar la carga progresiva de tiles (`UPLOAD_BUDGET_PER_FRAME`, hallazgo de S0-09) al diseño de
   la LRU con presupuesto de VRAM que architecture.md ya prevé para S1-03.
3. Definir tokens del design system en Penpot/Figma (S0-10) y luego ui-kit + Kitchen Sink (S0-11).
4. S0-07: estudiar Graphite (dispatcher, brush GPU, persistence) — sigue pendiente, no se tocó hoy.

## 🏁 Cierre de sesión 2 (2026-09-21)
Sprint 0 cerrado: S0-01, S0-02, S0-03, S0-04, S0-05, S0-06, S0-13. Quedan abiertos S0-07, S0-10,
S0-11, S0-12, y S0-08/S0-09 construidos pero sin medir en máquina con GPU real. Repo público, CI y
deploy funcionando en GitHub Actions, sitio en producción confirmado visualmente. Sin bloqueantes.
