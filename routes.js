// Route options: three route profiles for the current journey (call after newJourney has set S).
// Fast = quickest, Thrifty = cheapest, Cultural = passes through the most culturally rich places.
// Ferries, night services and sleepers appear only if the transport engine finds them worthwhile.
function cultRating(n){var p=N[n];if(CULTURE[n]!==undefined)return CULTURE[n];return p.s>=3?3:p.s==2?2:EXTRA_CITIES.indexOf(n)>-1?1:0}
function isMajor(e){return G(e.a)!=G(e.b)||e.m=="hsr"||e.m=="air"||hav(e.a,e.b)>250}
function routeInfo(steps,B){
 var r=run(steps,false),seen={},rep=false;
 r.names.forEach(function(n){if(seen[n])rep=true;seen[n]=1});
 if(rep||r.c>B*1.1)return null;
 var mid=r.names.slice(1,-1),wp={},cult=0,nights=0;
 mid.forEach(function(n){if(N[n].s>=2||N[n].p)wp[n]=1;cult+=cultRating(n)});
 steps.forEach(function(s){if(isMajor(E[s.j]))wp["e"+s.j]=1});
 r.nights.forEach(function(x){nights+=x});
 return{steps:steps,h:r.h,c:r.c,nights:nights,aboard:r.aboard,names:r.names,modes:r.modes,mid:mid,wp:wp,cult:cult}
}
function routeDist(a,b){var u={},n=0;Object.keys(a.wp).forEach(function(k){u[k]=1});Object.keys(b.wp).forEach(function(k){if(u[k])n++;u[k]=1});var t=Object.keys(u).length;return t?1-n/t:0}
function routePool(B){
 var pool=[],seen={},from=S.start,to=S.goal,dd=hav(from,to);
 function add(steps){if(!steps||!steps.length)return;var r=routeInfo(steps,B);if(!r)return;var k=r.names.join(">");if(seen[k])return;seen[k]=1;pool.push(r)}
 [60,25,10,4,2].forEach(function(vt){(vt==60||vt==2?[0,.3,.3,.3]:[0,.3]).forEach(function(nz){add(plan(nz,B,{vt:vt}))})});
 Object.keys(N).forEach(function(n){
  if(n==from||n==to||cultRating(n)<3||hav(from,n)+hav(n,to)>1.25*dd+40)return;
  [12].forEach(function(vt){
   var s1=plan(0,B,{from:from,to:n,vt:vt,nb:1});if(!s1)return;
   var g=s1.length?grp(E[s1[s1.length-1].j].m):S.term,s2=plan(0,B,{from:n,to:to,g:g,vt:vt,nb:1});if(!s2)return;
   add(s1.concat(s2))})
 });
 return pool
}
function routeOptions(B){
 B=B||S.budget;var pool=routePool(B);if(!pool.length)return[];
 var fast=pool.slice().sort(function(x,y){return x.h-y.h||x.c-y.c})[0],picked=[fast],out=[mkOpt(fast,"Fast")];
 var far=function(r){return picked.every(function(o){return routeDist(r,o)>=.3})};
 var cheap=pool.filter(far).sort(function(x,y){return x.c-y.c||x.h-y.h})[0];
 if(cheap&&cheap.c<fast.c*.9){picked.push(cheap);out.push(mkOpt(cheap,"Thrifty"))}
 var th=out.length>1?picked[1]:null,maxc=Math.max.apply(null,picked.map(function(o){return o.cult}));
 var cul=pool.filter(function(x){return far(x)&&x.cult>maxc&&x.c<=fast.c*.9&&x.h<=Math.max(th?th.h*1.1:0,fast.h*3.5)}).sort(function(x,y){return y.cult-x.cult||x.h-y.h})[0];
 if(cul){picked.push(cul);out.push(mkOpt(cul,"Cultural"))}
 return out
}
function mkOpt(r,label){
 var via=r.mid.filter(function(n){return cultRating(n)>=2||N[n].p}).sort(function(a,b){return cultRating(b)-cultRating(a)}).slice(0,3).map(function(n){return N[n].n});
 return{label:label,h:r.h,c:r.c,nights:r.nights,aboard:r.aboard,cult:r.cult,via:via,mid:r.mid,steps:r.steps,names:r.names,modes:r.modes}
}
function routeBrief(o){return o.label+": "+o.h.toFixed(1)+" h, \u00a3"+Math.round(o.c)+", "+o.nights+" hotel, "+o.aboard+" aboard, culture "+o.cult+"; "+o.names.map(function(n,i){return N[n].n+(i<o.modes.length?" ["+o.modes[i]+"]":"")}).join(" > ")}
