import math, datetime as dt
def sun(lat, lon, when_utc):
    # NOAA general solar position (fractional year method)
    doy = when_utc.timetuple().tm_yday
    hr = when_utc.hour + when_utc.minute/60 + when_utc.second/3600
    g = 2*math.pi/365*(doy - 1 + (hr-12)/24)
    eqt = 229.18*(0.000075 + 0.001868*math.cos(g) - 0.032077*math.sin(g) - 0.014615*math.cos(2*g) - 0.040849*math.sin(2*g))
    decl = 0.006918 - 0.399912*math.cos(g) + 0.070257*math.sin(g) - 0.006758*math.cos(2*g) + 0.000907*math.sin(2*g) - 0.002697*math.cos(3*g) + 0.00148*math.sin(3*g)
    tst = hr*60 + eqt + 4*lon          # true solar time, minutes (UTC-based)
    ha = math.radians(tst/4 - 180)
    la = math.radians(lat)
    cz = math.sin(la)*math.sin(decl) + math.cos(la)*math.cos(decl)*math.cos(ha)
    zen = math.acos(max(-1, min(1, cz)))
    el = 90 - math.degrees(zen)
    az = math.degrees(math.atan2(math.sin(ha), math.cos(ha)*math.sin(la) - math.tan(decl)*math.cos(la))) + 180
    return el, az % 360, eqt, decl
def local(h, m, day=(2026,6,21), off=2):
    return dt.datetime(*day, h, m) - dt.timedelta(hours=off)
LAT, LON = 47.5596, 7.5886
# scan for sunrise/sunset (el crosses -0.833) and max elevation
best = (-99, None); rise = sett = None; prev = None
t = local(3, 0)
while t < local(23, 30):
    el, az, *_ = sun(LAT, LON, t)
    if prev is not None:
        if prev < -0.833 <= el and rise is None: rise = (t, az)
        if prev >= -0.833 > el: sett = (t, az)
    if el > best[0]: best = (el, t, az)
    prev = el; t += dt.timedelta(seconds=30)
fmt = lambda t: (t + dt.timedelta(hours=2)).strftime('%H:%M')
print('Basel 21 Jun 2026  sunrise', fmt(rise[0]), f'az {rise[1]:.1f}', '| solar noon', fmt(best[1]), f'el {best[0]:.2f} az {best[2]:.1f}', '| sunset', fmt(sett[0]), f'az {sett[1]:.1f}')
for (h, m) in [(5,33),(6,0),(8,0),(9,30),(10,0),(12,0),(13,31),(16,0),(16,40),(18,0),(19,30),(20,12),(20,30),(21,0),(21,28),(22,0),(22,15),(22,45),(23,0)]:
    el, az, *_ = sun(LAT, LON, local(h, m))
    L = (1/math.tan(math.radians(el))) if el > 0.5 else float('inf')
    print(f'{h:02d}:{m:02d}  el {el:6.2f}  az {az:6.1f}  shadow/height {L:6.2f}')
# Moscow now-ish example (29 Sep 2026 09:12 MSK = 06:12 UTC)
el, az, *_ = sun(55.7558, 37.6173, dt.datetime(2026,9,29,6,12)); print('Moscow 29 Sep 09:12', round(el,1), round(az,1))
el, az, *_ = sun(47.5596, 7.5886, dt.datetime(2026,12,21,11,0)); print('Basel 21 Dec 12:00 CET', round(el,1), round(az,1))
