// quad.wgsl — dibuja una textura completa como un quad con transformacion de viewport.
// Entradas:  uniform transform = vec4(scaleX, scaleY, offsetX, offsetY) en clip space
//            texture_2d<f32> + sampler lineal
// Salida:    color del canvas, sin conversion de espacio de color (blit directo)
// Espacio:   el mismo del texel; la conversion a lineal/sRGB llega con el compositor real.

struct Transform {
  value: vec4<f32>,
};

@group(0) @binding(0) var<uniform> transform: Transform;
@group(0) @binding(1) var image: texture_2d<f32>;
@group(0) @binding(2) var imageSampler: sampler;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOutput {
  // Triangle strip de 4 vertices: (0,0) (1,0) (0,1) (1,1). Sin vertex buffer.
  let uv = vec2<f32>(f32(index & 1u), f32((index >> 1u) & 1u));
  var out: VertexOutput;
  out.position = vec4<f32>(
    uv.x * transform.value.x + transform.value.z,
    uv.y * transform.value.y + transform.value.w,
    0.0,
    1.0,
  );
  out.uv = uv;
  return out;
}

@fragment
fn fragmentMain(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  return textureSample(image, imageSampler, uv);
}
