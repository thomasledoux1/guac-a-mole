# Guac-a-Mole

Whack avocados on a chopping board, fill the bowl, make guacamole. A single-page
game built with React, Vite and Three.js, playable with a mouse on desktop and
with taps on a phone.

## Running it

```bash
npm install
npm run dev        # development server
npm run build      # type check, then production build into dist/
npm run preview    # serve the production build
npm test           # unit tests
npm run lint       # Biome check
npm run format     # Biome check with fixes applied
```

Node 20 or newer.

## How the game works

A round lasts 60 seconds. Avocados pop out of a three-by-three grid and you whack
them before they drop back.

- **Ripe avocado** — 10 points, and one more scoop towards the bowl.
- **Brown avocado** — costs 25 points and breaks your streak. Leave it alone.
- **Golden avocado** — 30 points and three extra seconds.
- **Streak** — every three hits in a row raise the multiplier by one, up to 5x. A
  brown avocado or a tap on bare board resets it. Letting an avocado retreat
  un-hit costs nothing.

The bowl on the counter fills with the number of ripe avocados you hit, not with
your score, so it reads as ingredients gathered. Thirty of them fills it. At the
end the camera glides to the bowl and grades the result: Sad Dip, Decent Guac or
Legendary Guac.

Difficulty ramps across the round on three axes at once: avocados stay up for
less time, they arrive more often, and more of them appear at once.

## Layout

```
src/
  game/          Rules and state. No Three.js, no React components.
    config.ts    Every tuning number in the game
    clock.ts     Mutable round clock, deliberately outside React
    difficulty.ts, scoring.ts   Pure functions, unit tested
    store.ts     Zustand store
  three/         The scene. One component per object.
  ui/            DOM overlays: title, HUD, countdown, pause, results
  audio/synth.ts Web Audio sound effects, generated in code
  strings.ts     All user-visible copy
```

The scene ships no asset files. Every shape is built from Three.js primitives:
the board is an extruded outline with nine holes cut through it, the avocado and
the bowl are lathes, and the sounds are synthesised. Swapping in GLTF models
later means changing `three/Avocado.tsx` and `three/Bowl.tsx` and nothing else.

Two pieces of state sit outside React on purpose. `game/clock.ts` holds the round
timer, and `three/malletControl.ts` holds the pointer position. Both change every
frame, and routing them through React state would re-render the tree sixty times
a second. The render loop reads and writes the store through
`useGameStore.getState()` for the same reason.

## Tuning

`src/game/config.ts` holds the round length, the grid layout, the points, the
grade thresholds and the whole difficulty ramp. The numbers there are a first
pass and are meant to be played with.

## Choices worth knowing about

- **Performance.** Device pixel ratio is capped at 2. If the average frame takes
  longer than 1/45 second, shadows switch off for the rest of the session.
- **No backend.** The personal best lives in `localStorage`. Nothing leaves the
  device.
- **Portrait is a first-class layout.** There is no rotate-your-phone wall. The
  camera fits the scene to whatever screen shape it finds, and the title and
  results panels sit below the action rather than on top of it.
- **English only, on purpose.** The studio convention says no hardcoded strings,
  but this game has around twenty of them. They all live in `src/strings.ts`, so
  moving to i18next later is a small job rather than a rewrite.
- **Single package, not a monorepo.** One app, no shared packages, no secrets, so
  Turborepo and Doppler would only add friction. Biome and the shared tsconfig
  from `@nimblestudio` are in place.

## Deploying

Vercel picks up the Vite build with no configuration. `vercel.json` adds the
single-page fallback. `base` in `vite.config.ts` is `/`; a host that serves from
a subpath, such as GitHub Pages, needs that changed to the subpath.

## Link previews

`index.html` carries the Open Graph and Twitter card tags, and `public/og-image.png`
is the 1200x630 preview picture. Two things are easy to get wrong here.

Social crawlers do not run JavaScript, so the tags have to sit in the HTML shell.
Setting them from React works for a browser and shows a blank card everywhere else.
Every URL in them is absolute for the same reason: crawlers do not reliably resolve
relative paths.

The absolute URLs hardcode `https://guac-a-mole.vercel.app`. Moving the game to
another domain means editing `og:url`, `og:image`, `twitter:image` and the canonical
link to match, or the preview will point at the old host.

LinkedIn caches what it scrapes and never re-reads a post that is already published.
After a change, run the URL through the
[Post Inspector](https://www.linkedin.com/post-inspector/) to refresh the cache, then
write a new post. Editing the old one will not bring the picture back.
