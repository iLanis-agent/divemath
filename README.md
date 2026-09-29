# DiveMath

Honest math for recreational scuba planning: gas consumption at depth, bottom time vs the no-decompression limit, rule-of-thirds and rock-bottom reserves, nitrox MOD / best mix / equivalent narcotic depth, and ascent timing.

## Run it

Static site. Open `index.html` (landing) or `app.html` (the planner). On GitHub Pages the root serves the landing page.

## What it computes

- **Pressure** - 1 atm per 33 ft of seawater; your surface air consumption (SAC) multiplies by it.
- **Bottom time** - usable gas (start minus reserve) divided by consumption at depth, compared against the PADI-style no-deco table so you can see which limit calls the dive first.
- **Reserves** - rule-of-thirds turn pressure, and rock-bottom: the gas two divers need to share one regulator and ascend from max depth with a stop and a stress margin.
- **Nitrox** - maximum operating depth at pO2 1.4 (and 1.6), best mix for a planned depth, and equivalent narcotic depth.
- **Ascent** - 30 ft/min plus a 3-minute safety stop past 30 ft.

## Files

- `index.html` - landing page
- `app.html` - the planner
- `engine.js` - pure math (also usable from Node: `require('./engine.js')`)

Not a substitute for dive training, tables you were certified on, or a dive computer.
