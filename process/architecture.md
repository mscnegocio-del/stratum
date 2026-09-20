# Arquitectura — Stratum

## 1. Principio rector
Tres capas con dependencias en una sola dirección: **UI → Core ← Engine**.
- **Core** es la fuente de verdad (documento, comandos, historial). TS puro, sin DOM.
- **Engine** observa el Core y pinta. Nunca decide el estado del documento.
- **UI** lee estado y emite Commands. Nunca toca píxeles ni muta el documento.

Inspirado en el dispatcher de mensajes de Graphite, simplificado (ver graphite-reference.md).

## 2. Estructura del monorepo
```
stratum/
├── AGENTS.md · CLAUDE.md · memory.md · README.md · LICENSE
├── apps/
│   └── web/                      # App React (PWA). Shell, paneles, herramientas, atajos
│       ├── src/app/              # Bootstrap, providers
│       ├── src/panels/           # Layers, Properties, History, Color, Navigator
│       ├── src/tools/            # UI de cada herramienta (opciones, cursores, HUD)
│       ├── src/canvas/           # Montaje del canvas, overlays (selección, guías, handles)
│       ├── src/command-palette/  # Ctrl+K (cmdk)
│       ├── src/managers/         # Puentes a APIs del navegador: input, clipboard, files, persistence
│       ├── src/stores/           # Zustand: estado de UI (paneles, herramienta activa, prefs)
│       └── public/               # manifest, iconos, service worker
├── packages/
│   ├── core/                     # Modelo de documento, Commands, History, selección
│   ├── engine/                   # WebGPU: device, tiles, compositor, shaders, fallback WebGL2
│   │   └── src/shaders/          # *.wgsl: blend, adjustments, brush, blur, conversions
│   ├── ui-kit/                   # Design system: tokens CSS, componentes, iconos
│   ├── io/                       # Codecs: PNG/JPEG/WebP, HEIC/TIFF (WASM), PSD (ag-psd), .stratum
│   ├── ai/                       # ONNX Runtime Web en worker: bg removal, inpainting, smart select
│   ├── workers/                  # Workers compartidos (filtros CPU, magic wand, codecs) vía Comlink
│   ├── wasm/                     # (Fase 4) crates Rust: floodfill, patchmatch, etc.
│   └── bench/                    # Benchmarks reproducibles
├── docs/rfcs/                    # Diseños antes de implementar cambios grandes
├── process/                      # Harness: contexto profundo para agentes
└── .github/                      # CI, plantillas de PR/issues
```

## 3. Flujo de datos
```
Input (pointer/teclado)
  → managers/input  → herramienta activa (apps/web/tools)
  → core.dispatch(Command)
      → Command.apply(doc)  → marca tiles/capas "dirty"
      → History.push(diff de tiles)
  → engine.requestFrame()   → recompone SOLO tiles dirty visibles → presenta
  → stores de UI se actualizan por suscripción (selectores finos)
```
- Mensajes redundantes por frame se colapsan (varios `Render` → uno). Idea tomada de Graphite.
- Actualizaciones de paneles se agrupan a 1 por frame (requestAnimationFrame).

## 4. Motor de render (packages/engine)
- **Espacio de trabajo:** RGBA16F **lineal**, alfa premultiplicado. Conversión a sRGB solo al presentar/exportar.
- **Tiles:** 256×256. Solo tiles visibles (+margen) residen en GPU. LRU con presupuesto de VRAM.
- **Composición:** recorrido de la pila por tile; cada blend mode es una función WGSL.
  Carpetas se componen en buffer intermedio (pass-through opcional).
- **Adjustment layers:** shaders sobre el resultado acumulado debajo de ellas.
- **Máscaras:** textura R16F por capa; clipping masks usan el alfa de la capa base.
- **Zoom:** mipmaps por tile para zoom < 100% (downsampling de calidad, como Compositor); rejilla de píxeles ≥ 800%.
- **Pincel:** stamping en GPU con kernel gaussiano precalculado (LUT), estilo scatter/resolve de Graphite.
- **Fallback WebGL2:** solo visualización y composición básica. Sin WebGPU → aviso honesto al usuario.

## 5. Concurrencia
- Hilo principal: UI + orquestación. Presupuesto: < 8 ms por frame.
- Workers (Comlink): filtros CPU, magic wand, codecs, serialización .stratum.
- Worker IA: aislado, con cola y cancelación.
- OffscreenCanvas para miniaturas de capas.
- `SharedArrayBuffer` solo con cross-origin isolation (COOP/COEP); diseñar para funcionar sin él.

## 6. Persistencia
- OPFS: `/projects/<id>/` (manifest + tiles comprimidos), `/autosave/`, `/models/` (caché de IA).
- Autoguardado incremental cada 30 s o tras N commands, en worker.
- File System Access API para "Guardar" sobre el mismo archivo (Chromium). Resto: descarga.
- Formato: process/document-model.md

## 7. Restricciones de entorno
- 100% offline tras la primera carga (PWA).
- Sin backend. Hosting estático (GitHub Pages / Vercel) + `pnpm dev`/`pnpm preview` para localhost.
- Navegadores: Chrome/Edge (primario), Safari y Firefox (verificar soporte WebGPU en Sprint 0).
- Memoria: la pestaña puede morir por RAM → tiles comprimidos a OPFS para capas no visibles.
- COOP/COEP opcionales (habilitan threads WASM); documentar cómo servirlos en localhost.

## 8. Dependencias previstas (verificar licencia antes de instalar → decisions.md)
react, react-dom, tailwindcss v4, @radix-ui/*, motion, cmdk, zustand, comlink, onnxruntime-web,
ag-psd, utif, fflate, vitest, playwright. HEIC: evaluar decodificador WASM con licencia compatible.
