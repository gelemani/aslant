// Dust motes (brief 6.1.6): points drifting on analytic curl noise, visible only inside the beam
// (point in the beam hexagon), brightness sun x 0.35 x a ramp along the beam, sizes 1.5 to 3.5
// CSS px, additive over the compositor's display-space output.

export const DUST_VERT = /* glsl */ `
attribute vec4 aSeed;              // xy base position (0..1 of the beam box), z size, w phase
uniform vec4 uBox;                 // beam bounding box, CSS px (x, y, w, h)
uniform vec2 uBuffer;
uniform float uDpr;
uniform float uTime;
uniform float uAir;                // damped scroll velocity, -1..1
uniform vec2 uBeam[6];
uniform vec2 uPatchC;              // patch centre, CSS px
uniform vec2 uBeamDir;             // toward the window
uniform float uBeamLen;
varying float vAlpha;
varying float vSize;

vec2 curl(vec2 p, float t) {
  // analytic curl of a sum of three sinusoidal potentials (divergence free)
  float a = 1.7, b = 2.3, c = 3.1;
  vec2 v = vec2(0.0);
  v += vec2( cos(p.y * a + t * 0.21) * a, -cos(p.x * a - t * 0.17) * a) * 0.50;
  v += vec2( cos(p.y * b - t * 0.13 + 1.3) * b, -cos(p.x * b + t * 0.19 + 0.7) * b) * 0.30;
  v += vec2( cos(p.y * c + p.x * 0.5 + t * 0.11) * c, -cos(p.x * c - p.y * 0.5 - t * 0.23) * c) * 0.12;
  return v;
}

float insideBeam(vec2 p) {
  float area = 0.0;
  for (int i = 0; i < 6; i++) {
    vec2 a = uBeam[i];
    vec2 b = uBeam[(i + 1) % 6];
    area += a.x * b.y - b.x * a.y;
  }
  if (abs(area) < 1.0) return 0.0;
  float sgn = area >= 0.0 ? 1.0 : -1.0;
  float m = 1.0;
  for (int i = 0; i < 6; i++) {
    vec2 a = uBeam[i];
    vec2 b = uBeam[(i + 1) % 6];
    vec2 e = b - a;
    float len = length(e);
    if (len < 0.5) continue;
    float d = sgn * (e.x * (p.y - a.y) - e.y * (p.x - a.x)) / len;
    m *= smoothstep(0.0, 18.0, d);
  }
  return m;
}

void main() {
  vec2 base = aSeed.xy;
  float t = uTime;
  // drift in box units: curl flow (0.02 to 0.12 CSS px per frame at 60 Hz), a slow sink, a swirl with the air
  vec2 flow = curl(base * 6.0 + aSeed.w, t * 0.35) * (0.0009 + 0.0006 * aSeed.w);
  vec2 pos = base + flow * t * 0.6 + vec2(uAir * 0.012 * sin(t * 0.7 + aSeed.w * 6.0), 0.0012 * t * (0.4 + aSeed.w) + uAir * 0.008 * cos(t * 0.5 + aSeed.w * 9.0));
  pos = fract(pos);
  vec2 css = uBox.xy + pos * uBox.zw;
  float inside = insideBeam(css);
  // ramp along the beam: motes read in the shaft of air between the window and the wall, against
  // the shade; in front of the lit patch itself they fade (a lit wall outshines them)
  float along = dot(css - uPatchC, uBeamDir) / max(uBeamLen, 1.0);
  float ramp = smoothstep(0.12, 0.32, along) * smoothstep(1.0, 0.45, along);
  float twinkle = 0.65 + 0.35 * sin(t * (0.6 + aSeed.w) + aSeed.w * 40.0);
  vAlpha = inside * ramp * twinkle;
  vSize = mix(1.5, 3.5, aSeed.z) * uDpr;
  gl_PointSize = vAlpha > 0.001 ? vSize : 0.0;
  vec2 ndc = vec2(css.x * uDpr / uBuffer.x * 2.0 - 1.0, 1.0 - css.y * uDpr / uBuffer.y * 2.0);
  gl_Position = vec4(ndc, 0.0, 1.0);
}
`

export const DUST_FRAG = /* glsl */ `
uniform vec3 uSunDisplay;          // sun colour x 0.35, display space
varying float vAlpha;
varying float vSize;
void main() {
  vec2 r = gl_PointCoord - 0.5;
  float d = dot(r, r) * 4.0;
  float w = exp(-d * 2.2);
  gl_FragColor = vec4(uSunDisplay * w * vAlpha, 1.0);
}
`
