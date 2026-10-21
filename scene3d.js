// LeonLink Kids Pet - interactive 3D scene (three.js), everything built from shapes.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
// Cartoon look: toon shading with a 4-step ramp + ink outlines
const RAMP=(()=>{const d=new Uint8Array([90,90,90,255,160,160,160,255,215,215,215,255,255,255,255,255]);const t=new THREE.DataTexture(d,4,1);t.minFilter=t.magFilter=THREE.NearestFilter;t.needsUpdate=true;return t})();
const M=(c,o={})=>{const{roughness,metalness,...r}=o;return new THREE.MeshToonMaterial({color:c,gradientMap:RAMP,...r})};
const INK=new THREE.MeshBasicMaterial({color:0x2a1d33,side:THREE.BackSide});
function outline(g,w=.035){const list=[];g.traverse(o=>{if(o.isMesh&&!o.userData.ink&&!o.userData.noink&&o.material!==INK&&!o.material.transparent&&o.material.visible!==false)list.push(o)});
 list.forEach(o=>{o.geometry.computeBoundingSphere();const r=o.geometry.boundingSphere.radius||1;const k=o.getWorldScale(new THREE.Vector3());const sc=Math.max(.0001,Math.min(k.x,k.y,k.z));const i=new THREE.Mesh(o.geometry,INK);i.userData.ink=1;i.scale.setScalar(1+Math.min(.25,w/(r*sc)));i.castShadow=false;o.add(i)});return g}
const mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;return o};
const MOB=matchMedia('(pointer:coarse)').matches||innerWidth<700;const S_=r=>new THREE.SphereGeometry(r,MOB?22:36,MOB?16:24),B=(w,h,d)=>new THREE.BoxGeometry(w,h,d),C=(a,b,h,s=24)=>new THREE.CylinderGeometry(a,b,h,s),K=(r,h,s=24)=>new THREE.ConeGeometry(r,h,s);
let mouth,blinkAt=3,blinkT=0,blob,R,scene,cam,ctl,cv,petG,head,homeG,furnG,wearG,eyes=[],ray=new THREE.Raycaster(),ptr=new THREE.Vector2(),key='',clock=new THREE.Clock(),fx=[],anim=null,target=new THREE.Vector3(),look=new THREE.Vector3(0,2,6),floor;
const COL={pup:[0xf2b26b,0x8a5230],kit:[0xff9f45,0xfff3e0],bun:[0xffffff,0xff9ccc],dra:[0x5fe08f,0xffd34d],uni:[0xffffff,0xff7fc8],pen:[0x2f3a7a,0xffffff]};
function init(){
 cv=document.createElement('canvas');cv.className='c3d';
 R=new THREE.WebGLRenderer({canvas:cv,antialias:!MOB||devicePixelRatio<2,preserveDrawingBuffer:true,powerPreference:'low-power'});R.setPixelRatio(Math.min(devicePixelRatio,MOB?1.5:2));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.NoToneMapping;
 scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(45,2,.1,200);cam.position.set(0,3.6,9);
 ctl=new OrbitControls(cam,cv);ctl.target.set(0,1.2,0);ctl.enableDamping=true;ctl.enablePan=false;ctl.minDistance=4.5;ctl.maxDistance=10.5;ctl.maxPolarAngle=Math.PI*.47;ctl.minPolarAngle=Math.PI*.22;ctl.minAzimuthAngle=-Math.PI*.33;ctl.maxAzimuthAngle=Math.PI*.33;
 scene.add(new THREE.HemisphereLight(0xffffff,0xb8a8e0,1.6));const rim=new THREE.DirectionalLight(0x9fdfff,1.4);rim.position.set(-6,5,-8);scene.add(rim);
 const sun=new THREE.DirectionalLight(0xfff0d8,2.2);sun.position.set(5,10,6);sun.castShadow=true;sun.shadow.mapSize.set(MOB?512:1024,MOB?512:1024);sun.shadow.radius=6;sun.shadow.bias=-.0005;sun.shadow.normalBias=.03;Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9});scene.add(sun);
 {const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(40,20,60,.55)');gr.addColorStop(1,'rgba(40,20,60,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);blob=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));blob.rotation.x=-Math.PI/2;blob.position.y=.03;scene.add(blob)}
 floor=mesh(new THREE.CircleGeometry(7,48),new THREE.MeshBasicMaterial({visible:false}));floor.rotation.x=-Math.PI/2;scene.add(floor);
 let down=null;
 cv.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];cv.parentElement&&cv.parentElement.classList.add('touched')});
 cv.addEventListener('pointermove',e=>{setPtr(e);ray.setFromCamera(ptr,cam);const h=ray.intersectObject(floor)[0];if(h)look.copy(h.point).setY(1.5);cv.style.cursor=petG&&ray.intersectObject(petG,true).length?'pointer':'grab'});
 cv.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;setPtr(e);ray.setFromCamera(ptr,cam);
  const hp=petG&&ray.intersectObject(petG,true)[0];
  if(hp){const local=petG.worldToLocal(hp.point.clone());if(local.y>1.5)act('pat');else act('tickle');return}
  const f=ray.intersectObject(floor)[0];if(f){target.set(THREE.MathUtils.clamp(f.point.x,-5,5),0,THREE.MathUtils.clamp(f.point.z,-4,4));spawn('step',target)}});
 new ResizeObserver(fit).observe(document.body);loop()}
