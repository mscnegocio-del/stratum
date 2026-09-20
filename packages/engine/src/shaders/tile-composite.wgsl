// tile-composite.wgsl — compone hasta MAX_LAYERS capas de UNA tile en un solo pase.
// Se concatena en JS detras de blend.wgsl (mismo modulo de shader): sin sistema de
// includes en WGSL, es la forma mas simple de compartir compositeOver().
//
// Entradas: tile.clip       = escala/offset en clip space del quad de esta tile
//           tile.uvExtent   = recorte de UV (las tiles de borde son mas chicas que 256x256)
//           tile.layerCount = cuantas capas de layerTextures/layerParams son validas
//           layerParams[i]  = (blendMode, opacity) por capa, compartido entre todas las tiles
//           layerTextures   = un layer de textura GPU por capa de Stratum, recortado a esta tile
// Salida:   color compuesto de la tile, alfa recto (ver blend.wgsl)

const MAX_LAYERS: u32 = 20u;

struct TileTransform {
  clip: vec4<f32>,
  uvExtent: vec2<f32>,
  layerCount: u32,
  _pad: u32,
};

struct LayerParams {
  // value.x = blend mode (como f32, se castea a u32) · value.y = opacity
  values: array<vec4<f32>, MAX_LAYERS>,
};

@group(0) @binding(0) var<uniform> tile: TileTransform;
@group(0) @binding(1) var<uniform> layerParams: LayerParams;
@group(0) @binding(2) var layerTextures: texture_2d_array<f32>;
@group(0) @binding(3) var layerSampler: sampler;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOutput {
  let unit = vec2<f32>(f32(index & 1u), f32((index >> 1u) & 1u));
  var out: VertexOutput;
  out.position = vec4<f32>(
    unit.x * tile.clip.x + tile.clip.z,
    unit.y * tile.clip.y + tile.clip.w,
    0.0,
    1.0,
  );
  out.uv = unit * tile.uvExtent;
  return out;
}

@fragment
fn fragmentMain(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  var accum = vec4<f32>(0.0, 0.0, 0.0, 0.0);
  for (var i: u32 = 0u; i < tile.layerCount; i = i + 1u) {
    let params = layerParams.values[i];
    let mode = u32(params.x);
    let opacity = params.y;
    var texel = textureSample(layerTextures, layerSampler, uv, i32(i));
    texel.a = texel.a * opacity;
    accum = compositeOver(accum, texel, mode);
  }
  return accum;
}
