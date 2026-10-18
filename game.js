var VT=20,NOISE=.35,KEY="route-generator-v4",S=null,IDX={U:1.15,F:1,B:1.05,N:1.05,G:1.05,S:.85,T:.95,C:1.6,R:1.1};
var N={};
PLACES.split(";").forEach(function(s){var p=s.split("|"),f=p[5];N[p[0]]={n:p[1],la:+p[2],lo:+p[3],c:p[4],r:f.indexOf("r")>-1,a:f.indexOf("a")>-1,p:f.indexOf("p")>-1,h:f.indexOf("h")>-1,l:f.indexOf("l")>-1,s:+(f.match(/\d/)||[1])[0]}});
var MODE={tube:"metro",bus:"bus",coach:"coach",rail:"train",hsr:"fast train",ferry:"ferry",air:"flight"},GRP={rail:"Trains",hsr:"Fast trains",coach:"Coaches",bus:"Buses",ferry:"Ferries",air:"Flights",tube:"Metro"},ORD=["rail","hsr","coach","bus","ferry","air","tube"];
var CARDS={rail:["Rail pass","Train and fast-train fares cost 30% less.",1],prio:["Priority boarding","Ferries and flights take 0.8 h less.",1],fixer:["Local fixer","Cancels your next bad event.",1],guide:["Local guide","Shows every onward option from here, free.",0],purse:["Winnings at cards","Gain \u00a340 now.",0]};

function hav(a,b){var A=N[a],B=N[b],r=Math.PI/180,x=(B.lo-A.lo)*r*Math.cos((A.la+B.la)/2*r),y=(B.la-A.la)*r;return Math.sqrt(x*x+y*y)*6371}
function arrow(a,b){if(a==b)return"\u2713";var A=N[a],B=N[b],r=Math.PI/180,x=(B.lo-A.lo)*Math.cos((A.la+B.la)/2*r),y=B.la-A.la,i=Math.round(((Math.atan2(x,y)/r+360)%360)/45)%8;return["\u2191 N","\u2197 NE","\u2192 E","\u2198 SE","\u2193 S","\u2199 SW","\u2190 W","\u2196 NW"][i]}
function status(){if(S.over)return["\ud83c\udfc1","Finished"];if(S.phase=="plan")return["\ud83e\udded","Planning"];if(S.phase=="lastmile")return["\ud83d\udccd","Last mile"];if(S.phase=="stay")return["\ud83d\udecf\ufe0f","Finding a bed"];return{r:["\ud83d\ude86","Train station"],b:["\ud83d\ude8c","Bus station"],f:["\u26f4\ufe0f","Ferry terminal"],a:["\u2708\ufe0f","Airport"]}[S.term]}
function dir(a,b){var A=N[a],B=N[b],r=Math.PI/180,x=(B.lo-A.lo)*Math.cos((A.la+B.la)/2*r),y=B.la-A.la,g=(Math.atan2(x,y)/r+360)%360;return["north","north-east","east","south-east","south","south-west","west","north-west"][Math.round(g/45)%8]}
function val(a,b,m){
 var d=hav(a,b)*1.25,k=IDX[N[a].c],uk=N[a].c=="U",h,c;
 if(m=="tube"){h=d/28+.15;c=3*k}
 else if(m=="bus"){h=d/45+.4;c=(d*.08+2)*k}
 else if(m=="coach"){h=d/62+.8;c=(d*.045+6)*k}
 else if(m=="rail"){h=d/(uk?85:100)+.4;c=(d*.2+3)*k}
 else if(m=="hsr"){h=d/190+.7;c=(d*.17+15)*k}
 else{d=hav(a,b)*1.05;h=d/700+2.2;c=(d*.12+30)*k}
 return[Math.round(h*10)/10,Math.round(c)]}

var E=[],ADJ={},seen={},ids=Object.keys(N),towns=ids.filter(function(i){return!N[i].l});
function G(i){var c=N[i].c;return c=="U"?1:c=="R"?3:2}
function mk(a,b,m,lg,h,c){
 var k=(a<b?a+b:b+a)+m;if(seen[k])return;seen[k]=1;
 var v=h?[h,c]:val(a,b,m),j=E.length;E.push({a:a,b:b,m:m,h:v[0],c:v[1],lg:lg});
 (ADJ[a]=ADJ[a]||[]).push(j);(ADJ[b]=ADJ[b]||[]).push(j)}
function nn(a,f,k,mx){return towns.filter(function(b){return b!=a&&G(b)==G(a)&&f(b)&&hav(a,b)<=mx}).sort(function(x,y){return hav(a,x)-hav(a,y)}).slice(0,k)}
ids.forEach(function(a){
 if(N[a].l){nn(a,function(){return 1},2,150).forEach(function(b){mk(a,b,hav(a,b)<12?"tube":"bus",0)});return}
 nn(a,function(){return 1},3,120).forEach(function(b){mk(a,b,"bus",0)});
 if(N[a].r)nn(a,function(b){return N[b].r},3,250).forEach(function(b){mk(a,b,"rail",0)})});
