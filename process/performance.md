# Rendimiento — Stratum (pilar #3)

## Presupuestos (medidos en máquina de referencia: laptop gama media, GPU integrada, 16 GB RAM)
| Métrica | Objetivo | Límite duro |
|---|---|---|
| Frame en zoom/pan | 16 ms (60 fps) | 33 ms |
| Latencia pincel (input → píxel) | ≤ 1 frame | 2 frames |
| Hilo principal por frame | < 8 ms | 12 ms |
| Composición 50 capas 4K con blend modes | < 16 ms por frame visible | 33 ms |
| Preview de ajuste (curvas/niveles/HSL) | 1 frame | 3 frames |
| Abrir JPEG 24 MP (primer píxel visible) | < 800 ms | 1.5 s |
| Carga inicial app (sin modelos IA) | < 2 s en frío, < 500 ms en caché | 3 s |
| Bundle JS inicial (gzip) | < 350 KB | 500 KB |
| Memoria con doc 24 MP + 30 capas | < 2.5 GB | 3.5 GB |
| Undo/redo | < 50 ms | 100 ms |

## Técnicas obligatorias
- Tiles + dirty rects: recomponer solo lo que cambió y es visible.
- Mipmaps por tile para zoom alejado.
- Code splitting: IA, PSD, HEIC/TIFF y filtros avanzados cargan bajo demanda.
- Pooling de texturas y buffers GPU (no crear/destruir por frame).
- Colapsar mensajes redundantes por frame (patrón Graphite).
- Miniaturas de capas en OffscreenCanvas con throttling (máx. 4/s).
- Carga progresiva de imágenes grandes (primero versión reducida).

## Benchmarks (packages/bench) — corren en CI y fallan si hay regresión > 10%
1. `compose-50-layers-4k` · 2. `brush-stroke-1000-dabs` · 3. `open-24mp-jpeg`
4. `adjustment-curves-preview` · 5. `undo-redo-100-steps-memory` · 6. `export-png-24mp`
Publicar resultados en README (tabla) y comparativa contra miniPaint/Graphite en el lanzamiento.

## Herramientas
Chrome DevTools Performance + WebGPU timestamp queries · Playwright traces · `performance.measureUserAgentSpecificMemory` si disponible.
Overlay de depuración (Ctrl+Alt+Shift+P): fps, ms de frame, tiles en GPU, VRAM estimada, cola de workers.