function setPtr(e){const r=cv.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1)}
function fit(){const p=cv.parentElement;if(!p)return;const w=p.clientWidth,h=p.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
function buildPet(id){
 const g=new THREE.Group(),[c1,c2]=COL[id]||COL.pup,m1=M(c1),m2=M(c2),dark=M(0x111111,{roughness:.2}),white=M(0xffffff),pink=M(0xff8fb8),orange=M(0xffa726);
 const body=mesh(S_(.85),m1,0,.92,0);body.scale.set(1.02,.92,1);g.add(body);
 if(id!=='dra'){const b=mesh(S_(.6),id==='pen'?white:m2,0,.9,.45);b.scale.set(1,1.1,.6);g.add(b)}
 head=new THREE.Group();head.position.set(0,2.1,.1);g.add(head);const hd=mesh(S_(.78),m1);hd.scale.set(1.05,.95,1);head.add(hd);head.scale.setScalar(1.15);
 eyes=[];for(const s of[-1,1]){const w=mesh(S_(.25),white,s*.3,.1,.58),p=mesh(S_(.18),dark,s*.3,.09,.72),sh=mesh(S_(.065),M(0xffffff,{emissive:0xffffff}),s*.24,.15,.84);w.scale.z=.6;p.userData.noink=1;sh.userData.noink=1;head.add(w,p,sh);eyes.push(w,p,sh);
  const ck=mesh(S_(.1),pink,s*.42,-.12,.52);ck.scale.set(1,.6,.4);head.add(ck)}
 mouth=new THREE.Group();mouth.position.set(0,-.36,.66);head.add(mouth);const sm=new THREE.Mesh(new THREE.TorusGeometry(.11,.03,8,16,Math.PI),dark);sm.rotation.z=Math.PI;sm.userData.noink=1;const om=mesh(S_(.1),M(0xc2185b),0,-.04,0);om.scale.set(1,.8,.5);om.userData.noink=1;om.visible=false;mouth.add(sm,om);mouth.userData={sm,om};
 const feetM=id==='pen'?orange:m1;for(const s of[-1,1]){g.add(mesh(S_(.26),feetM,s*.45,.22,.35));const a=mesh(S_(.22),m1,s*.8,1.1,.3);a.userData.arm=s;a.scale.set(.8,1.2,.8);g.add(a)}
 if(id==='pen'){const bk=mesh(K(.14,.35),orange,0,-.05,.78);bk.rotation.x=Math.PI/2;head.add(bk)}
 else{const sn=mesh(S_(.28),id==='pup'||id==='kit'?m2:m1,0,-.18,.55);sn.scale.set(1.1,.8,.8);head.add(sn);head.add(mesh(S_(.08),id==='bun'||id==='uni'?pink:dark,0,-.08,.79))}
 if(id==='pup')for(const s of[-1,1]){const ep=new THREE.Group();ep.position.set(s*.66,.42,-.02);ep.userData.ear=s;head.add(ep);const e=mesh(S_(.34),m2,s*.12,-.42,0);e.scale.set(.55,1.35,.42);e.rotation.z=s*.22;ep.add(e);const i=mesh(S_(.26),pink,s*.15,-.4,.1);i.scale.set(.42,1.15,.2);i.rotation.z=s*.22;ep.add(i)}
 if(id==='kit')for(const s of[-1,1]){const e=mesh(K(.22,.45,4),m1,s*.38,.62,0);e.rotation.z=-s*.25;head.add(e)}
 if(id==='bun'){for(const s of[-1,1]){const e=mesh(S_(.18),m1,s*.25,.95,-.05);e.scale.set(.8,3,.6);e.rotation.z=-s*.15;head.add(e);const i=mesh(S_(.1),pink,s*.25,.95,.07);i.scale.set(.7,2.6,.4);i.rotation.z=-s*.15;head.add(i)}g.add(mesh(S_(.22),white,0,.6,-.85))}
 if(id==='uni'){const h=mesh(K(.12,.6),M(0xffd23f,{metalness:.4}),0,.78,.25);h.rotation.x=.3;head.add(h);[0xff3fb4,0x22e5ff,0xb388ff].forEach((c,i)=>head.add(mesh(S_(.2),M(c),0,.55-i*.25,-.5-i*.08)));for(const s of[-1,1])head.add(mesh(K(.12,.3),m1,s*.35,.6,-.05))}
 if(id==='dra'){for(const s of[-1,1]){const h=mesh(K(.09,.4),m2,s*.3,.65,-.05);h.rotation.z=-s*.3;head.add(h);const w=mesh(B(.05,.7,1),M(0x7cf5b4),s*.85,1.4,-.5);w.rotation.set(.3,0,-s*.6);w.userData.wing=s;g.add(w)}
  for(let i=0;i<4;i++)g.add(mesh(K(.12,.3,4),m2,0,1.7-i*.3,-.84));const t=mesh(K(.25,1.2),m1,0,.45,-1);t.rotation.x=-1.9;g.add(t);g.add(mesh(B(.6,.75,.2),M(0xffe9a0),0,.95,.8))}
 if(id==='kit'||id==='pup'||id==='uni'){const t=mesh(C(.08,.12,.9),m1,0,.75,-.9);t.rotation.x=-.9;t.userData.tail=1;g.add(t)}
 outline(g);return g}
function buildWear(id){const g=new THREE.Group();if(!id)return g;const gold=M(0xffd23f,{metalness:.7,roughness:.25}),blk=M(0x111111),pk=M(0xff3fb4);
 if(id==='crown'){g.add(mesh(C(.42,.4,.25,8),gold,0,.75,0));for(let i=0;i<5;i++){const a=i/5*Math.PI*2;g.add(mesh(K(.08,.25,6),gold,Math.sin(a)*.38,.98,Math.cos(a)*.38));g.add(mesh(S_(.05),M([0xff3fb4,0x22e5ff,0x3ddc84][i%3]),Math.sin(a)*.42,.75,Math.cos(a)*.42))}}
 if(id==='tophat'){g.add(mesh(C(.55,.55,.05),blk,0,.66,0),mesh(C(.33,.35,.6),blk,0,.98,0),mesh(C(.355,.355,.1),pk,0,.75,0))}
 if(id==='party'){g.add(mesh(K(.3,.75),M(0x22e5ff),0,1.02,0),mesh(S_(.09),pk,0,1.42,0))}
 if(id==='cap'){g.add(mesh(new THREE.SphereGeometry(.62,24,12,0,Math.PI*2,0,Math.PI/2),pk,0,.25,0));const b=mesh(C(.45,.45,.04),pk,0,.28,.45);b.scale.z=.7;g.add(b)}
 if(id==='bow'){for(const s of[-1,1]){const l=mesh(K(.2,.35,12),pk,s*.22,.66,.15);l.rotation.z=s*Math.PI/2;g.add(l)}g.add(mesh(S_(.1),M(0xff7fcf),0,.66,.15))}
 if(id==='glasses'){const gm=M(0x111111,{roughness:.1,metalness:.6});for(const s of[-1,1]){const l=mesh(C(.18,.18,.05),gm,s*.27,.12,.8);l.rotation.x=Math.PI/2;g.add(l)}g.add(mesh(B(.2,.04,.04),gm,0,.14,.8))}
 return outline(g,.025)}
const HOME3D={room:{sky:0xffd9c2,fl:0xe0a878,wall:0xf3b6c8},garden:{sky:0xc5e8ff,fl:0x9fd98a},tree:{sky:0xcdeec0,fl:0xb98a68},beach:{sky:0xbfe8ff,fl:0xfbe7b5},castle:{sky:0x8f7ad8,fl:0xd8d2e6,wall:0xb3aacb},space:{sky:0x1a1840,fl:0x4a4a86,wall:0x2e2c5e}};
function buildHome(id){const h=HOME3D[id]||HOME3D.room,g=new THREE.Group();scene.background=new THREE.Color(h.sky);scene.fog=new THREE.Fog(h.sky,20,45);
 const f=mesh(C(7,6.8,.4,64),M(h.fl),0,-.2,0);g.add(f);g.add(mesh(new THREE.TorusGeometry(6.9,.18,12,80),M(new THREE.Color(h.fl).multiplyScalar(.8).getHex()),0,0,0).rotateX(Math.PI/2));
 if(h.wall){const w=mesh(new THREE.CylinderGeometry(7,7,6,48,1,true,Math.PI*.6,Math.PI*.8),M(h.wall,{side:THREE.DoubleSide}),0,3,0);g.add(w)}
 const rnd=(a,b)=>a+Math.random()*(b-a);
 if(id==='room'){g.add(mesh(C(2.3,2.3,.03,48),M(0xfff1f6),0,.02,.5))}
 if(id==='garden'){for(let i=0;i<22;i++){const a=rnd(0,6.28),r=rnd(3.2,6.5),x=Math.cos(a)*r,z=Math.sin(a)*r;g.add(mesh(C(.03,.03,.5),M(0x2e7d32),x,.25,z));g.add(mesh(S_(.15),M([0xff3fb4,0xffd23f,0xffffff,0x22e5ff][i%4]),x,.55,z))}g.add(mesh(S_(1),M(0xfff176,{emissive:0xffd23f}),-6,9,-14))}
 if(id==='tree'){g.add(mesh(C(.9,1.2,8),M(0x6d4c41),0,-4.3,-6.5));for(let i=0;i<9;i++)g.add(mesh(S_(rnd(1.5,2.5)),M(0x3f9a3a),rnd(-8,8),rnd(5,8),rnd(-9,-4)));for(const s of[-1,1])g.add(mesh(B(.2,1.2,12),M(0x8d5a3b),s*6.8,.6,0))}
 if(id==='beach'){const sea=mesh(B(40,.2,14),M(0x29b6f6,{roughness:.1,metalness:.2}),0,-.2,-13);sea.userData.sea=1;g.add(sea);g.add(mesh(C(.15,.2,4),M(0x8d6e63),4.5,2,-3));for(let i=0;i<5;i++){const l=mesh(B(2,.08,.5),M(0x43a047),4.5,4,-3);l.rotation.set(0,i*1.25,-.5);g.add(l)}
  const sc=mesh(C(.5,.7,.6,6),M(0xf0c46c),-3.5,.3,2);g.add(sc,mesh(K(.4,.5,6),M(0xf0c46c),-3.5,.85,2))}
 if(id==='castle'){for(const x of[-5,5]){g.add(mesh(C(1,1,6,12),M(0x8c8ca0),x,3,-4.5));g.add(mesh(K(1.3,1.8,12),M(0x5e35b1),x,6.9,-4.5))}for(const s of[-1,1])g.add(mesh(B(.6,2.6,.1),M(0xff3fb4),s*2.5,3.5,-5.4));g.add(mesh(B(3,.05,5),M(0xc62828),0,.02,0))}
 if(id==='space'){const sg=new THREE.BufferGeometry(),p=[];for(let i=0;i<700;i++){const v=new THREE.Vector3().randomDirection().multiplyScalar(rnd(25,60));p.push(v.x,Math.abs(v.y),v.z)}sg.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:.15})));
  const pl=mesh(S_(3),M(0xff3fb4),-12,9,-22);g.add(pl);const ring=mesh(new THREE.TorusGeometry(4.5,.25,8,60),M(0x22e5ff,{emissive:0x22e5ff}),-12,9,-22);ring.rotation.x=1.2;g.add(ring);g.add(mesh(new THREE.TorusGeometry(7,.08,8,80),M(0x22e5ff,{emissive:0x22e5ff}),0,.05,0).rotateX(Math.PI/2))}
 decor(id,g,h);g.traverse(o=>{if(o.isMesh&&o.position.y>5.5)o.castShadow=false});return g}
