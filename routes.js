// Whole-journey options. Each option is forced through a different gateway (a ferry or the high-speed link across the water),
// so the choices are genuinely different corridors, not the same route with different weights.
function routeOptions(){
 var from=S.start,to=S.goal,B=S.budget,dd=hav(from,to),cands=[];
function fam(j){var e=E[j];if(e.m=="ferry"){var u=G(e.a)==1?e.a:G(e.b)==1?e.b:e.a;return u}return e.m=="hsr"?"tunnel":"dov"}
 function gateOf(steps,fromNode){var cur=fromNode,best=null;steps.forEach(function(s){var e=E[s.j];if(!best&&(e.m=="ferry"||G(e.a)!=G(e.b)&&e.m!="air"))best=s.j;cur=s.to});return best}
 function add(steps,tag){
  if(!steps)return;var r=run(steps,false);if(r.c>B*1.1)return;var sn={},rep=false;r.names.forEach(function(n){if(sn[n])rep=true;sn[n]=1});if(rep)return;
  cands.push({steps:steps,h:r.h,c:r.c,nights:r.nights.reduce(function(a,b){return a+b},0),aboard:r.aboard,names:r.names,gate:gateOf(steps,from),tag:tag});var c=cands[cands.length-1];c.fam=c.gate===null?null:fam(c.gate)
 }
 add(plan(0,B,{vt:60}),"fast");add(plan(0,B,{vt:2}),"cheap");
 E.forEach(function(e,j){
  if(!(e.m=="ferry"||G(e.a)!=G(e.b)&&e.m!="air"))return;
  [[e.a,e.b],[e.b,e.a]].forEach(function(p){
   if(hav(from,p[0])+hav(p[1],to)>1.35*dd+60)return;
   var s1=p[0]==from?[]:plan(0,B,{from:from,to:p[0],vt:20,nb:1});if(s1===null)return;
   var s2=p[1]==to?[]:plan(0,B,{from:p[1],to:to,g:grp(e.m),vt:20,nb:1});if(s2===null)return;
   add(s1.concat([{j:j,to:p[1]}]).concat(s2),"gate")})
 });
 // drop duplicates (same node sequence)
 var seen={};cands=cands.filter(function(c){var k=c.names.join(">");if(seen[k])return false;seen[k]=1;return true});
 if(!cands.length)return[];
 var out=[],used={};
 function take(label,pick){var c=pick(cands.filter(function(x){return out.indexOf(x)<0&&(x.fam===null||!used[x.fam])}));if(!c)c=pick(cands.filter(function(x){return out.indexOf(x)<0}));if(!c)return;c.label=label;out.push(c);if(c.fam!==null)used[c.fam]=1}
 function min(f){return function(l){var b=null;l.forEach(function(x){if(!b||f(x)<f(b))b=x});return b}}
 take("Express",min(function(x){return x.h+x.c/200}));
 take("Thrifty",min(function(x){return x.c+x.h*0.5}));
 var ex=out[0],th=out[1];
 if(ex&&th){ // a third option only if it sits between the other two (cheaper than Express, faster than Thrifty) on a different crossing
  var mid=cands.filter(function(x){return out.indexOf(x)<0&&x.c<ex.c*.97&&x.h<th.h*.95&&(x.fam===null||!used[x.fam])}),b=min(function(x){return x.h+x.c/15+6*x.nights-(x.aboard?3:0)})(mid);
  if(b){b.label="Alternative";out.push(b);if(b.fam!==null)used[b.fam]=1}
 }
 routeOptions.cands=cands;
 return out.map(function(o,i){
  var ge=o.gate===null?null:E[o.gate],gate=!ge?"no sea crossing":N[ge.a].n+" to "+N[ge.b].n+(ge.m=="ferry"?" ferry":ge.m=="hsr"?" high-speed train":" coach");
  if(o.label=="Alternative")o.label=o.aboard>0&&o.nights==0?"Night crossing":"Alternative";
  o.gateName=gate;return o})
}
function routeBrief(o){return o.label+": "+o.h.toFixed(1)+" h, \u00a3"+Math.round(o.c)+", "+o.nights+" hotel night"+(o.nights==1?"":"s")+", "+o.aboard+" night"+(o.aboard==1?"":"s")+" aboard; "+o.gateName+"; "+o.names.map(function(n){return N[n].n}).join(" > ")}
