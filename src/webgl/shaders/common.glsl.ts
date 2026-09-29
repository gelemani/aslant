// Shared GLSL helpers (brief 6.1.3, 4.9). Plain strings: no three import.

/** ACES (Narkowicz fit), sRGB encode, hashes for photon grain and dither. */
export const COMMON_GLSL = /* glsl */ `
vec3 acesNarkowicz(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
vec3 linearToSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  vec3 lo = c * 12.92;
  vec3 hi = 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055;
  return mix(hi, lo, step(c, vec3(0.0031308)));
}
// Hash without sine (Dave Hoskins), stable across GPUs.
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float hashSeed(vec2 p, float seed) {
  return hash12(p + vec2(seed * 37.17, seed * 17.31));
}
`

/** Wave field of the loose phase (brief 6.1.2: 7 directional sinusoids, proto/v2.py rng 21). */
export const WAVES_GLSL = /* glsl */ `
const float TAU = 6.28318530718;
const vec4 WAVE_K[7] = vec4[7](
  vec4(0.66280, -3.34669, 4.45981, 0.55346),
  vec4(-2.83518, -3.04645, 2.66033, 0.56744),
  vec4(3.43055, -0.92076, 1.23900, 0.90324),
  vec4(2.61625, -0.11940, 5.36496, 0.91935),
  vec4(0.45489, 2.52896, 5.99515, 0.70426),
  vec4(-6.82201, 2.63212, 2.76650, 0.50016),
  vec4(-0.44719, 6.93006, 4.78319, 0.86383)
);
const float WAVE_A[7] = float[7](0.085913, 0.057740, 0.079262, 0.145794, 0.151457, 0.006546, 0.007258);
// g = gradient, h = (hxx, hyy, hxy)
void waves(vec2 p, float t, out vec2 g, out vec3 h) {
  g = vec2(0.0); h = vec3(0.0);
  for (int i = 0; i < 7; i++) {
    vec4 w = WAVE_K[i];
    float a = WAVE_A[i];
    float arg = TAU * (w.x * p.x + w.y * p.y) + w.z + w.w * t;
    float c = cos(arg);
    float s = sin(arg);
    g += a * TAU * w.xy * c;
    h += -a * TAU * TAU * vec3(w.x * w.x, w.y * w.y, w.x * w.y) * s;
  }
}
`
