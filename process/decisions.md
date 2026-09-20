# Decisiones (ADR) — Stratum
> Formato: ID | Fecha | Decisión | Alternativas descartadas | Razón | Estado

**ADR-001 | 2026-09-20 | WebGPU como motor principal, WGSL escrito a mano; WebGL2 como fallback de visualización**
Descartadas: Canvas 2D (lento con muchas capas/blend), solo WebGL2 (sin compute shaders), rust-gpu (toolchain frágil).
Razón: compute shaders, texturas float, cercano a Metal; estándar moderno = valor de portafolio. Estado: vigente (revalidar soporte en S0-01).

**ADR-002 | 2026-09-20 | React 19 + Vite + Tailwind v4 para la UI**
Descartadas: Svelte (usado por Graphite), Vue. Razón: dominio del autor; ecosistema (Radix, cmdk, Motion). Estado: vigente.

**ADR-003 | 2026-09-20 | Arquitectura por Commands con Core en TS puro separado de UI y Engine**
Descartadas: estado del documento en React/Zustand. Razón: testeable, undo garantizado, rendimiento; patrón validado por el dispatcher de Graphite. Estado: vigente.

**ADR-004 | 2026-09-20 | TypeScript primero; Rust→WASM solo en hot paths medidos (desde Fase 4)**
Descartadas: Rust desde el día uno (curva alta, retrasa v0.1). Razón: entregar pronto; migrar con datos de benchmark. Estado: vigente — el autor puede reabrirla.

**ADR-005 | 2026-09-20 | Modelo por capas (no grafo de nodos)**
Descartadas: grafo nodal tipo Graphite. Razón: complejidad enorme, no es el flujo de retoque objetivo, diferenciación de mercado. Estado: vigente.

**ADR-006 | 2026-09-20 | Tiles 256×256, RGBA16F lineal premultiplicado**
Descartadas: imagen completa por capa (RAM), 8 bits sRGB (banding, blend incorrecto). Razón: memoria acotada y calidad de color. Estado: vigente.

**ADR-007 | 2026-09-20 | Undo por snapshots diferenciales de tiles con presupuesto de memoria**
Descartadas: snapshots completos (Graphite legacy), CRDT (Graphite nuevo; innecesario sin colaboración). Razón: simple y eficiente. Estado: vigente.

**ADR-008 | 2026-09-20 | Persistencia en OPFS (no IndexedDB para binarios)**
Descartadas: IndexedDB (usado por Graphite), localStorage. Razón: mejor rendimiento para archivos grandes y acceso desde workers. Estado: vigente.

**ADR-009 | 2026-09-20 | IA local con ONNX Runtime Web; solo modelos con licencia compatible con MIT**
Descartadas: APIs en la nube, modelos no comerciales (p. ej. RMBG). Razón: privacidad (pilar #4) y licencia. Estado: vigente.

**ADR-010 | 2026-09-20 | Biome para lint y formato**
Descartadas: ESLint + Prettier. Razón: una herramienta, mucho más rápida. Estado: propuesta (confirmar en S0-03).

**ADR-011 | 2026-09-20 | Radix Primitives como base de accesibilidad de componentes**
Descartadas: shadcn/ui completo (estética genérica), componentes 100% propios (a11y costosa). Razón: a11y resuelta, estilo 100% propio. Estado: vigente.

**ADR-012 | 2026-09-20 | Licencia MIT**
Razón: igual que Compositor; máxima adopción. Estado: vigente.

**ADR-013 | 2026-09-20 | Nombre del proyecto: Stratum**
Descartadas: Lumen (ya usado por "Lumen Studio" y "lumen-editor", editores de imágenes; npm `lumen` tomado), Overlay (término genérico de UI, mal SEO).
Razón: evoca capas, ningún editor de imágenes lo usa. npm `stratum` ocupado (minería) → paquetes como `stratum-editor` o `@usuario/stratum`; repo GitHub `<usuario>/stratum`. Estado: vigente.

**ADR-014 | 2026-09-20 | Alcance de IA: asistencia, no generación**
Stratum cubre la franja Photoshop CC 2018–2021 (seleccionar sujeto, relleno según contenido, reparación inteligente).
Descartado: IA generativa tipo Firefly/relleno generativo. Razón: exige modelos en la nube, rompe el pilar #4 (privacidad) y el costo cero.
Criterio permanente: si una función necesita servidor, está fuera de alcance. Estado: vigente.

**ADR-015 | 2026-09-20 | Chrome Prompt API (Gemini Nano) como función opcional solo de texto**
Aceptado solo para nombrado automático de capas y texto alternativo (process/ai-local.md §6).
Descartado: usarlo para tareas de píxeles (su salida es solo texto) y hacerlo dependencia de algo. Razón: es solo-Chrome, exige 22 GB libres y no está estandarizado.
Regla: detección previa; si no está disponible, la función no aparece. Estado: vigente.

**ADR-016 | 2026-09-20 | Versiones del stack fijadas y revisables**
React 19.3 · Vite 8.x · Tailwind 4.3 · Zustand 5 · Motion 13 · cmdk 1.1 · ONNX Runtime Web 1.30 (verificado 2026-09-20).
Razón: evitar que el proyecto nazca con dependencias atrasadas. Regla: re-verificar versiones cada 3 meses y al inicio de cada fase. Estado: vigente.

<!-- Plantilla:
**ADR-0XX | AAAA-MM-DD | Decisión**
Descartadas: … Razón: … Estado: propuesta | vigente | reemplazada por ADR-0YY
-->
