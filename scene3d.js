// LeonLink Kids Pet - interactive 3D scene (three.js), everything built from shapes.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.55,...o});
const mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;return o};
const S_=r=>new THREE.SphereGeometry(r,28,18),B=(w,h,d)=>new THREE.BoxGeometry(w,h,d),C=(a,b,h,s=24)=>new THREE.CylinderGeometry(a,b,h,s),K=(r,h,s=24)=>new THREE.ConeGeometry(r,h,s);
let R,scene,cam,ctl,cv,petG,head,homeG,furnG,wearG,eyes=[],ray=new THREE.Raycaster(),ptr=new THREE.Vector2(),key='',clock=new THREE.Clock(),fx=[],anim=null,target=new THREE.Vector3(),look=new THREE.Vector3(0,2,6),floor;
const COL={pup:[0xd9a066,0x7a4a24],kit:[0xff9f43,0xffffff],bun:[0xf5f0ff,0xffb6d9],dra:[0x3ddc84,0xffd23f],uni:[0xffffff,0xff3fb4],pen:[0x22263a,0xffffff]};
function init(){
 cv=document.createElement('canvas');cv.className='c3d';
 R=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.outputColorSpace=THREE.SRGBColorSpace;
 scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(45,2,.1,200);cam.position.set(0,3.6,9);
 ctl=new OrbitControls(cam,cv);ctl.target.set(0,1.2,0);ctl.enableDamping=true;ctl.enablePan=false;ctl.minDistance=4.5;ctl.maxDistance=14;ctl.maxPolarAngle=Math.PI*.47;
 scene.add(new THREE.HemisphereLight(0xffffff,0x555577,1.2));
 const sun=new THREE.DirectionalLight(0xffffff,1.8);sun.position.set(5,10,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9});scene.add(sun);
 floor=mesh(new THREE.CircleGeometry(7,48),M(0,{visible:false}));floor.rotation.x=-Math.PI/2;scene.add(floor);
 let down=null;
 cv.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
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
 const body=mesh(S_(.85),m1,0,.95,0);body.scale.set(1,.95,1.05);g.add(body);
 if(id!=='dra'){const b=mesh(S_(.6),id==='pen'?white:m2,0,.9,.45);b.scale.set(1,1.1,.6);g.add(b)}
 head=new THREE.Group();head.position.set(0,2.1,.1);g.add(head);head.add(mesh(S_(.7),m1));
 eyes=[];for(const s of[-1,1]){const w=mesh(S_(.16),white,s*.26,.1,.6),p=mesh(S_(.09),dark,s*.26,.1,.73),sh=mesh(S_(.03),white,s*.23,.14,.81);head.add(w,p,sh);eyes.push(w,p,sh);
  const ck=mesh(S_(.1),pink,s*.42,-.12,.52);ck.scale.set(1,.6,.4);head.add(ck)}
 const feetM=id==='pen'?orange:m1;for(const s of[-1,1]){g.add(mesh(S_(.26),feetM,s*.45,.22,.35));const a=mesh(S_(.22),m1,s*.8,1.1,.3);a.userData.arm=s;a.scale.set(.8,1.2,.8);g.add(a)}
 if(id==='pen'){const bk=mesh(K(.14,.35),orange,0,-.05,.78);bk.rotation.x=Math.PI/2;head.add(bk)}
 else{const sn=mesh(S_(.28),id==='pup'||id==='kit'?m2:m1,0,-.18,.55);sn.scale.set(1.1,.8,.8);head.add(sn);head.add(mesh(S_(.08),id==='bun'||id==='uni'?pink:dark,0,-.08,.79))}
 if(id==='pup')for(const s of[-1,1]){const e=mesh(S_(.3),m2,s*.62,.05,0);e.scale.set(.5,1.2,.8);e.rotation.z=s*.3;head.add(e)}
 if(id==='kit')for(const s of[-1,1]){const e=mesh(K(.22,.45,4),m1,s*.38,.62,0);e.rotation.z=-s*.25;head.add(e)}
 if(id==='bun'){for(const s of[-1,1]){const e=mesh(S_(.18),m1,s*.25,.95,-.05);e.scale.set(.8,3,.6);e.rotation.z=-s*.15;head.add(e);const i=mesh(S_(.1),pink,s*.25,.95,.07);i.scale.set(.7,2.6,.4);i.rotation.z=-s*.15;head.add(i)}g.add(mesh(S_(.22),white,0,.6,-.85))}
 if(id==='uni'){const h=mesh(K(.12,.6),M(0xffd23f,{metalness:.4}),0,.78,.25);h.rotation.x=.3;head.add(h);[0xff3fb4,0x22e5ff,0xb388ff].forEach((c,i)=>head.add(mesh(S_(.2),M(c),0,.55-i*.25,-.5-i*.08)));for(const s of[-1,1])head.add(mesh(K(.12,.3),m1,s*.35,.6,-.05))}
 if(id==='dra'){for(const s of[-1,1]){const h=mesh(K(.09,.4),m2,s*.3,.65,-.05);h.rotation.z=-s*.3;head.add(h);const w=mesh(B(.05,.7,1),M(0x7cf5b4),s*.85,1.4,-.5);w.rotation.set(.3,0,-s*.6);w.userData.wing=s;g.add(w)}
  for(let i=0;i<4;i++)g.add(mesh(K(.12,.3,4),m2,0,1.7-i*.3,-.84));const t=mesh(K(.25,1.2),m1,0,.45,-1);t.rotation.x=-1.9;g.add(t);g.add(mesh(B(.6,.75,.2),M(0xffe9a0),0,.95,.8))}
 if(id==='kit'||id==='pup'||id==='uni'){const t=mesh(C(.08,.12,.9),m1,0,.75,-.9);t.rotation.x=-.9;t.userData.tail=1;g.add(t)}
 return g}
