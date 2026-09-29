import numpy as np, math, time
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from caustic_proto import hilbert_d, word_density, bands, cauchy, gblur
rng=np.random.default_rng(5)

def transport_j(density, gw, gh, order=10):
    H,W=density.shape
    # stratified jittered source grid
    xs=(np.arange(gw)+0.5)/gw; ys=(np.arange(gh)+0.5)/gh
    SX,SY=np.meshgrid(xs,ys); SX=SX.ravel()+(rng.random(gw*gh)-0.5)/gw; SY=SY.ravel()+(rng.random(gw*gh)-0.5)/gh
    N=SX.size; n=1<<order
    sd=hilbert_d(np.clip((SX*n).astype(np.int64),0,n-1),np.clip((SY*n).astype(np.int64),0,n-1),order)
    sorder=np.argsort(sd,kind='stable')
    px=(np.arange(W)+0.5)/W; py=(np.arange(H)+0.5)/H
    PX,PY=np.meshgrid(px,py); PX=PX.ravel(); PY=PY.ravel(); w=density.ravel()
    pd=hilbert_d(np.minimum((PX*n).astype(np.int64),n-1),np.minimum((PY*n).astype(np.int64),n-1),order)
    porder=np.argsort(pd,kind='stable')
    cdf=np.cumsum(w[porder]); cdf/=cdf[-1]
    q=(np.arange(N)+0.5)/N
    idx=np.minimum(np.searchsorted(cdf,q),len(porder)-1); pix=porder[idx]
    tx=PX[pix]+(rng.random(N)-0.5)/W; ty=PY[pix]+(rng.random(N)-0.5)/H
    dn=w[pix]/w.mean()          # normalized density at target (mean 1)
    TX=np.empty(N); TY=np.empty(N); DN=np.empty(N)
    TX[sorder]=tx; TY[sorder]=ty; DN[sorder]=dn
    return SX,SY,TX,TY,DN

# wave surface: sum of directional sinusoids with analytic gradient + hessian
WAVES=[]
r=np.random.default_rng(21)
for i in range(7):
    th=r.random()*2*math.pi; f=r.uniform(2.2,4.2) if i<5 else r.uniform(6,8)
    WAVES.append((math.cos(th)*f, math.sin(th)*f, r.random()*2*math.pi, r.uniform(0.5,1.1), (1.0 if i<5 else 0.35)/f**2))
def waves(x,y,t):
    gx=np.zeros_like(x); gy=np.zeros_like(x); hxx=np.zeros_like(x); hyy=np.zeros_like(x); hxy=np.zeros_like(x)
    for kx,ky,ph,om,a in WAVES:
        K=2*math.pi; arg=K*(kx*x+ky*y)+ph+om*t
        c=np.cos(arg); s=np.sin(arg)
        gx+=a*K*kx*c; gy+=a*K*ky*c
        hxx+=-a*K*K*kx*kx*s; hyy+=-a*K*K*ky*ky*s; hxy+=-a*K*K*kx*ky*s
    return gx,gy,hxx,hyy,hxy

def render(SX,SY,TX,TY,DN,W,H,focus=1.0,amp=0.0,t=0.0,glass=(1.4917,57.4),K=16,base_sigma=0.55):
    A,B=cauchy(*glass); nd=glass[0]
    ls,rgbw=bands(K); N=SX.size
    gx,gy,hxx,hyy,hxy=waves(SX,SY,t)
    D=amp*0.018
    dxn=D*gx; dyn=D*gy
    detJ=np.abs((1+D*hxx)*(1+D*hyy)-(D*hxy)**2)       # footprint scale of the wave map
    foot=((1-focus)*1.0+focus*(1.0/np.maximum(DN,1e-3)))*np.maximum(detJ,0.02)
    # per-ray radius in px: uniform spacing -> sigma ~ spacing*0.5
    spacing=math.sqrt(W*H/N)
    sig=np.clip(base_sigma*spacing*np.sqrt(foot),0.45,14.0)
    levels=np.array([0.5,0.8,1.3,2.1,3.4,5.5,9.0,14.0])
    li=np.clip(np.searchsorted(levels,sig),0,len(levels)-1)
    out=np.zeros((H,W,3))
    for l,cw in zip(ls,rgbw):
        n=A+B/(l/1000)**2; s=(n-1)/(nd-1)
        lx=SX+s*(focus*(TX-SX)+(1-focus)*dxn); ly=SY+s*(focus*(TY-SY)+(1-focus)*dyn)
        for L in range(len(levels)):
            m=li==L
            if not m.any(): continue
            acc=np.zeros((H,W))
            x=lx[m]*W; y=ly[m]*H
            x0=np.floor(x).astype(int); y0=np.floor(y).astype(int); fx=x-x0; fy=y-y0
            for ddx,ddy,ww in ((0,0,(1-fx)*(1-fy)),(1,0,fx*(1-fy)),(0,1,(1-fx)*fy),(1,1,fx*fy)):
                xi=x0+ddx; yi=y0+ddy; ok=(xi>=0)&(xi<W)&(yi>=0)&(yi<H)
                np.add.at(acc,(yi[ok],xi[ok]),ww[ok])
            acc=gblur(acc[...,None],levels[L])[...,0]
            for c in range(3): out[...,c]+=acc*cw[c]
    out/=(N/(W*H))
    return out

if __name__=='__main__':
    t0=time.time()
    dens=word_density('aslant',W=1024,H=480,wdth=140,wght=110,floor=0.02,blur=1.0)
    SX,SY,TX,TY,DN=transport_j(dens,370,177)
    print('rays',SX.size,'transport',round(time.time()-t0,2))
    np.savez('v2_transport.npz',SX=SX,SY=SY,TX=TX,TY=TY,DN=DN)
    for name,focus,amp,glass in (('formed',1.0,0.0,(1.4917,57.4)),('formed_flint',1.0,0.0,(1.72825,28.53)),('forming',0.6,1.0,(1.4917,57.4)),('loose',0.0,1.0,(1.4917,57.4))):
        t1=time.time(); img=render(SX,SY,TX,TY,DN,1024,480,focus=focus,amp=amp,t=0.7,glass=glass)
        np.save(f'v2_{name}.npy',img.astype(np.float32)); print(name,round(time.time()-t1,1),'s max',round(float(img.max()),1),'mean',round(float(img.mean()),3))
