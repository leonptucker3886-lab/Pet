let S=JSON.parse(localStorage.getItem('llpet')||'null')||{tokens:50,pet:null,name:'',inv:{},owned:{},homes:['room'],home:'room',placed:[],wear:null,st:{h:80,j:80,c:80,en:80},t:Date.now(),tab:'food',view:'home'};
const save=()=>localStorage.setItem('llpet',JSON.stringify(S));
const decay=m=>{for(const k in S.st)S.st[k]=Math.max(10,S.st[k]-m*0.3);S.t=Date.now()};
decay((Date.now()-S.t)/60000);
const today=new Date().toDateString();let gift=0;if(S.lastDay!==today){if(S.pet){S.days=(S.days||0)+1;S.spin=1}S.lastDay=S.pet?today:null;save()}
function mute(){S.mute=!S.mute;save();render()}
setInterval(()=>{decay(1);save();if(S.view==='home')render()},60000);
const $=id=>document.getElementById(id);
// Picture-first UI: buttons speak their name so kids who can't read hear what they do.
function say(t){try{if(S.mute||!t||!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.95;u.pitch=1.25;speechSynthesis.speak(u)}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-say]');if(b)say(b.dataset.say)},true);
function pop(emo,words){toast(emo);if(words)setTimeout(()=>say(words),350)}
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('s');clearTimeout(t._);t._=setTimeout(()=>t.classList.remove('s'),1800)}
// Hook for LeonLink Kids games: LeonLinkPet.addTokens(10), postMessage({type:'leonlink-tokens',amount:10}), or ?earn=10
window.LeonLinkPet={addTokens(n){n=Math.max(0,n|0);S.tokens+=n;save();render();pop('🪙 +'+n+' 🎉',n+' coins!')},get tokens(){return S.tokens}};
addEventListener('message',e=>{if(e.data&&e.data.type==='leonlink-tokens')LeonLinkPet.addTokens(e.data.amount)});
function go(v){S.view=v;save();render()}
function eff(i){const m={h:'🍗',j:'😊',c:'🫧',en:'⚡'};return Object.keys(m).filter(k=>i[k]).map(k=>m[k]+'+'+i[k]).join(' ')}
function buy(id){const i=ALL.find(x=>x.id===id);if(S.tokens<i.p)return pop('🪙❌ ➡️ 🎮','Not enough coins. Play a game to win more!');
 if(i.keep||i.wear){if(S.owned[id])return;S.owned[id]=1}else S.inv[id]=(S.inv[id]||0)+1;
 S.tokens-=i.p;save();render();pop('✅ '+i.e,'You got it!')}
function use(id){const i=ALL.find(x=>x.id===id);if(!S.inv[id])return;S.inv[id]--;
 for(const k of['h','j','c','en'])if(i[k])S.st[k]=Math.min(100,S.st[k]+i[k]);save();render();bounce();window.Pet3D&&Pet3D.act(kindOf(i),i.e);pop(i.e+' 😍',S.name+' loves it!')}
function place(id){const k=S.placed.indexOf(id);k>=0?S.placed.splice(k,1):S.placed.push(id);save();render()}
function wear(id){S.wear=S.wear===id?null:id;save();render()}
function buyHome(id){const h=HOMES.find(x=>x.id===id);if(S.homes.includes(id)){S.home=id;save();return go('home')}
 if(S.tokens<h.p)return pop('🪙❌ ➡️ 🎮','Not enough coins yet!');S.tokens-=h.p;S.homes.push(id);S.home=id;save();go('home');pop(h.e+' 🎉','Welcome to your new home!')}
function bounce(){const p=document.querySelector('.pet');if(p){p.classList.remove('bounce');void p.offsetWidth;p.classList.add('bounce')}}
function pat(fromScene){if(!fromScene&&window.Pet3D)return Pet3D.act('pat');S.st.j=Math.min(100,S.st.j+2);save();bounce();render()}
function tickle(){S.st.j=Math.min(100,S.st.j+3);save();render();pop('😆','Hee hee!')}
const kindOf=i=>SHOP.food.includes(i)?'eat':SHOP.toys.includes(i)?'play':i.c?'wash':'happy';
function quick(k){const cat=k==='eat'?SHOP.food:k==='play'?SHOP.toys:SHOP.care.filter(i=>i.c);const i=cat.find(x=>S.inv[x.id]>0);if(!i){S.tab=k==='eat'?'food':k==='play'?'toys':'care';pop('🎒❌ ➡️ 🛍️','None left! Let\'s go to the shop.');return go('shop')};use(i.id)}
function nap(){window.Pet3D&&Pet3D.act('nap');S.st.en=Math.min(100,S.st.en+30);S.st.h=Math.max(10,S.st.h-5);save();render();pop('💤😴','Night night!')}
function mood(){const a=(S.st.h+S.st.j+S.st.c+S.st.en)/4;
 if(S.st.h<30)return['🍎','I am hungry!'];if(S.st.c<30)return['🛁','I need a bath!'];if(S.st.en<30)return['😴','I am sleepy!'];if(S.st.j<30)return['⚽','Play with me!'];
 return a>75?['😍','I am so happy!']:['🙂','I feel okay']}