towns.forEach(function(a){towns.forEach(function(b){
 if(a>=b)return;var d=hav(a,b),A=N[a],B=N[b],same=G(a)==G(b);
 if(same&&A.r&&B.r&&A.s>1&&B.s>1&&d<650&&!(A.h&&B.h))mk(a,b,"rail",1);
 if(same&&A.h&&B.h&&d<1000)mk(a,b,"hsr",1);
 if(same&&((A.s==3||B.s==3)&&d<320||A.s>1&&B.s>1&&d<650))mk(a,b,"bus",1);
 if(A.a&&B.a&&d>250&&d<1500)mk(a,b,"air",1)})});
CROSSINGS.split("|").forEach(function(s){var p=s.split(" ");mk(p[0],p[1],p[2],p[2]=="ferry"?0:1,+p[3],+p[4])});

function has(k){return S.cards.indexOf(k)>-1}
function opts(all){
 return(ADJ[S.loc]||[]).filter(function(j){return(S.air||E[j].m!="air")&&(all||grp(E[j].m)==S.term)}).map(function(j){
  var e=E[j],h=e.h,c=e.c;
  if((e.m=="rail"||e.m=="hsr")&&has("rail"))c=Math.round(c*.7);
  if((e.m=="ferry"||e.m=="air")&&has("prio"))h=Math.max(.5,Math.round((h-.8)*10)/10);
  return{to:e.a==S.loc?e.b:e.a,m:e.m,h:h,c:c,lg:e.lg}})
}
function vis(){
 var all=opts(),idx=all.map(function(_,i){return i}),loc=idx.filter(function(i){return!all[i].lg}),lg=idx.filter(function(i){return all[i].lg});
 if(S.rev[S.loc+S.term])return{show:loc.concat(lg),hid:0};
 if(N[S.loc].s>=3){
  var sh=lg;
  if(lg.length>8){
   var pk={};
   var top=function(f,n){lg.slice().sort(function(x,y){return f(all[x])-f(all[y])}).slice(0,n).forEach(function(i){pk[i]=1})};
   top(function(o){return hav(o.to,S.goal)},4);top(function(o){return o.h},2);top(function(o){return o.c},2);
   sh=lg.filter(function(i){return pk[i]})}
  return{show:loc.concat(sh),hid:lg.length-sh.length}}
 return{show:loc,hid:lg.length}
}
var WIN={tube:[5.5,23.5],bus:[8,22],rail:[7,22],ferry:[6,21],hsr:[6.5,21],air:[6,21],coach:[6,23]};
function hsh(s){var x=0;for(var i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))%1000;return x}
var HW={tube:.12,bus:.6,rail:.8,hsr:1.5,ferry:2,air:4};
function hdw(o,from){var b=o.lg&&o.m=="bus"?3:o.lg&&o.m=="rail"?2:HW[o.m];return b*[0,1.5,1,.7][N[from].s]}
function nextDep(o,from,t){var H=hdw(o,from),ph=hsh(from+o.to+o.m)/1000*H,n=Math.ceil((8+t-ph)/H-1e-9);return ph+n*H-8}
function sched(o,from,t){
 var d0=nextDep(o,from,t),tod=(8+d0)%24,day=Math.floor((8+d0)/24),w=WIN[o.m];
 if((o.m=="rail"||o.m=="bus")&&o.lg)w=[6,23];
 if(tod>=w[0]&&tod<=w[1])return{dep:d0,night:0};
 if((o.m=="bus"&&o.lg&&hsh(from+o.to+day)%100<60)||(o.m=="rail"&&o.lg&&hsh(from+o.to+day)%100<30))return{dep:d0,night:0,ns:1};
 var ws=(tod<w[0]?day*24:(day+1)*24)+w[0]-8,d2=nextDep(o,from,ws);
 return{dep:d2,night:d2-t>4?1:0}
}
function tm(h){var t=Math.round(480+h*60)%1440;return pad(Math.floor(t/60))+":"+pad(t%60)}
function stayCost(k,n){return Math.round([0,22,65][k]*IDX[N[n].c]*[0,.9,1.1,1.4][N[n].s])}
function hpush(a,x){a.push(x);var i=a.length-1;while(i>0){var p=(i-1)>>1;if(a[p].w<=a[i].w)break;var t=a[p];a[p]=a[i];a[i]=t;i=p}}
function hpop(a){var t=a[0],l=a.pop();if(a.length){a[0]=l;var i=0,n=a.length;for(;;){var c=2*i+1;if(c>=n)break;if(c+1<n&&a[c+1].w<a[c].w)c++;if(a[i].w<=a[c].w)break;var u=a[i];a[i]=a[c];a[c]=u;i=c}}return t}
function mkRooms(){var n=N[S.loc],p=[[0,.4,.7,.9][n.s],[0,.55,.85,.97][n.s]],k=IDX[n.c]*[0,.9,1.1,1.4][n.s],r=[];[["Hostel bed",22,0],["Hotel room",65,1]].forEach(function(t,i){if(Math.random()<p[i])r.push({n:t[0],c:Math.round(t[1]*k*(.8+Math.random()*.5)),q:t[2]})});return r}
function ll(n){return[N[n].lo,N[n].la]}
function rivalPos(){
 var b=S.bot,k=S.over?b.names.length-1:0;
 if(!S.over)b.times.forEach(function(t,i){if(t<=S.h)k=i});
 var P=[];for(var i=0;i<=k;i++)P.push(ll(b.names[i]));
 if(k<b.names.length-1){var A=P[k],B=ll(b.names[k+1]),f=Math.min(1,(S.h-b.times[k])/((b.times[k+1]-b.times[k])||1)),c=[A[0]+(B[0]-A[0])*f,A[1]+(B[1]-A[1])*f];P.push(c);return{P:P,cur:c}}
 return{P:P,cur:P[P.length-1]}}
