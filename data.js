// LeonLink Kids Pet – catalogue. Stats: h=hunger, j=joy, c=clean, en=energy
const PETS=[{id:'pup',e:'🐶',n:'Puppy'},{id:'kit',e:'🐱',n:'Kitten'},{id:'bun',e:'🐰',n:'Bunny'},{id:'dra',e:'🐲',n:'Dragon'},{id:'uni',e:'🦄',n:'Unicorn'},{id:'pen',e:'🐧',n:'Penguin'}];
const HOMES=[
{id:'room',e:'🛏️',n:'Cozy Room',p:0,bg:'linear-gradient(#3a2a4a,#5b3b5b 70%,#7a4a3a 70%)',d:'Every pet starts here.'},
{id:'garden',e:'🌻',n:'Sunny Garden',p:60,bg:'linear-gradient(#7fd3ff,#bdeeff 60%,#4caf50 60%)',d:'Grass, flowers and sunshine.'},
{id:'tree',e:'🌳',n:'Treehouse',p:120,bg:'linear-gradient(#2e7d32,#8bc34a 65%,#6d4c41 65%)',d:'High up in the leaves.'},
{id:'beach',e:'🏖️',n:'Beach Hut',p:180,bg:'linear-gradient(#4fc3f7,#b3e5fc 55%,#ffe082 55%)',d:'Waves and sandcastles.'},
{id:'castle',e:'🏰',n:'Royal Castle',p:300,bg:'linear-gradient(#311b92,#7e57c2 65%,#9e9e9e 65%)',d:'Live like royalty!'},
{id:'space',e:'🚀',n:'Space Station',p:500,bg:'radial-gradient(circle at 70% 20%,#ff3fb455,transparent 30%),linear-gradient(#000010,#141440 70%,#2a2a5a 70%)',d:'Float among the stars.'}];
const SHOP={
food:[{id:'apple',e:'🍎',n:'Apple',p:5,h:15},{id:'carrot',e:'🥕',n:'Carrot',p:5,h:15},{id:'fish',e:'🐟',n:'Fish',p:10,h:25},{id:'bone',e:'🦴',n:'Bone',p:10,h:25},{id:'pizza',e:'🍕',n:'Pizza Slice',p:15,h:35,j:5},{id:'cake',e:'🎂',n:'Party Cake',p:30,h:50,j:20}],
care:[{id:'soap',e:'🧼',n:'Bubble Soap',p:8,c:40},{id:'brush',e:'🪥',n:'Brush',p:8,c:30},{id:'bath',e:'🛁',n:'Bubble Bath',p:20,c:100},{id:'potion',e:'🧪',n:'Energy Potion',p:25,en:60},{id:'medkit',e:'🩹',n:'Get-Well Kit',p:20,h:20,j:20,c:20,en:20}],
toys:[{id:'ball',e:'⚽',n:'Ball',p:15,j:25},{id:'yarn',e:'🧶',n:'Yarn Ball',p:15,j:25},{id:'kite',e:'🪁',n:'Kite',p:30,j:40},{id:'teddy',e:'🧸',n:'Teddy',p:40,j:45},{id:'game',e:'🎮',n:'Mini Console',p:60,j:60}],
furniture:[{id:'plant',e:'🪴',n:'Plant',p:20,keep:1},{id:'lamp',e:'🪔',n:'Glow Lamp',p:30,keep:1},{id:'bed',e:'🛏️',n:'Comfy Bed',p:50,keep:1},{id:'tv',e:'📺',n:'TV',p:70,keep:1},{id:'tent',e:'⛺',n:'Play Tent',p:80,keep:1},{id:'fountain',e:'⛲',n:'Fountain',p:120,keep:1}],
style:[{id:'bow',e:'🎀',n:'Bow',p:25,wear:1},{id:'cap',e:'🧢',n:'Cap',p:30,wear:1},{id:'party',e:'🥳',n:'Party Hat',p:35,wear:1},{id:'glasses',e:'🕶️',n:'Cool Shades',p:40,wear:1},{id:'tophat',e:'🎩',n:'Top Hat',p:60,wear:1},{id:'crown',e:'👑',n:'Crown',p:100,wear:1}]};
const TABS={food:'🍎 Food',care:'🧼 Care',toys:'⚽ Toys',furniture:'🛋️ Furniture',style:'👑 Style'};
const ALL=Object.values(SHOP).flat();
