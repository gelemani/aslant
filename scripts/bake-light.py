#!/usr/bin/env python3
"""Bake the two light transports of Aslant (brief 6.1.1, 7.5).

    python3 scripts/bake-light.py [--preview DIR]

Writes public/light/aslant.bin and public/light/ingrid.bin: 65,536 rays, 1,024
sliced optimal transport iterations each (the brief says 256; 1,024 leaves 0.3%
of rays off the letters instead of 1.0%, which clears the counters of the 'a'
and 's'; it costs only bake time, about 30 s). The algorithm is the one the browser
worker runs for live words (src/lib/caustics/*.ts), step for step:

  origins   R2 low-discrepancy points, i = 1 .. N, double precision
  raster    1024 x 480, black, white word; size from floor(480 * 0.62) px down
            in 4 px steps until the INK width is <= 0.86 * 1024 (outline bounds,
            as the browser's actualBoundingBox*; never Pillow's advance box);
            centred on the ink box; separable Gaussian blur, sigma 0.8 px, radius 3
  targets   Hilbert-order (order 10) inverse CDF of the density, N quantiles
            (j + 0.5) / N, jittered inside the pixel with mulberry32(7)
  transport sliced OT in isotropic coordinates (y * 480 / 1024): P = S, iteration
            k uses the direction theta_k = fract(u0 + k * 0.618...) * pi, u0 the first
            draw of mulberry32(9) (the golden-angle, low-discrepancy form of the
            brief's rand() * pi: 98.2% of rays on ink at 256 iterations against
            96.9%); both projections (as float32) sorted stably, rank-matched
            step 1.0
  strays    rays left off the letters (density < 0.05 * mean) move to the nearest
            ink pixel (density >= 0.5) holding fewer than 2 rays (snapStrays)
  density   max(density(P_i) / mean(density), 0.05)

numpy + Pillow only.
"""
import argparse
import math
import os
import struct
import sys
import time

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1024, 480
N = 65536
ITERS = 1024          # brief 6.1.1 says 256; 1024 cuts stray rays from 1.0% to 0.3% (offline cost only)
JITTER_SEED = 7
SOT_SEED = 9
R2_A1 = 0.7548776662466927
R2_A2 = 0.5698402909980532
GOLDEN = 0.6180339887498949   # 1 / phi
BLUR_SIGMA = 0.8
BLUR_RADIUS = 3

WORDS = (
    # (id, text, font file)
    ('aslant', 'aslant', os.path.join(ROOT, 'public', 'fonts', 'Sprat-Wordmark.ttf')),
    ('ingrid', 'Ingrid', os.path.join(ROOT, 'public', 'fonts', 'Sprat-RegularMedium.otf')),
)


# ── R2 origins ──────────────────────────────────────────────────────────────
def r2(n):
    i = np.arange(1, n + 1, dtype=np.float64)
    x = 0.5 + i * R2_A1
    y = 0.5 + i * R2_A2
    return x - np.floor(x), y - np.floor(y)


# ── mulberry32, vectorised (its state advances by a constant per call) ──────
def mulberry32(seed, count, offset=0):
    k = np.arange(offset + 1, offset + count + 1, dtype=np.uint64)
    a = ((np.uint64(seed) + k * np.uint64(0x6D2B79F5)) & np.uint64(0xFFFFFFFF)).astype(np.uint32)
    with np.errstate(over='ignore'):
        t = (a ^ (a >> np.uint32(15))) * (a | np.uint32(1))
        t = (t + (t ^ (t >> np.uint32(7))) * (t | np.uint32(61))) ^ t
        t = t ^ (t >> np.uint32(14))
    return t.astype(np.float64) / 4294967296.0


# ── word raster ─────────────────────────────────────────────────────────────
INK_SS = 4          # supersampling for the ink box (outline bounds to ±0.25 px)


def ink_box(word, font_path, size):
    """Ink bounds (left, top, right, bottom) relative to Pillow's 'la' origin, in px.

    Pillow's textbbox is the ADVANCE box horizontally (right = advance); the browser measures
    actualBoundingBoxLeft + actualBoundingBoxRight, the outline bounds. So both sides size and
    centre the word by its ink (brief 6.1.1): render 4x larger and read the lit pixels' bounds.
    """
    font = ImageFont.truetype(font_path, size * INK_SS)
    probe = ImageDraw.Draw(Image.new('L', (1, 1)))
    l, t, r, b = probe.textbbox((0, 0), word, font=font)
    pad = size * INK_SS
    img = Image.new('L', (r - l + 2 * pad, b - t + 2 * pad), 0)
    ImageDraw.Draw(img).text((pad - l, pad - t), word, font=font, fill=255)
    x0, y0, x1, y1 = img.getbbox()
    k = 1.0 / INK_SS
    return ((x0 - pad + l) * k, (y0 - pad + t) * k, (x1 - pad + l) * k, (y1 - pad + t) * k)