function buildWear(id){const g=new THREE.Group();if(!id)return g;const gold=M(0xffd23f,{metalness:.7,roughness:.25}),blk=M(0x111111),pk=M(0xff3fb4);
 if(id==='crown'){g.add(mesh(C(.42,.4,.25,8),gold,0,.75,0));for(let i=0;i<5;i++){const a=i/5*Math.PI*2;g.add(mesh(K(.08,.25,6),gold,Math.sin(a)*.38,.98,Math.cos(a)*.38));g.add(mesh(S_(.05),M([0xff3fb4,0x22e5ff,0x3ddc84][i%3]),Math.sin(a)*.42,.75,Math.cos(a)*.42))}}
 if(id==='tophat'){g.add(mesh(C(.55,.55,.05),blk,0,.66,0),mesh(C(.33,.35,.6),blk,0,.98,0),mesh(C(.355,.355,.1),pk,0,.75,0))}
 if(id==='party'){g.add(mesh(K(.3,.75),M(0x22e5ff),0,1.02,0),mesh(S_(.09),pk,0,1.42,0))}
 if(id==='cap'){g.add(mesh(new THREE.SphereGeometry(.62,24,12,0,Math.PI*2,0,Math.PI/2),pk,0,.25,0));const b=mesh(C(.45,.45,.04),pk,0,.28,.45);b.scale.z=.7;g.add(b)}
 if(id==='bow'){for(const s of[-1,1]){const l=mesh(K(.2,.35,12),pk,s*.22,.66,.15);l.rotation.z=s*Math.PI/2;g.add(l)}g.add(mesh(S_(.1),M(0xff7fcf),0,.66,.15))}
 if(id==='glasses'){const gm=M(0x111111,{roughness:.1,metalness:.6});for(const s of[-1,1]){const l=mesh(C(.18,.18,.05),gm,s*.27,.12,.8);l.rotation.x=Math.PI/2;g.add(l)}g.add(mesh(B(.2,.04,.04),gm,0,.14,.8))}
 return g}
