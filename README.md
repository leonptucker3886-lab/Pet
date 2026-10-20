# LeonLink Kids – Pet 🐾

Virtual pet for LeonLink Kids. Kids earn **tokens** by playing games and spend them on their pet.

## 3D pet (v2)
- Real-time 3D pet and homes built with three.js: chunky low-poly shapes, no textures, loads fast on phones.
- **Interact:** tap the head to pat, tap the tummy to tickle, tap the floor to make the pet walk there, swipe to turn, pinch to zoom.
- Quick buttons: Feed, Play, Wash, Pat, Nap, 📸 Photo, 🔊 mute. Food flies to the pet's mouth, toys get chased, bubbles at bath time, snores at nap time.
- Hats, shades and the crown sit on the 3D pet. Furniture appears in the room. Each home is its own 3D scene.
- **Grows up:** the pet starts as a baby and gets bigger each day the kids come back (up to day 9).
- **Daily gift:** +10 tokens on each new day.
- **Picture-only reminders:** a hungry pet rubs its tummy, and other needs make it wave and show an icon.
- The pet never dies or runs away. Stats stop at 10%.
- Relative paths, so it can be served from leonlink.net/kids/pet/.

## Features
- **Adopt**: Puppy, Kitten, Bunny, Dragon, Unicorn or Penguin, with a custom name.
- **Pet care**: Food, Joy, Clean and Energy stats that slowly drop over time. Free nap and pat actions.
- **Pet Shop**: 28 items in 5 aisles: Food, Care, Toys, Furniture (decorate the home) and Style (hats, crown, shades).
- **Homes (where pets live)**: Cozy Room (free), Sunny Garden 60, Treehouse 120, Beach Hut 180, Royal Castle 300, Space Station 500.
- **Earn Tokens**: built-in Star Catch mini-game. New players start with 50 tokens.
- Progress saves in the browser (localStorage).

## Connecting LeonLink Kids games
Any game can award tokens:
- Same page: `LeonLinkPet.addTokens(10)`
- Game in an iframe: `parent.postMessage({type:'leonlink-tokens', amount:10}, '*')`
- Redirect link: `https://<site>/?earn=10`

Note: tokens are stored on the device for now. For real accounts, move tokens to a backend so they can't be edited.

## Files
`index.html`, `style.css`, `data.js` (pets, shop items, homes, prices), `app.js` (game logic), `scene3d.js` (3D scene). Static site, no build step.
