import numpy as np, math, time
from caustic_proto import word_density, gblur
from v2 import transport_j, render
rng=np.random.default_rng(9)
def sliced_ot(P, T, iters=96, step=1.0):
    P=P.copy(); N=len(P)
    for it in range(iters):
        th=rng.random()*math.pi; d=np.array([math.cos(th),math.sin(th)])
        pp=P@d; tp=T@d
        ip=np.argsort(pp); it_=np.argsort(tp)
        disp=np.empty(N); disp[ip]=tp[it_]-pp[ip]
        P+=step*disp[:,None]*d[None,:]
    return P
t0=time.time()
dens=word_density('aslant',W=1024,H=480,wdth=140,wght=110,floor=0.0,blur=0.8)
SX,SY,TX,TY,DN=transport_j(dens,370,177)       # target sample set (hilbert-stratified), floor 0: letters only
S=np.stack([SX,SY*480/1024],1); T=np.stack([TX,TY*480/1024],1)   # isotropic coords
P=sliced_ot(S,T,iters=128)
print('sliced OT', round(time.time()-t0,2),'s')
TX2=P[:,0]; TY2=P[:,1]*1024/480
# density at new targets for footprint: sample dens
h,w=dens.shape
xi=np.clip((TX2*w).astype(int),0,w-1); yi=np.clip((TY2*h).astype(int),0,h-1)
DN2=np.maximum(dens[yi,xi]/dens.mean(),0.05)
np.savez('v3_transport.npz',SX=SX,SY=SY,TX=TX2,TY=TY2,DN=DN2)
for name,focus,amp in (('formed',1.0,0.0),('f35',0.35,0.35),('f65',0.65,0.15),('f85',0.85,0.05)):
    img=render(SX,SY,TX2,TY2,DN2,1024,480,focus=focus,amp=amp,t=0.7)
    np.save(f'v3_{name}.npy',img.astype(np.float32)); print(name,'max',round(float(img.max()),1),'mean',round(float(img.mean()),3))
