import numpy as np, math
from PIL import Image, ImageDraw, ImageFont
from caustic_proto import gblur
from composite import srgb_to_lin, lin_to_srgb, aces, fbm
rng=np.random.default_rng(3)
def F(fn,sz,ax): f=ImageFont.truetype(fn,sz); f.set_variation_by_axes(ax); return f
SPRAT='./fonts/Sprat_Variable.ttf'; GEO='./fonts/Geologica.ttf'
def sample(img, u, v):
    h,w=img.shape[:2]
    x=np.clip(u*(w-1),0,w-1); y=np.clip(v*(h-1),0,h-1)
    x0=np.floor(x).astype(int); y0=np.floor(y).astype(int); x1=np.minimum(x0+1,w-1); y1=np.minimum(y0+1,h-1)
    fx=(x-x0)[...,None]; fy=(y-y0)[...,None]
    return img[y0,x0]*(1-fx)*(1-fy)+img[y0,x1]*fx*(1-fy)+img[y1,x0]*(1-fx)*fy+img[y1,x1]*fx*fy

def frame(caustic,W=1920,H=1080,out='v2_hero.png',mobile=False,text=True,sun_rgb=(255,238,214),sun_i=1.25,exposure=1.0):
    y,x=np.mgrid[0:H,0:W].astype(np.float64)
    albedo=srgb_to_lin([214,206,190])*0.62            # pale limewash, linear
    mott=0.93+0.14*fbm(H,W,2.5,5,4)
    alb=albedo[None,None,:]*mott[...,None]
    sky=srgb_to_lin([170,196,214])*0.052               # cool skylight in shade
    sun=srgb_to_lin(sun_rgb)*sun_i
    if not mobile:
        top,bot=0.155*H,0.80*H; x0,x1=0.455*W,0.905*W; skew=0.20
    else:
        top,bot=0.085*H,0.49*H; x0,x1=0.05*W,0.95*W; skew=0.07
    ph=bot-top; v=(y-top)/ph; u=((x-v*skew*ph)-x0)/(x1-x0)
    pen_u=0.012; pen_v=0.012
    def ss(a,e0,e1): t=np.clip((a-e0)/(e1-e0),0,1); return t*t*(3-2*t)
    mask=ss(u,-pen_u,pen_u)*ss(1-u,-pen_u,pen_u)*ss(v,-pen_v,pen_v)*ss(1-v,-pen_v,pen_v)
    split=0.30; bar=0.035
    upper=mask*ss(split-v,-0.006,0.006)
    lower=mask*ss(v-(split+bar),-0.006,0.006)
    # plain upper light: ordinary glass faintly ripples
    rip=0.94+0.12*fbm(H,W,7,3,9)
    lv=(v-(split+bar))/(1-(split+bar))
    caus=sample(caustic,np.clip(u,0,1),np.clip(lv,0,1))
    irr=sky[None,None,:]+upper[...,None]*sun[None,None,:]*rip[...,None]+lower[...,None]*sun[None,None,:]*caus
    rad=alb*irr
    # faint haze in air along the beam (upper left -> patch)
    haze=np.exp(-(((x/W)-0.30)**2*5+((y/H)-0.25)**2*4))*0.010
    rad+=haze[...,None]*sun[None,None,:]
    # halation: bright spill
    bright=np.clip(rad-0.9,0,None)
    rad+=gblur(bright,9.0)*0.10+gblur(bright,28.0)*0.05
    vg=1-0.22*(((x/W-0.6)**2+(y/H-0.5)**2)*1.4)
    rad*=vg[...,None]
    img=aces(rad*exposure)
    lum=img.mean(-1,keepdims=True)
    img=np.clip(img+(rng.random((H,W,1))-0.5)*0.022/np.sqrt(0.12+lum)*0.35,0,1)
    im=Image.fromarray((lin_to_srgb(img)*255).astype(np.uint8))
    if text:
        d=ImageDraw.Draw(im); ink=(236,230,217); dust=(162,172,168); sunc=(255,225,166); umb=(30,34,36)
        if not mobile:
            d.text((int(0.055*W),int(0.05*H)),'aslant',font=F(SPRAT,36,[150,70]),fill=ink)
            d.text((int(0.62*W),int(0.058*H)),'08:10   First light',font=F(GEO,16,[420,0,100,0]),fill=dust)
            bx=int(0.83*W); by=int(0.045*H)
            d.rectangle([bx,by,bx+212,by+46],fill=sunc); d.text((bx+22,by+13),'Commission a pane',font=F(GEO,17,[520,0,100,0]),fill=umb)
            yy=int(0.545*H)
            for i,t in enumerate(['Clear glass','that writes','in sunlight.']):
                d.text((int(0.055*W),yy+i*80),t,font=F(SPRAT,72,[185,26]),fill=ink)
            d.text((int(0.055*W),yy+270),'We shape a window pane so that, at an hour you choose,',font=F(GEO,20,[340,0,0,0]),fill=dust)
            d.text((int(0.055*W),yy+300),'the sun spells a word on your wall.',font=F(GEO,20,[340,0,0,0]),fill=dust)
            bx,by=int(0.055*W),yy+352
            d.rectangle([bx,by,bx+212,by+50],fill=sunc); d.text((bx+22,by+15),'Commission a pane',font=F(GEO,17,[520,0,100,0]),fill=umb)
            d.text((bx+240,by+15),'Write yours',font=F(GEO,17,[450,0,100,0]),fill=ink); d.line([bx+240,by+38,bx+334,by+38],fill=(120,128,125),width=1)
        else:
            d.text((32,44),'aslant',font=F(SPRAT,40,[150,70]),fill=ink)
            yy=int(0.575*H)
            for i,t in enumerate(['Clear glass','that writes','in sunlight.']):
                d.text((32,yy+i*70),t,font=F(SPRAT,60,[175,28]),fill=ink)
            for i,t in enumerate(['We shape a window pane so that, at an','hour you choose, the sun spells a word','on your wall.']):
                d.text((32,yy+232+i*32),t,font=F(GEO,21,[340,0,0,0]),fill=dust)
            d.rectangle([32,yy+350,32+228,yy+350+54],fill=sunc); d.text((56,yy+366),'Commission a pane',font=F(GEO,18,[520,0,100,0]),fill=umb)
    im.save(out); return im

if __name__=='__main__':
    for name,t in (('formed',True),('formed_flint',False),('forming',False),('loose',False)):
        frame(np.load(f'v2_{name}.npy'),out=f'v2_hero_{name}.png',text=t)
    frame(np.load('v2_formed.npy'),W=780,H=1688,mobile=True,out='v2_hero_mobile.png')
    print('ok')
