# Referencia viva: Graphite — Stratum
> Repo oficial: https://github.com/GraphiteEditor/Graphite · Web: graphite.art · Editor en vivo en su web
> Revisado: commit 4813fe3 (2026-09-20) · **Estudio a fondo S0-07: commit 68c3c75 (2026-09-28)**
> Licencia: MIT OR Apache-2.0 (reutilizable citando la fuente)

## Datos
- ~191k líneas Rust + ~20k TS/Svelte. Frontend: Svelte 5, Vite 8, TS 6, SCSS. Núcleo Rust→WASM, render wgpu.
- Shaders: la mayoría en Rust (rust-gpu/cargo-gpu) compilados a WGSL; **el pincel usa WGSL escrito a mano**.
- Enfoque: grafo de nodos procedural, vector primero. Herramientas (13): artboard, brush, eyedropper, fill, freehand,
  gradient, navigate, path, pen, select, shape, spline, text. **Sin marquee, lazo, varita, clonar ni corrector** → nuestro hueco.

## Qué ADOPTAMOS (con archivo de referencia)
| Idea | Dónde verla en Graphite | Cómo la aplicamos |
|---|---|---|
| Dispatcher central de mensajes con handlers | `editor/src/dispatcher.rs` | `core.dispatch(Command)` (detalle §1) |
| Colapsar mensajes redundantes por frame | `SIDE_EFFECT_FREE_MESSAGES` y `FRONTEND_UPDATE_MESSAGES` en dispatcher.rs | Render y refresco de paneles 1×/frame |
| Atajos filtrados por acciones disponibles | `editor/src/messages/input_mapper/` | Tabla de atajos única (detalle §2) |
| Frontend "tonto": managers / stores / subscriptions router | `frontend/src/README.md`, `frontend/src/managers/`, `stores/`, `subscriptions-router.ts` | `apps/web/src/managers` + `stores` (Zustand) |
| UI de propiedades descrita por el núcleo (widgets) | `editor/src/messages/layout/` | Esquema declarativo de parámetros para ajustes/filtros → panel auto-generado |
| Pincel GPU por barrido analítico de segmentos | `node-graph/nodes/brush/src/basic_brush/` | Base de nuestro pincel WGSL (detalle §3) |
| Formato de documento con manifest de arranque y journal append-only | `document/format/`, `node-graph/rfcs/document-format.md` | `.stratum` (detalle §4) |
| 27 blend modes agrupados como Photoshop | `node-graph/libraries/no-std-types/src/blending.rs` | Checklist y fórmulas |
| Conversión explícita a lineal | `no-std-types/src/color/color_traits.rs` | Pipeline RGBA16F lineal |
| RFCs de diseño | `node-graph/rfcs/` | `docs/rfcs/` |
| Service worker offline | `frontend/src/service-worker.js` | PWA |
| Test "los archivos de demo siguen abriendo" | `check_if_demo_art_opens` en dispatcher.rs | Test de regresión de formato `.stratum` |

## Qué EVITAMOS
- Grafo de nodos como modelo central (ADR-005).
- rust-gpu para shaders (ADR-001): WGSL directo.
- Snapshots completos del documento para undo (ADR-007). Graphite sigue con snapshots en el editor
  (`MAX_UNDO_HISTORY_LEN = 100`) mientras migra a deltas CRDT en "modo sombra" (dual-write).
- CRDT/DAG de historial: resuelve colaboración multiusuario, que no está en nuestro alcance (ADR-007).
- IndexedDB para binarios grandes (ADR-008). **Graphite llegó a la misma conclusión**: movió los
  documentos a OPFS y deja IndexedDB solo para estado chico (lista de pestañas, preferencias).
- `createWritable` de OPFS para escrituras frecuentes (ver §4: copia el archivo entero en cada escritura).
- Caché de render en espacio de pantalla invalidada al cambiar el zoom (ver §5): para raster, nuestras
  tiles viven en espacio de documento + mipmaps y sobreviven al zoom.