const HOME3D={room:{sky:0x3a2a4a,fl:0xb07a52,wall:0x7b4f7f},garden:{sky:0x8fd8ff,fl:0x5cbf4a},tree:{sky:0x9be07a,fl:0x8d5a3b},beach:{sky:0x6fd0ff,fl:0xffe28a},castle:{sky:0x3a237a,fl:0x9e9e9e,wall:0x7a7a8c},space:{sky:0x050518,fl:0x2a2a5a,wall:0x1c1c3a}};
function buildHome(id){const h=HOME3D[id]||HOME3D.room,g=new THREE.Group();scene.background=new THREE.Color(h.sky);scene.fog=new THREE.Fog(h.sky,18,40);
 const f=mesh(C(7,7,.3,48),M(h.fl),0,-.15,0);g.add(f);
 if(h.wall){const w=mesh(new THREE.CylinderGeometry(7,7,6,48,1,true,Math.PI*.6,Math.PI*.8),M(h.wall,{side:THREE.DoubleSide}),0,3,0);g.add(w)}
 const rnd=(a,b)=>a+Math.random()*(b-a);
 if(id==='room'){const rug=mesh(C(2.2,2.2,.03,40),M(0xff3fb4),0,.02,.5);g.add(rug);const win=mesh(B(1.8,1.4,.1),M(0x9fe6ff,{emissive:0x335566}),-3.2,3.2,-5.6);g.add(win)}
 if(id==='garden'){for(let i=0;i<22;i++){const a=rnd(0,6.28),r=rnd(3.2,6.5),x=Math.cos(a)*r,z=Math.sin(a)*r;g.add(mesh(C(.03,.03,.5),M(0x2e7d32),x,.25,z));g.add(mesh(S_(.15),M([0xff3fb4,0xffd23f,0xffffff,0x22e5ff][i%4]),x,.55,z))}g.add(mesh(S_(1),M(0xfff176,{emissive:0xffd23f}),-6,9,-14))}
 if(id==='tree'){g.add(mesh(C(.9,1.2,8),M(0x6d4c41),0,-4.3,-6.5));for(let i=0;i<9;i++)g.add(mesh(S_(rnd(1.5,2.5)),M(0x3f9a3a),rnd(-8,8),rnd(5,8),rnd(-9,-4)));for(const s of[-1,1])g.add(mesh(B(.2,1.2,12),M(0x8d5a3b),s*6.8,.6,0))}
 if(id==='beach'){const sea=mesh(B(40,.2,14),M(0x29b6f6,{roughness:.1,metalness:.2}),0,-.2,-13);sea.userData.sea=1;g.add(sea);g.add(mesh(C(.15,.2,4),M(0x8d6e63),4.5,2,-3));for(let i=0;i<5;i++){const l=mesh(B(2,.08,.5),M(0x43a047),4.5,4,-3);l.rotation.set(0,i*1.25,-.5);g.add(l)}
  const sc=mesh(C(.5,.7,.6,6),M(0xf0c46c),-3.5,.3,2);g.add(sc,mesh(K(.4,.5,6),M(0xf0c46c),-3.5,.85,2))}
 if(id==='castle'){for(const x of[-5,5]){g.add(mesh(C(1,1,6,12),M(0x8c8ca0),x,3,-4.5));g.add(mesh(K(1.3,1.8,12),M(0x5e35b1),x,6.9,-4.5))}for(const s of[-1,1])g.add(mesh(B(.6,2.6,.1),M(0xff3fb4),s*2.5,3.5,-5.4));g.add(mesh(B(3,.05,5),M(0xc62828),0,.02,0))}
 if(id==='space'){const sg=new THREE.BufferGeometry(),p=[];for(let i=0;i<700;i++){const v=new THREE.Vector3().randomDirection().multiplyScalar(rnd(25,60));p.push(v.x,Math.abs(v.y),v.z)}sg.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:.15})));
  const pl=mesh(S_(3),M(0xff3fb4),-12,9,-22);g.add(pl);const ring=mesh(new THREE.TorusGeometry(4.5,.25,8,60),M(0x22e5ff,{emissive:0x22e5ff}),-12,9,-22);ring.rotation.x=1.2;g.add(ring);g.add(mesh(new THREE.TorusGeometry(7,.08,8,80),M(0x22e5ff,{emissive:0x22e5ff}),0,.05,0).rotateX(Math.PI/2))}
 return g}