// ---- Journey map: overlay layers on the shared MapLibre map (map.js)
var MJ={p:null,fit:""},JL=["j-ferry","j-nodes","j-opt","j-riv","j-me","j-opts","j-optlab","j-pts","j-ptlab"];
function fc(f){return{type:"FeatureCollection",features:f}}
function ptf(c,p){return{type:"Feature",properties:p||{},geometry:{type:"Point",coordinates:c}}}
function lnf(c){return c.length>1?{type:"Feature",properties:{},geometry:{type:"LineString",coordinates:c}}:fc([])}
function jvis(map,on){JL.forEach(function(id){if(map.getLayer(id))map.setLayoutProperty(id,"visibility",on?"visible":"none")})}
function setupJourney(map){
 if(map.getSource("j-nodes"))return;
 var F=MAPX.built().font,halo={"text-color":"#13242f","text-halo-color":"#ffffff","text-halo-width":1.6};
 map.addSource("j-ferry",{type:"geojson",data:fc(E.filter(function(e){return e.m=="ferry"}).map(function(e){return lnf([ll(e.a),ll(e.b)])}))});
 map.addLayer({id:"j-ferry",type:"line",source:"j-ferry",paint:{"line-color":"#566872","line-width":1.4,"line-opacity":.8,"line-dasharray":[3,2]}});
 map.addSource("j-nodes",{type:"geojson",data:fc(ids.map(function(i){return ptf(ll(i))}))});
 map.addLayer({id:"j-nodes",type:"circle",source:"j-nodes",paint:{"circle-radius":2.5,"circle-color":"#566872","circle-opacity":.55}});
 ["j-opt","j-riv","j-me","j-opts","j-pts"].forEach(function(id){map.addSource(id,{type:"geojson",data:fc([])})});
 map.addLayer({id:"j-opt",type:"line",source:"j-opt",layout:{"line-cap":"round"},paint:{"line-color":"#566872","line-width":2,"line-dasharray":[0.5,2.5]}});
 map.addLayer({id:"j-riv",type:"line",source:"j-riv",paint:{"line-color":"#d0432b","line-width":2.5,"line-dasharray":[3,2]}});
 map.addLayer({id:"j-me",type:"line",source:"j-me",layout:{"line-join":"round"},paint:{"line-color":"#1b6f63","line-width":3.5}});
 map.addLayer({id:"j-opts",type:"circle",source:"j-opts",paint:{"circle-radius":6,"circle-color":"#ffffff","circle-stroke-color":"#1b6f63","circle-stroke-width":2}});
 map.addLayer({id:"j-optlab",type:"symbol",source:"j-opts",layout:{"text-field":["get","name"],"text-font":F,"text-size":12,"text-offset":[0,1],"text-anchor":"top","symbol-sort-key":1},paint:halo});
 map.addLayer({id:"j-pts",type:"circle",source:"j-pts",paint:{"circle-radius":["match",["get","kind"],"goal",8,"me",7,5],"circle-color":["match",["get","kind"],"start","#13242f","me","#1b6f63","riv","#d0432b","rgba(0,0,0,0)"],"circle-stroke-color":["match",["get","kind"],"goal","#d0432b","#ffffff"],"circle-stroke-width":["match",["get","kind"],"goal",3,2]}});
 map.addLayer({id:"j-ptlab",type:"symbol",source:"j-pts",layout:{"text-field":["get","label"],"text-font":F,"text-size":12,"text-offset":[0,1.1],"text-anchor":"top","text-allow-overlap":true,"symbol-sort-key":0},paint:halo})
}
function fitJourney(map){
 var p=[ll(S.start),ll(S.goal),ll(S.loc)].concat(rivalPos().P);if(S.over&&S.opt)p=p.concat(S.opt.names.map(ll));
 var b=new maplibregl.LngLatBounds(p[0],p[0]);p.forEach(function(c){b.extend(c)});
 map.fitBounds(b,{padding:48,maxZoom:8,duration:0})
}
function updateJourney(map){
 jvis(map,true);
 var rv=rivalPos(),src=function(id,d){var s=map.getSource(id);if(s)s.setData(d)};
 src("j-me",lnf(S.path.map(ll)));src("j-riv",lnf(rv.P));src("j-opt",S.over&&S.opt?lnf(S.opt.names.map(ll)):fc([]));
 var o=[];if(!S.over&&S.phase=="move"){var all=opts();vis().show.forEach(function(i){o.push(ptf(ll(all[i].to),{name:N[all[i].to].n}))})}
 src("j-opts",fc(o));
 src("j-pts",fc([ptf(ll(S.start),{kind:"start",label:""}),ptf(ll(S.goal),{kind:"goal",label:N[S.goal].n}),ptf(ll(S.loc),{kind:"me",label:S.loc==S.goal?"":N[S.loc].n}),ptf(rv.cur,{kind:"riv",label:"Rival"})]));
 var key=S.start+S.goal+(S.over?"o":"");if(MJ.fit!=key){MJ.fit=key;fitJourney(map)}
}
function drawMap(){
 var box=document.getElementById("mapbox");if(!box||!S)return;
 MJ.p=MJ.p||MAPX.init(box).catch(function(e){MJ.p=null;console.warn("Map failed",e);var pf=document.getElementById("planfail");if(pf)pf.hidden=false});
 MJ.p.then(function(map){var b=document.getElementById("mapbox");if(!map||!b||!S)return;MAPX.attach(b);setupJourney(map);if(S.phase=="plan")planMap(map);else{planClean(map);updateJourney(map)}})
}
// ---- Planning phase: guess where the destination is on the unlabelled map; the error becomes time lost before you leave
var PL={on:false,pin:null,truth:null,guess:null,fn:null},PLAN_KM_PER_H=150,PLAN_MAX_H=8,PLAN_RIVAL_KM=300;
function kmc(a,b){var r=Math.PI/180,x=(b[0]-a[0])*r*Math.cos((a[1]+b[1])/2*r),y=(b[1]-a[1])*r;return Math.sqrt(x*x+y*y)*6371}
function planLost(km){return Math.min(PLAN_MAX_H,km/PLAN_KM_PER_H)}
function gauss(){var u=1-Math.random(),v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function planMap(map){
 jvis(map,false);if(PL.on)return;PL.on=true;
 var b=new maplibregl.LngLatBounds(ll(ids[0]),ll(ids[0]));ids.forEach(function(i){b.extend(ll(i))});
 map.setMinZoom(2.5);map.fitBounds(b,{padding:24,duration:0});
 PL.fn=function(e){if(!S||S.phase!="plan"||S.plan)return;PL.guess=[e.lngLat.lng,e.lngLat.lat];if(PL.pin)PL.pin.remove();PL.pin=new maplibregl.Marker({color:"#1b6f63"}).setLngLat(e.lngLat).addTo(map);var g=document.getElementById("planguess");if(g)g.disabled=false};
 map.on("click",PL.fn)
}
function planClean(map){
 if(!PL.on)return;PL.on=false;map.off("click",PL.fn);if(PL.pin)PL.pin.remove();if(PL.truth)PL.truth.remove();PL.pin=PL.truth=null;PL.guess=null;
 if(map.getLayer("p-miss"))map.removeLayer("p-miss");if(map.getSource("p-miss"))map.removeSource("p-miss");map.setMinZoom(0)
}
function planPanel(){
 return"<div class='panel'><h2>Planning in "+(S.start=="lon"?"Trafalgar Square":esc(N[S.start].n))+"</h2><p class='big' style='font-size:1.5rem'>Where is "+esc(N[S.goal].n)+"?</p><p class='mute' style='margin:0 0 10px'>Tap the map to drop a pin. The further off you are, the more time you lose working out how to get there.</p><div id='mapbox' class='jmap'></div><div class='row' style='margin-top:10px'><button class='btn' id='planguess' onclick='planGuess()'"+(PL.guess&&!S.plan?"":" disabled")+">Lock in guess</button></div><div id='planres'>"+(S.plan?planResHtml():"")+"</div><div id='planfail' hidden><p class='mute'>The map couldn't load.</p><button class='btn alt' onclick='planDone(1)'>Skip planning</button></div></div>"
}
function planResHtml(){var p=S.plan;return"<p>You were "+Math.round(p.km)+" km off: "+mins(p.lost)+" lost. The rival was "+Math.round(p.rkm)+" km off: "+mins(p.rl)+" lost.</p><button class='btn' onclick='planDone()'>Start travelling</button>"}
function planGuess(){
 if(S.phase!="plan"||S.plan||!PL.guess)return;
 var t=ll(S.goal),km=kmc(PL.guess,t),rkm=Math.exp(Math.log(PLAN_RIVAL_KM)+.9*gauss());
 S.plan={km:km,lost:planLost(km),rkm:rkm,rl:planLost(rkm)};
 document.getElementById("planguess").disabled=true;document.getElementById("planres").innerHTML=planResHtml();
 var g=PL.guess;
 MJ.p&&MJ.p.then(function(map){if(!map)return;PL.truth=new maplibregl.Marker({color:"#2e9e4f"}).setLngLat(t).addTo(map);
  map.addSource("p-miss",{type:"geojson",data:lnf([g,t])});map.addLayer({id:"p-miss",type:"line",source:"p-miss",paint:{"line-color":"#d0432b","line-width":3,"line-dasharray":[2,2]}});
  var b=new maplibregl.LngLatBounds(g,g);b.extend(t);map.fitBounds(b,{padding:60,maxZoom:6,duration:600})})
}
function planDone(skip){
 if(S.phase!="plan")return;
 if(!S.plan){if(!skip)return;S.plan={km:0,lost:0,rkm:0,rl:0,skipped:1}}
 var p=S.plan;S.h+=p.lost;S.bot.h+=p.rl;S.bot.score+=p.rl;for(var i=1;i<S.bot.times.length;i++)S.bot.times[i]+=p.rl;
 S.phase="move";say(p.skipped?"Planning skipped.":"Planning: "+Math.round(p.km)+" km off, "+mins(p.lost)+" lost before leaving.");render()
}
function planHtml(){var p=S.plan;if(!p||p.skipped)return"";return"<p class='res'><b>Planning: "+Math.round(p.km)+" km off</b><span>You lost "+mins(p.lost)+", the rival "+mins(p.rl)+".</span></p>"}
function mapPanel(){return"<div class='panel'><h2>Map</h2><div id='mapbox' class='jmap'></div><div class='zc'><button onclick='mfit()'>Fit journey</button></div></div>"}
function mfit(){if(MJ.p)MJ.p.then(function(map){if(map&&S)fitJourney(map)})}
var TN={r:"train station",b:"bus station",f:"ferry terminal",a:"airport"},TV={r:"Train station",b:"Bus station",f:"Ferry terminal",a:"Airport"};
function grp(m){return{tube:"r",rail:"r",hsr:"r",bus:"b",coach:"b",ferry:"f",air:"a"}[m]}
function terms(n){var o={},r=[];(ADJ[n]||[]).forEach(function(j){var e=E[j];if(S.air||e.m!="air")o[grp(e.m)]=1});["r","b","f","a"].forEach(function(g){if(o[g])r.push(g)});return r}
function xf(n,a,b){if(a==b)return{h:0,c:0};var s=N[n].s,k=IDX[N[n].c],air=a=="a"||b=="a",fer=a=="f"||b=="f";return{h:air?[0,1.2,1.2,1.5][s]:fer?[0,.6,.7,.9][s]:[0,.25,.35,.5][s],c:Math.round((air?20:fer?6:2)*k)}}
function xfer(g){if(S.over||S.phase!="move")return;var x=xf(S.loc,S.term,g);if(x.c>S.cash)return;S.h+=x.h;S.cash-=x.c;S.spent+=x.c;S.term=g;S.arr=S.h;say(clk(S.h)+": You make your way to the "+TN[g]+" in "+N[S.loc].n+" ("+x.h+" h, \u00a3"+x.c+").");render()}
function xferHtml(){var t=terms(S.loc).filter(function(g){return g!=S.term});if(!t.length)return"";var s="<h3>Go somewhere else in "+N[S.loc].n+"</h3>";t.forEach(function(g){var x=xf(S.loc,S.term,g);s+="<button class='opt' onclick=\"xfer('"+g+"')\""+(x.c>S.cash?" disabled":"")+"><div class='to'>"+TV[g]+"</div><span>"+x.h+" h</span><span>\u00a3"+x.c+"</span></button>"});return s}
function roll(){return 1+Math.floor(Math.random()*6)}
function ev(r){
 if(r==1)return{h:1.5,c:0,t:"Strike or breakdown: 1.5 h lost."};
 if(r==2){var f=10+Math.floor(Math.random()*16);return{h:0,c:f,t:"Unexpected fees: \u00a3"+f+"."}}
 if(r==5)return{h:0,c:-8,t:"Fare refunded: \u00a38 back."};
 if(r==6)return{h:-.3,c:0,t:"Smooth connection: 18 minutes saved."};
 return{h:0,c:0,t:"An uneventful hop."}
}
function plan(noise,B){
 var f=E.map(function(){return{h:1+noise*(Math.random()*2-1),c:1+noise*(Math.random()*2-1)}});
 var best={},done={},open=[];hpush(open,{n:S.start,g:S.term,c:0,w:0,e:[]});
 while(open.length){
  
  var s=hpop(open),k=s.n+s.g+"|"+Math.round(s.c/5);
  if(done[k])continue;done[k]=1;
  if(s.n==S.goal)return s.e;
  (ADJ[s.n]||[]).forEach(function(j){
   var e=E[j];if(!S.air&&e.m=="air")return;var g2=grp(e.m),x=xf(s.n,s.g,g2),to=e.a==s.n?e.b:e.a,c2=s.c+x.c+e.c*f[j].c;if(c2>B)return;
   var w2=s.w+.6+x.h+x.c/VT+e.h*f[j].h+e.c*f[j].c/VT,k2=to+g2+"|"+Math.round(c2/5);
   if(best[k2]!==undefined&&best[k2]<=w2)return;
   best[k2]=w2;hpush(open,{n:to,g:g2,c:c2,w:w2,e:s.e.concat([{j:j,to:to}])})})
 }
 return null
}
function run(steps,events){
 var h=0,c=0,names=[S.start],times=[0],modes=[],nights=[];
 var cur=S.start,g=S.term;steps.forEach(function(s){var e=E[s.j],g2=grp(e.m),x0=xf(cur,g,g2);h+=x0.h;c+=x0.c;var sc=sched({m:e.m,lg:e.lg,to:s.to},cur,h);if(sc.night)c+=stayCost(1,cur);h=sc.dep+e.h;c+=e.c;if(events){var x=ev(S.ev?roll():3);h+=x.h;c+=x.c;if(sc.night&&roll()<=2)h+=1}g=g2;cur=s.to;names.push(s.to);times.push(h);modes.push(e.m);nights.push(sc.night?1:0)});
 return{names:names,times:times,modes:modes,nights:nights,h:h,c:c,score:h+c/VT}
}
function newRace(a,b,air,evn,lm){
 S={start:a,goal:b,air:air,ev:evn,lmOn:!!(lm&&lm.on),planOn:!!(lm&&lm.plan),lmClue:lm&&lm.clue,lmLevel:lm&&lm.level,rooms:[],wait:0,tired:false,pend:null,loc:a,h:0,spent:0,cards:[],path:[a],modes:[],nights:[],rev:{},log:["Get from "+(a=="lon"?"Trafalgar Square":N[a].n)+" to "+N[b].n+" before your rival does."],phase:(lm&&lm.plan)?"plan":"move",draft:[],over:null};
 S.term=terms(a)[0];S.arr=0;var B=Math.max(80,Math.round((60+.3*hav(a,b))/10)*10),p=plan(0,B),t=0;
 while(!p&&t++<4){B=Math.round(B*1.5);p=plan(0,B)}
 if(!p){S=null;return false}
 S.budget=B;S.cash=B;S.opt=run(p,false);S.bot=run(plan(NOISE,B)||p,true);return true
}
function load(){try{var r=localStorage.getItem(KEY);if(r){var o=JSON.parse(r);if(o&&o.loc&&o.bot&&N[o.start]&&N[o.goal])S=o}}catch(e){}}
function save(){try{if(S)localStorage.setItem(KEY,JSON.stringify(S));else localStorage.removeItem(KEY)}catch(e){}}
function say(t){S.log.push(t);if(S.log.length>40)S.log.shift()}
function drop(k){var i=S.cards.indexOf(k);if(i>-1)S.cards.splice(i,1)}
function pad(n){return(n<10?"0":"")+n}
function clk(h){var t=480+Math.round(h*60),d=Math.floor(t/1440),m=t%1440;return"Day "+(d+1)+", "+pad(Math.floor(m/60))+":"+pad(m%60)}

function go(i){
 var o=opts()[i];if(!o||S.over||S.phase!="move"||vis().show.indexOf(i)<0||o.c>S.cash)return;
 var sc=sched(o,S.loc,S.h);
 if(sc.night){S.pend=i;S.rooms=mkRooms();S.phase="stay";return render()}
 hop(i,sc.dep)
}
function hop(i,dep){
 var o=opts()[i];if(!o||o.c>S.cash){S.phase="move";S.pend=null;return render()}
 var tr=S.tired?1:0;S.tired=false;S.pend=null;S.phase="move";
 if(tr)say("Tired after a poor night: 1 h lost.");
 S.h=dep+o.h+tr;S.cash-=o.c;S.spent+=o.c;S.loc=o.to;S.path.push(o.to);S.modes.push(o.m);S.nights.push(S.slept?1:0);S.slept=0;
 var x=S.ev?ev(roll()):ev(3),t=x.t;
 if(x.c>0||x.h>0){if(has("fixer")){drop("fixer");x={h:0,c:0};t="Your fixer smooths over the trouble."}}
 S.h=Math.max(0,S.h+x.h);S.cash=Math.max(0,S.cash-x.c);S.spent+=x.c;
 say(clk(S.h)+": "+MODE[o.m]+" to "+N[o.to].n+" ("+o.h+" h, \u00a3"+o.c+"). "+t);
 if(S.loc==S.goal){if(S.lmOn){S.phase="lastmile";S.draft=[];startLM();return render()}S.over="done";return render()}
 S.arr=S.h;S.term=grp(o.m);
 if(!S.ev){S.draft=[];pick(null);return}
 var pool=Object.keys(CARDS).filter(function(k){return!(CARDS[k][2]&&has(k))});
 pool.sort(function(){return Math.random()-.5});
 S.draft=pool.slice(0,3);S.phase="draft";render()
}
function stay(k){
 var i=S.pend,o=opts()[i],rm=k<0?{n:"the station",c:0,q:2}:S.rooms[k],c=rm.c,sc=sched(o,S.loc,S.h);
 if(c>S.cash)return;
 S.cash-=c;S.spent+=c;var poor=k<0||(rm.q==0&&roll()<=2);S.tired=poor;
 say((k<0?"No room found: you spent the night at the station in ":"Stayed in a "+rm.n.toLowerCase()+" in ")+N[S.loc].n+(c?" (\u00a3"+c+")":"")+"."+(poor?" You slept badly.":""));
 S.slept=1;hop(i,sc.dep)
}
function look(){S.h+=.3;S.rev[S.loc+S.term]=1;say(clk(S.h)+": You ask around and check timetables at "+N[S.loc].n+".");render()}
function pick(k){
 if(k){
  if(k=="purse")S.cash+=40;else if(k=="guide")S.rev[S.loc+S.term]=1;else S.cards.push(k);
  say("Picked up: "+CARDS[k][0]+".")}
 S.draft=[];S.phase="move";
 if(opts(1).every(function(o){return o.c>S.cash}))S.over="broke";
 render()
}
var MIN_KM=1000,MAX_KM=2000;
function isCity(i){return!N[i].l&&(N[i].s>=2||EXTRA_CITIES.indexOf(i)>-1)}
function pickDest(from){var c=ids.filter(function(i){var d=hav(from,i);return i!=from&&isCity(i)&&d>=MIN_KM&&d<=MAX_KM});return c.length?c[Math.floor(Math.random()*c.length)]:null}
function begin(random){
 var a=document.getElementById("from"),b=document.getElementById("to"),air=document.getElementById("air").checked,evn=document.getElementById("evn").checked,lm={on:document.getElementById("lmon").checked,clue:document.getElementById("lmclue").value,level:document.getElementById("lmlevel").value,plan:document.getElementById("planon").checked},x,y;
 if(random){x="lon";var t=0,ok=false;while(!ok&&t++<8){y=pickDest(x);ok=y&&newRace(x,y,air,evn,lm)}if(!ok){S=null;return render("Couldn't find a route. Try again.")}return render()}
 else{x=a.value;y=b.value}
 if(x==y){S=null;return render("Choose two different places.")}
 if(!newRace(x,y,air,evn,lm))return render("No route found between those places.");
 render()
}
function reset(){LM.reset();S=null;render()}
function rivalAt(){var b=S.bot,k=0;b.times.forEach(function(t,i){if(t<=S.h)k=i});return k==b.names.length-1?"has reached "+N[S.goal].n:"is at "+N[b.names[k]].n}
var ICON={tube:"\ud83d\ude87",rail:"\ud83d\ude86",hsr:"\ud83d\ude84",bus:"\ud83d\ude8c",ferry:"\u26f4\ufe0f",air:"\u2708\ufe0f"},BED="\ud83d\udecf\ufe0f";
function route(names,modes,nights){if(!modes||modes.length!=names.length-1)return names.map(function(n){return N[n].n}).join(" \u2192 ");return names.map(function(n,i){return N[n].n+(i<modes.length?(nights&&nights[i]?" "+BED:"")+" "+ICON[modes[i]]+" ":"")}).join("")}
function res(l,r){return"<p class='res'><b>"+l+": "+r.h.toFixed(1)+" h, \u00a3"+Math.round(r.c)+", score "+r.score.toFixed(1)+"</b><span>"+route(r.names,r.modes,r.nights)+"</span></p>"}

function mins(h){var m=Math.round(h*60);return m<60?m+" min":Math.floor(m/60)+" h "+(m%60)+" min"}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function startLM(){
 var g=N[S.goal];if(MJ.p)MJ.p.then(function(m){if(m)jvis(m,false)});
 LM.start({name:g.n,lat:g.la,lon:g.lo,landmark:g.l,level:S.lmLevel||"mixed",clueMode:S.lmClue||"pay"},function(r){
  LM.reset();S.lm=r;S.h+=r.lost;S.bot.h+=r.rivalLost;S.bot.score+=r.rivalLost;S.over="done";S.phase="move";
  say(clk(S.h)+": Last mile: "+(r.skipped?"skipped.":r.title+", "+r.distText+" off, "+mins(r.lost)+" lost."));render()})
}
function lmHtml(){var r=S.lm;if(!r)return"";return"<p class='res'><b>Last mile: "+(r.skipped?"skipped":esc(r.title)+" ("+r.distText+" off)")+"</b><span>You lost "+mins(r.lost)+(r.skipped?"":", the rival "+mins(r.rivalLost))+".</span></p>"}
function render(msg){
 save();var h="<h1>Cross-Channel race</h1>";
 if(!S){
  var os=ids.slice().sort(function(a,b){return N[a].n<N[b].n?-1:1}).map(function(i){return"<option value='"+i+"'>"+N[i].n+"</option>"}).join("");
  h+="<p class='sub'>You start in Trafalgar Square, London. Your destination is a random city 1,000 to 2,000 km away.</p><div class='panel'>"+(msg?"<p style='color:var(--bad)'>"+msg+"</p>":"")+"<label style='display:flex;gap:8px;align-items:center;color:var(--ink)'><input type='checkbox' id='air' checked> Allow flights</label><label style='display:flex;gap:8px;align-items:center;color:var(--ink);margin-top:8px'><input type='checkbox' id='evn'> Random events and boon cards</label><label style='display:flex;gap:8px;align-items:center;color:var(--ink);margin-top:8px'><input type='checkbox' id='planon' checked> Planning phase in London</label><label style='display:flex;gap:8px;align-items:center;color:var(--ink);margin-top:8px'><input type='checkbox' id='lmon' checked> Last-mile photo challenge at the destination</label><label for='lmclue' style='margin-top:8px'>Last-mile map clues</label><select id='lmclue'><option value='pay'>Pay for icon reveals (time cost)</option><option value='free'>Common icons free</option><option value='off'>Roads only, no reveals</option></select><label for='lmlevel'>Last-mile difficulty</label><select id='lmlevel'><option value='easy'>Famous landmarks</option><option value='mixed' selected>Mixed</option><option value='hard'>Local sights</option></select><div class='row' style='margin-top:12px'><button class='btn' onclick='begin(1)'>Start journey</button></div><details style='margin-top:14px'><summary class='mute'>Choose start and destination yourself</summary><label for='from' style='margin-top:10px'>From</label><select id='from'>"+os+"</select><label for='to'>To</label><select id='to'>"+os+"</select><button class='btn alt' onclick='begin()'>Start with these places</button></details></div>";
  document.getElementById("app").innerHTML=h;
  document.getElementById("from").value="lon";document.getElementById("to").value="rom";return}
 h+="<p class='sub'>Score is hours plus \u00a31 per three minutes (\u00a320 = 1 h). Lower wins.</p>";
 var st=status();
 h+="<div class='hdr'><div class='r1'><span><b>"+clk(S.h)+"</b></span><span><b>\u00a3"+S.cash+"</b> of \u00a3"+S.budget+"</span><span class='st'><span aria-hidden='true'>"+st[0]+"</span> "+st[1]+"</span></div><div class='r2'><div><small>From</small>"+(S.start=="lon"?"Trafalgar Square":N[S.start].n)+"</div><div class='cur'><small>Now</small>"+N[S.loc].n+"</div><div><small>To "+(S.phase=="plan"&&!S.plan?"?":arrow(S.loc,S.goal))+"</small>"+N[S.goal].n+"</div></div><div class='rv'>Rival "+rivalAt()+"</div></div>";
 if(S.over){
  var you={names:S.path,modes:S.modes,nights:S.nights,h:S.h,c:S.spent,score:S.h+S.spent/VT},m=S.over=="broke"?"Stranded: you can't afford any onward fare from "+N[S.loc].n+".":(you.score<S.bot.score?"You beat the rival.":"The rival wins this one.");
  h+="<div class='panel'><p class='big'>"+m+"</p>"+(S.over=="done"?res("You",you):"")+res("Rival",S.bot)+res("Best planned route",S.opt)+planHtml()+lmHtml()+"<button class='btn' onclick='reset()'>New race</button></div>"+mapPanel()
 }else{

  if(S.cards.length)h+="<p class='hand'>Carrying: "+S.cards.map(function(k){return CARDS[k][0]}).join(", ")+"</p>";
  if(S.phase=="lastmile")h+="<div class='panel'><h2>Last mile</h2><div id='lm'></div></div>";else if(S.phase=="plan")h+=planPanel();else h+=mapPanel();
  if(S.phase=="lastmile"||S.phase=="plan"){}else if(S.phase=="stay"){var po=opts()[S.pend],ss=sched(po,S.loc,S.h);h+="<div class='panel'><h2>No service until "+tm(ss.dep)+"</h2><p style='margin:0 0 10px'>Where will you sleep in "+N[S.loc].n+"?</p>";S.rooms.forEach(function(x,k){h+="<button class='card' onclick='stay("+k+")'"+(x.c>S.cash?" disabled":"")+"><b>"+x.n+", \u00a3"+x.c+"</b><span>"+(x.q?"A proper night's rest.":"Cheap, but you may sleep badly.")+"</span></button>"});if(!S.rooms.length)h+="<p style='margin:0 0 10px'>No rooms are free in town tonight.</p><button class='card' onclick='stay(-1)'><b>Spend the night at the station</b><span>Free, but you will be tired: 1 h lost on the next leg.</span></button>";h+="<button class='link' onclick='S.phase=\"move\";S.pend=null;render()'>Choose a different option</button></div>"}else if(S.phase=="draft"){
   h+="<div class='panel'><h2>Pick one to take with you</h2>";
   S.draft.forEach(function(k){h+="<button class='card' onclick=\"pick('"+k+"')\"><b>"+CARDS[k][0]+"</b><span>"+CARDS[k][1]+"</span></button>"});
   h+="<button class='link' onclick='pick(null)'>Skip</button></div>"
  }else{
   var all=opts(),v=vis(),last="";
   h+="<div class='panel'><h2>Where next?</h2>";
   v.show.sort(function(a,b){var x=ORD.indexOf(all[a].m)-ORD.indexOf(all[b].m);return x||all[a].h-all[b].h});
   v.show.forEach(function(i){
    var o=all[i],sc=sched(o,S.loc,S.h);
    if(o.m!=last){h+="<h3>"+GRP[o.m]+"</h3>";last=o.m}
    h+="<button class='opt' onclick='go("+i+")'"+(o.c>S.cash?" disabled":"")+"><div class='to'>"+N[o.to].n+"<small>heads "+dir(S.loc,o.to)+", departs "+tm(sc.dep)+(sc.night?" tomorrow":"")+(sc.ns?", night service":"")+(S.path.indexOf(o.to)>-1?", already visited":"")+"</small></div><span>"+o.h+" h</span><span>\u00a3"+o.c+"</span></button>"});
   if(v.hid>0)h+="<p class='hand'>"+v.hid+" more long-distance links are not shown here.</p><button class='btn alt' onclick='look()'>Look for routes (0.3 h)</button>";h+=xferHtml();
   h+="</div>"}
 }
 h+="<div class='panel'><h2>Travel log</h2><ol class='log' reversed>";
 S.log.slice(-6).reverse().forEach(function(l){h+="<li>"+l+"</li>"});
 h+="</ol></div><button class='link' onclick='if(confirm(\"Abandon this race?\"))reset()'>Abandon race</button>";
 document.getElementById("app").innerHTML=h;drawMap();if(S&&S.phase=="lastmile"&&!S.over)LM.attach(document.getElementById("lm"))
}
load();if(S&&S.phase=="lastmile"&&!S.over)startLM();render();
window.addEventListener("resize",function(){drawMap()});
