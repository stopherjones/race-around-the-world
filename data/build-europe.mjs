// Builds data/europe.json: Natural Earth countries (via world-atlas), trimmed to Europe and simplified.
// Usage: npm i world-atlas topojson-client topojson-server topojson-simplify d3-geo && node tools/build-europe.mjs
import fs from "fs";
import {createRequire} from "module";
import {feature} from "topojson-client";
import {topology} from "topojson-server";
import {presimplify, simplify, quantile} from "topojson-simplify";
import {geoCentroid} from "d3-geo";
const require = createRequire(import.meta.url);
const world = JSON.parse(fs.readFileSync(require.resolve("world-atlas/countries-50m.json"), "utf8"));
const all = feature(world, world.objects.countries).features;
const keep = all.filter(f => {
  const [lo, la] = geoCentroid(f);
  return lo > -25 && lo < 45 && la > 28 && la < 72;
});
let topo = topology({countries: {type: "FeatureCollection", features: keep}}, 1e5);
topo = presimplify(topo);
topo = simplify(topo, quantile(topo, 0.55));
fs.writeFileSync("data/europe.json", JSON.stringify(topo));
console.log("countries:", keep.length, "bytes:", fs.statSync("data/europe.json").size);
