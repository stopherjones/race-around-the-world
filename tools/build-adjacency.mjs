// Builds data/adjacency.js: which regions border each other, from pairs of places in different regions
// within RING_KM of each other. Run after editing data/regions/*.js:
//   node tools/build-adjacency.mjs
import fs from "fs";
const RING_KM=650;
const rows=fs.readFileSync("data/gazetteer.js","utf8").match(/var GAZETTEER=("(?:[^"\\]|\\.)*");/s);
const places=JSON.parse(rows[1]).split(";").filter(Boolean).map(r=>{const p=r.split("|");return{id:p[0],la:+p[2],lo:+p[3],region:p[5]}});
const km=(a,b)=>{const R=Math.PI/180,x=(b.lo-a.lo)*R*Math.cos((a.la+b.la)/2*R),y=(b.la-a.la)*R;return Math.sqrt(x*x+y*y)*6371};
// Hand-set crossings in data.js also link regions, even when the places are far apart
const dataJs=fs.readFileSync("data.js","utf8");
const regionOf=Object.fromEntries(places.map(p=>[p.id,p.region]));
const crossings=(dataJs.match(/var CROSSINGS="([^"]*)"/)||[])[1]||"";
const adj={};
const link=(x,y)=>{if(x===y)return;(adj[x]=adj[x]||new Set()).add(y);(adj[y]=adj[y]||new Set()).add(x)};
crossings.split("|").filter(Boolean).forEach(c=>{const [f,t]=c.split(" ");if(regionOf[f]&&regionOf[t])link(regionOf[f],regionOf[t])});
for(let i=0;i<places.length;i++)for(let j=i+1;j<places.length;j++){
  const a=places[i],b=places[j];
  if(a.region===b.region||km(a,b)>RING_KM)continue;
  link(a.region,b.region);
}
const out={};Object.keys(adj).sort().forEach(k=>out[k]=[...adj[k]].sort());
fs.writeFileSync("data/adjacency.js","// Regions that border each other: a place in one is within "+RING_KM+" km of a place in the other, or a hand-set crossing joins them\nvar REGION_ADJ="+JSON.stringify(out)+";\n");
console.log(JSON.stringify(out));
