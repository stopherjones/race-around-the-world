// Builds data/gazetteer.js: one line per place with its region and flags, for destination choice and
// planning which regions a route can reach. Run after editing data/regions/*.js:
//   node tools/build-gazetteer.mjs
import fs from "fs";
const regions=fs.readdirSync("data/regions").filter(f=>f.endsWith(".js")&&f!=="index.js");
const rows=[];
for(const f of regions){
  const src=fs.readFileSync("data/regions/"+f,"utf8");
  const m=src.match(/var REGION_\w+="((?:[^"\\]|\\.)*)";/s);
  if(!m)continue;
  const region=f.replace(/\.js$/,"");
  m[1].split(";").filter(Boolean).forEach(r=>{const p=r.split("|");rows.push([p[0],p[1],p[2],p[3],p[4],region,p[5]].join("|"))});
}
const out="// Gazetteer: every place with its region and flags (r rail, a airport, p port, h high-speed, l landmark, digit = size)\n"+
  "var GAZETTEER="+JSON.stringify(rows.join(";"))+";\n";
fs.writeFileSync("data/gazetteer.js",out);
console.log("places:",rows.length,"regions:",regions.length,"ports:",rows.filter(r=>r.split("|")[6].includes("p")).length);
