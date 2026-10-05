# Estado actual — Stratum
> Última actualización: 2026-10-05 (sesión 4: S0-08/S0-09 medidos en GPU real, S0-11 ui-kit + Kitchen Sink)

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
- [ ] Sprint 0 — quedan **S0-07** (estudiar Graphite), **S0-10** (diseño en Penpot/Figma) y **S0-12** (README).
- [x] **S0-08 medido en GPU real (2026-10-05)**: Intel gen-9 integrada, Chrome, 4K → **OK**:
  frame p50 16.70 / p95 16.90 ms, hilo principal p95 1.10 ms. ADR-001 se sostiene en GPU integrada.
- [x] **S0-09 medido en GPU real (2026-10-05)**, Intel gen-9, 4K:
  | capas | frame p50 | frame p95 | main p95 | veredicto |
  |---|---|---|---|---|
  | 20 | 16.70 | 33.30 | 2.20 | fuera |
  | 10 | 16.70 | 32.90 | 2.80 | fuera |
  | 4  | 16.70 | 16.90 | 2.00 | OK |
  El blending cabe (p50 a 60 fps siempre); los picos de p95 vienen de subir tiles (4 tiles × N capas
  de `copyExternalImageToTexture` por frame). **Para S1-03: presupuesto de subida en capas-tile por
  frame (≈16), no en tiles.**
- [x] **S0-11 ui-kit + Kitchen Sink (2026-10-05)**, rama `feat/ui-kit-tokens`: tokens completos en
  ambos temas, Button/IconButton/Kbd/Badge, `/dev/ui.html`. Contraste AA verificado por test; 4 tokens
  del spec ajustados (detalle en process/tasks.md y design-system.md §2). Tokens **provisionales**
  hasta S0-10.

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

## 📌 Próximos pasos
1. **S0-10**: decidir Penpot o Figma y diseñar layout + 10 componentes clave partiendo del Kitchen Sink.
2. Primitivos sobre Radix (Tooltip con atajo, Popover, Menu, Dialog, Select...) → requiere registrar
   Radix en decisions.md (licencia MIT) antes de instalar.
3. Auto-hospedar Inter y JetBrains Mono (OFL-1.1, p. ej. @fontsource-variable) → ADR antes de añadir.
4. S1-03: LRU de tiles con presupuesto de VRAM y subida progresiva en capas-tile por frame.
5. S0-07 (Graphite) y S0-12 (README) cuando haya capturas del diseño.
6. Re-confirmar modelos de IA (BiRefNet vs BEN v2, MobileSAM2) recién al llegar al sprint de IA.
