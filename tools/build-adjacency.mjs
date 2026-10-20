// Builds data/adjacency.js: which regions border each other, from pairs of places in different regions
// within RING_KM of each other. Run after editing data/regions/*.js:
//   node tools/build-adjacency.mjs
import fs from "fs";
const RING_KM=650;
const rows=fs.readFileSync("data/gazetteer.js","utf8").match(/var GAZETTEER=("(?:[^"\\]|\\.)*");/s);
const places=JSON.parse(rows[1]).split(";").filter(Boolean).map(r=>{const p=r.split("|");return{id:p[0],la:+p[2],lo:+p[3],region:p[5]}});
const km=(a,b)=>{const R=Math.PI/180,x=(b.lo-a.lo)*R*Math.cos((a.la+b.la)/2*R),y=(b.la-a.la)*R;return Math.sqrt(x*x+y*y)*6371};
const adj={};
for(let i=0;i<places.length;i++)for(let j=i+1;j<places.length;j++){
  const a=places[i],b=places[j];
  if(a.region===b.region||km(a,b)>RING_KM)continue;
  (adj[a.region]=adj[a.region]||new Set()).add(b.region);
  (adj[b.region]=adj[b.region]||new Set()).add(a.region);
}
const out={};Object.keys(adj).sort().forEach(k=>out[k]=[...adj[k]].sort());
fs.writeFileSync("data/adjacency.js","// Regions that border each other: a place in one is within "+RING_KM+" km of a place in the other\nvar REGION_ADJ="+JSON.stringify(out)+";\n");
console.log(JSON.stringify(out));