const SPOTS=[[-4,-2.5],[4,-2.5],[-4.8,1.2],[4.8,1.2],[-2.2,-4],[2.2,-4]];
function buildFurn(id,i){const g=new THREE.Group(),[x,z]=SPOTS[i%6];g.position.set(x,0,z);g.lookAt(0,0,0);
 if(id==='plant'){g.add(mesh(C(.4,.3,.6),M(0xd84315),0,.3,0));for(let k=0;k<5;k++)g.add(mesh(S_(.35),M(0x43a047),Math.sin(k)*.25,1+k*.12,Math.cos(k)*.25))}
 if(id==='lamp'){g.add(mesh(C(.3,.35,.1),M(0x333333),0,.05,0),mesh(C(.04,.04,1.8),M(0x333333),0,.9,0),mesh(K(.45,.5,24),M(0x22f0ff,{emissive:0x22f0ff,emissiveIntensity:.8}),0,1.9,0));const l=new THREE.PointLight(0x22f0ff,6,6);l.position.y=1.7;g.add(l)}
 if(id==='bed'){g.add(mesh(B(2.4,.5,1.4),M(0x6d4c41),0,.25,0),mesh(B(2.3,.3,1.3),M(0x22e5ff),0,.6,0),mesh(B(.6,.25,1),M(0xffffff),-.8,.85,0),mesh(B(.15,1.2,1.4),M(0x6d4c41),-1.2,.6,0))}
 if(id==='tv'){g.add(mesh(B(1.4,.6,.6),M(0x5d4037),0,.3,0),mesh(B(1.8,1.1,.1),M(0x111111),0,1.2,0));const sc=mesh(B(1.65,.95,.02),M(0x2222ff,{emissive:0x22e5ff,emissiveIntensity:.7}),0,1.2,.06);sc.userData.tv=1;g.add(sc)}
 if(id==='tent'){const t=mesh(K(1.3,1.8,4),M(0xff3fb4),0,.9,0);t.rotation.y=Math.PI/4;g.add(t,mesh(K(.08,.5),M(0xffd23f),0,2,0))}
 if(id==='fountain'){g.add(mesh(C(1.1,1.2,.4,32),M(0xbdbdbd),0,.2,0),mesh(C(1,1,.05,32),M(0x29b6f6,{roughness:.1}),0,.38,0),mesh(C(.15,.2,1,12),M(0xbdbdbd),0,.8,0),mesh(C(.5,.4,.15,24),M(0xbdbdbd),0,1.3,0));g.userData.fountain=1}
 return g}
// ---------- effects ----------
const ICON={pat:0xff3fb4,step:0x22f0ff};
function sprite(txt,size=64){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.font=size*1.5+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,64,70);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));return s}
function spawn(kind,pos,txt){if(kind==='step'){const r=mesh(new THREE.RingGeometry(.2,.32,24),new THREE.MeshBasicMaterial({color:0x22f0ff,transparent:true}));r.rotation.x=-Math.PI/2;r.position.copy(pos).setY(.05);scene.add(r);fx.push({o:r,t:0,life:.8,ring:1});return}
 const s=sprite(txt);s.position.copy(pos);s.scale.setScalar(.6);scene.add(s);fx.push({o:s,t:0,life:1.4,v:new THREE.Vector3((Math.random()-.5)*1.2,1.4+Math.random(),(Math.random()-.5)*.6)})}