def raster(word, font_path):
    size = int(math.floor(H * 0.62))
    while True:
        left, top, right, bottom = ink_box(word, font_path, size)
        if right - left <= 0.86 * W or size <= 8:
            break
        size -= 4
    ink_w, ink_h = right - left, bottom - top
    # Drawn 4x larger and box-filtered down: exact-area coverage and sub-pixel placement, like
    # the browser's unhinted canvas text (Pillow snaps glyphs to whole pixels at 1x).
    img = Image.new('L', (W * INK_SS, H * INK_SS), 0)
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(font_path, size * INK_SS)
    x, y = (W - ink_w) / 2 - left, (H - ink_h) / 2 - top
    draw.text((x * INK_SS, y * INK_SS), word, font=font, fill=255)
    a = np.asarray(img, dtype=np.float64).reshape(H, INK_SS, W, INK_SS).mean(axis=(1, 3)) / 255.0
    a8 = np.round(a * 255.0)                 # 8-bit, like the browser's canvas raster
    raster.last8 = a8.astype(np.uint8)
    return blur(a8 / 255.0), size, (round(ink_w, 1), round(ink_h, 1))


def blur(a):
    r = np.arange(-BLUR_RADIUS, BLUR_RADIUS + 1, dtype=np.float64)
    k = np.exp(-0.5 * (r / BLUR_SIGMA) ** 2)
    k /= k.sum()
    pad = np.pad(a, BLUR_RADIUS)
    tmp = np.zeros_like(pad)
    for i, w in enumerate(k):              # horizontal
        tmp[:, BLUR_RADIUS:-BLUR_RADIUS] += w * pad[:, i:i + a.shape[1]]
    out = np.zeros_like(a)
    for i, w in enumerate(k):              # vertical
        out += w * tmp[i:i + a.shape[0], BLUR_RADIUS:-BLUR_RADIUS]
    return out


# ── Hilbert traversal of the 1024 x 480 grid (order 10) ─────────────────────
def hilbert_d(x, y, order=10):
    n = 1 << order
    x = x.astype(np.int64).copy()
    y = y.astype(np.int64).copy()
    d = np.zeros_like(x)
    s = n >> 1
    while s > 0:
        rx = ((x & s) > 0).astype(np.int64)
        ry = ((y & s) > 0).astype(np.int64)
        d += s * s * ((3 * rx) ^ ry)
        flip = (ry == 0) & (rx == 1)
        x = np.where(flip, n - 1 - x, x)
        y = np.where(flip, n - 1 - y, y)
        swap = ry == 0
        x, y = np.where(swap, y, x), np.where(swap, x, y)
        s >>= 1
    return d


def hilbert_order():
    py, px = np.divmod(np.arange(W * H, dtype=np.int64), W)
    d = hilbert_d(px, py)
    return np.argsort(d, kind='stable')     # pixel indices along the curve


# ── targets and sliced OT ───────────────────────────────────────────────────
def target_samples(dens, order, n):
    w = dens.ravel()[order]
    cdf = np.cumsum(w)
    q = (np.arange(n, dtype=np.float64) + 0.5) / n * cdf[-1]
    k = np.minimum(np.searchsorted(cdf, q, side='left'), len(order) - 1)
    pix = order[k]
    py, px = np.divmod(pix, W)
    rnd = mulberry32(JITTER_SEED, 2 * n)
    tx = (px + rnd[0::2]) / W
    ty = (py + rnd[1::2]) / H
    return tx, ty


def sliced_ot(sx, sy, tx, ty, iters, seed):
    iso = H / W
    P = np.stack([sx, sy * iso], 1)
    T = np.stack([tx, ty * iso], 1)
    u0 = float(mulberry32(seed, 1)[0])
    disp = np.empty(len(P))
    for it in range(iters):
        u = u0 + it * GOLDEN
        th = (u - math.floor(u)) * math.pi
        c, s = math.cos(th), math.sin(th)
        pp = P[:, 0] * c + P[:, 1] * s
        tp = T[:, 0] * c + T[:, 1] * s
        ip = np.argsort(pp.astype(np.float32), kind='stable')
        jt = np.argsort(tp.astype(np.float32), kind='stable')
        disp[ip] = tp[jt] - pp[ip]
        P[:, 0] += disp * c
        P[:, 1] += disp * s
    return P[:, 0], P[:, 1] / iso


SNAP_TAU = 0.5
SNAP_RADIUS = 64
SNAP_CAP = 2
DENSITY_FLOOR = 0.05


def snap_offsets():
    r = SNAP_RADIUS
    lst = [(dx * dx + dy * dy, dy, dx) for dy in range(-r, r + 1) for dx in range(-r, r + 1) if dx * dx + dy * dy <= r * r]
    lst.sort()
    return np.array([(dx, dy) for _, dy, dx in lst], dtype=np.int64)


def seq_mean(dens):
    return float(np.cumsum(dens.ravel())[-1]) / dens.size     # sequential sum, as the worker