---

## 1. Dispatcher (`editor/src/dispatcher.rs`, 511 líneas)
- **Pila de colas, procesamiento en profundidad.** `message_queues: Vec<VecDeque<Message>>`. Cada
  mensaje procesado genera sus hijos en una cola nueva que se apila; se procesa siempre la cola más
  profunda. Resultado: los efectos de un mensaje terminan antes de que corra su hermano → orden
  determinista y fácil de razonar.
- **Dedup de mensajes sin efectos laterales** (render, "estructura cambió"): si ya hay uno igual en la
  cola raíz, se descarta; si llega anidado, se mueve al final de la cola raíz. Se ejecuta una vez, al final.
- **Buffer por frame para refrescos de UI** (panel de propiedades, capas, reglas, overlays): se
  acumulan y se liberan solo en `AnimationMessage::IncrementFrameCounter`. Nunca más de 1 refresco/frame.
- **Contexto tipado por handler.** Cada handler recibe un struct con referencias explícitas a lo que
  necesita de otros handlers (p. ej. `ToolMessageContext { document, input, viewport, preferences }`).
  No hay estado global; las dependencias entre subsistemas quedan visibles en un solo archivo.
- Los mensajes hacia el frontend solo se acumulan en `responses` y se devuelven a JS en lote.
- Logging como árbol (├──/└──) con niveles off/nombres/contenido y lista de mensajes ruidosos excluidos
  (pointer move, frame). Muy útil para depurar; se activa con Alt+0/1/2.

**Para Stratum (S1-02):** `core.dispatch()` con la misma pila en profundidad; marcar Commands como
`coalescible` (render, refresco de miniaturas, refresco de paneles) en vez de listas separadas; el
flush 1×/frame lo dispara el `requestAnimationFrame` del engine. Los handlers de core reciben su
contexto por parámetro (encaja con "core no importa DOM": el contexto se inyecta).

## 2. Input y atajos (`editor/src/messages/input_mapper/`)
- La tabla `input_mappings.rs` es la **única fuente de verdad**: `entry!(KeyDown(KeyZ); modifiers=[Accel], action_dispatch=...)`.
- Indexada por (tipo de evento, tecla) → lista de entradas **ordenadas por nº de modificadores
  descendente**: la combinación más específica gana (Ctrl+Shift+Z antes que Ctrl+Z).
- **Una entrada solo dispara si su acción está anunciada como disponible** por los handlers activos
  (`advertise_actions!`, `collect_actions()`). Así la misma tecla significa cosas distintas según la
  herramienta activa, sin `if` dispersos.
- Tecla virtual `Accel` = Cmd en macOS, Ctrl en el resto. Orden de modificadores al mostrar según guía de plataforma.
- `canonical: true` elige qué atajo se muestra en menús/tooltips cuando una acción tiene varios.
  Menús y tooltips **derivan la etiqueta del atajo de la misma tabla** (`action_input_mapping`).
- `refresh_keys=[Shift]`: el pointer-move se re-emite al pulsar/soltar Shift → el snapping se
  actualiza sin mover el mouse. Detalle fino que se nota en la UX.
- Distinguen `KeyDown` y `KeyDownNoRepeat` (autorepeat del SO).

**Para Stratum:** una tabla de atajos en core (`shortcuts.ts`) que alimenta a la vez el dispatcher de
teclado, los tooltips (`Tooltip` rico con atajo) y la Command Palette (cmdk) → cumple la regla de
AGENTS.md "atajo + entrada en Command Palette" por construcción. Adoptar `Accel`, `canonical`,
orden por especificidad, filtro por disponibilidad y `refresh_keys`.

