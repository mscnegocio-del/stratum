# Convenciones, testing y Definition of Done — Stratum

## Código
- TypeScript strict · sin `any` · `readonly` por defecto en tipos del Core.
- Nombres: `camelCase` funciones/variables, `PascalCase` tipos/componentes, `kebab-case` archivos, `SCREAMING_CASE` constantes.
- Un componente por archivo; hooks en `use-*.ts`; shaders en `*.wgsl` con comentario de cabecera (entradas, salidas, espacio de color).
- Imports entre paquetes solo vía su `index.ts` público (nada de `packages/core/src/internal/...`).
- Errores: tipos `Result` en Core; en UI, toasts con microcopy según ux-principles §5.
- Comentarios explican el *por qué*, no el *qué*.

## Git
- Conventional Commits en inglés: feat, fix, perf, refactor, test, docs, chore, ux, style.
- Scope = paquete: `feat(core): ...`, `perf(engine): ...`, `ux(web): ...`.
- PR pequeño (< 400 líneas ideal), con capturas/GIF si toca UI y números si toca rendimiento.

## Testing
| Capa | Herramienta | Qué |
|---|---|---|
| core | Vitest | Commands, historial, invariantes, serialización (cobertura ≥ 85%) |
| engine | Vitest + Playwright | Shaders contra imágenes de referencia (tolerancia ΔE) |
| ui-kit | Playwright | Regresión visual de Kitchen Sink (oscuro/claro) |
| web | Playwright E2E | Flujos: abrir → editar → exportar; atajos; autoguardado/recuperación |
| bench | Vitest bench | Presupuestos de performance.md |
- Imágenes de prueba en `packages/bench/fixtures/` (licencia libre, documentada).

## Definition of Done (toda tarea)
- [ ] Funciona en Chrome y Edge; verificado en Safari/Firefox si aplica
- [ ] Tests nuevos/actualizados y en verde; CI verde
- [ ] Sin regresión de benchmarks > 10%
- [ ] UI: checklist de design-system.md §9 cumplido
- [ ] UX: estados completos, atajo (si aplica) y entrada en Command Palette
- [ ] Accesible por teclado; textos en i18n (es/en)
- [ ] Undo/redo funciona para la acción
- [ ] memory.md y tasks.md actualizados