const NAMES={pup:'Biscuit',kit:'Whiskers',bun:'Hoppy',dra:'Sparky',uni:'Sparkle',pen:'Waddles'};
const lvl=v=>v<30?'low':v<60?'mid':'ok';
function adoptView(){return `<div class="card"><button class="big-ico" data-say="Pick a friend!">👇🐾</button>
<div class="grid pets">${PETS.map(p=>`<button class="item tap" aria-label="${p.n}" data-say="${p.n}" onclick="adopt('${p.id}')"><div class="e">${p.e}</div><div class="go">❤️</div></button>`).join('')}</div>
<div class="row name-row"><input id="pn" aria-label="Name" maxlength="14" value="${S.name||''}" placeholder="✏️"></div></div>`}
function adopt(id){let n=($('pn')&&$('pn').value.trim())||NAMES[id]||'Buddy';S.pet=id;S.name=n;S.days=1;S.lastDay=new Date().toDateString();save();go('home');pop('🎉 '+PETS.find(x=>x.id===id).e+' ❤️','Say hi to '+n+'!')}
function homeView(){const h=HOMES.find(x=>x.id===S.home),p=PETS.find(x=>x.id===S.pet),w=S.wear&&ALL.find(x=>x.id===S.wear);
 const furn=window.Pet3D?'':S.placed.map((id,i)=>`<span class="furn" style="left:${6+(i%6)*15}%">${ALL.find(x=>x.id===id).e}</span>`).join('');
 const [me,mw]=mood(),d=S.days||1,age=d<4?'🍼':d<9?'🌱':'⭐';
 const meter=(k,e,word)=>`<button class="meter ${lvl(S.st[k])}" aria-label="${word}" data-say="${word}${S.st[k]<30?', getting low!':''}"><span class="mi">${e}</span><span class="bar"><i style="width:${S.st[k]}%"></i></span></button>`;
 const bag=ALL.filter(i=>S.inv[i.id]>0);
 const act=(fn,e,word)=>`<button aria-label="${word}" data-say="${word}" onclick="${fn}">${e}</button>`;
 return `<div class="card"><div class="stage home" id="stage" style="background:${h.bg}">
 <button class="mood" aria-label="${mw}" data-say="${mw}">${me}</button><span class="age">${age}</span>
 <span class="hint">👆</span>${furn}<div class="pet fallback" onclick="pat()">${p.e}${w?`<span class="acc">${w.e}</span>`:''}</div>
 <div class="acts">${act("quick('eat')",'🍎','Feed')}${act("quick('play')",'⚽','Play')}${act("quick('wash')",'🧼','Wash')}${act('pat()','🤗','Hug')}${act('nap()','💤','Sleep')}${act('Pet3D.photo(S.name)','📸','Photo')}${act('mute()',S.mute?'🔇':'🔊',S.mute?'Sound on':'Sound off')}</div></div>
 <div class="meters">${meter('h','🍗','Tummy')}${meter('j','😊','Happy')}${meter('c','🫧','Clean')}${meter('en','⚡','Energy')}</div></div>
 <div class="card"><div class="sec">🎒</div>${bag.length?`<div class="grid">${bag.map(i=>`<button class="item tap" aria-label="${i.n}" data-say="${i.n}" onclick="use('${i.id}')"><div class="e">${i.e}</div><div class="cnt">${'●'.repeat(Math.min(S.inv[i.id],5))}${S.inv[i.id]>5?'+':''}</div></button>`).join('')}</div>`:`<button class="empty tap" data-say="Empty! Go to the shop." onclick="go('shop')">🎒❌ ➡️ 🛍️</button>`}</div>
 <div class="card"><div class="sec">🛋️👑</div>${ALL.some(i=>S.owned[i.id])?`<div class="grid">${ALL.filter(i=>S.owned[i.id]).map(i=>{const on=i.keep?S.placed.includes(i.id):S.wear===i.id;return `<button class="item tap ${on?'on':''}" aria-label="${i.n}" data-say="${i.n}" onclick="${i.keep?'place':'wear'}('${i.id}')"><div class="e">${i.e}</div><div class="go">${on?'✅':'⬜'}</div></button>`}).join('')}</div>`:`<button class="empty tap" data-say="Buy furniture and hats in the shop" onclick="go('shop')">🛍️ ➡️ 🛋️👑</button>`}</div>`}
