// Pet v3: two pets per device, daily spin wheel, talking guide, mini-games, sticker book, grow-up parties.
const _base=render;
S.stk=S.stk||{};S.cnt=S.cnt||{};
const STK=[['first','🐾','Best friends'],['feed5','🍎','Fed 5 times'],['wash5','🧼','Squeaky clean'],['play5','⚽','Play time'],['nap3','💤','Sweet dreams'],['spin','🎡','Lucky spin'],['stars','⭐','Star catcher'],['treats','🍖','Treat catcher'],['bubbles','🫧','Bubble popper'],['seek','🙈','Found me'],['kid','🌱','Growing up'],['grown','🌟','All grown up'],['home2','🏡','New home'],['hat','👑','Looking good'],['day3','📅','Three days together'],['rich','💰','100 coins']];
function sticker(id){if(S.stk[id])return;S.stk[id]=1;save();const s=STK.find(x=>x[0]===id);setTimeout(()=>{confetti();pop('📒 '+s[1]+' 🎉','New sticker! '+s[2])},900)}
function bump(k,n,id){S.cnt[k]=(S.cnt[k]||0)+1;save();if(S.cnt[k]>=n)sticker(id)}
const _use=use;use=function(id){const i=ALL.find(x=>x.id===id);if(!i||!S.inv[id])return;_use(id);const k=kindOf(i);if(k==='eat')bump('feed',5,'feed5');if(k==='wash')bump('wash',5,'wash5');if(k==='play')bump('play',5,'play5');const a=(S.st.h+S.st.j+S.st.c+S.st.en)/4;if(a>85&&window.Pet3D)setTimeout(()=>Pet3D.act('dance','🎵'),1700)};
const _nap=nap;nap=function(){_nap();bump('nap',3,'nap3')};
const _wear=wear;wear=function(id){_wear(id);if(S.wear)sticker('hat')};
const _bh=buyHome;buyHome=function(id){_bh(id);if(S.homes.length>1)sticker('home2')};
const _adopt=adopt;adopt=function(id){_adopt(id);S.stage=0;S.guided=0;save();sticker('first');setTimeout(startGuide,2600)};
function confetti(n=40){const c=['#22f0ff','#ff6fb5','#ffd23f','#7cf57c','#b388ff'];for(let i=0;i<n;i++){const e=document.createElement('i');e.className='cf';e.style.left=Math.random()*100+'vw';e.style.background=c[i%5];e.style.animationDelay=Math.random()*.6+'s';document.body.appendChild(e);setTimeout(()=>e.remove(),3400)}}
function checkGrow(){if(!S.pet)return;const d=S.days||1,st=d<4?0:d<9?1:2;if(S.stage===undefined){S.stage=st;save()}
 else if(st>S.stage){S.stage=st;save();setTimeout(()=>{confetti(70);window.Pet3D&&Pet3D.act('dance','🎉');pop((st===1?'🌱':'🌟')+' ⬆️ 🎉',S.name+(st===1?' is growing up!':' is all grown up!'));sticker(st===1?'kid':'grown')},1200)}
 if(d>=3)sticker('day3');if(S.tokens>=100)sticker('rich')}
function blip(f=900,d=.04){if(S.mute)return;try{const A=window._ac=window._ac||new (window.AudioContext||window.webkitAudioContext)(),o=A.createOscillator(),g=A.createGain();o.frequency.value=f;g.gain.setValueAtTime(.08,A.currentTime);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+.08);o.connect(g).connect(A.destination);o.start();o.stop(A.currentTime+d+.08)}catch(e){}}
// ---------- two pets per device ----------
function slotInfo(n){try{const o=JSON.parse(localStorage.getItem(n===2?'llpet2':'llpet')||'null');return o&&o.pet?o:null}catch(e){return null}}
function pickSlot(n){localStorage.setItem('llslot',String(n));location.reload()}
function whoView(){const c=n=>{const o=slotInfo(n),p=o&&PETS.find(x=>x.id===o.pet);return `<button class="item tap who ${n===1?'b':'p'} ${SLOT===n?'on':''}" aria-label="${o?o.name:'New pet'}" data-say="${o?o.name:'Get a new pet'}" onclick="pickSlot(${n})"><div class="e">${p?p.e:'➕'}</div><div class="go">${n===1?'🔵':'🩷'}${SLOT===n?'✅':''}</div></button>`};
 return `<div class="card"><button class="big-ico" data-say="Whose pet? Tap yours!">👧👦❓</button><div class="grid two">${c(1)}${c(2)}</div></div>`}