## 3. Pincel GPU (`node-graph/nodes/brush/src/basic_brush/`, ~1.8k líneas)
**Cambió respecto de lo anotado en 4813fe3**: ya no estampa "dabs" discretos. Cada segmento del
trazo se dibuja como **un quad** y el fragment shader integra el kernel a lo largo del segmento →
trazo continuo sin artefactos de espaciado ni "cuentas de collar".
- **Kernel**: super-gaussiana `exp(-((v² + s²)/2)^p)`. `p = 1` gaussiana suave; `p` alto aplana el
  centro y endurece el borde. **Dureza → p** en escala exponencial de 0.7 a 48 (`kernel.rs`).
- **LUT 2D 256×256** horneada en CPU (integral acumulada a lo largo del eje, trapecios de 4096 pasos):
  fila = distancia perpendicular, columna = posición a lo largo. Un segmento = `F(v,t) − F(v,t−len)`,
  dos lecturas de textura. Caché LRU de 64 LUTs por `p` cuantizado (ln p × 24).
- **Calibración**: se busca dónde el alfa resuelto cruza 5% y se escala para que ese contorno caiga
  exactamente en `diámetro/2` → **el ancho pintado coincide con el ajuste, sea duro o suave**.
  `p` se limita para que el borde tenga ≥ 1.5 texels en pantalla (antialias garantizado).
- **Dos render targets R16Float** (`scatter.wgsl`): `density` con blend **Add** (acumula como flujo
  continuo) y `stamp` con blend **Max** (tapas redondas en extremos). `resolve.wgsl`:
  `field = max(density, stamp)`, `alpha = (1 − e^(−field·G))·norm·color.a`, salida premultiplicada
  RGBA16F. La saturación exponencial hace que `color.a` actúe como **tope de opacidad del trazo**.
- **Flujo → peso por dab**: `weight = −ln(1 − flow·(1 − e^(−G)))/G` (G = 5.0757) para que el flujo
  percibido sea lineal con el slider.
- **Presión**: `sigma = diámetro/4 × presión`. Segmentos con sigma variable se parten en hasta 64
  piezas para acotar el error del borde.
- **Diezmado**: se descartan muestras a menos de `sigma_min/2` (mín. 0.5 texel) de la anterior.
- **Render incremental** (`stroke.rs`, `Walk`): los segmentos ya fijos (`committed`) se dibujan una
  vez; solo el último tramo en curso (`tail`) se re-dibuja cada frame. Latencia del pincel O(1) por frame.
- Recorte alineado a 256 px (`CROP_STEP = 256`) y resolución máx. 8192.

**Para Stratum (S3-01):** adoptar kernel + LUT + calibración + fórmula de flujo + MRT density/stamp +
render incremental casi tal cual (todo es WGSL, licencia MIT/Apache citando fuente). **Diferencia de
fondo**: en Graphite el trazo es no destructivo (se guardan las muestras y se re-rasteriza a la
resolución del viewport); en Stratum el trazo se **hornea en las tiles de la capa** a resolución de
documento al soltar. Flujo propuesto: trazo en curso → buffer de trazo por tile sucia (density/stamp)
→ preview compuesto en vivo → al terminar, un Command que escribe las tiles (diff antes/después, ADR-007).
Esto además da el modelo "opacidad vs. flujo" de Photoshop gratis (opacidad = tope `color.a` del trazo).

## 4. Persistencia y formato de documento (`document/`, RFC `node-graph/rfcs/document-format.md`)
Arquitectura en 3 capas, que conviene copiar tal cual en forma:
```
document-graph-storage (modelo, sin disco)   document-container (backends: folder, memoria, OPFS;
          ▲                                     archivado: zip, xz)
          └──── document-format (handle Gdd: layout, codecs, manifest, orquestación) ────┘
```
- **manifest.json siempre JSON** (archivo de arranque): `format: "gdd"`, `format_version: u32`,
  versión del editor, id del documento y **tabla de codecs por payload** (nunca se infiere el codec
  por extensión). Un build rechaza versiones mayores a `SUPPORTED_FORMAT_VERSION`.
