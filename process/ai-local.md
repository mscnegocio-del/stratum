# IA local — Stratum (pilar #4)

> Principio: **nada sale del navegador**. Todos los modelos se descargan una vez, se cachean en OPFS
> y corren con ONNX Runtime Web (backend WebGPU; fallback WASM con aviso de lentitud).

## Funciones (orden de prioridad)
| # | Función | Uso en UI | Candidatos de modelo (VERIFICAR licencia y tamaño) |
|---|---|---|---|
| 1 | Quitar fondo | Botón en ContextualBar / Filtro → crea máscara de capa (no destructivo) | BiRefNet (variantes lite), MODNet, U²-Net. ⚠ RMBG-1.4/2.0 tienen licencia no comercial: evitar |
| 2 | Relleno con IA (content-aware / inpainting) | Selección → "Relleno con IA"; también extender lienzo | LaMa, MI-GAN (ligero) |
| 3 | Selección inteligente por clic | Herramienta W: clic sobre objeto → selección | MobileSAM / EfficientSAM / SlimSAM |
| 4 | Pincel corrector puntual mejorado | Herramienta J usa inpainting local en parches pequeños | Reutiliza modelo #2 |
| 5 | (Opcional) Super-resolución x2 | Tamaño de imagen → "Mejorar con IA" | Real-ESRGAN (variante pequeña) |

Antes de integrar cualquier modelo: registrar ADR con licencia, tamaño (MB), tiempo en máquina de referencia y fuente.

## Arquitectura
- `packages/ai`: worker dedicado, API vía Comlink: `removeBackground(layerId)`, `inpaint(region, mask)`, `segmentAt(point)`.
- Descarga bajo demanda con progreso, reanudable; verificación por hash; caché en OPFS `/models/`.
- Preprocesado/postprocesado en GPU cuando sea posible (evitar copias CPU↔GPU).
- Procesar en tiles/parches para imágenes grandes; unir con feathering.
- Cancelable siempre. Timeout con mensaje claro.
- Detección de capacidad: si no hay WebGPU o la VRAM es insuficiente → ofrecer modo WASM (lento) con aviso honesto.

## UX de la IA
- Color `--ai` e ícono de destello solo para funciones de IA; badge **"Local · privado"**.
- Primera vez: diálogo breve "Descargar modelo (≈XX MB, una sola vez, se guarda en tu navegador)".
- Resultado siempre como **máscara o capa nueva**, nunca destruye el original.
- Mostrar preview antes de confirmar; permitir "Probar otra vez" (variación) en inpainting.
- Gestor de modelos en Preferencias: ver tamaño en disco, borrar, re-descargar.

## Métricas objetivo (máquina de referencia)
Quitar fondo 12 MP < 3 s · Inpainting región 512² < 2 s · Selección por clic < 300 ms tras el primer embedding.

## Revisión de modelos — setiembre 2026
Investigación hecha el 2026-09-20. Nada de esto está decidido: son notas para el ADR que toque en Sprint 10+.

- **Quitar fondo:** BiRefNet sigue vigente y con licencia MIT. Nuevo candidato a comparar: **BEN v2** (también MIT), reportado como superior en bordes finos (cabello). Benchmark obligatorio BiRefNet vs BEN v2 antes de elegir.
- **Selección inteligente:** MobileSAM (2023, basado en SAM v1) es la opción *segura* porque ya tiene export ONNX maduro y demos corriendo en navegador. Salió **MobileSAM2** (paper jul-2026, destilado de SAM2 para dispositivos limitados): mejor sobre el papel, pero aún sin tooling ONNX/web maduro → **vigilar y re-evaluar antes del Sprint de selección inteligente**. SAM 3.1 (Meta, mar-2026) queda descartado: demasiado pesado para on-device.
- **Inpainting:** LaMa sigue siendo el estándar práctico para navegador; sin reemplazo abierto claro. Sin cambios.
- Regla general: re-verificar esta tabla al inicio de cada sprint de IA; el campo se mueve más rápido que el proyecto.

## 6 · (Opcional, solo Chrome) IA de texto integrada al navegador
**Qué es:** desde Chrome 148 (I/O 2026) la **Prompt API** es estable y expone **Gemini Nano** corriendo
on-device. No requiere cuenta de Google, ni API key, ni servidor: el modelo se descarga una vez y
Chrome documenta que **no se envían datos a Google ni a terceros**. No confundir con "Gemini en Chrome"
(panel lateral, en la nube, de pago) — eso NO es esto.

**Límite duro:** entrada multimodal (texto + imagen), pero **salida solo texto**. No segmenta, no
genera ni modifica píxeles. Por eso NO reemplaza nada de las funciones 1-5.

**Usos previstos en Stratum (solo dos, deliberadamente):**
1. **Nombrar capas automáticamente** — en vez de "Capa 1", derivar "Retrato", "Fondo playa".
2. **Texto alternativo al exportar** — generar descripción accesible de la imagen.

**Requisitos del usuario (por eso es opcional):** Chrome de escritorio (Win 10/11, macOS 13+, Linux,
ChromeOS en Chromebook Plus), ~22 GB libres en disco, GPU con >4 GB VRAM o CPU de 16 GB + 4 núcleos.
No hay soporte en Android/iOS ni en otros navegadores (propuesta WICG, aún sin estandarizar).

**Reglas de implementación:**
- Detección con `LanguageModel.availability()` antes de mostrar nada. Si no está disponible, la función
  **no aparece** en la UI — nunca un botón deshabilitado ni un error.
- Aislada en `packages/ai/src/browser-ai/`, detrás de una interfaz propia. Ningún otro paquete depende de ella.
- Nunca en la ruta crítica de una edición. Es azúcar, no funcionalidad.
- Tipos vía `@types/dom-chromium-ai`.