// ---------- daily spin wheel ----------
const PRIZES=[['🪙5',5],['🪙10',10],['🪙15',15],['🍎',0,'apple'],['🪙20',20],['🎂',0,'cake'],['🪙30',30],['🪙10',10]];
function spinView(){const seg=360/PRIZES.length,cols=['#22f0ff','#ffd23f','#ff6fb5','#7cf57c','#b388ff','#ffa726','#4fc3f7','#f48fb1'];
 const grad=PRIZES.map((p,i)=>`${cols[i]} ${i*seg}deg ${(i+1)*seg}deg`).join(',');
 const lab=PRIZES.map((p,i)=>`<span style="transform:rotate(${i*seg+seg/2}deg)"><b>${p[0]}</b></span>`).join('');
 return `<div class="card spinc"><div class="ptr">🔻</div><div class="wheel" id="wheel" style="background:conic-gradient(${grad})">${lab}<div class="hub">🎁</div></div>
 <button class="startbtn" id="spinb" aria-label="Spin" data-say="Spin the wheel!" onclick="spinNow()">🎡▶️</button></div>`}
function spinNow(){if(!S.spin)return go('home');S.spin=0;save();const i=Math.floor(Math.random()*PRIZES.length),seg=360/PRIZES.length,w=$('wheel');$('spinb').disabled=true;
 w.style.transition='transform 4s cubic-bezier(.12,.8,.2,1)';w.style.transform=`rotate(${360*6-(i*seg+seg/2)}deg)`;
 let n=0;(function tk(){if(n++<26){blip(700+n*10,.02);setTimeout(tk,60+n*n*.4)}})();
 setTimeout(()=>{const p=PRIZES[i];if(p[1])LeonLinkPet.addTokens(p[1]);else{S.inv[p[2]]=(S.inv[p[2]]||0)+1;save();pop('🎁 '+p[0],'You won a treat!')}confetti();sticker('spin');setTimeout(()=>go('home'),2400)},4200)}
// ---------- mini-games ----------
let MG=null;
function gamesView(){const g=(id,e,w)=>`<button class="item tap" aria-label="${w}" data-say="${w}" onclick="playGame('${id}')"><div class="e">${e}</div><div class="go">▶️</div></button>`;
 return `<div class="card"><button class="big-ico" data-say="Pick a game and win coins!">🎮 = 🪙</button><div class="grid two">${g('stars','⭐','Tap the stars')}${g('treats','🍖','Catch the treats')}${g('bubbles','🫧','Pop the bubbles')}${g('seek','🙈','Hide and seek')}</div></div>`}
function endMG(got,id){(MG||[]).forEach(clearInterval);MG=null;if(got>0){LeonLinkPet.addTokens(got);confetti(25);sticker(id)}S.view='games';save();setTimeout(render,got>0?1200:0)}
function playGame(id){if(id==='stars'){sticker('stars');S.view='play';save();return render()}
 S.view='mg';save();$('app').innerHTML=`<div class="card"><div class="row playbar"><button class="startbtn" data-say="Back" aria-label="Back" onclick="endMG(0)">⬅️</button><b id="gs" class="score">🪙 0</b></div><div class="timer"><i id="gt" style="width:100%"></i></div><div id="game" class="mg"></div></div>`;
 const box=$('game');let got=0,left=25;const sc=v=>{got+=v;$('gs').textContent='🪙 '+got;blip(1200)};
 const timer=()=>setInterval(()=>{left--;$('gt').style.width=(left/25*100)+'%';if(left<=0)endMG(got,id)},1000);
 if(id==='treats'){say('Move the basket. Catch the treats!');const b=document.createElement('div');b.className='basket';b.textContent='🧺';box.appendChild(b);let bx=50;
  const mv=e=>{const r=box.getBoundingClientRect();bx=Math.max(6,Math.min(94,(e.clientX-r.left)/r.width*100));b.style.left=bx+'%'};box.onpointermove=mv;box.onpointerdown=mv;
  const items=[];const sp=setInterval(()=>{const bad=Math.random()<.2,e=document.createElement('span');e.className='fall';e.textContent=bad?'🥦':['🍖','🍎','🦴','🍪'][Math.random()*4|0];e._x=6+Math.random()*88;e._y=-8;e._bad=bad;e.style.left=e._x+'%';box.appendChild(e);items.push(e)},750);
  const fr=setInterval(()=>{for(let i=items.length-1;i>=0;i--){const e=items[i];e._y+=1.5;e.style.top=e._y+'%';if(e._y>74&&e._y<90&&Math.abs(e._x-bx)<12){if(!e._bad)sc(1);else{b.classList.add('shake');setTimeout(()=>b.classList.remove('shake'),300)}e.remove();items.splice(i,1)}else if(e._y>100){e.remove();items.splice(i,1)}}},40);
  MG=[sp,fr,timer()]}
 if(id==='bubbles'){say('Pop the bubbles!');const sp=setInterval(()=>{const e=document.createElement('span');e.className='bub';const gold=Math.random()<.15;e.textContent=gold?'🌟':'🫧';e.style.left=Math.random()*85+'%';e.style.animationDuration=(3+Math.random()*2)+'s';
  e.onpointerdown=()=>{sc(gold?3:1);e.textContent='💥';e.onpointerdown=null;setTimeout(()=>e.remove(),200)};box.appendChild(e);setTimeout(()=>e.remove(),5200)},550);MG=[sp,timer()]}
 if(id==='seek'){const p=PETS.find(x=>x.id===S.pet);let round=0;$('gt').style.width='100%';
  const play=()=>{if(round>=5)return endMG(got,id);round++;$('gt').style.width=((5-round+1)/5*100)+'%';say('Where is '+S.name+'? Tap a box!');const hide=Math.random()*3|0;
   box.innerHTML='<div class="boxes">'+[0,1,2].map(i=>`<button class="hbox" data-i="${i}">${['📦','🎁','🧺'][i]}</button>`).join('')+'</div>';
   box.querySelectorAll('.hbox').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;box.querySelectorAll('.hbox').forEach(x=>x.onclick=null);
    if(i===hide){b.textContent=p.e;b.classList.add('found');sc(2);say('You found me!')}else{b.textContent='💨';const r=box.querySelectorAll('.hbox')[hide];r.textContent=p.e;say('Here I am!')}setTimeout(play,1600)})};
  MG=[];play()}}
