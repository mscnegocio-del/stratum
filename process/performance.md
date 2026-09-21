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
| VRAM mínima soportada (GPU integrada) | 2 GB | — degradar a resolución de tile menor / menos capas residentes |
| VRAM recomendada | 4 GB+ | — |

**Nota (sin medir aún):** estimación basada en tiles 256×256 RGBA16F (512 KB/tile, ADR-006). Con
~180 tiles visibles × hasta 20 capas por tile (rango probado en spike S0-09), el peor caso sin LRU
ronda ~1.8 GB de VRAM. La LRU con presupuesto de VRAM prevista para S1-03 debe acotar esto por
debajo del piso de 2 GB en GPUs integradas modestas. **Pendiente: medir consumo real de VRAM en la
máquina de referencia durante los sweeps de S0-08/S0-09** (ver memory.md → próximos pasos) y
confirmar o ajustar esta fila con datos reales, no estimados.

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
