let S=JSON.parse(localStorage.getItem('llpet')||'null')||{tokens:50,pet:null,name:'',inv:{},owned:{},homes:['room'],home:'room',placed:[],wear:null,st:{h:80,j:80,c:80,en:80},t:Date.now(),tab:'food',view:'home'};
const save=()=>localStorage.setItem('llpet',JSON.stringify(S));
const decay=m=>{for(const k in S.st)S.st[k]=Math.max(10,S.st[k]-m*0.3);S.t=Date.now()};
decay((Date.now()-S.t)/60000);
setInterval(()=>{decay(1);save();if(S.view==='home')render()},60000);
const $=id=>document.getElementById(id);
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('s');clearTimeout(t._);t._=setTimeout(()=>t.classList.remove('s'),1800)}
// Hook for LeonLink Kids games: LeonLinkPet.addTokens(10), postMessage({type:'leonlink-tokens',amount:10}), or ?earn=10
window.LeonLinkPet={addTokens(n){n=Math.max(0,n|0);S.tokens+=n;save();render();toast('+'+n+' 🪙 tokens!')},get tokens(){return S.tokens}};
addEventListener('message',e=>{if(e.data&&e.data.type==='leonlink-tokens')LeonLinkPet.addTokens(e.data.amount)});
function go(v){S.view=v;save();render()}
function eff(i){const m={h:'🍗',j:'😊',c:'🫧',en:'⚡'};return Object.keys(m).filter(k=>i[k]).map(k=>m[k]+'+'+i[k]).join(' ')}
function buy(id){const i=ALL.find(x=>x.id===id);if(S.tokens<i.p)return toast('Need more tokens! Play games 🎮');
 if(i.keep||i.wear){if(S.owned[id])return;S.owned[id]=1}else S.inv[id]=(S.inv[id]||0)+1;
 S.tokens-=i.p;save();render();toast('Bought '+i.e+' '+i.n+'!')}
function use(id){const i=ALL.find(x=>x.id===id);if(!S.inv[id])return;S.inv[id]--;
 for(const k of['h','j','c','en'])if(i[k])S.st[k]=Math.min(100,S.st[k]+i[k]);save();render();bounce();toast(S.name+' loved the '+i.n+'! '+i.e)}
function place(id){const k=S.placed.indexOf(id);k>=0?S.placed.splice(k,1):S.placed.push(id);save();render()}
function wear(id){S.wear=S.wear===id?null:id;save();render()}
function buyHome(id){const h=HOMES.find(x=>x.id===id);if(S.homes.includes(id)){S.home=id;save();return go('home')}
 if(S.tokens<h.p)return toast('Need '+h.p+' tokens for the '+h.n);S.tokens-=h.p;S.homes.push(id);S.home=id;save();go('home');toast('Welcome to your new '+h.n+'! '+h.e)}
function bounce(){const p=document.querySelector('.pet');if(p){p.classList.remove('bounce');void p.offsetWidth;p.classList.add('bounce')}}
function pat(){S.st.j=Math.min(100,S.st.j+2);save();bounce();render()}
function nap(){S.st.en=Math.min(100,S.st.en+30);S.st.h=Math.max(10,S.st.h-5);save();render();toast(S.name+' had a nap 💤')}
function mood(){const a=(S.st.h+S.st.j+S.st.c+S.st.en)/4;
 if(S.st.h<30)return'😋 Hungry!';if(S.st.c<30)return'🫧 Needs a bath';if(S.st.en<30)return'💤 Sleepy';if(S.st.j<30)return'😢 Wants to play';
 return a>75?'😍 Super happy':'🙂 Doing fine'}
