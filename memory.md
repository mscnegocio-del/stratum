# Estado actual — Stratum
> Última actualización: 2026-09-20 (sesión 1: revisión de vigencia del stack y alcance de IA)

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

## 🔄 En progreso
- [ ] Sprint 0 — Fundaciones (ver process/tasks.md)

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

## 📌 Próximos pasos (próxima sesión)
0. Re-confirmar modelos de IA (BiRefNet vs BEN v2, MobileSAM2) recién al llegar al sprint de IA, no antes.
1. Verificar soporte actual de WebGPU por navegador (caniuse) y actualizar ADR-001 si cambia algo.
2. Crear monorepo según process/architecture.md (S0-01 a S0-05).
3. Spike técnico WebGPU: textura 4K, zoom/pan a 60 fps (S0-08).
4. Definir tokens del design system en Penpot/Figma (S0-10).
