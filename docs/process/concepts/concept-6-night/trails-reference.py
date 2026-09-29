# Reference math for concept 6 (Intempesta). Proof-of-look renderer, NOT production code.
# Mirrors what the GLSL compositor does: sidereal rotation at 15.041 deg/h around the pole at latitude 52 N,
# magnitude-limited star field, twilight visibility, airmass extinction, stylised-physical twilight sky.
# Run from a folder that has ../fonts/Imbue[opsz,wght].ttf etc. Lesson learned: density and exposure ARE the art direction.

"""Proof-of-look for concept 6 (Intempesta): wall + windows + analytic star trails.
Not production code; it mirrors the math the GLSL compositor would use."""
import numpy as np

def gaussian_filter(a0, s):
    p = int(4 * s + 2); a = np.pad(a0, p, mode='constant')
    H, W = a.shape
    fy = np.fft.fftfreq(H)[:, None]; fx = np.fft.fftfreq(W)[None, :]
    g = np.exp(-2 * (np.pi ** 2) * (s ** 2) * (fx ** 2 + fy ** 2))
    return np.real(np.fft.ifft2(np.fft.fft2(a) * g))[p:-p, p:-p]
from PIL import Image, ImageDraw, ImageFont

rng = np.random.default_rng(7)
D2R = np.pi / 180
PHI = 52.0 * D2R          # model latitude
DEC_SUN = -2.3 * D2R      # 29 September
F = '../fonts/'

def imbue(size, w, o=100):
    f = ImageFont.truetype(F + 'Imbue[opsz,wght].ttf', size); f.set_variation_by_axes([w, o]); return f
def hg(size, w=400):
    f = ImageFont.truetype(F + 'HostGrotesk[wght].ttf', size); f.set_variation_by_axes([w]); return f
def mm(size, wd=87.5, w=300):
    f = ImageFont.truetype(F + 'MartianMono[wdth,wght].ttf', size)
    names = [a['name'] for a in f.get_variation_axes()]
    f.set_variation_by_axes([wd if n == b'Width' else w for n in names]); return f

def sun_alt(t_hours):
    H = (t_hours - 12.0) * 15 * D2R
    return np.arcsin(np.sin(DEC_SUN) * np.sin(PHI) + np.cos(DEC_SUN) * np.cos(PHI) * np.cos(H))

def sun_az(t_hours):
    H = (t_hours - 12.0) * 15 * D2R
    return np.arctan2(-np.sin(H) * np.cos(DEC_SUN), np.sin(DEC_SUN) * np.cos(PHI) - np.cos(DEC_SUN) * np.sin(PHI) * np.cos(H))

def stars(n):
    # uniform on sphere, magnitude from a power law (N(<m) ~ 10^(0.5 m))
    dec = np.arcsin(rng.uniform(-0.35, 1.0, n))
    ra = rng.uniform(0, 2 * np.pi, n)
    u = rng.uniform(0, 1, n)
    m = np.log10(u * (10 ** (0.5 * 6.0) - 1) + 1) / 0.5 - 0.6
    flux = 10 ** (-0.46 * m) * (m < 5.2)
    tcol = rng.choice([0, 1, 2, 3], n, p=[.18, .42, .28, .12])
    pal = np.array([[1.0, .72, .50], [1.0, .9, .78], [.9, .93, 1.0], [.72, .82, 1.0]])
    return dec, ra, flux, pal[tcol]

def altaz(dec, H):
    sa = np.sin(dec) * np.sin(PHI) + np.cos(dec) * np.cos(PHI) * np.cos(H)
    alt = np.arcsin(np.clip(sa, -1, 1))
    az = np.arctan2(-np.sin(H) * np.cos(dec), np.sin(dec) * np.cos(PHI) - np.cos(dec) * np.sin(PHI) * np.cos(H))
    return alt, az   # az: 0 = north, + = east

def twilight_visibility(t):
    a = sun_alt(t) / D2R
    x = np.clip((-a - 3.0) / 14.0, 0, 1)
    return x * x * (3 - 2 * x)                     # smoothstep: trails fade in after sunset, out before sunrise

def accumulate(W, H, proj, t0, t1, n=14000, step_deg=0.12):
    dec, ra, flux, col = stars(n)
    img = np.zeros((H, W, 3))
    span = (t1 - t0) * 15.041
    steps = max(2, int(span / step_deg))
    ts = np.linspace(t0, t1, steps)
    vis_t = twilight_visibility(ts)
    for i in range(0, n, 1500):
        d, r, f, c = dec[i:i+1500, None], ra[i:i+1500, None], flux[i:i+1500, None], col[i:i+1500]
        Hh = (ts[None, :] * 15.041 * D2R) - r
        alt, az = altaz(d, Hh)
        x, y, ok = proj(alt, az, ts[None, :])
        ext = np.exp(-0.25 / np.maximum(np.sin(alt), 0.02))       # airmass extinction
        w = f * ext * vis_t[None, :] * ok
        xi, yi = np.round(x).astype(int), np.round(y).astype(int)
        m = (xi >= 0) & (xi < W) & (yi >= 0) & (yi < H) & (w > 1e-6)
        for k in range(3):
            np.add.at(img[..., k], (yi[m], xi[m]), (w * c[:, k:k+1])[m])
    core = np.stack([gaussian_filter(img[..., k], .55) for k in range(3)], -1)
    halo = np.stack([gaussian_filter(img[..., k], 2.2) for k in range(3)], -1)
    return core * 1.0 + halo * 0.35