// ---------- richer environments ----------
function decor(id,g,h){const rnd=(a,b)=>a+Math.random()*(b-a),Q=MOB?.6:1,pick=a=>a[Math.floor(Math.random()*a.length)];
 const add=(o,ud)=>{if(ud)Object.assign(o.userData,ud);g.add(o);return o};
 const wall=(o,th,y,r=6.82)=>{o.position.set(Math.sin(th)*r,y,Math.cos(th)*r);o.rotation.y=th+Math.PI;return add(o)};
 const grp=(...m)=>{const q=new THREE.Group();m.forEach(x=>q.add(x));return q};
 const glow=(c,i=1)=>M(c,{emissive:c,emissiveIntensity:i});
 const at=(o,x,z,ud)=>{o.position.x=x;o.position.z=z;return add(o,ud)};
 const ring=(th0,th1,n,r0,r1,fn)=>{for(let i=0;i<n;i++){const th=rnd(th0,th1),r=rnd(r0,r1);fn(Math.sin(th)*r,Math.cos(th)*r,th)}};
 const cloud=(x,y,z,s=1)=>{const w=M(0xffffff,{roughness:1}),c=grp(mesh(S_(1),w),mesh(S_(.75),w,1,-.15,0),mesh(S_(.7),w,-1,-.2,.1),mesh(S_(.6),w,.4,.45,0));c.traverse(o=>o.castShadow=false);c.position.set(x,y,z);c.scale.set(s*1.3,s*.8,s);return add(c,{drift:rnd(.15,.35),x0:x})};
 const tree=(x,z,s=1,leaf=0x7cc68a)=>{const L=d=>M(new THREE.Color(leaf).offsetHSL(0,0,d).getHex());const T=at(grp(mesh(C(.18,.28,1.6,10),M(0xa77b5b),0,.8,0),mesh(S_(1),L(0),0,2.2,0),mesh(S_(.75),L(.05),.55,1.9,.3),mesh(S_(.7),L(-.04),-.5,2,-.2)),x,z,{sway:rnd(0,6)});T.scale.setScalar(s);return T};
 const bush=(x,z,c=0x8fd19e)=>{const b=grp(mesh(S_(.5),M(c),0,.35,0),mesh(S_(.4),M(c),.4,.28,.1),mesh(S_(.38),M(c),-.38,.26,0));if(Math.random()<.6)for(let i=0;i<3;i++)b.add(mesh(S_(.08),M(pick([0xff9ec4,0xfff1a8,0xffffff])),rnd(-.5,.5),rnd(.45,.75),rnd(.2,.45)));return at(b,x,z)};
 const flower=(x,z)=>{const c=pick([0xff9ec4,0xffd36e,0xffffff,0xb9a3ff,0x9fe3ff]),f=grp(mesh(C(.025,.025,.45,6),M(0x5fae6b),0,.22,0),mesh(S_(.06),M(0xffc94d),0,.48,0));for(let i=0;i<5;i++){const a=i/5*6.28;f.add(mesh(S_(.08),M(c),Math.cos(a)*.09,.47,Math.sin(a)*.09))}return at(f,x,z,{sway:rnd(0,6)})};
 const butterfly=(x,y,z,c)=>{const b=new THREE.Group();for(const s of[-1,1]){const w=mesh(new THREE.CircleGeometry(.16,12),M(c,{side:THREE.DoubleSide}),s*.13,0,0);w.rotation.x=-Math.PI/2;w.userData.wingB=s;b.add(w)}b.add(mesh(C(.025,.025,.22,6),M(0x444444)).rotateX(Math.PI/2));b.position.set(x,y,z);return add(b,{fly:rnd(0,6),c0:new THREE.Vector3(x,y,z)})};
 const lights=(th0,th1,y,n,cols)=>{for(let i=0;i<n;i++){const k=i/(n-1),b=mesh(S_(.08),glow(cols[i%cols.length],1.6));b.castShadow=false;wall(b,th0+(th1-th0)*k,y-Math.sin(k*Math.PI)*.5,6.65);b.userData.tw=i}};
 const flags=(th0,th1,y,n,cols)=>{for(let i=0;i<n;i++){const k=i/(n-1),b=mesh(K(.18,.34,3),M(cols[i%cols.length]));b.rotation.x=Math.PI;wall(b,th0+(th1-th0)*k,y-Math.sin(k*Math.PI)*.45,6.6);b.rotation.z=Math.PI}};
 const rock=(x,z,s=.4,c=0xc9c2bc)=>{const r=mesh(new THREE.DodecahedronGeometry(s,1),M(c,{roughness:1}),x,s*.4,z);r.scale.y=.6;r.rotation.y=rnd(0,6);return add(r)};
 if(id==='room'){
  const arc=(r,hh,y,c)=>add(mesh(new THREE.CylinderGeometry(r,r,hh,48,1,true,Math.PI*.6,Math.PI*.8),M(c,{side:THREE.DoubleSide}),0,y,0));
  arc(6.95,1.4,.9,0xfbe3d6);arc(6.92,.12,1.62,0xffffff);arc(6.9,.25,.12,0xffffff);
  for(let i=0;i<Math.round(36*Q);i++){const d=mesh(new THREE.CircleGeometry(.07,10),M(0xffe7ef));d.castShadow=false;wall(d,rnd(Math.PI*.62,Math.PI*1.38),rnd(2,5.8),6.97)}
  // window
  const wf=M(0xffffff),wn=grp(mesh(B(2.2,1.8,.06),M(0xbfe9ff,{emissive:0x9fd8ff,emissiveIntensity:.5})),mesh(B(2.4,.14,.16),wf,0,.97,0),mesh(B(2.6,.16,.35),wf,0,-.97,.1),mesh(B(.14,1.9,.16),wf,-1.13,0,0),mesh(B(.14,1.9,.16),wf,1.13,0,0),mesh(B(2.2,.07,.1),wf,0,0,.02),mesh(B(.07,1.8,.1),wf,0,0,.02),mesh(S_(.22),glow(0xfff1a8,.8),.5,.45,-.02),mesh(C(.16,.12,.25,12),M(0xff9e7a),.7,-.75,.15),mesh(S_(.17),M(0x7cc68a),.7,-.52,.15),mesh(C(.04,.04,3.4,8),M(0xd9b38c),0,1.2,.2).rotateZ(Math.PI/2));
  for(const s of[-1,1])wn.add(mesh(B(.55,2.3,.12),M(0xa9d8c9),s*1.45,-.1,.15));wall(wn,Math.PI*1.17,3.3,6.75);
  // bookshelf on wall
  const sh=grp(mesh(B(2.2,.1,.4),M(0xf5e1c8)),mesh(B(2.2,.1,.4),M(0xf5e1c8),0,.9,0));
  for(let r=0;r<2;r++){let x=-.95;while(x<(r?.2:.9)){const w=rnd(.1,.18),hh=rnd(.45,.7),b=mesh(B(w,hh,.3),M(pick([0xff9ec4,0x9fe3ff,0xffd36e,0xb9a3ff,0x8fd19e,0xffffff])),x+w/2,r*.9+.05+hh/2,0);sh.add(b);x+=w+.02}}
  sh.add(mesh(S_(.22),M(0xffc94d),.55,1.17,0),mesh(S_(.12),M(0xffc94d),.42,1.42,0),mesh(S_(.12),M(0xffc94d),.68,1.42,0));wall(sh,Math.PI*.83,3,6.6);
  // pictures + clock
  const fr=(w,hh,c,c2)=>grp(mesh(B(w+.16,hh+.16,.06),M(0xffffff)),mesh(B(w,hh,.03),M(c),0,0,.03),mesh(S_(w*.2),M(c2),-w*.12,-hh*.05,.05));
  wall(fr(.8,1,0xbfe9ff,0xffd36e),Math.PI*.97,3.9,6.85);wall(fr(.6,.6,0xffd9e6,0xff9ec4),Math.PI*1.04,3.2,6.85);wall(fr(.6,.75,0xd8f3d8,0x7cc68a),Math.PI*.92,3.1,6.85);
  const ck=grp(mesh(C(.42,.42,.08,32),M(0xff9ec4)).rotateX(Math.PI/2),mesh(C(.35,.35,.1,32),M(0xffffff)).rotateX(Math.PI/2));const hand=mesh(B(.04,.28,.02),M(0x555555),0,0,.08);hand.geometry.translate(0,.12,0);hand.userData.clock=1;ck.add(hand,mesh(B(.04,.2,.02),M(0x555555),0,.08,.07));wall(ck,Math.PI*1.31,4.4,6.85);
  flags(Math.PI*.68,Math.PI*1.32,5.6,13,[0xff9ec4,0xffd36e,0x9fe3ff,0xb9a3ff,0x8fd19e]);lights(Math.PI*.64,Math.PI*1.36,4.9,MOB?12:18,[0xfff1a8,0xffc4dd,0xbfe9ff]);
  // floor: striped rug, cushions, toy box, blocks, ball, plant, bookcase, lamp
  for(let i=0;i<4;i++){const r=mesh(new THREE.RingGeometry(1.7-i*.42,1.9-i*.42,48),M([0xfff1f6,0xa9d8c9,0xffd36e,0xffffff][i]),0,.045,.5);r.rotation.x=-Math.PI/2;r.receiveShadow=true;r.castShadow=false;add(r)}
  for(const [x,z,c] of[[-5.3,2.8,0xb9a3ff],[-4.6,3.6,0xffd36e],[5.4,2.6,0x9fe3ff]]){const c1=mesh(S_(.55),M(c),x,.25,z);c1.scale.y=.45;add(c1)}
  const tb=grp(mesh(B(1.2,.7,.8),M(0xffb88a),0,.35,0),mesh(B(1.26,.12,.86),M(0xff9ec4),0,.74,0),mesh(S_(.18),M(0xffd36e),.2,.86,0),mesh(K(.15,.3,4),M(0x9fe3ff),-.25,.9,.1));at(tb,-5.6,-1.2).rotation.y=1.2;
  [[0xff9ec4,-4.6,-.1],[0x9fe3ff,-4.2,.1],[0xffd36e,-4.4,.0,.36]].forEach(([c,x,z,y=0])=>{const b=mesh(B(.32,.32,.32),M(c),x,.16+y,z);b.rotation.y=rnd(0,1);add(b)});
  const ball=grp(mesh(S_(.3),M(0xffffff)),mesh(new THREE.TorusGeometry(.3,.05,8,24),M(0xff9ec4)),mesh(new THREE.TorusGeometry(.3,.05,8,24),M(0x9fe3ff)).rotateY(Math.PI/2));ball.position.y=.3;at(ball,3.2,3.4);
  const bc=grp(mesh(B(1.4,2.6,.6),M(0xf5e1c8),0,1.3,0));for(let r=0;r<3;r++){bc.add(mesh(B(1.25,.06,.5),M(0xe8cfae),0,.5+r*.75,.05));for(let k=0;k<5;k++)bc.add(mesh(B(.16,.5,.4),M(pick([0xff9ec4,0x9fe3ff,0xffd36e,0xb9a3ff,0x8fd19e])),-.45+k*.2,.8+r*.75,.06))}wall(bc,Math.PI*.66,0,6.3);
  const pl=grp(mesh(C(.35,.28,.6,16),M(0xffffff),0,.3,0));for(let k=0;k<7;k++){const l=mesh(S_(.32),M(0x7cc68a),Math.sin(k*.9)*.3,.9+k*.13,Math.cos(k*.9)*.3);l.scale.set(.6,1.2,.6);pl.add(l)}wall(pl,Math.PI*1.38,0,6.2);
  const fl=grp(mesh(C(.28,.32,.08,16),M(0xd9b38c),0,.04,0),mesh(C(.04,.04,2.2,8),M(0xd9b38c),0,1.1,0),mesh(C(.3,.5,.55,20,1,true),M(0xfff6ec,{emissive:0xffe7b0,emissiveIntensity:.7,side:THREE.DoubleSide}),0,2.3,0));if(!MOB){const pt=new THREE.PointLight(0xffd9a0,5,7);pt.position.y=2.1;fl.add(pt)}wall(fl,Math.PI*1.27,0,6.1);
  const mob=grp(mesh(C(.01,.01,1,4),M(0xffffff),0,.5,0));[0xffd36e,0xff9ec4,0x9fe3ff].forEach((c,i)=>{const a=i*2.09,s=mesh(new THREE.OctahedronGeometry(.18),glow(c,.4),Math.cos(a)*.5,0,Math.sin(a)*.5);s.castShadow=false;mob.add(s)});mob.position.set(2.5,5.2,-3);add(mob,{spin:.4});
 }
 if(id==='garden'){
  for(let i=0;i<5;i++)cloud(rnd(-20,20),rnd(8,13),rnd(-30,-18),rnd(.8,1.6));
  const N=MOB?14:22;for(let i=0;i<N;i++){const th=Math.PI*.55+i/(N-1)*Math.PI*.9,p=grp(mesh(B(.22,1,.08),M(0xffffff),0,.5,0),mesh(K(.16,.2,4),M(0xffffff),0,1.1,0).rotateY(Math.PI/4));wall(p,th,0,6.6);if(i)wall(mesh(B(.9,.08,.06),M(0xffffff)),th-Math.PI*.45/(N-1),.75,6.6)}
  [[-9,-9,1.5],[9,-10,1.7],[-12,-3,1.3],[12,-4,1.4],[0,-13,1.8],[-5,-12,1.2],[6,-14,1.3]].forEach(([x,z,s],i)=>tree(x,z,s,[0x7cc68a,0x95d5a0,0xf7b7cf][i%3]));
  ring(Math.PI*.6,Math.PI*1.4,MOB?6:9,5.6,6.3,(x,z)=>bush(x,z,pick([0x8fd19e,0x7cc68a,0xa6dcae])));
  ring(0,6.28,MOB?14:24,5,6.6,(x,z)=>flower(x,z));
  for(let i=0;i<5;i++){const s=mesh(C(.35,.38,.06,12),M(0xd8d2c8),-1.2+i*.6+Math.sin(i)*.3,.03,1.5+i*.9);add(s)}
  const pond=grp(mesh(C(1.3,1.3,.05,32),M(0x8fd3f0,{roughness:.05,metalness:.2}),0,.04,0));for(let i=0;i<8;i++)pond.add(rock(0,0,.22).translateX(Math.cos(i*.8)*1.4).translateZ(Math.sin(i*.8)*1.4));at(pond,4.2,2.6);g.add(mesh(C(.3,.3,.02,16),M(0x7cc68a),4,.08,2.4));
  const bh=grp(mesh(C(.05,.05,2.2,8),M(0xa77b5b),0,1.1,0),mesh(B(.5,.5,.5),M(0xffd36e),0,2.4,0),mesh(K(.48,.4,4),M(0xff9ec4),0,2.85,0).rotateY(Math.PI/4),mesh(C(.09,.09,.02,12),M(0x553322),0,2.45,.26).rotateX(Math.PI/2));at(bh,-4.8,-3.4);
  const mush=(x,z)=>at(grp(mesh(C(.06,.08,.25,8),M(0xfff6ec),0,.12,0),mesh(new THREE.SphereGeometry(.2,16,8,0,6.28,0,1.6),M(0xff8c8c),0,.24,0)),x,z);mush(-3.6,3.9);mush(-3.3,4.1);mush(5.3,-1.5);
  for(let i=0;i<(MOB?3:5);i++)butterfly(rnd(-4,4),rnd(1.5,3),rnd(-3,3),pick([0xffb3d1,0xffe08a,0xb9d9ff,0xd5b8ff]));
 }
 if(id==='tree'){
  for(let i=-6;i<=6;i++){const p=mesh(B(.9,.02,13),M(i%2?0xc49a74:0xb98a68),i*1.0,.01,0);p.receiveShadow=true;p.castShadow=false;add(p)}
  ring(0,6.28,MOB?7:12,10,15,(x,z)=>{if(z>2)return;const c=mesh(S_(rnd(1.8,3)),M(pick([0x7cc68a,0x95d5a0,0x6bb87c])),x,rnd(4,9),z);c.castShadow=false;add(c)});
  for(let i=0;i<6;i++){const th=Math.PI*.6+i*Math.PI*.16,l=grp(mesh(C(.01,.01,.8,4),M(0x8d6e63),0,.4,0),mesh(S_(.22),glow(pick([0xffd36e,0xff9ec4,0x9fe3ff]),.9),0,0,0));l.children[1].scale.y=1.3;l.children[1].castShadow=false;wall(l,th,4.6+Math.sin(i)*.4,6.4);l.userData.sway=i}
  const lad=grp();for(const s of[-1,1])lad.add(mesh(C(.04,.04,4,6),M(0xd9b38c),s*.35,2,0));for(let k=0;k<7;k++)lad.add(mesh(C(.04,.04,.75,6),M(0xa77b5b),0,.4+k*.55,0).rotateZ(Math.PI/2));wall(lad,Math.PI*1.3,0,6.5);
  const tbl=grp(mesh(C(.8,.8,.12,24),M(0xd9b38c),0,.75,0),mesh(C(.15,.25,.75,12),M(0xa77b5b),0,.37,0),mesh(C(.15,.12,.2,12),M(0xffffff),.3,.9,0),mesh(S_(.18),M(0xff8c8c),-.2,.95,.2));at(tbl,-4.8,2.6);
  for(const [x,z] of[[-5.8,1.6],[-4,3.6]])add(mesh(C(.3,.3,.45,12),M(0xa77b5b),x,.22,z));
  const win=grp(mesh(C(1,1,.1,32),M(0xcdeec0,{emissive:0xcdeec0,emissiveIntensity:.4})).rotateX(Math.PI/2),mesh(new THREE.TorusGeometry(1,.12,10,32),M(0xa77b5b)));wall(win,Math.PI*.85,3.6,6.7);
  for(let i=0;i<3;i++){const b=grp(mesh(S_(.18),M(pick([0x9fe3ff,0xffd36e,0xff9ec4])),0,0,0),mesh(K(.06,.14,6),M(0xffb347),0,0,.2).rotateX(Math.PI/2));b.position.set(-2+i*2,5.5,-6);add(b,{fly:i*2,c0:b.position.clone()})}
  ring(0,6.28,MOB?6:10,5.4,6.4,(x,z)=>{const f=grp();for(let k=0;k<5;k++){const l=mesh(S_(.25),M(0x7cc68a),0,.3,0);l.scale.set(.3,1.3,.6);l.rotation.set(.5,k*1.25,0);f.add(l)}at(f,x,z,{sway:x})});
 }
 if(id==='beach'){
  for(let i=0;i<4;i++)cloud(rnd(-20,20),rnd(8,12),rnd(-32,-22),rnd(1,1.6));
  const palm=(x,z,s)=>{const p=new THREE.Group();for(let k=0;k<6;k++)p.add(mesh(C(.16-k*.01,.18-k*.01,.7,8),M(k%2?0xc9a27a:0xb88d63),Math.sin(k*.3)*.15*k,.35+k*.65,0));for(let i=0;i<6;i++){const l=mesh(S_(.5),M(0x6bb87c),0,4.1,0);l.geometry=l.geometry.clone().translate(.45,0,0);l.scale.set(2.2,.12,.6);l.rotation.set(0,i*1.05,-.35);p.add(l)}p.scale.setScalar(s);return at(p,x,z,{sway:x})};
  palm(-5.6,-2.8,1);palm(6,-.5,.85);palm(-8,-6,1.2);
  const um=grp(mesh(C(.04,.04,2.6,8),M(0xffffff),0,1.3,0));for(let i=0;i<8;i++)um.add(mesh(new THREE.ConeGeometry(1.4,.6,8,1,true,i*Math.PI/4,Math.PI/4),M(i%2?0xffffff:0xff9ec4,{side:THREE.DoubleSide}),0,2.6,0));at(um,-3.6,-3.8);
  const tw=mesh(B(1,.03,1.9),M(0x9fe3ff),-2.6,.03,-2.8);tw.rotation.y=.3;add(tw);
  const bb=grp(mesh(S_(.35),M(0xffffff)));for(let i=0;i<3;i++)bb.add(mesh(new THREE.SphereGeometry(.355,16,12,i*2.09,1,0,Math.PI),M([0xff9ec4,0xffd36e,0x9fe3ff][i])));bb.position.y=.35;at(bb,3,3);
  ring(0,6.28,MOB?8:14,4.5,6.5,(x,z)=>{const s=mesh(new THREE.SphereGeometry(.12,10,6,0,6.28,0,1.5),M(pick([0xffd9e6,0xfff6ec,0xffa07a])),x,.02,z);s.scale.set(1,.5,1.3);add(s)});
  for(let i=0;i<5;i++)rock(rnd(-6,6),rnd(-6.6,-5.8),rnd(.3,.6),0xd8cfc4);
  const boat=grp(mesh(B(1.6,.4,.6),M(0xffffff)),mesh(C(.03,.03,1.8,6),M(0xa77b5b),0,1,0),mesh(K(.6,1.4,3),M(0xff9ec4),.35,1.1,0));boat.position.set(-6,.1,-14);add(boat,{bob:1});
  const crab=grp(mesh(S_(.22),M(0xff8c8c)),mesh(S_(.05),M(0x222222),-.08,.18,.15),mesh(S_(.05),M(0x222222),.08,.18,.15));crab.children[0].scale.y=.6;crab.position.y=.12;at(crab,4.5,1.5,{crab:1});
 }
 if(id==='castle'){
  for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++){if(Math.hypot(i,j)>3.4||(i+j)%2)continue;const t=mesh(B(1.9,.02,1.9),M(0xc9c1dd),i*2,.005,j*2);t.castShadow=false;add(t)}
  add(mesh(B(2.2,.04,9),M(0xd96b8a),0,.03,-1.5));
  const gd=M(0xffd36e,{metalness:.5,roughness:.35}),th=grp(mesh(B(1.6,.6,1.3),gd,0,.6,0),mesh(B(1.6,2.4,.25),gd,0,1.8,-.55),mesh(B(1.3,.2,1.1),M(0xb57bff),0,.95,.05),mesh(B(1.2,1.8,.1),M(0xb57bff),0,1.9,-.4),mesh(S_(.2),glow(0x9fe3ff,.8),0,3.1,-.55));wall(th,Math.PI,0,5.8);
  for(const k of[-1,1])for(const t of[.2,.37])wall(grp(mesh(C(.35,.4,5.5,16),M(0xe8e2f2),0,2.75,0),mesh(B(.9,.3,.9),M(0xd8d2e6),0,.15,0),mesh(B(.9,.3,.9),M(0xd8d2e6),0,5.5,0)),Math.PI+k*Math.PI*t,0,6.4);
  for(const k of[-1,1]){const fl=mesh(K(.15,.4,8),glow(0xffb347,1.5),0,.45,0);fl.userData.flame=1;fl.castShadow=false;wall(grp(mesh(C(.08,.12,.6,8),M(0x6d5a8a)),fl),Math.PI+k*Math.PI*.28,3.2,6.6);
   wall(grp(mesh(C(.55,.55,.1,6),M(0x9fe3ff,{metalness:.4})).rotateX(Math.PI/2),mesh(B(.15,.8,.12),gd,0,0,.06),mesh(B(.8,.15,.12),gd,0,.1,.06)),Math.PI+k*Math.PI*.1,4.3,6.85)}
  const sg=grp(mesh(B(1.2,2.2,.06),M(0xffffff,{emissive:0xb9a3ff,emissiveIntensity:.5})));[[0xff9ec4,-.3,.4],[0x9fe3ff,.3,.4],[0xffd36e,0,-.3],[0x8fd19e,0,-.85]].forEach(([c,x,y])=>sg.add(mesh(B(.45,.45,.08),glow(c,.6),x,y,.02)));for(const k of[-1,1])wall(sg.clone(),Math.PI+k*Math.PI*.36,3.4,6.9);
  const ch=grp(mesh(new THREE.TorusGeometry(1,.06,8,32),gd).rotateX(Math.PI/2));for(let i=0;i<6;i++){const a=i*1.047,f=mesh(K(.09,.25,8),glow(0xffd36e,1.4),Math.cos(a),.18,Math.sin(a));f.userData.flame=1;f.castShadow=false;ch.add(f)}ch.position.set(0,6.5,-1);add(ch);
 }
 if(id==='space'){
  for(let i=1;i<8;i+=2){const p=mesh(new THREE.RingGeometry(1.4+i*.7,1.43+i*.7,64),glow(0x22e5ff,.3),0,.02,0);p.rotation.x=-Math.PI/2;p.castShadow=false;add(p)}
  const con=grp(mesh(B(2.2,1,.8),M(0x5d5ba0),0,.5,0),mesh(B(2.2,.15,1.1),M(0x7a78c0),0,1.05,.1));for(let i=0;i<6;i++){const b=mesh(B(.22,.06,.22),glow(pick([0xff9ec4,0x22e5ff,0xffd36e,0x8fd19e]),1.2),-.75+i*.3,1.15,.2);b.userData.tw=i;con.add(b)}const scr=mesh(B(1.6,.9,.05),M(0x111133,{emissive:0x22e5ff,emissiveIntensity:.5}),0,1.8,-.3);scr.userData.tv=1;con.add(scr);wall(con,Math.PI*1.2,0,6.2);
  const ph=grp(mesh(C(1.3,1.3,.06,32),M(0x0a0a25,{emissive:0x2a2060,emissiveIntensity:.6})).rotateX(Math.PI/2),mesh(new THREE.TorusGeometry(1.3,.15,10,40),M(0xbfc3e8,{metalness:.6,roughness:.3})));for(let i=0;i<6;i++)ph.add(mesh(S_(.04),glow(0xffffff,2),rnd(-.9,.9),rnd(-.9,.9),.05));wall(ph,Math.PI,3.4,6.8);
  const rk=grp(mesh(C(.35,.4,1.6,16),M(0xffffff),0,1.2,0),mesh(K(.35,.7,16),M(0xff9ec4),0,2.35,0),mesh(S_(.15),glow(0x9fe3ff,.5),0,1.5,.33));for(let i=0;i<3;i++){const f=mesh(B(.06,.6,.5),M(0xff9ec4),Math.cos(i*2.09)*.4,.6,Math.sin(i*2.09)*.4);f.rotation.y=-i*2.09;rk.add(f)}wall(rk,Math.PI*.8,0,6);
  const dome=grp(mesh(C(.6,.7,.3,20),M(0x7a78c0),0,.15,0),mesh(new THREE.SphereGeometry(.6,20,12,0,6.28,0,1.6),M(0xbfe9ff,{transparent:true,opacity:.35,roughness:.05}),0,.3,0),mesh(S_(.25),M(0x8fd19e),0,.5,0));at(dome,5.3,-2.2);at(dome.clone(),-5.6,2);
  for(let i=0;i<(MOB?4:7);i++){const a=mesh(new THREE.DodecahedronGeometry(rnd(.3,.8),0),M(pick([0x8a86c0,0xb9a3ff,0x6f6ba8]),{roughness:1}),rnd(-10,10),rnd(4,9),rnd(-14,-7));a.castShadow=false;add(a,{spin:rnd(.2,.6),bob:1})}
  const moon=mesh(S_(1.6),M(0xfff6ec,{emissive:0xfff1c8,emissiveIntensity:.3}),12,11,-24);moon.castShadow=false;add(moon);
  for(let i=0;i<(MOB?5:9);i++){const s=mesh(new THREE.OctahedronGeometry(.12),glow(0xffffff,2),rnd(-8,8),rnd(3,7),rnd(-8,-4));s.castShadow=false;s.userData.tw=i;add(s)}
 }
}
const SPOTS=[[-4,-2.5],[4,-2.5],[-4.8,1.2],[4.8,1.2],[-2.2,-4],[2.2,-4]];
function buildFurn(id,i){const g=new THREE.Group(),[x,z]=SPOTS[i%6];g.position.set(x,0,z);g.lookAt(0,0,0);
 if(id==='plant'){g.add(mesh(C(.4,.3,.6),M(0xd84315),0,.3,0));for(let k=0;k<5;k++)g.add(mesh(S_(.35),M(0x43a047),Math.sin(k)*.25,1+k*.12,Math.cos(k)*.25))}
 if(id==='lamp'){g.add(mesh(C(.3,.35,.1),M(0x333333),0,.05,0),mesh(C(.04,.04,1.8),M(0x333333),0,.9,0),mesh(K(.45,.5,24),M(0x22f0ff,{emissive:0x22f0ff,emissiveIntensity:.8}),0,1.9,0));const l=new THREE.PointLight(0x22f0ff,6,6);l.position.y=1.7;g.add(l)}
 if(id==='bed'){g.add(mesh(B(2.4,.5,1.4),M(0x6d4c41),0,.25,0),mesh(B(2.3,.3,1.3),M(0x22e5ff),0,.6,0),mesh(B(.6,.25,1),M(0xffffff),-.8,.85,0),mesh(B(.15,1.2,1.4),M(0x6d4c41),-1.2,.6,0))}
 if(id==='tv'){g.add(mesh(B(1.4,.6,.6),M(0x5d4037),0,.3,0),mesh(B(1.8,1.1,.1),M(0x111111),0,1.2,0));const sc=mesh(B(1.65,.95,.02),M(0x2222ff,{emissive:0x22e5ff,emissiveIntensity:.7}),0,1.2,.06);sc.userData.tv=1;g.add(sc)}
 if(id==='tent'){const t=mesh(K(1.3,1.8,4),M(0xff3fb4),0,.9,0);t.rotation.y=Math.PI/4;g.add(t,mesh(K(.08,.5),M(0xffd23f),0,2,0))}
 if(id==='fountain'){g.add(mesh(C(1.1,1.2,.4,32),M(0xbdbdbd),0,.2,0),mesh(C(1,1,.05,32),M(0x29b6f6,{roughness:.1}),0,.38,0),mesh(C(.15,.2,1,12),M(0xbdbdbd),0,.8,0),mesh(C(.5,.4,.15,24),M(0xbdbdbd),0,1.3,0));g.userData.fountain=1}
 return outline(g,.03)}
