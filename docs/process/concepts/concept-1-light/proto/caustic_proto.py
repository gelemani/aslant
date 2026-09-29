import numpy as np, math, time
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FONT='./fonts/Sprat_Variable.ttf'
rng=np.random.default_rng(7)

def hilbert_d(x,y,order):
    # vectorized xy->d on a 2^order grid
    n=1<<order; d=np.zeros_like(x,dtype=np.int64); x=x.copy(); y=y.copy(); s=n>>1
    while s>0:
        rx=((x & s)>0).astype(np.int64); ry=((y & s)>0).astype(np.int64)
        d+= s*s*((3*rx)^ry)
        # rotate
        m=(ry==0)
        flip=m&(rx==1)
        x=np.where(flip, s-1-x, x); y=np.where(flip, s-1-y, y)
        x2=np.where(m, y, x); y2=np.where(m, x, y); x,y=x2,y2
        s>>=1
    return d

def word_density(word, W=1024, H=512, wdth=140, wght=110, floor=0.012, blur=1.2):
    img=Image.new('L',(W,H),0); d=ImageDraw.Draw(img)
    size=int(H*0.62)
    f=ImageFont.truetype(FONT,size); f.set_variation_by_axes([wdth,wght])
    # fit width
    while d.textlength(word,font=f)>W*0.86:
        size-=4; f=ImageFont.truetype(FONT,size); f.set_variation_by_axes([wdth,wght])
    bbox=d.textbbox((0,0),word,font=f)
    tw,th=bbox[2]-bbox[0],bbox[3]-bbox[1]
    d.text(((W-tw)/2-bbox[0],(H-th)/2-bbox[1]),word,font=f,fill=255)
    img=img.filter(ImageFilter.GaussianBlur(blur))
    a=np.asarray(img,dtype=np.float64)/255.0
    return a+floor

def transport(density, gw, gh, order=10):
    H,W=density.shape
    # source grid (uniform over the aperture), normalized [0,1]x[0,1]
    xs=(np.arange(gw)+0.5)/gw; ys=(np.arange(gh)+0.5)/gh
    SX,SY=np.meshgrid(xs,ys); SX=SX.ravel(); SY=SY.ravel(); N=SX.size
    n=1<<order
    sd=hilbert_d(np.minimum((SX*n).astype(np.int64),n-1),np.minimum((SY*n).astype(np.int64),n-1),order)
    sorder=np.argsort(sd,kind='stable')
    # density pixels in hilbert order
    px=(np.arange(W)+0.5)/W; py=(np.arange(H)+0.5)/H
    PX,PY=np.meshgrid(px,py); PX=PX.ravel(); PY=PY.ravel(); w=density.ravel()
    pd=hilbert_d(np.minimum((PX*n).astype(np.int64),n-1),np.minimum((PY*n).astype(np.int64),n-1),order)
    porder=np.argsort(pd,kind='stable')
    cdf=np.cumsum(w[porder]); cdf/=cdf[-1]
    q=(np.arange(N)+0.5)/N
    idx=np.searchsorted(cdf,q)
    idx=np.minimum(idx,len(porder)-1)
    pix=porder[idx]
    tx=PX[pix]+(rng.random(N)-0.5)/W; ty=PY[pix]+(rng.random(N)-0.5)/H
    TX=np.empty(N); TY=np.empty(N)
    TX[sorder]=tx; TY[sorder]=ty
    return SX,SY,TX,TY

# --- spectral (Wyman, Sloan, Shirley 2013 multi-lobe CIE 1931 fit)
def g(l,mu,s1,s2):
    s=np.where(l<mu,s1,s2); return np.exp(-0.5*((l-mu)/s)**2)
def xyz(l):
    x=1.056*g(l,599.8,37.9,31.0)+0.362*g(l,442.0,16.0,26.7)-0.065*g(l,501.1,20.4,26.2)
    y=0.821*g(l,568.8,46.9,40.5)+0.286*g(l,530.9,16.3,31.1)
    z=1.217*g(l,437.0,11.8,36.0)+0.681*g(l,459.0,26.0,13.8)
    return np.stack([x,y,z],-1)
