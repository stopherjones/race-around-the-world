// Builds dev-map.html: a development map of every place and link, using the game's own link rules.
// Run from the repo root after data changes: node tools/build-dev-map.mjs
import fs from "node:fs";
import vm from "node:vm";

const ctx = {
  console, Math, JSON, Object, Array, String, Number, parseFloat, isFinite,
  document: { getElementById: () => null, createElement: () => ({ style: {} }), head: { appendChild() {} }, addEventListener() {} },
  localStorage: { getItem: () => null, setItem() {} }, setTimeout: () => 0, location: { hash: "" },
};
ctx.window = ctx;
vm.createContext(ctx);
const run = f => { try { vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f }); } catch (e) { /* game.js touches the DOM on load; the rules we need are defined before that */ } };
["data/gazetteer.js", "data/adjacency.js", "data/regions/index.js", "data.js", "config.js"].forEach(run);
fs.readdirSync("data/regions").filter(f => f.endsWith(".js") && f !== "index.js").forEach(f => run("data/regions/" + f));
run("game.js");

const data = vm.runInContext(`(function(){
  var rows = [];
  Object.keys(REGION_VARS).forEach(function(k){ var v = window[REGION_VARS[k]]; if (v) rows = rows.concat(v.split(";").filter(Boolean)); });
  var byId = {}; rows.forEach(function(r){ byId[r.split("|")[0]] = r; });
  var list = PLACE_ORDER.filter(function(id){ return byId[id]; }).map(function(id){ return byId[id]; });
  CROSSINGS = CROSSINGS_ALL;
  loadWorld(list.join(";"));
  buildLinks();
  var places = Object.keys(N).map(function(id){
    var p = N[id];
    return { id: id, name: p.n, lat: p.la, lon: p.lo, cc: p.c, region: regionOf(id) || "", size: p.s };
  });
  var seen = {}, links = [];
  E.forEach(function(e){
    var key = [e.a, e.b].sort().join("~") + "~" + e.m;
    if (seen[key]) return; seen[key] = 1;
    links.push({ a: e.a, b: e.b, m: e.m, km: Math.round(hav(e.a, e.b)), h: e.h, c: e.c });
  });
  return JSON.stringify({ places: places, links: links });
})()`, ctx);

const html = fs.readFileSync("tools/dev-map.template.html", "utf8").replace("/*DATA*/null", () => data);
fs.writeFileSync("dev-map.html", html);
console.log("dev-map.html written");