const TAB_WORD={food:'Food',care:'Bath time',toys:'Toys',furniture:'Furniture',style:'Hats and clothes'};
function shopView(){return `<div class="card"><div class="row tabs">${Object.keys(TABS).map(t=>`<button class="${S.tab===t?'on':''}" aria-label="${TAB_WORD[t]}" data-say="${TAB_WORD[t]}" onclick="S.tab='${t}';save();render()">${TABS[t].split(' ')[0]}</button>`).join('')}</div>
 <div class="grid">${SHOP[S.tab].map(i=>{const own=(i.keep||i.wear)&&S.owned[i.id],poor=S.tokens<i.p;return `<button class="item tap ${own?'on':poor?'poor':''}" aria-label="${i.n}" data-say="${i.n}${own?', you have it':poor?', you need more coins':', '+i.p+' coins'}" onclick="${own?'':`buy('${i.id}')`}"><div class="e">${i.e}</div>${own?'<div class="go">✅</div>':`<div class="price">🪙${i.p}</div><div class="go">${poor?'🔒':'🛒'}</div>`}${S.inv[i.id]?`<div class="cnt">🎒${'●'.repeat(Math.min(S.inv[i.id],5))}</div>`:''}</button>`}).join('')}</div></div>`}
function homesView(){return `<div class="card"><div class="grid">${HOMES.map(h=>{const o=S.homes.includes(h.id),here=S.home===h.id,poor=!o&&S.tokens<h.p;return `<button class="item tap ${here?'on':poor?'poor':''}" aria-label="${h.n}" data-say="${h.n}${here?', you live here':o?', move in':poor?', you need more coins':', '+h.p+' coins'}" onclick="${here?'':`buyHome('${h.id}')`}"><div class="hb" style="background:${h.bg}">${h.e}</div>${here?'<div class="go">🏠✅</div>':o?'<div class="go">➡️🏠</div>':`<div class="price">🪙${h.p}</div><div class="go">${poor?'🔒':'🔓'}</div>`}</button>`}).join('')}</div></div>`}
let G=null;
function playView(){return `<div class="card"><div class="row playbar"><button class="startbtn" aria-label="Start" data-say="Tap the stars!" onclick="startGame()">▶️⭐</button><b id="gs" class="score">⭐ 0</b></div><div class="timer"><i id="gt" style="width:100%"></i></div><div id="game"><div class="demo">👆⭐ = 🪙</div></div></div>`}
function startGame(){if(G)return;let left=20,got=0;const box=$('game');box.innerHTML='';$('gt').style.width='100%';
 const spawn=()=>{const s=document.createElement('span');const big=Math.random()<.2;s.className='star';s.textContent=big?'🌟':'⭐';s.style.left=Math.random()*85+'%';s.style.top=Math.random()*78+'%';
  s.onpointerdown=()=>{got+=big?3:1;s.remove();$('gs').textContent='⭐ '+got};box.appendChild(s);setTimeout(()=>s.remove(),1300)};
 const sp=setInterval(spawn,600);G=setInterval(()=>{left--;$('gt').style.width=(left/20*100)+'%';if(left<=0){clearInterval(sp);clearInterval(G);G=null;box.innerHTML='<div class="demo">🎉</div>';LeonLinkPet.addTokens(got)}},1000)}
function render(){$('tok').textContent=S.tokens;
 const v=S.pet?S.view:'adopt';$('nav').innerHTML=S.pet?[['home','🏠','My pet'],['shop','🛍️','Shop'],['homes','🏡','Homes'],['play','🎮','Play and win coins']].map(([k,l,w])=>`<button class="${v===k?'on':''}" aria-label="${w}" data-say="${w}" onclick="go('${k}')">${l}</button>`).join(''):'';
 if(G&&v==='play')return;$('app').innerHTML={adopt:adoptView,home:homeView,shop:shopView,homes:homesView,play:playView}[v]();const st=$('stage');if(st&&window.Pet3D)Pet3D.mount(st,S)}
addEventListener('pet3d-ready',()=>render());
const q=new URLSearchParams(location.search).get('earn');if(q){S.tokens+=Math.max(0,+q|0);save();history.replaceState(null,'',location.pathname)}
render();

