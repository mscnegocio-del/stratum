// blend.wgsl — funciones de blend mode, reutilizables por cualquier shader de composicion.
// Entradas:  backdrop/source en alfa recto (no premultiplicado)
// Salida:    color compuesto en alfa recto
// Espacio:   este spike trabaja en rgba8unorm; el compositor real usa alfa premultiplicado
//            en RGBA16F lineal (ADR-006) — aqui solo se mide el costo de GPU del blending.

const BLEND_NORMAL: u32 = 0u;
const BLEND_MULTIPLY: u32 = 1u;

fn blendRgb(mode: u32, backdrop: vec3<f32>, source: vec3<f32>) -> vec3<f32> {
  if (mode == BLEND_MULTIPLY) {
    return backdrop * source;
  }
  return source; // Normal
}

// Compone "source" sobre "backdrop" (Porter-Duff "over") tras aplicar el blend mode al RGB.
fn compositeOver(backdrop: vec4<f32>, source: vec4<f32>, mode: u32) -> vec4<f32> {
  let blended = blendRgb(mode, backdrop.rgb, source.rgb);
  let outAlpha = source.a + backdrop.a * (1.0 - source.a);
  if (outAlpha <= 0.0) {
    return vec4<f32>(0.0, 0.0, 0.0, 0.0);
  }
  let outRgb = (blended * source.a + backdrop.rgb * backdrop.a * (1.0 - source.a)) / outAlpha;
  return vec4<f32>(outRgb, outAlpha);
}
