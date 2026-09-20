# Design System — Stratum (pilar #2)

> Estética: herramienta profesional contemporánea (referencias de calidad: Figma, Linear, Raycast,
> Arc, Photoshop 2026). Sobria, precisa, silenciosa. La imagen del usuario es el único color protagonista.

## 1. Fuente de verdad
- Diseño en **Penpot** (recomendado, open source) o Figma → archivo enlazado en README.
- Código: `packages/ui-kit/src/tokens.css` con variables CSS consumidas por Tailwind v4 (`@theme`).
- Página "Kitchen Sink" (`/dev/ui`) con TODOS los componentes y estados. Es la referencia viva.

## 2. Tokens de color (tema oscuro por defecto; claro como opción)
Grises neutros ligeramente fríos, nunca negro puro (fatiga visual y mala lectura de contraste de la foto).
```
--bg-app        #17181B   fondo de la aplicación
--bg-canvas     #1E1F23   área de trabajo alrededor del documento
--bg-panel      #212226   paneles
--bg-elevated   #2A2B30   popovers, menús, tooltips
--bg-hover      #2F3036
--bg-active     #36373E
--border-subtle #2C2D32
--border-strong #3B3C43
--text-primary  #EDEDEF
--text-secondary#A1A1AA
--text-muted    #71717A
--accent        #5B8CFF   foco, selección, herramienta activa (único color de marca en UI)
--accent-hover  #7AA2FF
--success #3FB950 · --warning #D29922 · --danger #F85149
--ai            #B28CFF   exclusivo para funciones de IA local (identidad visual del pilar #4)
```
Regla: el acento se usa con moderación (≤ 5% de la UI visible). Validar contraste AA en ambos temas.

## 3. Tipografía
- UI: **Inter** (variable, con `font-feature-settings: 'cv11','ss01','tnum'` en números).
- Monoespaciada (valores, hex, coordenadas): **JetBrains Mono**.
- Escala: 11 (micro), 12 (base UI), 13 (títulos panel), 15 (diálogos), 20 (pantalla inicio).
- Números tabulares en todos los campos numéricos.

## 4. Espaciado, radios, sombras
- Base 4 px: 2, 4, 6, 8, 12, 16, 24, 32.
- Densidad: filas de panel 28 px; controles 24–28 px; objetivo táctil mínimo 32 px en modo tablet.
- Radios: 4 (inputs), 6 (botones), 8 (paneles/popovers), 12 (diálogos).
- Sombras solo en elementos flotantes; borde sutil + sombra suave en capas.

## 5. Movimiento (Motion)
- Duraciones: 120 ms (micro: hover, toggles), 180 ms (popovers, paneles), 240 ms (diálogos).
- Curva: `cubic-bezier(0.2, 0, 0, 1)` (entrada) · `cubic-bezier(0.4, 0, 1, 1)` (salida).
- Nada animado durante interacción directa con el canvas (zoom/pan/pintar son instantáneos).
- `prefers-reduced-motion`: sustituir por fundidos de 80 ms o nada.

## 6. Iconografía
- Set único de 20 px, trazo 1.5 px (base: Lucide o Phosphor, verificar licencia; iconos de herramientas
  propios cuando no exista uno claro). Herramienta activa: fondo `--bg-active` + icono `--accent`.

## 7. Inventario de componentes (packages/ui-kit)
Primitivos (sobre Radix): Button, IconButton, ToggleGroup, Tooltip (rico, con atajo), Popover, Menu,
ContextMenu, Dialog, Tabs, Select, Checkbox, Switch, Toast.
Específicos del editor:
- **NumberField** (scrubby + matemáticas + unidades px/%/°)
- **Slider** con valor editable, doble clic reset, marcas
- **ColorPicker** (HSV cuadrado + tira de tono, HEX/RGB/HSL, cuentagotas, historial, OKLCH opcional)
- **CurvesEditor**, **LevelsEditor** (histograma en vivo)
- **GradientEditor**
- **LayerRow** (miniatura, miniatura de máscara, visibilidad, candado, clipping, blend, drag&drop)
- **BlendModeSelect** (agrupado como Photoshop, preview en vivo al pasar el cursor)
- **ToolOptionsBar**, **ContextualBar**, **CanvasHUD**
- **CommandPalette** (cmdk)
- **Panel** (colapsable, redimensionable), **StatusBar** (zoom, dimensiones, memoria, GPU)
- **AIButton** (badge "Local", estado de descarga del modelo, progreso)

## 8. Layout por defecto
```
┌──────────────────────────── TitleBar / Menú / Tabs de documentos ─────────────────────┐
│ ToolOptionsBar (opciones de la herramienta activa)                                     │
├────┬────────────────────────────────────────────────────────────────┬─────────────────┤
│Tool│                                                                │ Properties      │
│bar │                     CANVAS (protagonista)                      │ (contextual)    │
│    │              [ContextualBar flotante junto a selección]        ├─────────────────┤
│    │                                                                │ Layers          │
│    │                                                                ├─────────────────┤
│    │                                                                │ History / Color │
├────┴────────────────────────────────────────────────────────────────┴─────────────────┤
│ StatusBar: zoom · tamaño · modo de color · memoria · GPU · "Guardado localmente ✓"     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

## 9. Checklist de calidad visual (antes de mergear UI)
- [ ] Usa solo tokens (sin hex/px sueltos)
- [ ] Todos los estados diseñados (ver ux-principles §3)
- [ ] Foco visible por teclado
- [ ] Contraste AA verificado
- [ ] Alineado a la rejilla de 4 px
- [ ] Probado en tema oscuro y claro
- [ ] Captura agregada a la regresión visual (Playwright)
