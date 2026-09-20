# Modelo de documento — Stratum

## Entidades (packages/core)
```ts
Document { id, name, width, height, colorSpace: 'srgb-linear', bitDepth: 8|16,
           root: Group, guides: Guide[], selection: Selection|null, meta }
Layer (union):
  PixelLayer      { id, name, visible, locked, opacity, blendMode, tiles: TileMap,
                    transform: Affine|Perspective (no destructivo), source?: SmartSource,
                    mask?: Mask, clipped: boolean }
  AdjustmentLayer { id, name, visible, opacity, blendMode, kind, params, mask?, clipped }
  Group           { id, name, visible, opacity, blendMode | 'pass-through', children: Layer[], mask? }
  FillLayer       { color | gradient }  (Fase 4)
Mask      { tiles: TileMap(R16F), enabled, linked, density, feather }
Selection { tiles: TileMap(R8) }  // selección = máscara suavizable (antialias/feather)
TileMap   Map<"x,y", TileRef>     // TileRef apunta a GPU/RAM/OPFS según residencia
```

## Transformaciones no destructivas
- La capa conserva sus píxeles originales (`source`) y un `transform`. El render remuestrea al vuelo.
- "Rasterizar" es un Command explícito. Así se escala sin perder resolución (como Compositor).

## Commands e historial
```ts
interface Command { id: string; label: string; apply(doc): Diff; merge?(next): boolean }
```
- `Diff` guarda **solo los tiles cambiados** (antes/después) + cambios de propiedades.
- Trazo de pincel = un solo Command (merge de eventos del trazo).
- Sliders: `merge` colapsa cambios continuos en una sola entrada.
- Tope configurable (100 pasos) y **presupuesto de memoria** (1 GB); lo antiguo pasa a OPFS.
- Panel History muestra `label` legible (i18n es/en).
- Cada Command aplicable también es acción de la Command Palette.

## Formato .stratum
ZIP (fflate):
```
manifest.json                 # versión de formato, dimensiones, árbol de capas, params
tiles/<layerId>/<x>_<y>.bin   # tiles comprimidos (RGBA16F o RGBA8)
masks/<layerId>/...
thumb.webp                    # miniatura para la pantalla de inicio
```
- Versionado con migraciones. Nunca romper archivos viejos.
- Import PSD básico (capas, opacidad, blend modes, máscaras) vía ag-psd. Export PSD: posterior.

## Invariantes (tests obligatorios)
- apply → undo → redo produce documento idéntico (hash de tiles).
- Serializar → deserializar .stratum es idempotente.
- Ningún Command muta el documento fuera de `apply`.
