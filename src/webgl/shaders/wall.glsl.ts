// Wall mode (brief 6.1.3, 6.1.4): limewash in shade lit by skylight, one slanted sun patch with
// penumbra, transom and mullion shadows, drawn-glass cords in the plain upper light, the caustic
// word pane below, scrims, air-light along the beam, halation, skirting. Multiplicative lighting
// only: radiance = albedo x irradiance. Returns linear radiance; the tail is in compositor.glsl.ts.
//
// Helpers available to WP5's mode chunks (declared before them): uViewport, uDpr, uTime, uPlaster,
// uAlbedo, uSky, uSun, uDefocus, fragToCss(), wallAlbedo(fragCSS), skyFall(q), plainWall(fragCSS),
// shadeWall(fragCSS).

export const WALL_GLSL = /* glsl */ `
uniform vec2 uViewport;            // canvas CSS size
uniform vec2 uBuffer;              // drawing buffer size, device px
uniform float uDpr;
uniform float uTime;
uniform sampler2D uPlaster;        // 1024^2 tileable: R cloud, G trowel, B cords
uniform vec3 uAlbedo;              // 0.62 x lin(#D6CEBE)
uniform vec3 uSky;                 // calibrated skylight (6.1.5)
uniform vec3 uSun;                 // sun rgb x E_sun x (1 - 0.8 cloud)
uniform vec4 uPatch;               // x, y, w, h (CSS px)
uniform float uSkew, uSplit, uTransom, uMullion, uPatchOn;
uniform vec4 uLower;               // u0, v0, u1, v1 (patch-local)
uniform sampler2D uCaustic;
uniform float uCausticOn;          // 0 when no word pane is lit (the lower light shows uFill only)
uniform float uCausticGain;        // 1 for half float; 4 for the RGBA8 fallback (stored at 0.25)
uniform vec2 uCausticSize;         // caustic target size, px
uniform float uCausticMix;         // 0: flat glass (focus and wave near 0) = plain light; 1: the computed caustic
uniform float uFill;
uniform float uShimmer;
uniform vec4 uScrims[8];
uniform int uScrimCount;
uniform float uScrimW[8];          // per-rect strength: 1, or fading with a leaving chapter's weight
uniform float uScrimFeather;       // 32 CSS px at rest (4.3), widened to 72 while the light is moving
uniform float uWallCloud;          // 1 - 0.8 sin(pi blend) on the wall's sun during a focus pull (4.3 cloud)
uniform float uHaze, uHalation, uDefocus, uSkirting;

vec2 fragToCss(vec2 fc) {
  return vec2(fc.x, uBuffer.y - fc.y) / uDpr;
}

float skyFall(vec2 q) {
  return mix(1.12, 0.88, smoothstep(0.0, 1.35, dot(q, vec2(0.62, 0.78))));
}

vec3 wallAlbedo(vec2 fragCSS) {
  float cloud = texture(uPlaster, fragCSS / 900.0).r;                    // 0.3 to 1 m blotches
  float trowel = texture(uPlaster, fragCSS / 140.0).g;                   // fine marks
  return uAlbedo * (0.91 + 0.18 * cloud) * (0.97 + 0.06 * trowel);        // +-9% limewash mottling
}

// Skirting board (6.1.4): below uSkirting the board (albedo x 0.92, no mottling) with a 1 px lit
// bevel; a 6 px soft contact shadow above the edge.
vec3 skirtingAlbedo(vec3 albedo, vec2 fragCSS) {
  if (uSkirting < 0.0) return albedo;
  float y = fragCSS.y;
  if (y >= uSkirting) {
    float bevel = 1.0 + 0.18 * (1.0 - smoothstep(0.0, 1.0, y - uSkirting));
    float shade = 1.0 - 0.05 * smoothstep(uSkirting + 2.0, uSkirting + 40.0, y);
    return uAlbedo * 0.92 * bevel * shade;
  }
  float contact = 1.0 - 0.10 * smoothstep(uSkirting - 6.0, uSkirting, y);
  return albedo * contact;
}

vec3 plainWall(vec2 fragCSS) {
  vec2 q = fragCSS / uViewport;
  return skirtingAlbedo(wallAlbedo(fragCSS), fragCSS) * uSky * skyFall(q);
}

struct PatchLocal { float u; float v; float mask; float penU; float penV; float wPx; float hPx; };

// Patch-local coordinates (6.0 conventions) with a soft penumbra of 1.2% of the patch width.
PatchLocal toPatch(vec2 p) {
  PatchLocal pl;
  float k = uSkew * uPatch.w;
  float wIn = max(uPatch.z - k, 1.0);
  pl.v = (p.y - uPatch.y) / max(uPatch.w, 1.0);
  pl.u = (p.x - uPatch.x - pl.v * k) / wIn;
  // the sun's disc softens every edge over about 1.2% of the patch width, never less than 2.5 CSS px
  // (the dusk ember is only about 100 px wide)
  float pen = max(0.012 * uPatch.z, 2.5) * (1.0 + 40.0 * uDefocus);
  float slant = uPatch.w / sqrt(uPatch.w * uPatch.w + k * k);             // perpendicular distance to the slanted sides
  pl.wPx = wIn * slant;
  pl.hPx = uPatch.w;
  pl.penU = pen / pl.wPx;
  pl.penV = pen / pl.hPx;
  float mu = smoothstep(-pl.penU, pl.penU, pl.u) * smoothstep(-pl.penU, pl.penU, 1.0 - pl.u);
  float mv = smoothstep(-pl.penV, pl.penV, pl.v) * smoothstep(-pl.penV, pl.penV, 1.0 - pl.v);
  pl.mask = mu * mv;
  return pl;
}

// x: the scrim mask (feather outside the text box); y: the same with twice the feather, for the
// part of a caustic letter above plain sunlight: a letter at ten times the sun would otherwise
// still saturate most of the way across the feather and read as cut along the box's straight edge.
vec2 scrimMask(vec2 p) {
  vec2 m = vec2(0.0);
  for (int i = 0; i < 8; i++) {
    if (i >= uScrimCount) break;
    vec4 r = uScrims[i];
    float w = uScrimW[i];
    vec2 d = max(max(r.xy - p, p - (r.xy + r.zw)), 0.0);                 // distance outside the rect
    float l = length(d);
    m = max(m, w * (1.0 - vec2(smoothstep(0.0, uScrimFeather, l), smoothstep(0.0, 2.0 * uScrimFeather, l))));
  }
  return m;
}

// Point in the beam hexagon with a soft edge of feather px: uBeamEdges holds the six edge lines
// (nx, ny, c), unit normals pointing inside, computed on the CPU (degenerate edges are (0, 0, 1e4)).
uniform vec3 uBeamEdges[6];
float beamMask(vec2 p, float feather) {
  float m = 1.0;
  for (int i = 0; i < 6; i++) {
    vec3 e = uBeamEdges[i];
    m *= smoothstep(-0.5 * feather, 0.5 * feather, dot(e.xy, p) + e.z);
  }
  return m;
}

// Cubic B-spline reconstruction of a mip level from four bilinear taps (Sigg and Hadwiger): the
// box-filtered mips would otherwise show as blocks (bilinear) or as shifted copies (offset taps).
vec4 bsplineWeights(float v) {
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
  vec4 s = n * n * n;
  float x = s.x;
  float y = s.y - 4.0 * s.x;
  float z = s.z - 4.0 * s.y + 6.0 * s.x;
  return vec4(x, y, z, 6.0 - x - y - z) * (1.0 / 6.0);
}
vec3 haloTap(vec2 uv, float lod) {
  vec2 size = max(floor(uCausticSize / exp2(lod)), vec2(1.0));
  vec2 p = uv * size - 0.5;
  vec2 f = fract(p);
  p -= f;
  vec4 xc = bsplineWeights(f.x);
  vec4 yc = bsplineWeights(f.y);
  vec4 c = p.xxyy + vec2(-0.5, 1.5).xyxy;
  vec4 sw = vec4(xc.xz + xc.yw, yc.xz + yc.yw);
  vec4 o = (c + vec4(xc.yw, yc.yw) / sw) / size.xxyy;
  vec3 s0 = textureLod(uCaustic, o.xz, lod).rgb;
  vec3 s1 = textureLod(uCaustic, o.yz, lod).rgb;
  vec3 s2 = textureLod(uCaustic, o.xw, lod).rgb;
  vec3 s3 = textureLod(uCaustic, o.yw, lod).rgb;
  float sx = sw.x / (sw.x + sw.y);
  float sy = sw.z / (sw.z + sw.w);
  return mix(mix(s3, s2, sx), mix(s1, s0, sx), sy);
}

// The word under a focus pull (the hero leaving for the pane, 4.3): the defocus reads from mip
// levels up to 5, and a bilinear tap of a 32-to-64-texel level magnified across the patch draws the
// word as blocks. Level 0 stays a plain bilinear tap; from level 1 up the mips are reconstructed
// with the same cubic B-spline as the halation, blended across the fractional level.
vec3 defocusTap(vec2 uv, float lod) {
  if (lod <= 0.001) return textureLod(uCaustic, uv, 0.0).rgb;
  float l0 = floor(lod);
  vec3 a = l0 < 0.5 ? textureLod(uCaustic, uv, 0.0).rgb : haloTap(uv, l0);
  return mix(a, haloTap(uv, l0 + 1.0), lod - l0);
}

vec3 shadeWall(vec2 fragCSS) {
  vec2 q = fragCSS / uViewport;
  vec3 albedo = skirtingAlbedo(wallAlbedo(fragCSS), fragCSS);
  vec3 E = uSky * skyFall(q);
  vec3 rad;

  PatchLocal pl = toPatch(fragCSS);
  if (uPatchOn > 0.0 && pl.mask > 0.0 && fragCSS.y < (uSkirting < 0.0 ? 1e9 : uSkirting)) {
    float split = uSplit;
    float upper = split > 0.0 ? pl.mask * smoothstep(-pl.penV, pl.penV, split - pl.v) : 0.0;
    float lower = pl.mask * (split > 0.0 ? smoothstep(-pl.penV, pl.penV, pl.v - (split + uTransom)) : 1.0);
    // mullion shadow in the upper light (soft)
    float mw = 0.5 * uMullion;
    upper *= 1.0 - smoothstep(-pl.penU, pl.penU, mw - abs(pl.u - 0.5)) * step(0.0001, uMullion);
    // drawn-glass cords: horizontal streaks, +-12%, in patch space
    float cords = 0.88 + 0.24 * texture(uPlaster, vec2(pl.u * 0.06, pl.v * 2.2)).b;
    vec3 sunUpper = uSun * cords * (1.0 - 0.08 * pl.v / max(split, 1e-3)) * upper;

    vec3 sunLower = vec3(0.0);
    vec3 hal = vec3(0.0);
    float lowerW = max(uLower.z - uLower.x, 1e-3);
    float lowerH = max(uLower.w - uLower.y, 1e-3);
    vec2 st = vec2((pl.u - uLower.x) / lowerW, (pl.v - uLower.y) / lowerH);
    float dil = pl.mask * (split > 0.0 ? smoothstep(-0.04, 0.0, pl.v - (split + uTransom)) : 1.0);
    if (dil > 0.0) {
      vec3 C = vec3(1.0);
      if (uCausticOn > 0.5) {
        // residual breathing of a settled word: <= 0.8 CSS px UV warp and +-2% intensity
        vec2 px = vec2(pl.wPx * lowerW, pl.hPx * lowerH);
        vec2 warp = vec2(sin(st.y * 9.0 + uTime * 0.83) + 0.6 * sin(st.x * 13.0 - uTime * 0.61),
                         cos(st.x * 7.0 + uTime * 0.71) + 0.6 * cos(st.y * 11.0 + uTime * 0.53)) * (0.5 / px);
        vec2 sts = st + warp * uShimmer;
        vec2 uv = vec2(sts.x, 1.0 - sts.y);
        C = max(defocusTap(uv, uDefocus * 5.0) * uCausticGain, 0.0);
        C *= 1.0 + 0.02 * uShimmer * sin(uTime * 1.3 + st.x * 5.0 - st.y * 3.0);
        C = mix(vec3(1.0), C, uCausticMix);
        vec3 h3 = max(haloTap(uv, 3.0) * uCausticGain - 0.9, 0.0);
        vec3 h5 = max(haloTap(uv, 5.0) * uCausticGain - 0.9, 0.0);
        hal = (h3 * 0.10 + h5 * 0.05) * dil * uHalation * uCausticMix;     // spill from light above 0.9 only
      }
      sunLower = uSun * (uFill + (1.0 - uFill) * C) * lower;
    }
    // Scrims (4.3): the sun and caustic term (halation included) times f = mix(1.0, 0.015, mask).
    // Caustic letters carry up to ten times the sun, so a factor alone would leave them at 15% inside
    // a text box: the part above plain sunlight also fades with the mask, so inside a box the light
    // is at most 1.5% of plain sunlight (the value the 4.3 contrast numbers assume) and the feather
    // outside it stays smooth. Plain light gets exactly the specified factor.
    vec2 smw = scrimMask(fragCSS);
    float sm = smw.x;
    float f = mix(1.0, 0.015, sm);
    vec3 lit = (sunUpper + sunLower + uSun * hal) * uPatchOn * uWallCloud;
    vec3 plainSun = uSun * (1.15 * uPatchOn * uWallCloud);
    float ex = 1.0 - smw.y;
    lit = f * (min(lit, plainSun) + ex * ex * max(lit - plainSun, 0.0));
    rad = albedo * (E + lit);
  } else {
    rad = albedo * E;
  }
  if (uHaze > 0.0) rad += beamMask(fragCSS, 160.0) * uHaze * uSun * 0.010;   // faint air-light along the beam
  return rad;
}
`
