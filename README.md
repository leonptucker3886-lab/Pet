# LeonLink Kids – Pet 🐾

Virtual pet for LeonLink Kids. Kids earn **tokens** by playing games and spend them on their pet.

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
`index.html`, `style.css`, `data.js` (pets, shop items, homes, prices), `app.js` (game logic). Static site, no build step.
