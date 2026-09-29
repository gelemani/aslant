// Compositor (brief 6.1.3): one full-screen triangle; every mode returns linear radiance and shares
// one tail: mode mix, vignette, ACES, sRGB, photon grain (amplitude ~ 1/sqrt(luminance)), dither.
import { COMMON_GLSL } from './common.glsl'
import { WALL_GLSL } from './wall.glsl'

export const COMPOSITOR_VERT = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const TAIL_GLSL = /* glsl */ `
uniform int uModeA;                // 0 wall, 1 pane, 2 bench
uniform int uModeB;
uniform float uModeMix;
uniform float uExposure;
uniform float uGrainSeed;

vec3 shadeMode(int mode, vec2 fragCSS) {
#ifdef WALL_ONLY
  return shadeWall(fragCSS);
#else
  if (mode == 1) return shadePane(fragCSS);
  if (mode == 2) return shadeBench(fragCSS);
  return shadeWall(fragCSS);
#endif
}

void main() {
  vec2 fragCSS = fragToCss(gl_FragCoord.xy);
  vec3 rad;
#ifdef WALL_ONLY
  rad = shadeWall(fragCSS);
#else
  if (uModeMix <= 0.0) rad = shadeMode(uModeA, fragCSS);
  else if (uModeMix >= 1.0) rad = shadeMode(uModeB, fragCSS);
  else rad = mix(shadeMode(uModeA, fragCSS), shadeMode(uModeB, fragCSS), uModeMix);
#endif
  vec2 q = fragCSS / uViewport;
  vec2 dq = (q - vec2(0.6, 0.5)) * vec2(1.2, 1.0);
  rad *= 1.0 - 0.18 * dot(dq, dq);
  vec3 col = acesNarkowicz(rad * uExposure);
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  vec3 outc = linearToSrgb(col) + (hashSeed(gl_FragCoord.xy, uGrainSeed) - 0.5) * 0.010 / sqrt(0.12 + lum) * 0.35;
  outc += (hash12(gl_FragCoord.xy + 71.3) - 0.5) / 255.0;
  gl_FragColor = vec4(outc, 1.0);
}
`

/**
 * Assemble the compositor fragment shader: shared helpers, wall, WP5's chunks, the tail.
 * wallOnly builds the lean program used whenever only the wall is in view (the common case): the
 * chunks are left out, so their registers never weigh on the wall's occupancy.
 */
export function compositorFrag(paneGlsl: string, benchGlsl: string, wallOnly = false): string {
  if (wallOnly) return ['#define WALL_ONLY', COMMON_GLSL, WALL_GLSL, TAIL_GLSL].join('\n')
  return [COMMON_GLSL, WALL_GLSL, paneGlsl, benchGlsl, TAIL_GLSL].join('\n')
}