def snap_strays(tx, ty, dens):
    """Rays left off the letters (density < 0.05 * mean: counters, gaps) move to the nearest ink
    pixel (density >= 0.5) holding fewer than 2 rays, keeping their sub-pixel offset. Mirrors
    snapStrays() in src/lib/caustics/sliced-ot.ts on the same float32 values; index order."""
    tx = tx.astype(np.float32).copy()
    ty = ty.astype(np.float32).copy()
    floor_d = DENSITY_FLOOR * seq_mean(dens)
    x = tx.astype(np.float64) * W
    y = ty.astype(np.float64) * H
    px = np.clip(np.floor(x).astype(np.int64), 0, W - 1)
    py = np.clip(np.floor(y).astype(np.int64), 0, H - 1)
    stray = dens[py, px] < floor_d
    occ = np.zeros(W * H, dtype=np.int64)
    np.add.at(occ, (py * W + px)[~stray], 1)
    occ = np.minimum(occ, 255)
    off = snap_offsets()
    flat = dens.ravel()
    moved = 0
    for i in np.nonzero(stray)[0]:
        fx = x[i] - math.floor(x[i])
        fy = y[i] - math.floor(y[i])
        qx = px[i] + off[:, 0]
        qy = py[i] + off[:, 1]
        ok = (qx >= 0) & (qx < W) & (qy >= 0) & (qy < H)
        q = (qy * W + qx)[ok]
        hit = np.nonzero((flat[q] >= SNAP_TAU) & (occ[q] < SNAP_CAP))[0]
        if len(hit) == 0:
            continue
        k = q[hit[0]]
        tx[i] = np.float32((k % W + fx) / W)
        ty[i] = np.float32((k // W + fy) / H)
        occ[k] += 1
        moved += 1
    return tx, ty, moved


def ray_density(dens, px, py):
    xi = np.clip((px * W).astype(np.int64), 0, W - 1)
    yi = np.clip((py * H).astype(np.int64), 0, H - 1)
    return np.maximum(dens[yi, xi] * (1.0 / seq_mean(dens)), DENSITY_FLOOR)


# ── .bin (little-endian, brief 6.1.1) ───────────────────────────────────────
def write_bin(path, px, py, dn, iters, seed):
    n = len(px)
    head = b'ASL1' + struct.pack('<IHHHHI', n, iters, W, H, 1, seed) + bytes(12)
    xy = np.empty(2 * n, dtype='<u2')
    xy[0::2] = np.round(np.clip(px, 0.0, 1.0) * 65535.0).astype(np.uint16)
    xy[1::2] = np.round(np.clip(py, 0.0, 1.0) * 65535.0).astype(np.uint16)
    code = np.clip(np.round((np.log2(dn) + 5.0) * 25.5), 0, 255).astype(np.uint8)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(head)
        f.write(xy.tobytes())
        f.write(code.tobytes())
    return 32 + 5 * n


def preview(path, px, py, dn):
    """Splat the formed targets (focus 1) so a human can look at the word."""
    img = np.zeros((H, W))
    xi = np.clip((px * W).astype(np.int64), 0, W - 1)
    yi = np.clip((py * H).astype(np.int64), 0, H - 1)
    np.add.at(img, (yi, xi), 1.0)
    img = blur(img)
    img = img / (N / (W * H))
    tone = img / (1.0 + img)
    Image.fromarray((np.clip(tone, 0, 1) * 255).astype(np.uint8)).save(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--preview', help='directory for preview PNGs')
    ap.add_argument('--n', type=int, default=N)
    ap.add_argument('--iters', type=int, default=ITERS)
    ap.add_argument('--dump', help='directory for the 8-bit rasters (<id>-raster.u8, 1024 x 480) used by the checks')
    args = ap.parse_args()
    t_all = time.time()
    order = hilbert_order()
    sx, sy = r2(args.n)
    for wid, text, font in WORDS:
        t0 = time.time()
        dens, size, ink = raster(text, font)
        tx, ty = target_samples(dens, order, args.n)
        px, py = sliced_ot(sx, sy, tx, ty, args.iters, SOT_SEED)
        px, py, moved = snap_strays(px, py, dens)
        dn = ray_density(dens, px.astype(np.float64), py.astype(np.float64))
        out = os.path.join(ROOT, 'public', 'light', f'{wid}.bin')
        nbytes = write_bin(out, px, py, dn, args.iters, SOT_SEED)
        inside = float(np.mean(dens[np.clip((py * H).astype(int), 0, H - 1), np.clip((px * W).astype(int), 0, W - 1)] > 0.05))
        print(f'{wid}: {text!r} size {size}px ink {ink[0]}x{ink[1]}px, {args.n} rays x {args.iters} it, '
              f'{time.time() - t0:.2f} s, {nbytes} bytes, strays moved {moved}, rays on ink {inside * 100:.1f}%, '
              f'density {dn.min():.3f}..{dn.max():.3f}')
        if args.dump:
            os.makedirs(args.dump, exist_ok=True)
            raster.last8.tofile(os.path.join(args.dump, f'{wid}-raster.u8'))
        if args.preview:
            os.makedirs(args.preview, exist_ok=True)
            preview(os.path.join(args.preview, f'{wid}-formed.png'), px, py, dn)
            Image.fromarray((np.clip(dens, 0, 1) * 255).astype(np.uint8)).save(os.path.join(args.preview, f'{wid}-raster.png'))
    print(f'done in {time.time() - t_all:.2f} s')
    return 0


if __name__ == '__main__':
    sys.exit(main())