function burst(txt,n=6,y=2.6){for(let i=0;i<n;i++)setTimeout(()=>petG&&spawn('fx',petG.position.clone().add(new THREE.Vector3(0,y,0)),txt),i*90)}
let AC,ST={},grow=1,need=null,needT=0;
function tone(f1,f2,dur,type='sine',vol=.15,delay=0){if(ST.mute)return;AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+dur)}
const SND={pat:()=>{tone(700,1300,.12);tone(900,1600,.12,'sine',.12,.13)},tickle:()=>[0,1,2,3].forEach(i=>tone(900+i*120,1400,.08,'triangle',.1,i*.09)),eat:()=>[0,1,2].forEach(i=>tone(220,120,.09,'square',.06,i*.2)),wash:()=>[0,1,2,3,4].forEach(i=>tone(500+Math.random()*600,1500,.06,'sine',.08,i*.12)),play:()=>[0,1,2].forEach(i=>tone(520+i*200,780+i*200,.12,'triangle',.12,i*.12)),nap:()=>[0,1.1].forEach(d=>tone(90,60,.8,'sawtooth',.05,d)),happy:()=>tone(600,1200,.25)};
// actions called by the app (or by tapping the pet)
const ACT={pat:{t:.8,fx:'💖'},tickle:{t:1,fx:'😆'},eat:{t:1.4,fx:'😋'},wash:{t:1.6,fx:'🫧'},play:{t:2.2,fx:'⭐'},nap:{t:2.6,fx:'💤'},happy:{t:1,fx:'✨'}};
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
   if(anim.kind==='nap'){rx=-s*1.2;y-=s*.3}
   if(k>=1){anim=null;head.rotation.x=0}}
  petG.scale.set(sx*grow,sy*grow,sx*grow);p.y=y;petG.rotation.z=rz;petG.rotation.x=rx*.6;
  petG.traverse(o=>{if(o.userData.arm!==undefined){const s=o.userData.arm;o.position.set(s*.8,1.1,.3);o.rotation.z=0;
    if(!anim&&!walking&&need){if(need==='h'){o.position.set(s*.35,.95+Math.sin(t*6+s)*.12,.8)}else if(s>0){o.position.set(1,1.9,.3);o.rotation.z=Math.sin(t*8)*.6}}}});
  if(need&&!anim&&(needT-=dt)<0){needT=2.5;spawn('fx',p.clone().add(new THREE.Vector3(0,3.3*grow,0)),{h:'🍎',c:'🫧',en:'💤',j:'⚽'}[need])}
  const blink=(t%4)<.12?.1:1;eyes.forEach(e=>e.scale.y=blink);
  if(!anim||anim.kind!=='eat'){const lp=head.parent.worldToLocal(look.clone());head.rotation.y=THREE.MathUtils.clamp(Math.atan2(lp.x,lp.z),-.6,.6)*.6;head.rotation.x=THREE.MathUtils.clamp(-(lp.y-2.1)*.08,-.3,.3)}
  petG.traverse(o=>{if(o.userData.wing)o.rotation.z=-o.userData.wing*(.6+Math.sin(t*(walking?14:3))*.3);if(o.userData.tail)o.rotation.z=Math.sin(t*(walking?12:4))*.4})}
 scene&&scene.traverse(o=>{if(o.userData.tv)o.material.emissive.setHSL((t*.1)%1,.8,.4);if(o.userData.sea)o.position.y=-.2+Math.sin(t)*.06});
 for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t+=dt;const k=f.t/f.life;
  if(f.ring){f.o.scale.setScalar(1+k*2);f.o.material.opacity=1-k}
  else if(f.feed){const m=head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,0,.4));f.o.position.lerpVectors(cam.position.clone().lerp(m,.55),m,k);f.o.scale.setScalar(.7*(1-k*.8))}
  else if(f.toss){const a=f.t*2.8;f.o.position.set(f.from.x+Math.sin(a)*2.2,1+Math.abs(Math.sin(a*2))*2,f.from.z+Math.cos(a)*2.2);f.o.material.rotation=a*3}
  else{f.o.position.addScaledVector(f.v,dt);f.o.material.opacity=1-k}
  if(k>=1){scene.remove(f.o);fx.splice(i,1)}}
 ctl&&ctl.update();R&&cv.isConnected&&R.render(scene,cam)}
function mount(el,S){ST=S;grow=.7+Math.min(S.days||1,9)*.035;need=S.st.h<35?'h':S.st.c<35?'c':S.st.en<35?'en':S.st.j<35?'j':null;if(!R)init();el.prepend(cv);el.classList.add('live');fit();
 const k=S.pet+'|'+S.home+'|'+S.placed.join(',')+'|'+S.wear;if(k===key)return;const[pp,ph]=key.split('|');key=k;
 if(pp!==S.pet){if(petG)scene.remove(petG);petG=buildPet(S.pet);scene.add(petG);wearG=null;target.set(0,0,0)}
 if(ph!==S.home){if(homeG)scene.remove(homeG);homeG=buildHome(S.home);scene.add(homeG)}
 if(furnG)scene.remove(furnG);furnG=new THREE.Group();S.placed.forEach((id,i)=>furnG.add(buildFurn(id,i)));scene.add(furnG);
 if(wearG)head.remove(wearG);wearG=buildWear(S.wear);head.add(wearG)}
function photo(name){R.render(scene,cam);const a=document.createElement('a');a.download=(name||'my-pet')+'.png';a.href=cv.toDataURL('image/png');a.click()}
window.Pet3D={mount,act,photo,ready:true};
window.dispatchEvent(new Event('pet3d-ready'));
