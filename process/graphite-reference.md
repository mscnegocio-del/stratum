# Referencia viva: Graphite — Stratum
> Repo oficial: https://github.com/GraphiteEditor/Graphite · Web: graphite.art · Editor en vivo en su web
> Revisado: commit 4813fe3 (2026-09-20) · Licencia: MIT OR Apache-2.0 (reutilizable citando la fuente)

## Datos
- ~191k líneas Rust + ~20k TS/Svelte. Frontend: Svelte 5, Vite 8, TS 6, SCSS. Núcleo Rust→WASM, render wgpu.
- Shaders escritos en Rust (rust-gpu/cargo-gpu) compilados a WGSL.
- Enfoque: grafo de nodos procedural, vector primero. Herramientas (13): artboard, brush, eyedropper, fill, freehand,
  gradient, navigate, path, pen, select, shape, spline, text. **Sin marquee, lazo, varita, clonar ni corrector** → nuestro hueco.

## Qué ADOPTAMOS (con archivo de referencia)
| Idea | Dónde verla en Graphite | Cómo la aplicamos |
|---|---|---|
| Dispatcher central de mensajes con handlers | `editor/src/dispatcher.rs` | `core.dispatch(Command)` |
| Colapsar mensajes redundantes por frame | `SIDE_EFFECT_FREE_MESSAGES` y `FRONTEND_UPDATE_MESSAGES` en dispatcher.rs | Render y refresco de paneles 1×/frame |
| Frontend "tonto": managers / stores / subscriptions router | `frontend/src/README.md`, `frontend/src/managers/`, `stores/`, `subscriptions-router.ts` | `apps/web/src/managers` + `stores` (Zustand) |
| UI de propiedades descrita por el núcleo (widgets) | `editor/src/messages/layout/` | Esquema declarativo de parámetros para ajustes/filtros → panel auto-generado |
| Pincel GPU scatter/resolve con LUT gaussiana | `node-graph/nodes/brush/src/basic_brush/` (scatter.wgsl, resolve.wgsl, kernel.rs) | Base de nuestro pincel WGSL |
| 27 blend modes agrupados como Photoshop | `node-graph/libraries/no-std-types/src/blending.rs` | Checklist y fórmulas |
| Conversión explícita a lineal | `no-std-types/src/color/color_traits.rs` | Pipeline RGBA16F lineal |
| RFCs de diseño | `node-graph/rfcs/` | `docs/rfcs/` |
| Service worker offline | `frontend/src/service-worker.js` | PWA |

## Qué EVITAMOS
- Grafo de nodos como modelo central (ADR-005).
- rust-gpu para shaders (ADR-001): WGSL directo.
- Snapshots completos del documento para undo (ellos mismos están migrando) (ADR-007).
- IndexedDB para binarios grandes (ADR-008).

## Pendiente de estudiar (S0-07)
- [ ] Cómo sincronizan resolución del viewport y footprint de render (`node-graph/libraries/rendering`)
- [ ] Manejo de input y mapeo de atajos (`editor/src/messages/input_mapper`)
- [ ] Persistencia de sesión (`frontend/src/utility-functions/persistence.ts`)
- [ ] Formato .gdd y su RFC (`node-graph/rfcs/document-format.md`) para ideas de versionado
