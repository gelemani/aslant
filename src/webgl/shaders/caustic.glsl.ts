// Caustic pass (brief 6.1.2): one point per ray per wavelength band, footprint-scaled Gaussian
// splats, additive into a half-float target covering lower-light space. Output is relative
// irradiance: 1.0 = plain sunlight through plain glass.
import { WAVES_GLSL } from './common.glsl'

export const CAUSTIC_VERT = /* glsl */ `
attribute vec2 aOrigin;
attribute vec2 aTarget;
attribute vec2 aTargetPrev;
attribute float aDensity;
uniform float uFocus, uWave, uTime, uMorph, uDispersion, uSpacing, uPointMax, uAberr, uPointScale;
uniform float uEnergy;              // < 1 for the early frames of a streamed word (CausticPass formEnergy)
uniform vec2 uSunOffset;           // lower-light units
uniform vec4 uWordRect;            // raster -> lower-light: xy offset, zw size
uniform vec2 uTarget;              // render target size, px
varying float vSigma;
varying float vSize;
varying float vTrunc;
#define LOOSE_DIM 0.62
${WAVES_GLSL}
// Three fixed low-frequency sinusoids: the off-axis smear of the pane when the sun leaves its hour.
vec2 aberrField(vec2 p) {
  float a = sin(TAU * (1.31 * p.x + 0.47 * p.y) + 0.4);
  float b = sin(TAU * (-0.62 * p.x + 1.18 * p.y) + 2.1);
  float c = sin(TAU * (2.07 * p.x - 0.93 * p.y) + 4.3);
  return vec2(0.020 * a + 0.009 * c, 0.013 * b - 0.006 * c);
}
// Per-ray hash in [-0.5, 0.5]^2 (stable per origin).
vec2 rayJitter(vec2 o) {
  vec3 p3 = fract(vec3(o.xyx) * vec3(443.897, 441.423, 437.195));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract(vec2((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y)) - 0.5;
}
void main() {
  vec2 target = uWordRect.xy + mix(aTargetPrev, aTarget, uMorph) * uWordRect.zw;
  vec2 g; vec3 h;
  // While the light is loose the R2 origins would read as a regular dot lattice: jitter each ray by
  // up to 0.4 of the ray spacing (in lower-light units) and widen the splats; both vanish before the
  // word forms, so the formed word is exact.
  float loose = 1.0 - smoothstep(0.25, 0.6, uFocus);
  vec2 spacingUv = vec2(uSpacing) / uTarget;
  vec2 origin = aOrigin + rayJitter(aOrigin) * 0.8 * spacingUv * loose;
  waves(origin, uTime, g, h);
  float D = uWave * 0.018;
  vec2 disp = uFocus * (target - origin) + (1.0 - uFocus) * D * g;           // displacement interpolation
  vec2 p = origin + uDispersion * disp + uSunOffset + uAberr * aberrField(aOrigin);
  float detJ = abs((1.0 + D * h.x) * (1.0 + D * h.y) - D * h.z * D * h.z);  // ray differential of the wave map
  float foot = ((1.0 - uFocus) + uFocus / max(aDensity, 1e-3)) * max(detJ, 0.02);
  float s = clamp(0.55 * uSpacing * sqrt(foot) * uPointScale, 0.45, 14.0);
  s = max(s, 0.8 * uSpacing * (1.0 - uFocus) * loose);
  // Splat span: +-3 sigma when formed; +-2 sigma while loose (the wide loose splats would otherwise
  // cost twice the fill); vTrunc renormalises the truncated Gaussian so energy is conserved.
  float span = 6.0 - 2.0 * loose;
  vSize = min(span * s, uPointMax);
  vSigma = vSize / span;                                                     // truncate by shrinking: energy is conserved
  // Loose light (and the slab it gathers into on the way to the word) spreads its energy where the
  // tone curve is still steep, so the same radiance reads far brighter than letters that pack it
  // into the shoulder: every keystroke flashed the patch white (MOT-1). Until the letters separate
  // (focus 0.9) the light carries less energy, so the displayed patch stays level through the
  // focus ramp and the formed word stays the brightest thing (3.1.2).
  float dim = LOOSE_DIM * (1.0 - smoothstep(0.55, 0.92, uFocus));
  vTrunc = mix(1.0054, 1.0976, loose) * (1.0 - dim) * uEnergy;                      // 1 / erf(span / (2 sqrt 2))^2
  gl_PointSize = vSize;
  gl_Position = vec4(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
}
`

export const CAUSTIC_FRAG = /* glsl */ `
uniform vec3 uBandRGB;
uniform float uNorm;               // rtW * rtH / N
varying float vSigma;
varying float vSize;
varying float vTrunc;
void main() {
  vec2 r = (gl_PointCoord - 0.5) * vSize;
  float w = vTrunc * exp(-0.5 * dot(r, r) / (vSigma * vSigma)) / (6.2831853 * vSigma * vSigma);
  gl_FragColor = vec4(uBandRGB * (w * uNorm), 1.0);
}
`