// ---------- effects ----------
const ICON={pat:0xff3fb4,step:0x22f0ff};
function sprite(txt,size=64){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.font=size*1.5+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,64,70);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));return s}
function spawn(kind,pos,txt){if(kind==='step'){const r=mesh(new THREE.RingGeometry(.2,.32,24),new THREE.MeshBasicMaterial({color:0x22f0ff,transparent:true}));r.rotation.x=-Math.PI/2;r.position.copy(pos).setY(.05);scene.add(r);fx.push({o:r,t:0,life:.8,ring:1});return}
 const s=sprite(txt);s.position.copy(pos);s.scale.setScalar(.6);scene.add(s);fx.push({o:s,t:0,life:1.4,v:new THREE.Vector3((Math.random()-.5)*1.2,1.4+Math.random(),(Math.random()-.5)*.6)})}
function burst(txt,n=6,y=2.6){for(let i=0;i<n;i++)setTimeout(()=>petG&&spawn('fx',petG.position.clone().add(new THREE.Vector3(0,y,0)),txt),i*90)}
let AC,ST={},grow=1,need=null,needT=0;
function tone(f1,f2,dur,type='sine',vol=.15,delay=0){if(ST.mute)return;AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+dur)}
const SND={pat:()=>{tone(700,1300,.12);tone(900,1600,.12,'sine',.12,.13)},tickle:()=>[0,1,2,3].forEach(i=>tone(900+i*120,1400,.08,'triangle',.1,i*.09)),eat:()=>[0,1,2].forEach(i=>tone(220,120,.09,'square',.06,i*.2)),wash:()=>[0,1,2,3,4].forEach(i=>tone(500+Math.random()*600,1500,.06,'sine',.08,i*.12)),play:()=>[0,1,2].forEach(i=>tone(520+i*200,780+i*200,.12,'triangle',.12,i*.12)),nap:()=>[0,1.1].forEach(d=>tone(90,60,.8,'sawtooth',.05,d)),happy:()=>tone(600,1200,.25),dance:()=>[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,f*1.01,.18,'triangle',.1,i*.22))};
// actions called by the app (or by tapping the pet)
const ACT={pat:{t:.8,fx:'💖'},tickle:{t:1,fx:'😆'},eat:{t:1.4,fx:'😋'},wash:{t:1.6,fx:'🫧'},play:{t:2.2,fx:'⭐'},nap:{t:2.6,fx:'💤'},happy:{t:1,fx:'✨'},dance:{t:3,fx:'🎵'}};
function act(kind,emoji){const a=ACT[kind]||ACT.happy;(SND[kind]||SND.happy)();anim={kind,t:0,dur:a.t};
 if(kind==='pat'||kind==='tickle'){burst(a.fx,kind==='pat'?4:5);if(kind==='pat'&&window.pat)window.pat(true);if(kind==='tickle'&&window.tickle)window.tickle()}
 else{burst(emoji||a.fx,7);if(kind==='play'&&emoji){const b=sprite(emoji);b.scale.setScalar(.9);scene.add(b);fx.push({o:b,t:0,life:2.2,toss:1,from:petG.position.clone()})}
  if(kind==='eat'&&emoji){const f=sprite(emoji);f.scale.setScalar(.7);scene.add(f);fx.push({o:f,t:0,life:.9,feed:1})}}}
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
 if(petG&&cv.isConnected){
  const p=petG.position,d=target.clone().sub(p);d.y=0;const walking=d.length()>.15&&!(anim&&anim.kind==='nap');
  if(walking){p.addScaledVector(d.normalize(),dt*2.4);const ang=Math.atan2(d.x,d.z);petG.rotation.y+=((ang-petG.rotation.y+Math.PI*3)%(Math.PI*2)-Math.PI)*.15}
  else{const ang=Math.atan2(cam.position.x-p.x,cam.position.z-p.z);petG.rotation.y+=((ang-petG.rotation.y+Math.PI*3)%(Math.PI*2)-Math.PI)*.04}
  let y=walking?Math.abs(Math.sin(t*10))*.25:Math.sin(t*2)*.04,sx=1,sy=1,rz=0,rx=0;
  if(anim){anim.t+=dt;const k=anim.t/anim.dur,s=Math.sin(k*Math.PI);
   if(anim.kind==='pat'){sy=1-.12*s;sx=1+.08*s}
   if(anim.kind==='tickle'){rz=Math.sin(anim.t*30)*.15*s;y+=s*.3}
   if(anim.kind==='eat'){head.rotation.x=Math.sin(anim.t*18)*.2}
   if(anim.kind==='wash'){petG.rotation.y+=dt*8*s;if(Math.random()<.4)spawn('fx',p.clone().add(new THREE.Vector3((Math.random()-.5)*1.5,Math.random()*2.5,(Math.random()-.5)*1.5)),'🫧')}
   if(anim.kind==='play'||anim.kind==='happy'){y+=Math.abs(Math.sin(k*Math.PI*3))*1.1;petG.rotation.y+=anim.kind==='play'?dt*5:0}
   if(anim.kind==='dance'){y+=Math.abs(Math.sin(anim.t*8))*.5;rz=Math.sin(anim.t*6)*.25;petG.rotation.y+=dt*3}
   if(anim.kind==='nap'){rx=-s*1.2;y-=s*.3}
   if(k>=1){anim=null;head.rotation.x=0}}
  petG.scale.set(sx*grow,sy*grow,sx*grow);blob.position.x=p.x;blob.position.z=p.z;blob.scale.setScalar(grow*(1-Math.min(p.y,1)*.35));p.y=y;petG.rotation.z=rz;petG.rotation.x=rx*.6;
  petG.traverse(o=>{if(o.userData.arm!==undefined){const s=o.userData.arm;o.position.set(s*.8,1.1,.3);o.rotation.z=0;
    if(!anim&&!walking&&need){if(need==='h'){o.position.set(s*.35,.95+Math.sin(t*6+s)*.12,.8)}else if(s>0){o.position.set(1,1.9,.3);o.rotation.z=Math.sin(t*8)*.6}}}});
  if(need&&!anim&&(needT-=dt)<0){needT=2.5;spawn('fx',p.clone().add(new THREE.Vector3(0,3.3*grow,0)),{h:'🍎',c:'🫧',en:'💤',j:'⚽'}[need])}
  if(t>blinkAt){blinkT=.14;blinkAt=t+2+Math.random()*3.5}blinkT-=dt;const blink=blinkT>0||(anim&&anim.kind==='nap')?.1:1;eyes.forEach(e=>e.scale.y=blink);
  if(mouth){const{sm,om}=mouth.userData,open=anim&&anim.kind!=='nap'&&anim.kind!=='eat'||(anim&&anim.kind==='eat'&&Math.sin(anim.t*18)>0);om.visible=!!open;sm.visible=!open;sm.rotation.z=need&&!anim?0:Math.PI;sm.position.y=need&&!anim?-.1:0}
  if(!anim||anim.kind!=='eat'){const lp=head.parent.worldToLocal(look.clone());head.rotation.y=THREE.MathUtils.clamp(Math.atan2(lp.x,lp.z),-.6,.6)*.6;head.rotation.x=THREE.MathUtils.clamp(-(lp.y-2.1)*.08,-.3,.3)}
  petG.traverse(o=>{if(o.userData.wing)o.rotation.z=-o.userData.wing*(.6+Math.sin(t*(walking?14:3))*.3);if(o.userData.tail)o.rotation.z=Math.sin(t*(walking||(anim&&anim.kind!=='nap')?14:need?1.5:5))*(need&&!anim?.15:.5);if(o.userData.ear){const s=o.userData.ear,pt=anim&&(anim.kind==='pat'||anim.kind==='happy'||anim.kind==='play')?Math.sin(anim.t*16)*.35:0;o.rotation.z=s*(.12+Math.sin(t*3+s)*.06+(walking?Math.sin(t*10)*.15:0))+pt}})}
 scene&&scene.traverse(o=>{if(o.userData.tv)o.material.emissive.setHSL((t*.1)%1,.8,.4);if(o.userData.sea)o.position.y=-.2+Math.sin(t)*.06;const u=o.userData;if(u.sway!==undefined)o.rotation.z=Math.sin(t*1.3+u.sway)*.04;if(u.drift)o.position.x=u.x0+Math.sin(t*u.drift*.2)*4;if(u.spin)o.rotation.y+=dt*u.spin;if(u.bob)o.position.y+=Math.sin(t*1.5+o.position.x)*.003;if(u.tw!==undefined)o.material.emissiveIntensity=1+Math.sin(t*3+u.tw*1.7)*.7;if(u.flame){o.scale.y=1+Math.sin(t*14+o.id)*.15;o.material.emissiveIntensity=1.3+Math.sin(t*9+o.id)*.4}if(u.clock)o.rotation.z=-t*.5;if(u.fly!==undefined){o.position.set(u.c0.x+Math.sin(t*.6+u.fly)*1.5,u.c0.y+Math.sin(t*1.7+u.fly)*.3,u.c0.z+Math.cos(t*.5+u.fly)*1.5);o.rotation.y=t*.6+u.fly}if(u.wingB)o.rotation.z=u.wingB*Math.sin(t*18)*.8;if(u.crab)o.position.x=4.5+Math.sin(t*.7)*1.2});
 for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t+=dt;const k=f.t/f.life;
  if(f.ring){f.o.scale.setScalar(1+k*2);f.o.material.opacity=1-k}
  else if(f.feed){const m=head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,0,.4));f.o.position.lerpVectors(cam.position.clone().lerp(m,.55),m,k);f.o.scale.setScalar(.7*(1-k*.8))}
  else if(f.toss){const a=f.t*2.8;f.o.position.set(f.from.x+Math.sin(a)*2.2,1+Math.abs(Math.sin(a*2))*2,f.from.z+Math.cos(a)*2.2);f.o.material.rotation=a*3}
  else{f.o.position.addScaledVector(f.v,dt);f.o.material.opacity=1-k}
  if(k>=1){scene.remove(f.o);fx.splice(i,1)}}
 ctl&&ctl.update();R&&cv.isConnected&&!document.hidden&&R.render(scene,cam)}