function adoptView(){return `<div class="card"><h2>Adopt your LeonLink pet! 🐾</h2><p>Pick a friend and give them a name. Earn tokens in LeonLink Kids games and spend them on food, toys, outfits and a dream home.</p>
<div class="row"><input id="pn" placeholder="Pet name" maxlength="14" value="${S.name||''}"></div><br><div class="grid">${PETS.map(p=>`<div class="item"><div class="e">${p.e}</div><div class="n">${p.n}</div><button onclick="adopt('${p.id}')">Adopt</button></div>`).join('')}</div></div>`}
function adopt(id){const n=$('pn').value.trim();if(!n)return toast('Give your pet a name first!');S.pet=id;S.name=n;save();go('home');toast('Say hi to '+n+'! 🎉')}
function homeView(){const h=HOMES.find(x=>x.id===S.home),p=PETS.find(x=>x.id===S.pet),w=S.wear&&ALL.find(x=>x.id===S.wear);
 const furn=S.placed.map((id,i)=>`<span class="furn" style="left:${6+(i%6)*15}%;${i%2?'right:auto':''}">${ALL.find(x=>x.id===id).e}</span>`).join('');
 const bar=(k,l)=>`<div>${l} ${Math.round(S.st[k])}%<div class="bar"><i style="width:${S.st[k]}%"></i></div></div>`;
 const food=ALL.filter(i=>S.inv[i.id]>0);
 return `<div class="card"><div class="row"><h2 style="margin:0">${S.name} the ${p.n}</h2><span style="opacity:.7">· lives in the ${h.e} ${h.n}</span></div><br>
 <div class="home" style="background:${h.bg}"><span class="mood">${mood()}</span>${furn}<div class="pet" onclick="pat()" title="Pat me!">${p.e}${w?`<span class="acc">${w.e}</span>`:''}</div></div>
 <div class="bars">${bar('h','🍗 Food')}${bar('j','😊 Joy')}${bar('c','🫧 Clean')}${bar('en','⚡ Energy')}</div></div>
 <div class="card"><h3>🎒 Backpack</h3>${food.length?`<div class="grid">${food.map(i=>`<div class="item"><div class="e">${i.e}</div><div class="n">${i.n} ×${S.inv[i.id]}</div><div class="d">${eff(i)}</div><button onclick="use('${i.id}')">Use</button></div>`).join('')}</div>`:'<p>Empty! Visit the 🛍️ Pet Shop.</p>'}
 <div class="row" style="margin-top:10px"><button onclick="nap()">💤 Nap (free)</button><button onclick="pat()">🤗 Pat (free)</button></div></div>
 <div class="card"><h3>🛋️ Decorate & dress up</h3><div class="row">${ALL.filter(i=>S.owned[i.id]).map(i=>i.keep?`<button class="${S.placed.includes(i.id)?'on':''}" onclick="place('${i.id}')">${i.e} ${i.n}</button>`:`<button class="${S.wear===i.id?'on':''}" onclick="wear('${i.id}')">${i.e} ${i.n}</button>`).join('')||'<p>Buy furniture and outfits in the shop.</p>'}</div></div>`}
function shopView(){return `<div class="card"><h2>🛍️ LeonLink Pet Shop</h2><div class="row tabs">${Object.keys(TABS).map(t=>`<button class="${S.tab===t?'on':''}" onclick="S.tab='${t}';render()">${TABS[t]}</button>`).join('')}</div><br>
 <div class="grid">${SHOP[S.tab].map(i=>{const own=(i.keep||i.wear)&&S.owned[i.id];return `<div class="item"><div class="e">${i.e}</div><div class="n">${i.n}</div><div class="d">${i.keep?'Decorate your home':i.wear?'Your pet can wear it':eff(i)}${S.inv[i.id]?' · have '+S.inv[i.id]:''}</div><div class="price">🪙 ${i.p}</div><button ${own||S.tokens<i.p?'disabled':''} onclick="buy('${i.id}')">${own?'Owned ✓':'Buy'}</button></div>`}).join('')}</div></div>`}
function homesView(){return `<div class="card"><h2>🏡 Where pets live</h2><p>Unlock new homes with your tokens and move in any time.</p><div class="grid">${HOMES.map(h=>{const o=S.homes.includes(h.id);return `<div class="item"><div style="height:70px;border-radius:12px;background:${h.bg};font-size:40px;line-height:70px">${h.e}</div><div class="n">${h.n}</div><div class="d">${h.d}</div><div class="price">${o?'Unlocked':'🪙 '+h.p}</div><button ${S.home===h.id||(!o&&S.tokens<h.p)?'disabled':''} onclick="buyHome('${h.id}')">${S.home===h.id?'Living here':o?'Move in':'Unlock'}</button></div>`}).join('')}</div></div>`}
let G=null;
function playView(){return `<div class="card"><h2>🎮 Earn tokens: Star Catch</h2><p>Tap the stars before they vanish! Each ⭐ = 1 token, each 🌟 = 3. In LeonLink Kids every game you play adds tokens here.</p><button onclick="startGame()">Start 20-second round</button> <b id="gs"></b><br><br><div id="game"></div></div>`}
function startGame(){if(G)return;let left=20,got=0;const box=$('game');box.innerHTML='';
 const spawn=()=>{const s=document.createElement('span');const big=Math.random()<.2;s.className='star';s.textContent=big?'🌟':'⭐';s.style.left=Math.random()*88+'%';s.style.top=Math.random()*80+'%';
  s.onclick=()=>{got+=big?3:1;s.remove();$('gs').textContent='Caught: '+got};box.appendChild(s);setTimeout(()=>s.remove(),1100)};
 const sp=setInterval(spawn,550);G=setInterval(()=>{left--;$('gs').textContent=`⏱ ${left}s · Caught: ${got}`;if(left<=0){clearInterval(sp);clearInterval(G);G=null;box.innerHTML='';LeonLinkPet.addTokens(got)}},1000)}
function render(){$('tok').textContent=S.tokens;
 const v=S.pet?S.view:'adopt';$('nav').innerHTML=S.pet?[['home','🏠 My Pet'],['shop','🛍️ Pet Shop'],['homes','🏡 Homes'],['play','🎮 Earn Tokens']].map(([k,l])=>`<button class="${v===k?'on':''}" onclick="go('${k}')">${l}</button>`).join(''):'';
 if(G&&v==='play')return;$('app').innerHTML={adopt:adoptView,home:homeView,shop:shopView,homes:homesView,play:playView}[v]()}
const q=new URLSearchParams(location.search).get('earn');if(q){S.tokens+=Math.max(0,+q|0);save();history.replaceState(null,'',location.pathname)}
render();