// ---------- sticker book ----------
function bookView(){const n=STK.filter(s=>S.stk[s[0]]).length;return `<div class="card"><button class="big-ico" data-say="Your sticker book. You have ${n} stickers!">📒 ${n}/${STK.length}</button><div class="grid stk">${STK.map(s=>`<button class="item tap ${S.stk[s[0]]?'on':'poor'}" aria-label="${s[2]}" data-say="${S.stk[s[0]]?s[2]:'Not yet!'}"><div class="e">${S.stk[s[0]]?s[1]:'❔'}</div></button>`).join('')}</div></div>`}
// ---------- talking guide ----------
const GUIDE=[['.pet,#stage canvas,#stage','Hi! I am Ollie the owl. Tap your pet to give it a hug!'],['.acts button:nth-child(1)','This apple feeds your pet when it is hungry.'],['.meters','These bars show how your pet feels. Green is good! Red means help!'],['#nav button:nth-child(2)','Tap the shop to buy food, toys and hats.'],['#nav button:nth-child(4)','Play games to win coins!'],['#nav button:nth-child(5)','Collect stickers in your sticker book. Have fun!']];
function startGuide(){S.guided=0;save();if(S.view!=='home')go('home');showGuide()}
function showGuide(){document.querySelectorAll('.guide,.gpoint').forEach(e=>e.remove());if(S.guided>=GUIDE.length){S.guided=99;save();return}
 const [sel,txt]=GUIDE[S.guided],t=document.querySelector(sel.split(',').find(s=>document.querySelector(s))||'body');
 const g=document.createElement('button');g.className='guide';g.setAttribute('aria-label','Next');g.innerHTML='🦉<span>👉</span>';g.onclick=()=>{S.guided++;save();showGuide()};document.body.appendChild(g);
 if(t&&t!==document.body){const r=t.getBoundingClientRect(),h=document.createElement('div');h.className='gpoint';h.textContent='👆';h.style.left=(r.left+r.width/2+scrollX-22)+'px';h.style.top=(r.top+r.height/2+scrollY)+'px';document.body.appendChild(h);t.scrollIntoView({block:'center',behavior:'smooth'})}
 say(txt)}
// ---------- routing ----------
render=function(){if(MG&&S.view==='mg')return;if(S.view==='mg')S.view='games';
 const extra={who:whoView,spin:spinView,games:gamesView,book:bookView}[S.view];
 if(!S.pet&&S.view!=='who'){_base();navBar();return}
 if(S.spin&&S.view==='home')S.view='spin';
 if(extra){$('tok').textContent=S.tokens;$('app').innerHTML=extra();navBar();return}
 _base();navBar();if(S.view==='play'&&!G){const c=document.querySelector('.playbar');if(c&&!c.querySelector('.back'))c.insertAdjacentHTML('afterbegin','<button class="startbtn back" data-say="Back" aria-label="Back" onclick="go(\'games\')">⬅️</button>')}}
function navBar(){if(!S.pet){$('nav').innerHTML=`<button class="${S.view==='who'?'on':''}" aria-label="Change pet" data-say="Change pet" onclick="go('who')">👥</button>`;return}const v=S.view==='play'||S.view==='mg'?'games':S.view==='spin'?'home':S.view;
 $('nav').innerHTML=[['home','🏠','My pet'],['shop','🛍️','Shop'],['homes','🏡','Homes'],['games','🎮','Play and win coins'],['book','📒','Sticker book'],['who','👥','Change pet']].map(([k,l,w])=>`<button class="${v===k?'on':''}" aria-label="${w}" data-say="${w}" onclick="go('${k}')">${l}</button>`).join('')}
// header guide button (replay the helper any time)
document.querySelector('header').insertAdjacentHTML('beforeend','<button class="ghelp" aria-label="Help" data-say="Help" onclick="startGuide()">🦉</button>');
if(S.pet&&S.lastDay&&S.days===undefined)S.days=1;
if(S.pet&&!S.stk.first)S.stk.first=1;
render();checkGrow();
if(S.pet&&S.guided===undefined){S.guided=0;save();setTimeout(startGuide,1500)}
// Older versions gave +10 every day; first open after this update gets a spin if not already given today