function mount(el,S){ST=S;grow=.7+Math.min(S.days||1,9)*.035;need=S.st.h<35?'h':S.st.c<35?'c':S.st.en<35?'en':S.st.j<35?'j':null;if(!R)init();el.prepend(cv);el.classList.add('live');fit();
 const k=S.pet+'|'+S.home+'|'+S.placed.join(',')+'|'+S.wear;if(k===key)return;const[pp,ph]=key.split('|');key=k;
 if(pp!==S.pet){if(petG)scene.remove(petG);petG=buildPet(S.pet);scene.add(petG);wearG=null;target.set(0,0,0)}
 if(ph!==S.home){if(homeG)scene.remove(homeG);homeG=buildHome(S.home);scene.add(homeG)}
 if(furnG)scene.remove(furnG);furnG=new THREE.Group();S.placed.forEach((id,i)=>furnG.add(buildFurn(id,i)));scene.add(furnG);
 if(wearG)head.remove(wearG);wearG=outline(buildWear(S.wear),.03);head.add(wearG)}
function photo(name){R.render(scene,cam);const a=document.createElement('a');a.download=(name||'my-pet')+'.png';a.href=cv.toDataURL('image/png');a.click()}
window.Pet3D={mount,act,photo,ready:true};
window.dispatchEvent(new Event('pet3d-ready'));