def tonemap(x, exposure):
    x = x * exposure
    y = x / (1 + x)
    return np.clip(y, 0, 1) ** (1 / 2.2)

def srgb(h):
    return np.array([int(h[i:i+2], 16) for i in (1, 3, 5)]) / 255.0

NIGHT = srgb('#0A1014'); ROD = (213, 222, 224); DIM = (140, 157, 163); EMBER = (255, 165, 89)

def wall(W, H, lamp=None):
    base = np.ones((H, W, 3)) * NIGHT
    n = gaussian_filter(rng.normal(0, 1, (H, W)), 6) * 0.9 + gaussian_filter(rng.normal(0, 1, (H, W)), 1.2) * 0.25
    base *= (1 + 0.035 * n[..., None])
    if lamp is not None:
        lx, ly, rad = lamp
        yy, xx = np.mgrid[0:H, 0:W]
        L = np.exp(-(((xx - lx) ** 2 + (yy - ly) ** 2) / (2 * rad ** 2)))
        base += L[..., None] * np.array([0.050, 0.030, 0.014]) * (1 + 0.25 * n[..., None])
    grain = rng.normal(0, 0.006, (H, W, 1))
    return np.clip(base + grain, 0, 1)

def sky_pano(alt, az, t):
    """stylised-physical twilight: warm near the sun's azimuth + low, blue above, night floor."""
    sa = sun_alt(t); saz = sun_az(t)
    I = np.exp((sa / D2R + 6) / 3.4)               # grows toward sunrise/sunset
    I = np.minimum(I, 14.0)
    dAz = np.angle(np.exp(1j * (az - saz)))
    near = np.exp(-(np.abs(dAz) / D2R) / 38) * np.exp(-np.maximum(alt, 0) / D2R / 7)
    warm = np.array([1.0, 0.42, 0.14]) * near[..., None]
    blue = np.array([0.20, 0.34, 0.62]) * np.exp(-np.maximum(alt, 0) / D2R / 40)[..., None]
    night = np.array([0.0022, 0.0042, 0.0090]) + np.array([0.0018, 0.0036, 0.0042]) * np.exp(-np.maximum(alt, 0) / D2R / 9)[..., None]
    return night + 0.030 * I[..., None] * (0.8 * blue + 3.0 * warm)

# ---------------------------------------------------------------- hero (1440x900)
W, H = 1440, 900
img = wall(W, H, lamp=(360, 780, 420))
sx0, sx1, sy0, sy1 = 0, W, 318, 672            # panoramic window rect
sw, sh = sx1 - sx0, sy1 - sy0
AZ0, AZ1, ALT0, ALT1 = -112, 112, -4, 74
T_SET, T_RISE = 17.88, 30.12                  # 17:53 -> 06:07 (next day, as 30.12)

def pano_proj(alt, az, ts):
    x = (az / D2R - AZ0) / (AZ1 - AZ0) * sw
    y = (ALT1 - alt / D2R) / (ALT1 - ALT0) * sh
    return x, y, (alt > 0).astype(float)

trails = accumulate(sw, sh, pano_proj, T_SET + 0.3, T_RISE - 0.3, n=5200)
yy, xx = np.mgrid[0:sh, 0:sw]
az = (AZ0 + xx / sw * (AZ1 - AZ0)) * D2R
alt = (ALT1 - yy / sh * (ALT1 - ALT0)) * D2R
tcol = T_SET + xx / sw * (T_RISE - T_SET)
sky = sky_pano(alt, az, tcol)
lin = sky + trails * 0.17
ground = alt < 0
lin[ground] = np.array([0.0009, 0.0012, 0.0015])
out = tonemap(lin, 2.3)
shot = rng.normal(0, 1, (sh, sw, 1)) * (0.012 / np.sqrt(out.mean(-1, keepdims=True) + 0.02))
out = np.clip(out + shot * 0.12, 0, 1)
img[sy0:sy1, sx0:sx1] = out
# spill of the window onto the wall (soft, colour of the sky at each column)
col = out[:6].mean(0); colb = out[-6:].mean(0)
for k in range(1, 60):
    a = 0.10 * np.exp(-k / 14)
    if sy0 - k >= 0: img[sy0 - k] = img[sy0 - k] * (1 - a) + col * a
    if sy1 + k < H: img[sy1 + k - 1] = img[sy1 + k - 1] * (1 - a) + colb * a