- **session.json separado del documento**: cursor del historial, pila de redo, ajustes de vista
  (zoom/pan, reglas, paneles). Lo que es "dónde estoy mirando" no ensucia el documento ni el undo.
  **El redo sobrevive a cerrar y reabrir.**
- **history**: journal append-only. En binario, **frames con prefijo de longitud** para detectar el
  último frame roto tras un cierre inesperado. **hot-log**: operaciones aún no consolidadas, como
  sidecar para recuperación ante crash.
- **resources/<hash>**: bytes direccionados por contenido (blake3) → deduplicación automática.
- **Working copy vs. export**: el documento vive como carpeta en OPFS que se actualiza en continuo
  (autoguardado cada 1 s, `AUTO_SAVE_TIMEOUT_SECONDS`); exportar empaqueta esa carpeta a zip/xz sin
  tocar la copia de trabajo. Un solo formato lógico, dos envoltorios.
- **Undo por interacción, no por delta**: el último delta de una interacción lleva `interaction_end`;
  undo retrocede hasta ese borde.
- Migraciones sobre la forma "sin tipos" antes de hidratar a tipos de runtime; en una etapa de
  transición guardan también el formato viejo (`legacy.graphite`) dentro del nuevo (dual-write).
- **Escritura a OPFS** (`document/container/src/backends/opfs.rs`): cola FIFO de mutaciones
  (write/append/delete) drenada por una sola tarea async, con **barreras** para que las lecturas vean
  lo encolado. Usan `createWritable`, que **copia el archivo entero en cada escritura** → N appends
  costaban O(N²); lo mitigan fusionando appends consecutivos al mismo archivo. Errores de escritura
  con alerta al usuario con debounce de 60 s.

**Para Stratum:** ver propuestas ADR-018 y ADR-019 en decisions.md. En resumen: I/O de OPFS en un
worker con `createSyncAccessHandle` (escritura in-place, sin copia; solo existe en workers), y
`.stratum` como carpeta de trabajo en OPFS + ZIP solo al exportar. Idea adicional para S1-02:
**tiles direccionadas por hash** en el almacén de undo → una tile que no cambió entre snapshots se
guarda una sola vez (dedup gratis sobre ADR-007).

## 5. Viewport, footprint y caché de render (`core-types/src/transform.rs`, `gstd/src/render_cache.rs`)
- `Footprint { transform, resolution, quality }`: cada nodo recibe qué área y a qué resolución se
  va a mostrar, y renderiza solo eso (render a resolución de pantalla, no de documento).
- `RenderQuality`: `Preview` / `Scale(f)` / `Probability(p)` / `Full` — permite servir una versión
  de menor calidad mientras se calcula la completa (refinamiento progresivo).
- **Caché de render por tiles de 256 px con presupuesto fijo de 512 MB** (`MAX_CACHE_MEMORY_BYTES`),
  desalojo LRU por `last_access`. Las tiles faltantes se agrupan en regiones conexas (flood fill) y
  se parten por el eje largo si superan un área máxima → menos pasadas de render.
- **La clave de caché incluye el zoom**: cambiar de zoom invalida toda la caché (solo el pan
  reutiliza). Aceptable para vector; para raster lo evitamos (tiles en espacio de documento + mipmaps).

**Para Stratum (S1-03):** confirma el enfoque del spike S0-09 y de la nota de VRAM de performance.md:
presupuesto fijo en bytes (no en número de tiles), LRU, y agrupar tiles faltantes en regiones. Combinar
con nuestro `UPLOAD_BUDGET_PER_FRAME` (carga progresiva) y con `RenderQuality` → mostrar primero el
mipmap bajo de una tile mientras sube la de resolución completa.

## Pendiente de estudiar (S0-07) — cerrado
- [x] Resolución del viewport y footprint de render → §5
- [x] Input y mapeo de atajos → §2
- [x] Persistencia de sesión (`frontend/src/utility-functions/persistence.ts`) → §4
- [x] Formato `.gdd` y su RFC → §4
- [x] Dispatcher → §1 · Pincel GPU → §3
