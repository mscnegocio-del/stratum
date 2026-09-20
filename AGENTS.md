# AGENTS.md — Stratum v0.0
> Generado: 2026-09-20 · Autor: Milton Salcedo · Licencia: MIT

## Qué es Stratum
Editor de imágenes raster **open source, 100% en el navegador**, con flujo de capas familiar para
quien viene de Photoshop, enfocado en **composición y retoque fotográfico**, con **IA local** (sin servidor).
Posicionamiento: "el Compositor para la web" (inspirado en robbietilton/Compositor, app nativa macOS).
NO es otro Photoshop web ni compite con Graphite (nodos/vector).

## Los 5 pilares (toda decisión se evalúa contra ellos, en este orden)
1. **UX de primer nivel** → process/ux-principles.md
2. **UI moderna e impecable (estándar sept. 2026)** → process/design-system.md
3. **Rendimiento real: 60 fps en canvas siempre** → process/performance.md
4. **IA local y privada (nada sale del navegador)** → process/ai-local.md
5. **Calidad de imagen: color lineal, alta precisión, sin banding** → process/architecture.md

## Posicionamiento (referencia histórica)
Stratum apunta a la franja de **Photoshop CC 2018–2021**: IA de *asistencia* (seleccionar sujeto,
relleno según contenido, reparación inteligente), NO IA *generativa* tipo Firefly (2023+), que exige
modelos enormes en la nube. Diferencia clave: los modelos que usamos son de 2024-2026 (mejores que
los de Adobe en 2019) y corren **en la máquina del usuario**, con privacidad total y costo cero.
Regla: si una función requiere un servidor para funcionar, está fuera de alcance.

## Stack técnico (versiones verificadas 2026-09-20 — re-verificar cada 3 meses)
- Monorepo: pnpm workspaces · TypeScript estricto · **Vite 8.x**
- UI: **React 19.3** + **Tailwind CSS 4.3** + Radix Primitives + Motion 13 + cmdk 1.1 · **Zustand 5** (solo estado de UI)
- Motor: WebGPU (WGSL escrito a mano) · fallback WebGL2 solo para visualizar/componer
- Cómputo pesado: Web Workers + OffscreenCanvas · Rust→WASM solo en hot paths medidos (desde Fase 4)
- IA: **ONNX Runtime Web 1.30** (backend WebGPU, fallback WASM) en worker dedicado
- IA opcional solo-Chrome: Prompt API / Gemini Nano (tareas de texto; ver process/ai-local.md §6)
- Persistencia: OPFS (proyectos, autoguardado, caché de modelos) + File System Access API
- Distribución: PWA estática offline-first · `pnpm dev` para localhost
- Tests: Vitest (core/engine) · Playwright (E2E + regresión visual) · benchmarks en CI

## Arquitectura en una línea
`UI (React)` → envía **Commands** → `Core (TS puro)` actualiza documento + historial →
`Engine (WebGPU)` re-renderiza solo tiles sucios. **React nunca toca píxeles.**
Detalle: process/architecture.md · Modelo de documento: process/document-model.md

## Convenciones obligatorias
- TypeScript `strict`, sin `any` (usar `unknown` + narrowing). Nombres de código en inglés; docs en español.
- `packages/core` no importa nada del DOM, React ni WebGPU. Debe correr en Node para tests.
- Toda mutación del documento pasa por un `Command` registrado (undo/redo garantizado).
- Todo trabajo > 16 ms en el hilo principal va a un worker o a la GPU.
- Componentes UI solo desde `packages/ui-kit`; tokens de diseño solo desde variables CSS (nunca hex sueltos).
- Toda interacción nueva: estados hover/active/focus/disabled + atajo de teclado + entrada en Command Palette.
- Commits: Conventional Commits en inglés (`feat(engine): add tile cache eviction`).
- Ramas: `main` estable · `feat/*`, `fix/*`, `perf/*`, `ux/*`. PR con checklist de .github/PULL_REQUEST_TEMPLATE.md.

## NUNCA
- NUNCA bloquear el hilo principal durante zoom/pan/pintado.
- NUNCA enviar imágenes, telemetría ni datos del usuario a un servidor.
- NUNCA usar localStorage para datos de imagen (usar OPFS).
- NUNCA añadir un modelo de IA o librería sin verificar su licencia (compatible con MIT) → registrar en decisions.md.
- NUNCA modificar el documento desde un componente React.
- NUNCA agregar funciones fuera de alcance (vectores, nodos, animación, video) → process/scope.md.
- NUNCA mezclar un refactor grande con una feature en el mismo PR.
- NUNCA declarar una tarea "hecha" sin cumplir la Definition of Done (process/conventions.md).

## Reglas de trabajo del agente
1. Leer **memory.md** al inicio de cada sesión.
2. Leer el archivo de process/ relevante antes de tocar un área.
3. Si una decisión afecta arquitectura, UX o dependencias → proponer y registrar ADR en process/decisions.md.
4. Si la tarea es ambigua → preguntar antes de implementar (el autor lo prefiere así).
5. Señalar proactivamente huecos de diseño, riesgos de rendimiento o de UX.
6. Al terminar: actualizar memory.md y el estado en process/tasks.md.
7. Si memory.md supera ~150 líneas → archivar lo completado en process/history.md.

## Contexto profundo → process/
- Arquitectura y carpetas: process/architecture.md
- Modelo de documento, capas, historial, formato .stratum: process/document-model.md
- Principios de UX: process/ux-principles.md
- Design system (tokens, componentes, motion): process/design-system.md
- Atajos de teclado: process/shortcuts.md
- Rendimiento (presupuestos y benchmarks): process/performance.md
- IA local: process/ai-local.md
- Alcance y paridad de funciones: process/scope.md
- Roadmap, sprints y tareas: process/tasks.md
- Decisiones (ADR): process/decisions.md
- Convenciones, testing y DoD: process/conventions.md
- Referencia viva Graphite: process/graphite-reference.md
- Riesgos: process/risks.md
- RFCs de diseño: docs/rfcs/

## Estado actual → memory.md
