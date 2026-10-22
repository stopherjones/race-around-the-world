# Adding map data

The map is built from region files. Adding a place or a region is mostly data work, and the checker tells you when something is wrong.

## Quick workflow

1. Edit or add a file in `data/regions/`.
2. Run `node tools/build-gazetteer.mjs` and `node tools/build-adjacency.mjs`.
3. Run `node tools/check-world.mjs`. Fix every ERROR. Exit code 0 means it passes.
4. Load the game and try a journey into the area.

## Places

Each place is one row inside a region file's string, separated by `;`:

    id|Name|latitude|longitude|country|flags

- **id:** 2 to 6 lower-case letters or digits, unique across all regions. Pick a short code, such as `cph` for Copenhagen. It must be unique across the whole project.
- **Name:** shown to the player.
- **latitude, longitude:** decimal degrees.
- **country:** one capital letter. It sets the price level and which places can be linked by bus and rail. Every country letter needs an entry in `IDX` in `game.js`.
- **flags:** any of these letters, and at most one digit:
  - `r` rail station
  - `a` airport
  - `p` port (ferries can leave from here)
  - `h` high-speed rail
  - `l` landmark (not a destination city)
  - a digit `1` to `3` for size. No digit means size 1. Size 2 and 3 places count as destination cities.

## Regions

A region is a file in `data/regions/` with one variable, named `REGION_` followed by the name in capitals, for example `REGION_SCANDINAVIA`. To add one:

1. Create the file, following the existing ones.
2. Add its name to `REGION_ORDER` in `data/regions/index.js`.
3. Add it to `REGION_VARS` in `game.js`, for example `east:"REGION_EAST"`.
4. Append its new place ids to `PLACE_ORDER` in `data.js`. Places missing from this list are dropped.
5. If it uses a country letter that isn't already in `IDX`, add one. The value is a price multiplier: about 1 is typical, higher is dearer.

## Crossings

Ferries and other fixed links go in `CROSSINGS` in `data.js`, one per `|`:

    from to mode hours [cost] [departHour everyNDays]

- **mode:** `ferry`, `rail`, `bus`, `hsr`, `air`.
- **hours, cost:** travel time and fare. Cost is optional for ferries and uses the default if left out.
- **departHour everyNDays:** for ferries with a timetable. `22.5 1` means a sailing at 22:30 every day. `8.5 2` means 08:30 every other day.

Nearby places in different regions are linked automatically, so a border only needs a crossing if there's no short rail or bus link across it. A hand-set crossing also counts as a link between its two regions, so a region with no nearby neighbour, such as an island, only needs one crossing to be reachable.

## Things to check

- **Reachable:** every region must connect to the rest through the border table, otherwise the checker reports it.
- **Costs:** a new country letter with no `IDX` entry is an error.
- **Corridor:** long detours need a wide corridor. If a journey that should work says "no route found", check it against the full network before changing data.
- **Budgets:** the starting income is £350 per leg. Far-away destinations may need the income raised.
- **Sanity:** real services differ a lot between countries. Check a few journeys and adjust the hours and costs where they look wrong.

## Commands

    node tools/build-gazetteer.mjs     # rebuild the place index
    node tools/build-adjacency.mjs     # rebuild the border table
    node tools/check-world.mjs         # check everything
