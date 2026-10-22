// Checks the map data before the game uses it. Run from the project folder:
//   node tools/check-world.mjs
// Exits with code 1 if anything is wrong, so it can run before committing changes.
import fs from "fs";
const errors=[],warnings=[];
const err=m=>errors.push(m),warn=m=>warnings.push(m);
const read=f=>fs.readFileSync(f,"utf8");

// 1. Region files: one variable per file, rows in the right format
const regionFiles=fs.readdirSync("data/regions").filter(f=>f.endsWith(".js")&&f!=="index.js");
const regions={},rows=[];
const idIndex=read("data/regions/index.js").match(/REGION_ORDER=(\[[^\]]*\])/);
const declared=idIndex?JSON.parse(idIndex[1]):[];
regionFiles.forEach(f=>{
  const name=f.replace(/\.js$/,"");
  const m=read("data/regions/"+f).match(/var (REGION_\w+)="((?:[^"\\]|\\.)*)";/s);
  if(!m){err(`${f}: no REGION_ variable found`);return}
  if(!declared.includes(name))err(`${f}: not listed in data/regions/index.js`);
  regions[name]=[];
  m[2].split(";").filter(Boolean).forEach((r,i)=>{
    const p=r.split("|");
    if(p.length!==6){err(`${f} row ${i+1}: expected 6 fields (id|name|lat|lon|country|flags), found ${p.length}`);return}
    const [id,nm,la,lo,cc,fl]=p;
    if(!/^[a-z0-9]{2,6}$/.test(id))err(`${f}: id "${id}" should be 2 to 6 lower-case letters or digits`);
    if(!nm.trim())err(`${f}: ${id} has no name`);
    const lat=+la,lon=+lo;
    if(!isFinite(lat)||lat<-90||lat>90)err(`${f}: ${id} latitude "${la}" is out of range`);
    if(!isFinite(lon)||lon<-180||lon>180)err(`${f}: ${id} longitude "${lo}" is out of range`);
    if(!/^[A-Za-z]{1,2}$/.test(cc))err(`${f}: ${id} country code "${cc}" should be one or two letters`);
    if(!/^[rahplc0-9]*$/.test(fl))err(`${f}: ${id} flags "${fl}" use unknown letters (allowed: r a h p l and a digit)`);
    rows.push({id,name:nm,la:lat,lo:lon,cc,fl,region:name,file:f});
    regions[name].push(id);
  });
});
declared.forEach(n=>{if(!regionFiles.includes(n+".js"))err(`data/regions/index.js lists "${n}" but data/regions/${n}.js is missing`)});

// 2. Duplicate ids across regions
const seen={};rows.forEach(r=>{if(seen[r.id])err(`id "${r.id}" appears in both ${seen[r.id]} and ${r.file}`);seen[r.id]=r.file});

// 3. Every region variable is registered in game.js, and the place order includes every place
const game=read("game.js");
const rv=game.match(/var REGION_VARS=(\{[^}]*\});/);
const regionVars=rv?Function("return "+rv[1])():{};
regionFiles.forEach(f=>{
  const name=f.replace(/\.js$/,"");
  if(!regionVars[name])err(`game.js REGION_VARS has no entry for "${name}"`);
});
const data=read("data.js");
const order=(data.match(/var PLACE_ORDER="([^"]*)"/)||[])[1];
if(order===undefined)err("data.js: PLACE_ORDER not found");
else{
  const ord=order.split(" ");
  rows.forEach(r=>{if(ord.indexOf(r.id)<0)err(`${r.id} is missing from PLACE_ORDER in data.js, so it would be dropped`)});
  ord.forEach(id=>{if(!seen[id])warn(`PLACE_ORDER lists "${id}" but no region defines it`)});
}

// 4. Every country code has a cost setting
const idx=game.match(/IDX=(\{[^}]*\})/);
const costs=idx?Function("return "+idx[1])():{};
new Set(rows.map(r=>r.cc)).forEach(cc=>{if(costs[cc]===undefined)err(`country code "${cc}" has no cost setting in IDX (game.js)`)});

// 5. Crossings refer to real places and use the right format
const cross=(data.match(/var CROSSINGS="([^"]*)"/)||[])[1]||"";
cross.split("|").filter(Boolean).forEach(c=>{
  const p=c.split(" ");
  if(p.length<4){err(`crossing "${c}": expected from to mode hours [cost] [departHour everyNDays]`);return}
  if(!seen[p[0]])err(`crossing "${c}": "${p[0]}" is not a known place`);
  if(!seen[p[1]])err(`crossing "${c}": "${p[1]}" is not a known place`);
  if(!isFinite(+p[3])||+p[3]<=0)err(`crossing "${c}": hours "${p[3]}" should be a positive number`);
  if(p[2]==="ferry"&&p[5]!==undefined&&(+p[5]<0||+p[5]>=24))err(`crossing "${c}": departure hour should be 0 to 23`);
});

// 6. Gazetteer and border table are up to date with the regions
const gz=read("data/gazetteer.js");
const gzCount=(gz.match(/var GAZETTEER=("(?:[^"\\]|\\.)*");/s)||[])[1];
if(!gzCount)err("data/gazetteer.js is missing or unreadable: run node tools/build-gazetteer.mjs");
else{
  const n=JSON.parse(gzCount).split(";").filter(Boolean).length;
  if(n!==rows.length)err(`data/gazetteer.js has ${n} places but the regions have ${rows.length}: run node tools/build-gazetteer.mjs`);
}
const adjText=read("data/adjacency.js");
const adj=JSON.parse(adjText.match(/REGION_ADJ=(\{.*?\});/s)[1]);

// 7. Every region can be reached from every other region (through the border table)
const names=Object.keys(regions);
const reach=new Set([names[0]]),queue=[names[0]];
while(queue.length){const r=queue.shift();(adj[r]||[]).forEach(n=>{if(!reach.has(n)){reach.add(n);queue.push(n)}})}
names.forEach(n=>{if(!reach.has(n))err(`region "${n}" cannot be reached from the other regions: add a crossing or a nearby place across a border`)});

// 8. Regions with no places
names.forEach(n=>{if(!regions[n].length)err(`region "${n}" has no places`)});

// Report
console.log(`Checked ${rows.length} places in ${names.length} regions, ${cross.split("|").filter(Boolean).length} crossings.`);
warnings.forEach(w=>console.log("  warning: "+w));
errors.forEach(e=>console.log("  ERROR: "+e));
console.log(errors.length?`${errors.length} error(s). Fix these before playing.`:"No errors.");
process.exit(errors.length?1:0);
