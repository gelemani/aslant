export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent exponential smoothing. lambda ~4-8 feels cinematic. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * Math.min(dt, 1 / 30)));

export const mapRange = (v: number, inMin: number, inMax: number, outMin = 0, outMax = 1) =>
  outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