hero = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
d = ImageDraw.Draw(hero)
d.text((64, 40), 'Intempesta', font=imbue(34, 300), fill=ROD)
d.text((1146, 50), '19:04', font=mm(15), fill=DIM)
# mini exposure mark (round window) drawn as a ring for the mock
d.ellipse((1330, 36, 1374, 80), outline=(60, 72, 78), width=1)
d.text((1210, 52), '', font=mm(14), fill=DIM)
d.text((64, 118), 'It’ll be ready by morning.', font=imbue(150, 200), fill=ROD)
d.text((64, 648 + 44), 'Sunset 17:53', font=mm(14), fill=DIM)
d.text((W - 64 - 118, 648 + 44), 'Sunrise 06:07', font=mm(14), fill=DIM)
d.text((64, 752), 'Intempesta designs and builds one web page per night.', font=hg(21), fill=ROD)
d.text((64, 782), 'Brief us before sunset. It goes live at sunrise.', font=hg(21), fill=DIM)
d.text((1136, 770), 'Choose a night', font=hg(21, 500), fill=EMBER)
d.line((1136, 800, 1276, 800), fill=EMBER, width=1)
hero.save('hero_mock.png')

# ---------------------------------------------------------------- small hours: pole-centred round window
W2, H2 = 1440, 900
img2 = wall(W2, H2, lamp=(1100, 520, 380))
cx, cy, R = 470, 450, 330
FOV = 44 * D2R
def pole_proj(alt, az, ts):
    # gnomonic projection centred on the celestial pole (alt = PHI, az = 0)
    v = np.stack([np.cos(alt) * np.sin(az), np.cos(alt) * np.cos(az), np.sin(alt)], 0)   # E, N, U
    fwd = np.array([0, np.cos(PHI), np.sin(PHI)]); up = np.array([0, -np.sin(PHI), np.cos(PHI)]); right = np.array([1, 0, 0])
    z = np.tensordot(fwd, v, 1); xr = np.tensordot(right, v, 1); yu = np.tensordot(up, v, 1)
    f = R / np.tan(FOV / 2)
    x = R + f * xr / np.maximum(z, 1e-3); y = R - f * yu / np.maximum(z, 1e-3)
    return x, y, ((z > 0.2) & (alt > 0)).astype(float)
t_now = 26.23  # 02:14
tr = accumulate(2 * R, 2 * R, pole_proj, T_SET + 0.3, t_now, n=9000, step_deg=0.06)
yy, xx = np.mgrid[0:2 * R, 0:2 * R]
rr = np.hypot(xx - R, yy - R)
skyc = np.array([0.0024, 0.0044, 0.0092]) + np.array([0.0012, 0.0020, 0.0028]) * (yy / (2 * R))[..., None]
lin2 = skyc + tr * 0.17
o2 = tonemap(lin2, 2.3)
o2 = np.clip(o2 + rng.normal(0, 1, o2.shape[:2] + (1,)) * 0.012 / np.sqrt(o2.mean(-1, keepdims=True) + .02) * .12, 0, 1)
mask = (rr <= R - 0.5)
edge = np.clip(R - rr, 0, 1)[..., None]
sub = img2[cy - R:cy + R, cx - R:cx + R]
sub[:] = sub * (1 - edge) + o2 * edge
# reveal: thin lit bevel just inside the aperture (sky-lit side at top)
ring = (rr > R - 10) & (rr <= R)
ang = np.arctan2(yy - R, xx - R)
bev = (0.018 + 0.03 * np.clip(-np.sin(ang), 0, 1))
sub[ring] = sub[ring] * 0.55 + np.array([0.09, 0.11, 0.13])[None, :] * bev[ring][:, None] * 12
img2[cy - R:cy + R, cx - R:cx + R] = sub
sh2 = Image.fromarray((np.clip(img2, 0, 1) * 255).astype(np.uint8))
d2 = ImageDraw.Draw(sh2)
d2.text((64, 40), 'Intempesta', font=imbue(34, 300), fill=ROD)
d2.text((880, 150), '02:14', font=imbue(250, 100), fill=ROD)
d2.text((884, 470), 'The small hours.', font=imbue(64, 250), fill=ROD)
d2.text((884, 560), 'The Romans called this stretch of night intempesta:', font=hg(19), fill=DIM)
d2.text((884, 586), 'the hour when work is inopportune. We do most of ours then.', font=hg(19), fill=DIM)
d2.text((884, 660), '02:40', font=mm(14), fill=EMBER)
d2.text((950, 657), 'Motion. Nothing moves unless something moves it.', font=hg(19), fill=ROD)
d2.text((884, 700), '03:30', font=mm(14), fill=DIM)
d2.text((950, 697), 'Words. Each sentence read aloud.', font=hg(19), fill=DIM)
sh2.save('smallhours_mock.png')
print('done')
