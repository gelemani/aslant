import numpy as np, math
from PIL import Image, ImageDraw, ImageFont
from caustic_proto import gblur
rng=np.random.default_rng(11)
def srgb_to_lin(c):
    c=np.asarray(c)/255.0; return np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4)
def lin_to_srgb(c):
    c=np.clip(c,0,1); return np.where(c<=0.0031308,12.92*c,1.055*np.power(c,1/2.4)-0.055)
def aces(x):
    a,b,c,d,e=2.51,0.03,2.43,0.59,0.14; return np.clip((x*(a*x+b))/(x*(c*x+d)+e),0,1)
def fbm(H,W,scale,oct=5,seed=1):
    r=np.random.default_rng(seed); out=np.zeros((H,W)); amp=1; tot=0
    for o in range(oct):
        s=max(2,int(scale*(2**o)))
        g=r.random((s+1,s*W//H+2))
        im=np.asarray(Image.fromarray((g*255).astype(np.uint8)).resize((W,H),Image.BICUBIC),dtype=np.float64)/255
        out+=amp*im; tot+=amp; amp*=0.5
    return out/tot

def frame(caustic, W=1920, H=1080, mobile=False, out='hero.png', skew=0.24, sun=(255,236,205), show_text=True):
    y,x=np.mgrid[0:H,0:W].astype(np.float64)
    shade=srgb_to_lin([37,43,44])
    plaster=fbm(H,W,3,5,2)
    base=shade[None,None,:]*(0.9+0.2*(plaster[...,None]-0.5)*2)
    # sun patch: parallelogram skewed (light from upper-left), two lights separated by mullion
    if not mobile:
        top,bot=0.16*H,0.86*H; x0,x1=0.40*W,0.965*W
    else:
        top,bot=0.13*H,0.50*H; x0,x1=0.06*W,0.94*W
    ph=bot-top
    # parallelogram coordinates: u across, v down; skew shifts x with v
    v=(y-top)/ph
    xs=x-(v*skew*ph)            # unskew
    u=(xs-x0)/(x1-x0)
    pen=0.006                    # penumbra (fraction)
    def soft(a,edge0,edge1): return np.clip((a-edge0)/(edge1-edge0),0,1)
    inside=soft(u,0,pen*1.8)*soft(1-u,0,pen*1.8)*soft(v,0,pen*3)*soft(1-v,0,pen*3)
    sunl=srgb_to_lin(sun)*0.42
    light=np.zeros((H,W,3))
    if not mobile:
        mull=0.5; mw=0.028
        left=inside*soft(mull-mw/2-u,0,pen*2)
        right=inside*soft(u-(mull+mw/2),0,pen*2)
        # transom bar near top
        tb=np.clip(1-soft(v,0.085,0.085+pen*3)*soft(0.115-v,0,pen*3)*1.0,0,1)
        left*=tb; right*=tb
        # plain old-glass ripple on left
        rip=1+0.06*(fbm(H,W,9,3,5)-0.5)*2
        light+=left[...,None]*sunl[None,None,:]*rip[...,None]
        # caustic into right light
        ru=(u-(mull+mw/2))/(1-(mull+mw/2)); rv=v
    else:
        right=inside; ru=u; rv=v
    ch,cw_=caustic.shape[:2]
    # the caustic spans the pane-light region: map (ru,rv)->caustic pixel (aspect handled by stretch)
    ci=np.clip((rv*ch).astype(int),0,ch-1); cj=np.clip((ru*cw_).astype(int),0,cw_-1)
    cimg=caustic[ci,cj]
    light+=right[...,None]*sunl[None,None,:]*cimg
    # faint beam haze toward patch (upper-left), very subtle
    beam=np.exp(-((x/W-0.18)**2*6+(y/H-0.2)**2*3))*0.012
    img=base+light+beam[...,None]*srgb_to_lin(sun)[None,None,:]
    # vignette
    vg=1-0.28*(((x/W-0.55)**2+(y/H-0.5)**2)*1.6)
    img*=vg[...,None]
    img=aces(img*1.25)
    # grain ~ photon noise: stronger in dark
    lum=img.mean(-1,keepdims=True)
    gr=(rng.random((H,W,1))-0.5)*0.035*(1/np.sqrt(0.08+lum))*0.25
    img=np.clip(img+gr*0.5,0,1)
    im=Image.fromarray((lin_to_srgb(img)*255).astype(np.uint8))
    if show_text:
        d=ImageDraw.Draw(im)
        def F(fn,sz,ax): f=ImageFont.truetype(fn,sz); f.set_variation_by_axes(ax); return f
        ink=(236,230,217); dust=(162,172,168); sunc=(255,225,166)
        if not mobile:
            d.text((int(0.055*W),int(0.045*H)),'aslant',font=F('./fonts/Sprat_Variable.ttf',34,[150,70]),fill=ink)
            d.text((int(0.80*W),int(0.05*H)),'Commission a pane',font=F('./fonts/Geologica.ttf',17,[520,0,100,0]),fill=(30,34,36))
            d.text((int(0.055*W),int(0.56*H)),'Clear glass',font=F('./fonts/Sprat_Variable.ttf',70,[185,26]),fill=ink)
            d.text((int(0.055*W),int(0.56*H)+78),'that writes',font=F('./fonts/Sprat_Variable.ttf',70,[185,26]),fill=ink)
            d.text((int(0.055*W),int(0.56*H)+156),'in sunlight.',font=F('./fonts/Sprat_Variable.ttf',70,[185,26]),fill=ink)
            sub='We shape a window pane so that, at an hour you choose,'
            sub2='the sun spells a word on your wall.'
            d.text((int(0.055*W),int(0.56*H)+262),sub,font=F('./fonts/Geologica.ttf',20,[340,0,0,0]),fill=dust)
            d.text((int(0.055*W),int(0.56*H)+292),sub2,font=F('./fonts/Geologica.ttf',20,[340,0,0,0]),fill=dust)
            bx,by=int(0.055*W),int(0.56*H)+344
            d.rectangle([bx,by,bx+208,by+48],fill=sunc)
            d.text((bx+22,by+13),'Commission a pane',font=F('./fonts/Geologica.ttf',17,[520,0,100,0]),fill=(30,34,36))
            d.text((bx+236,by+13),'Write yours',font=F('./fonts/Geologica.ttf',17,[450,0,100,0]),fill=ink)
            d.line([bx+236,by+36,bx+330,by+36],fill=(120,128,125),width=1)
            # nav button top-right
            d.rectangle([int(0.795*W)-14,int(0.042*H)-4,int(0.795*W)+196,int(0.042*H)+36],fill=sunc)
            d.text((int(0.795*W),int(0.05*H)),'Commission a pane',font=F('./fonts/Geologica.ttf',17,[520,0,100,0]),fill=(30,34,36))
            d.text((int(0.66*W),int(0.05*H)),'08:10  First light',font=F('./fonts/Geologica.ttf',15,[420,0,100,0]),fill=dust)
        else:
            d.text((32,40),'aslant',font=F('./fonts/Sprat_Variable.ttf',34,[150,70]),fill=ink)
            yy=int(0.58*H)
            for i,t in enumerate(['Clear glass','that writes','in sunlight.']):
                d.text((32,yy+i*62),t,font=F('./fonts/Sprat_Variable.ttf',56,[175,28]),fill=ink)
            d.text((32,yy+206),'We shape a window pane so that, at an',font=F('./fonts/Geologica.ttf',19,[340,0,0,0]),fill=dust)
            d.text((32,yy+234),'hour you choose, the sun spells a word',font=F('./fonts/Geologica.ttf',19,[340,0,0,0]),fill=dust)
            d.text((32,yy+262),'on your wall.',font=F('./fonts/Geologica.ttf',19,[340,0,0,0]),fill=dust)
            d.rectangle([32,yy+304,32+212,yy+304+50],fill=sunc)
            d.text((54,yy+318),'Commission a pane',font=F('./fonts/Geologica.ttf',17,[520,0,100,0]),fill=(30,34,36))
    im.save(out)
    return im

if __name__=='__main__':
    for name in ('formed','forming','loose'):
        c=np.load(f'caustic_{name}.npy')
        frame(c,out=f'hero_{name}.png',show_text=(name=='formed'))
    c=np.load('caustic_formed.npy')
    frame(c,W=780,H=1688,mobile=True,out='hero_mobile.png',skew=0.10)
    print('ok')
