# Role Around the World

A solo travel RPG: travel from place to place, manage your time and money, discover new sights, and keep a journal of your journey. Choose services as you go, balancing timetables, terminals, fares and overnight stays.

## Files
- `index.html` loads everything (MapLibre is loaded from the jsDelivr CDN by `map.js` when first needed)
- `game.js` game logic and the journey overlay layers (places, your route, ferries) on the shared map
- `map.js` the shared MapLibre map (one instance for the whole game; strips basemap labels except road names; streets, satellite and hybrid modes)
- `lastmile.js` the last-mile challenge (loads MapLibre only when you reach the destination)
- `config.js` map sources for the last mile: vector style and satellite tiles (set a keyed satellite provider here before a public launch)
- `data.js` places and hand-set crossings (edit these to add towns or ferries)
- `styles.css` styling, light and dark

## Run locally
Browsers block `fetch` from `file://`, so use a tiny server:
`python3 -m http.server` then open http://localhost:8000

## Host on GitHub Pages
1. Put these files in a repo (keep the `data/` folder).
2. Settings, Pages, deploy from the `main` branch root.
3. Open `https://<you>.github.io/<repo>/`

## Adding places
In `data.js`, each place is `id|Name|lat|lon|country|flags`. Flags: `r` rail, `a` airport, `p` port, `h` high-speed rail, `l` landmark, and a digit 1 to 3 for size. Country codes also drive prices and landmasses (see `IDX` and `G()` in `game.js`). Ferries and other special links go in `CROSSINGS` as `from to mode hours cost`.

## Last-mile challenge
When you reach the destination, a landmark photo from Wikipedia appears and you pin where it was taken. The photo is a notable sight within 10 km of the destination city.
Distance off becomes time lost (4.5 km/h) and is added to your arrival time. If the photo or map cannot load, a "Skip the last mile" button lets you finish with no penalty.

## Starting a journey
Each journey starts at a hub drawn by weight from `START_HUBS` in `config.js` (London only by default). The destination is a random city in the distance band for its own region, set in `DISTANCE_BANDS` in `config.js`; regions not listed use the `default` band of 1,000 to 2,000 km. Cities are places of size 2 or 3 plus the `EXTRA_CITIES` list in `data.js`.

## Planning phase
Before leaving, you see the destination's name and tap where you think it is on the unlabelled map. Error converts to time at `PLAN_KM_PER_H` (150 km per hour, capped at `PLAN_MAX_H` = 8 h), which delays your departure.

## Choosing how to travel
Before setting off, a short overview introduces the kinds of connections available between your start and destination. The overview is a built-in sentence, with no AI call. Then choose individual services as you travel; fares and timetables are shown at each stop. Destination introductions are generated through the Groq proxy (`FLAVOUR_URL` in `game.js`).