M=np.array([[3.2406,-1.5372,-0.4986],[-0.9689,1.8758,0.0415],[0.0557,-0.2040,1.0570]])
def bands(K, lo=400, hi=700):
    l=np.linspace(lo,hi,K); rgb=xyz(l)@M.T
    rgb=rgb/rgb.sum(0,keepdims=True)  # white-balance: sum of bands = (1,1,1)
    return l,rgb

def cauchy(nd,Vd):
    lF,lC,ld=0.4861,0.6563,0.5876
    dn=(nd-1)/Vd; B=dn/(1/lF**2-1/lC**2); A=nd-B/ld**2; return A,B

def splat(img, x, y, wgt):
    # bilinear splat into img (H,W), x,y in pixels
    H,W=img.shape
    x0=np.floor(x).astype(int); y0=np.floor(y).astype(int); fx=x-x0; fy=y-y0
    for dx,dy,ww in ((0,0,(1-fx)*(1-fy)),(1,0,fx*(1-fy)),(0,1,(1-fx)*fy),(1,1,fx*fy)):
        xi=x0+dx; yi=y0+dy; ok=(xi>=0)&(xi<W)&(yi>=0)&(yi<H)
        np.add.at(img,(yi[ok],xi[ok]),(ww*wgt)[ok])

def noise_grad(x,y,t,seed=3,octaves=((6,1.0),(11,0.55),(19,0.3))):
    r=np.random.default_rng(seed); gx=np.zeros_like(x); gy=np.zeros_like(y)
    for freq,amp in octaves:
        for _ in range(4):
            th=r.random()*2*math.pi; ph=r.random()*2*math.pi; kx,ky=math.cos(th)*freq,math.sin(th)*freq
            c=np.cos(2*math.pi*(kx*x+ky*y)+ph+t*(0.6+r.random()))
            gx+=amp*kx*c; gy+=amp*ky*c
    return gx,gy

def gblur(img,sigma):
    r=int(math.ceil(sigma*3)); k=np.exp(-0.5*(np.arange(-r,r+1)/sigma)**2); k/=k.sum()
    out=img.copy()
    for axis in (0,1):
        acc=np.zeros_like(out)
        for i,w in enumerate(k):
            acc+=w*np.roll(out,i-r,axis=axis)
        out=acc
    return out

def render_caustic(SX,SY,TX,TY,W,H,focus=1.0,noise=0.0,t=0.0,glass=(1.72825,28.53),K=12,throw=1.0,sigma=1.1):
    A,B=cauchy(*glass); nd=glass[0]
    ls,rgbw=bands(K)
    out=np.zeros((H,W,3))
    N=SX.size
    gx,gy=noise_grad(SX,SY,t)
    dxn=gx*noise*0.0035; dyn=gy*noise*0.0035
    for l,cw in zip(ls,rgbw):
        n=A+B/(l/1000)**2; s=(n-1)/(nd-1)*throw
        lx=SX+s*(focus*(TX-SX)+dxn); ly=SY+s*(focus*(TY-SY)+dyn)
        acc=np.zeros((H,W))
        splat(acc,lx*W,ly*H,np.full(N,1.0))
        for c in range(3): out[...,c]+=acc*cw[c]
    # normalize: plain light (uniform) would be N/(W*H) per pixel -> 1.0
    out/= (N/(W*H))
    # soft blur (splat footprint)
    return gblur(out,sigma)

if __name__=='__main__':
    t0=time.time()
    dens=word_density('aslant')
    gw,gh=362,181
    SX,SY,TX,TY=transport(dens,gw,gh)
    print('transport', round(time.time()-t0,3),'s', SX.size,'rays')
    np.savez('aslant_transport.npz',SX=SX,SY=SY,TX=TX,TY=TY)
    for name,focus,noise in (('formed',1.0,0.06),('forming',0.55,0.55),('loose',0.0,1.0)):
        t1=time.time()
        img=render_caustic(SX,SY,TX,TY,1024,512,focus=focus,noise=noise,t=1.3)
        np.save(f'caustic_{name}.npy',img.astype(np.float32))
        print(name, round(time.time()-t1,2),'s', 'max',round(float(img.max()),2),'mean',round(float(img.mean()),3))
