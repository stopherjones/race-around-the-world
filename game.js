var VT=20,NOISE=.35,KEY="route-generator-v4",S=null,IDX={U:1.15,F:1,B:1.05,N:1.05,G:1.05,S:.85,T:.95,C:1.6,R:1.1,D:1.3,E:.7,K:.75,Y:.6,M:.7,V:.65};
var N={};
function loadWorld(str){N={};str.split(";").forEach(function(s){var p=s.split("|"),f=p[5];N[p[0]]={n:p[1],la:+p[2],lo:+p[3],c:p[4],r:f.indexOf("r")>-1,a:f.indexOf("a")>-1,p:f.indexOf("p")>-1,h:f.indexOf("h")>-1,l:f.indexOf("l")>-1,s:+(f.match(/\d/)||[1])[0]}});ids=Object.keys(N);towns=ids.filter(function(i){return!N[i].l});E=[];ADJ={};seen={};buildLinks()}
var MODE={tube:"metro",bus:"bus",coach:"coach",rail:"train",hsr:"fast train",ferry:"ferry",air:"flight"},GRP={rail:"Trains",hsr:"Fast trains",coach:"Coaches",bus:"Buses",ferry:"Ferries",air:"Flights",tube:"Metro"},ORD=["rail","hsr","coach","bus","ferry","air","tube"];
var CARDS={rail:["Rail pass","Train and fast-train fares cost 30% less.",1],prio:["Priority boarding","Ferries and flights take 0.8 h less.",1],fixer:["Local fixer","Cancels your next bad event.",1],guide:["Local guide","Shows every onward option from here, free.",0],purse:["Winnings at cards","Gain \u00a340 now.",0]};

function hav(a,b){var A=N[a],B=N[b],r=Math.PI/180,x=(B.lo-A.lo)*r*Math.cos((A.la+B.la)/2*r),y=(B.la-A.la)*r;return Math.sqrt(x*x+y*y)*6371}
function arrow(a,b){if(a==b)return"\u2713";var A=N[a],B=N[b],r=Math.PI/180,x=(B.lo-A.lo)*Math.cos((A.la+B.la)/2*r),y=B.la-A.la,i=Math.round(((Math.atan2(x,y)/r+360)%360)/45)%8;return["\u2191 N","\u2197 NE","\u2192 E","\u2198 SE","\u2193 S","\u2199 SW","\u2190 W","\u2196 NW"][i]}
function status(){if(S.over)return["\ud83c\udfc1","Finished"];if(S.phase=="plan")return["\ud83e\udded","Planning"];if(S.phase=="routes")return["\ud83d\uddfa\ufe0f","Choosing a route"];if(S.phase=="lastmile")return["\ud83d\udccd","Last mile"];if(S.phase=="interim")return["\ud83d\udccd","Last-mile work"];if(S.phase=="stay")return["\ud83d\udecf\ufe0f","Finding a bed"];return{r:["\ud83d\ude86","Train station"],b:["\ud83d\ude8c","Bus station"],f:["\u26f4\ufe0f","Ferry terminal"],a:["\u2708\ufe0f","Airport"]}[S.term]}
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

var E=[],ADJ={},seen={},ids=[],towns=[];
function G(i){var c=N[i].c;return c=="U"?1:c=="R"?3:2}
function mk(a,b,m,lg,h,c,dp,ev){if(!N[a]||!N[b])return;
 var k=(a<b?a+b:b+a)+m;if(seen[k])return;seen[k]=1;
 var v=h?[h,c]:val(a,b,m),j=E.length;E.push({a:a,b:b,m:m,h:v[0],c:v[1],lg:lg,dp:dp,ev:ev,hw:ev?ev*24:0});
 (ADJ[a]=ADJ[a]||[]).push(j);(ADJ[b]=ADJ[b]||[]).push(j)}
// ---- Link generation, using a spatial grid so each place only looks at places near it (not every pair)
var CELL=2,GRID={},IX={};
function gridBuild(){GRID={};IX={};ids.forEach(function(i,n){IX[i]=n;var k=Math.floor(N[i].la/CELL)+"|"+Math.floor(N[i].lo/CELL);(GRID[k]=GRID[k]||[]).push(i)})}
// Places within r km of a, in the same order as the places list (so results match the old every-pair search exactly)
function near(a,r,raw){
 var A=N[a],dl=r/111,dn=r/(111*Math.max(.2,Math.cos(Math.min(85,Math.abs(A.la)+dl)*Math.PI/180))),out=[];
 for(var la=Math.floor((A.la-dl)/CELL);la<=Math.floor((A.la+dl)/CELL);la++)for(var lo=Math.floor((A.lo-dn)/CELL);lo<=Math.floor((A.lo+dn)/CELL);lo++){var c=GRID[la+"|"+lo];if(c)for(var q=0;q<c.length;q++){var b=c[q];if(b!=a&&hav(a,b)<=r)out.push(b)}}
 return raw?out:out.sort(function(x,y){return IX[x]-IX[y]})
}
function nn(a,f,k,mx){return near(a,mx).filter(function(b){return!N[b].l&&G(b)==G(a)&&f(b)}).sort(function(x,y){return hav(a,x)-hav(a,y)}).slice(0,k)}
function buildLinks(){
 E.length=0;ADJ={};seen={};gridBuild();
 ids.forEach(function(a){
  if(N[a].l){nn(a,function(){return 1},2,150).forEach(function(b){mk(a,b,hav(a,b)<12?"tube":"bus",0)});return}
  nn(a,function(){return 1},3,120).forEach(function(b){mk(a,b,"bus",0)});
  if(N[a].r)nn(a,function(b){return N[b].r},3,250).forEach(function(b){mk(a,b,"rail",0)})});
 ids.forEach(function(a){if(N[a].l)return;var A0=N[a],rr=Math.max(A0.s>1?650:0,A0.h?1000:0,A0.s==3?320:0,A0.a?1500:0);if(!rr)return;near(a,rr,1).forEach(function(b){
  if(N[b].l)return;var d=hav(a,b),A=N[a],B=N[b],same=G(a)==G(b);
  if(same&&A.r&&B.r&&A.s>1&&B.s>1&&d<650&&!(A.h&&B.h))mk(a,b,"rail",1);
  if(same&&A.h&&B.h&&d<1000)mk(a,b,"hsr",1);
  if(same&&((A.s==3||B.s==3)&&d<320||A.s>1&&B.s>1&&d<650))mk(a,b,"bus",1);
  if(A.a&&B.a&&d>250&&d<1500)mk(a,b,"air",1)})});
 CROSSINGS.split("|").forEach(function(s){var p=s.split(" ");mk(p[0],p[1],p[2],p[2]=="ferry"?0:1,+p[3],+p[4],p[5]?+p[5]:-1,p[6]?+p[6]:0)})
}

function has(k){return S.cards.indexOf(k)>-1}
function opts(all){
 return(ADJ[S.loc]||[]).filter(function(j){return(S.air||E[j].m!="air")&&(all||grp(E[j].m)==S.term)}).map(function(j){
  var e=E[j],h=e.h,c=e.c;
  if((e.m=="rail"||e.m=="hsr")&&has("rail"))c=Math.round(c*.7);
  if((e.m=="ferry"||e.m=="air")&&has("prio"))h=Math.max(.5,Math.round((h-.8)*10)/10);
  return{to:e.a==S.loc?e.b:e.a,m:e.m,h:h,c:c,lg:e.lg,dp:e.dp,ev:e.ev}})
}
// Choose which long-distance links to show at this stop: toward, sideways, a diversion, and red herrings, with a spread of departure times.
// The choice is seeded by the race, the place and the time, so refreshing the page or reloading a save shows the same list.
function curateLong(all,lg){
 if(lg.length<=5)return lg;
 var seed=hsh(S.start+S.goal+S.loc+Math.floor(S.h*4)),cur=hav(S.loc,S.goal),tw=[],sd=[],aw=[],r=seed;
 lg.forEach(function(i){var d=hav(all[i].to,S.goal);if(d<cur*.95)tw.push(i);else if(d>cur*1.05)aw.push(i);else sd.push(i)});
 var pickN=function(arr,n,key){var s=arr.slice().sort(function(x,y){return key(all[x])-key(all[y])}),out=[];while(out.length<n&&s.length){r=(r*31+7)%1000;out.push(s.splice(r%Math.min(3,s.length),1)[0])}return out};
 var target=Math.min(lg.length,5+seed%4),pick=[];
 pick=pick.concat(pickN(tw,2,function(o){return o.h}));
 pick=pick.concat(pickN(sd,2,function(o){return o.h}));
 pick=pick.concat(pickN(lg.filter(function(i){return pick.indexOf(i)<0&&cultRating(all[i].to)>=3}),1,function(o){return o.h}));
 pick=pick.concat(pickN(aw,2,function(o){return o.c}));
 pick=pick.concat(pickN(lg.filter(function(i){return pick.indexOf(i)<0}),Math.max(0,target-pick.length),function(o){return o.h}));
 pick=pick.slice(0,target);
 var wait=function(i){return sched(all[i],S.loc,S.h).dep-S.h};
 if(pick.length>1&&!pick.some(function(i){return wait(i)<=1.5})){var soon=lg.filter(function(i){return pick.indexOf(i)<0&&wait(i)<=1.5})[0];if(soon!==undefined)pick[pick.length-1]=soon}
 if(pick.length>1&&!pick.some(function(i){return wait(i)>=3})){var late=lg.filter(function(i){return pick.indexOf(i)<0&&wait(i)>=3})[0];if(late!==undefined)pick[pick.length-1]=late}
 return lg.filter(function(i){return pick.indexOf(i)>=0})
}
function vis(){
 var all=opts(),idx=all.map(function(_,i){return i}),loc=idx.filter(function(i){return!all[i].lg}),lg=idx.filter(function(i){return all[i].lg});
 if(S.rev[S.loc+S.term])return{show:loc.concat(lg),hid:0};
 var cl=curateLong(all,idx);return{show:cl,hid:idx.length-cl.length}
}
var WIN={tube:[5.5,23.5],bus:[8,22],rail:[7,22],ferry:[6,21],hsr:[6.5,21],air:[6,21],coach:[6,23]};
function hsh(s){var x=0;for(var i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))%1000;return x}
var HW={tube:.12,bus:.6,rail:.8,hsr:1.5,ferry:2,air:4};
// Service frequency: headway grows with leg length (short hops run often, long hops less often); ferries run about half as often again
function hdw(o,from){var b=o.lg&&o.m=="bus"?3:o.lg&&o.m=="rail"?2:HW[o.m],f=Math.min(3,.7+hav(from,o.to)/500);return b*f*(o.m=="ferry"?2:1)*[0,1.5,1,.7][N[from].s]}
function nextDep(o,from,t){if(o.dp!=null){var evd=o.ev||1,pd=hsh(from+o.to)%evd,A=8+t,dy=Math.floor(A/24);for(var k=0;k<=evd*2+1;k++){var d=dy+k;if(d%evd==pd&&d*24+o.dp>=A-1e-9)return d*24+o.dp-8}}var H=hdw(o,from),ph=hsh(from+o.to+o.m)/1000*H,n=Math.ceil((8+t-ph)/H-1e-9);return ph+n*H-8}
function sched(o,from,t){
 if(o.hw>0&&o.dp>=0){var step=Math.max(24,o.hw),base=o.dp-8,dd=base+Math.max(0,Math.ceil((t-base)/step-1e-9))*step;if(dd<t-1e-9)dd+=step;var da=Math.floor((8+dd)/24)-Math.floor((8+t)/24);return{dep:dd,night:da>0&&dd-t>5?1:0,nn:Math.max(1,da),ns:0}}
 var d0=nextDep(o,from,t),tod=(8+d0)%24,day=Math.floor((8+d0)/24),w=WIN[o.m];
 if((o.m=="rail"||o.m=="bus")&&o.lg)w=[6,23];
 if(tod>=w[0]&&tod<=w[1])return{dep:d0,night:0};
 if((o.m=="bus"&&o.lg&&hsh(from+o.to+day)%100<60)||(o.m=="rail"&&o.lg&&hsh(from+o.to+day)%100<30))return{dep:d0,night:0,ns:1};
 var ws=(tod<w[0]?day*24:(day+1)*24)+w[0]-8,d2=nextDep(o,from,ws);
 return{dep:d2,night:d2-t>4?1:0}
}
function tm(h){var t=Math.round(480+h*60)%1440;return pad(Math.floor(t/60))+":"+pad(t%60)}
function stayCost(k,n){return Math.round([0,22,65][k]*IDX[N[n].c]*[0,.9,1.1,1.4][N[n].s])}
function hpush(a,x){a.push(x);var i=a.length-1;while(i>0){var p=(i-1)>>1;if((a[p].f||a[p].w)<=(a[i].f||a[i].w))break;var t=a[p];a[p]=a[i];a[i]=t;i=p}}
function hpop(a){var t=a[0],l=a.pop();if(a.length){a[0]=l;var i=0,n=a.length;for(;;){var c=2*i+1;if(c>=n)break;if(c+1<n&&(a[c+1].f||a[c+1].w)<(a[c].f||a[c].w))c++;if((a[i].f||a[i].w)<=(a[c].f||a[c].w))break;var u=a[i];a[i]=a[c];a[c]=u;i=c}}return t}
function mkRooms(){var n=N[S.loc],p=[[0,.4,.7,.9][n.s],[0,.55,.85,.97][n.s]],k=IDX[n.c]*[0,.9,1.1,1.4][n.s],r=[];[["Hostel bed",22,0],["Hotel room",65,1]].forEach(function(t,i){if(Math.random()<p[i])r.push({n:t[0],c:Math.round(t[1]*k*(.8+Math.random()*.5)),q:t[2]})});return r}
function ll(n){return[N[n].lo,N[n].la]}
// ---- Journey map: overlay layers on the shared MapLibre map (map.js)
var MJ={p:null,fit:""},JL=["j-ferry","j-nodes","j-opt","j-riv","j-me","j-opts","j-optlab","j-pts","j-ptlab","j-routes","j-routes-lab"];
function fc(f){return{type:"FeatureCollection",features:f}}
function ptf(c,p){return{type:"Feature",properties:p||{},geometry:{type:"Point",coordinates:c}}}
function lnf(c){return c.length>1?{type:"Feature",properties:{},geometry:{type:"LineString",coordinates:c}}:fc([])}
function jvis(map,on){JL.forEach(function(id){if(map.getLayer(id))map.setLayoutProperty(id,"visibility",on?"visible":"none")})}
function setupJourney(map){
 if(map.getSource("j-nodes"))return;
 var F=MAPX.built().font,halo={"text-color":"#13242f","text-halo-color":"#ffffff","text-halo-width":1.6};
 map.addSource("j-routes",{type:"geojson",data:fc([])});
 map.addLayer({id:"j-routes",type:"line",source:"j-routes",layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":["match",["get","kind"],"Fast","#1b6f63","Thrifty","#8a6d1f","#7a3e9d"],"line-width":["case",["==",["get","sel"],1],6,3],"line-opacity":["case",["==",["get","sel"],1],1,.55]}});
 map.addSource("j-routes-lab",{type:"geojson",data:fc([])});
 map.addLayer({id:"j-routes-lab",type:"symbol",source:"j-routes-lab",layout:{"text-field":["get","label"],"text-font":F,"text-size":13,"text-allow-overlap":true,"symbol-sort-key":2},paint:{"text-color":["match",["get","label"],"Fast","#1b6f63","Thrifty","#8a6d1f","#7a3e9d"],"text-halo-color":"#ffffff","text-halo-width":2}});
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
 var p=[ll(S.start),ll(S.goal),ll(S.loc)];if(S.over&&S.opt)p=p.concat(S.opt.names.map(ll));
 if(S.phase=="routes"&&S.opts)S.opts.forEach(function(o){p=p.concat(o.names.map(ll))});
 var b=new maplibregl.LngLatBounds(p[0],p[0]);p.forEach(function(c){b.extend(c)});
 map.fitBounds(b,{padding:48,maxZoom:8,duration:0})
}
function updateJourney(map){
 jvis(map,true);
 var src=function(id,d){var s=map.getSource(id);if(s)s.setData(d)};
 src("j-me",lnf(S.path.map(ll)));src("j-opt",S.over&&S.opt?lnf(S.opt.names.map(ll)):fc([]));
 var o=[];if(!S.over&&S.phase=="move"){var all=opts();vis().show.forEach(function(i){o.push(ptf(ll(all[i].to),{name:N[all[i].to].n}))})}
 src("j-opts",fc(o));
 src("j-pts",fc([ptf(ll(S.start),{kind:"start",label:""}),ptf(ll(S.goal),{kind:"goal",label:N[S.goal].n}),ptf(ll(S.loc),{kind:"me",label:S.loc==S.goal?"":N[S.loc].n})]));
 var rt=S.phase=="routes"&&S.opts?S.opts:[];src("j-routes",fc(rt.map(function(o,i){return{type:"Feature",properties:{kind:o.label,sel:i==S.hl?1:0},geometry:{type:"LineString",coordinates:o.names.map(ll)}}})));src("j-routes-lab",fc(rt.map(function(o){return ptf(ll(o.names[Math.floor(o.names.length/2)]),{label:o.label})})));
 var key=S.start+S.goal+(S.over?"o":"")+(rt.length?"r":"");if(MJ.fit!=key){MJ.fit=key;fitJourney(map)}
}
function drawMap(){
 var box=document.getElementById("sharedmap");if(!box||!S)return;
 MJ.p=MJ.p||MAPX.init(box).catch(function(e){MJ.p=null;console.warn("Map failed",e);var pf=document.getElementById("planfail");if(pf)pf.hidden=false});
 MJ.p.then(function(map){var b=document.getElementById("sharedmap");if(!map||!b||!S)return;if(S.phase!="lastmile"&&S.phase!="interim")MAPX.setLabels(false);MAPX.attach(b);setupJourney(map);if(S.phase=="plan")planMap(map);else{planClean(map);updateJourney(map)}})
}
// ---- Planning phase: guess where the destination is on the unlabelled map; the error becomes time lost before you leave
var PL={on:false,pin:null,truth:null,guess:null,fn:null},PLAN_KM_PER_H=150,PLAN_MAX_H=8;
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
// Route colours: the same as the route lines on the map
function routeColour(label){return label=="Fast"?"#1b6f63":label=="Thrifty"?"#8a6d1f":"#7a3e9d"}
function planPanel(){return planPanelBase()+boardHtml()}
// Destination board: the key services on each route type, fixed for the day, so every traveller sees the same options
function legTxt(e,from,to){
 var t=(MODE[e.m]||e.m)+" "+N[from].n+" to "+N[to].n;
 if(e.m=="ferry"&&e.dp>=0){t+=", sails "+pad(Math.floor(e.dp))+":"+pad(Math.round((e.dp%1)*60))+(e.hw>24?", every "+Math.round(e.hw/24)+" days":", daily")}
 return t
}
function boardHtml(){
 if(!S||!S.opts||!S.opts.length||S.over)return"";
 var rows=S.opts.map(function(o){
  var legs=o.steps.map(function(s,i){return legTxt(E[s.j],o.names[i],o.names[i+1])});
  var shown=legs.slice(0,4).map(function(t){return"<li>"+esc(t)+"</li>"}).join("")+(legs.length>4?"<li class='mute'>+"+(legs.length-4)+" more legs</li>":"");
  return"<div class='panel' style='border:2px solid "+routeColour(o.label)+"'><h2>"+esc(o.label)+" route</h2><ul class='log'>"+shown+"</ul></div>"
 }).join("");
 return"<div class='panel'><h2>Destination board</h2><p class='mute'>Key services on each route to "+esc(N[S.goal].n)+". Timetables are fixed, so the same services are open to everyone.</p></div>"+rows
}
// Destination introductions: generated live through the Groq proxy (Cloudflare Worker), one request per city, cached for the session
var FLAVOUR_URL="https://groq-proxy.chrisjones59.workers.dev/chat/completions",FLAVOUR_MODEL="openai/gpt-oss-120b",FLAV={};
function flavourPrompt(c){return"You are producing a travel TV show - provide a short, light, informative voiceover script introducing "+c+". Your response should start \""+c+"\", then cover its geographic location, history and current significance."}
function flavourFor(c){
 if(FLAV[c])return FLAV[c];
 FLAV[c]=fetch(FLAVOUR_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:FLAVOUR_MODEL,messages:[{role:"user",content:flavourPrompt(c)}]})})
  .then(function(r){if(!r.ok)throw new Error("status "+r.status);return r.json()})
  .then(function(j){var t=((j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content)||"").replace(/\*\*/g,"").trim();if(!t)throw new Error("empty reply");return t})
  .catch(function(e){delete FLAV[c];throw e});
 return FLAV[c]
}
function fillFlavour(){
 var el=document.getElementById("flavour-text");if(!el||!S||S.phase!=="plan")return;
 var key=S.goal,c=N[key].n;
 flavourFor(c).then(function(t){var cur=document.getElementById("flavour-text");if(cur&&S&&S.goal===key)cur.textContent=t},function(){var cur=document.getElementById("flavour-text");if(cur&&S&&S.goal===key)cur.textContent="An introduction isn't available right now."})
}
function planIntro(){
 var n=N[S.goal].n;
 return"<div class='panel'><h2>Destination: "+esc(n)+"</h2><p class='flavour' id='flavour-text'>Loading an introduction to "+esc(n)+"…</p>"+(S.plan?"":"<p class='mute' style='margin:0'>Where is "+esc(n)+"? Tap the map to drop a pin. The further off you are, the more time you lose working out how to get there.</p>")+"</div>"
}
function planPanelBase(){
 return"<div class='panel'>"+(S.plan?"":"<div class='row' style='margin-top:0'><button class='btn' id='planguess' onclick='planGuess()'"+(PL.guess?"":" disabled")+">Lock in guess</button></div>")+"<div id='planres'>"+(S.plan?planResHtml():"")+"</div><div id='planfail' hidden><p class='mute'>The map couldn't load.</p><button class='btn alt' onclick='planDone(1)'>Skip planning</button></div></div>"
}
function planResHtml(){var p=S.plan;return"<p>You were "+Math.round(p.km)+" km off: "+mins(p.lost)+" lost.</p><button class='btn' onclick='planDone()'>Start travelling</button>"}
function planGuess(){
 if(S.phase!="plan"||S.plan||!PL.guess)return;
 var t=ll(S.goal),km=kmc(PL.guess,t);
 S.plan={km:km,lost:planLost(km)};
 document.getElementById("planguess").disabled=true;document.getElementById("planres").innerHTML=planResHtml();
 var g=PL.guess;
 MJ.p&&MJ.p.then(function(map){if(!map)return;PL.truth=new maplibregl.Marker({color:"#2e9e4f"}).setLngLat(t).addTo(map);
  map.addSource("p-miss",{type:"geojson",data:lnf([g,t])});map.addLayer({id:"p-miss",type:"line",source:"p-miss",paint:{"line-color":"#d0432b","line-width":3,"line-dasharray":[2,2]}});
  var b=new maplibregl.LngLatBounds(g,g);b.extend(t);map.fitBounds(b,{padding:60,maxZoom:6,duration:600})})
}
function planDone(skip){
 if(S.phase!="plan")return;
 if(!S.plan){if(!skip)return;S.plan={km:0,lost:0,rkm:0,rl:0,skipped:1}}
 var p=S.plan;S.h+=p.lost;
 S.phase="routes";S.opts=routeOptions(S.budget);say(p.skipped?"Planning skipped.":"Planning: "+Math.round(p.km)+" km off, "+mins(p.lost)+" lost before leaving.");render()
}
function planHtml(){var p=S.plan;if(!p||p.skipped)return"";return"<p class='res'><b>Planning: "+Math.round(p.km)+" km off</b><span>You lost "+mins(p.lost)+".</span></p>"}
// ---- Route cards: three descriptions, revealed only as sentences. Costs, hotels and times appear after you pick.
var ROUTE_NAMES={fast:"fast but expensive",thrifty:"slower and cheaper",cultural:"the scenic, culture-rich way"};
function describeRoute(o){
 var seq=o.names.slice(1,-1),first=o.names[0],mid=o.mid||[],kinds=o.modes;
 var pick=mid.filter(function(n){return cultRating(n)>=2||N[n].p}).sort(function(a,b){return cultRating(b)-cultRating(a)}).slice(0,2).sort(function(a,b){return mid.indexOf(a)-mid.indexOf(b)}),via=pick.map(function(n){return N[n].n});
 var hasFerry=kinds.indexOf("ferry")>-1,hasAir=kinds.indexOf("air")>-1,hasHsr=kinds.indexOf("hsr")>-1,hasBus=kinds.indexOf("bus")>-1,hasRail=kinds.indexOf("rail")>-1||kinds.indexOf("tube")>-1;
 var nightish=o.aboard>0||o.nights>0;
 var first_leg=o.modes[0]=="ferry"?"a ferry crossing":o.modes[0]=="air"?"a flight":o.modes[0]=="hsr"?"a high-speed train":o.modes[0]=="bus"?"a bus":"a train";
 var main=hasAir?"flying":hasHsr?"fast trains":hasRail&&!hasBus?"regional trains":hasBus?"long-distance buses":"trains";
 var parts=[];
 if(o.label=="Fast"){parts.push("A fast but expensive route"+(hasFerry?", crossing by ferry":"")+(hasAir?", mostly flying":", then "+main)+(via.length?" through "+via.join(" and "):"")+".")}
 else if(o.label=="Thrifty"){parts.push("A slower, cheaper route"+(o.aboard>0?(o.nights>0?", using overnight buses":", using overnight buses to avoid hotels"):", using long-distance buses")+(via.length?", through "+via.join(" and "):"")+".")}
 else{parts.push("A scenic route"+(via.length?" through "+via.join(", ")+" and on":"")+(hasFerry?", with a ferry crossing":"")+", using "+(hasAir?"flights":main)+" where it helps.")}
 if(hasFerry&&o.label!="Fast")parts.push("Ferries are on the way, and sailings are less frequent than trains.");
 if(nightish&&o.label=="Cultural")parts.push("Some of the journey is overnight.");
 return parts.join(" ")
}
function routesPanel(){
 var o=S.opts||[];
 if(!o.length)return"<div class='panel'><h2>No routes</h2><p class='mute'>Couldn't find a route. Start a new journey.</p><button class='btn' onclick='reset()'>New journey</button></div>";
 var cards=o.map(function(r,i){return"<button class='card routecard' style='border:2px solid "+routeColour(r.label)+"' data-route='"+i+"'><b>"+esc(r.label)+"</b><span>"+esc(describeRoute(r))+"</span></button>"}).join("");
 return"<div class='panel'><h2>Choose your route to "+esc(N[S.goal].n)+"</h2><p class='mute' style='margin:0 0 6px'>Target: arrive by "+stamp(S.target||0)+" to earn the \u00a3"+BONUS+" bonus.</p><p class='mute' style='margin:0 0 10px'>Costs, hotels and journey times are revealed once you set off.</p>"+cards+"</div>"
}
function bindModes(){
 document.querySelectorAll(".modebar [data-mode]").forEach(function(b){
  b.classList.toggle("on",b.dataset.mode==MAPX_MODE());
  b.onclick=function(){if(window.MAPX){MAPX.setMode(b.dataset.mode);document.querySelectorAll(".modebar [data-mode]").forEach(function(x){x.classList.toggle("on",x===b)})}};
 });
}
function MAPX_MODE(){return window.MAPX&&MAPX.mode?MAPX.mode():"streets"}
function bindRouteHover(){
 if(S.phase!="routes")return;
 document.querySelectorAll("[data-route]").forEach(function(b){var i=+b.dataset.route;b.onpointerenter=b.onfocus=function(){routeHL(i)}})
}
function routeHL(i){S.hl=i;if(MJ.p)MJ.p.then(function(m){if(m&&S&&S.phase=="routes")updateJourney(m)})}
function chooseRoute(i){
 if(S.phase!="routes"||!S.opts||!S.opts[i])return;
 var r=S.opts[i];S.route=r;S.phase="move";S.plan_steps=r.steps;
 say("Chose the "+r.label.toLowerCase()+" route.");render();
}
// ---- Results journal: your legs, with timestamps and totals
function stamp(h){var m=Math.round(480+absH(h)*60),d=Math.floor(m/1440)+1,t=m%1440;return"Day "+d+", "+pad(Math.floor(t/60))+":"+pad(t%60)}
function jcol(names,modes,times,nights,label){
 var t=times||[0],rows="<li class='jstart'><span>"+esc(S.start=="lon"?"Trafalgar Square":N[S.start].n)+"</span><small>"+stamp(0)+"</small></li>";
 names.slice(1).forEach(function(n,i){rows+="<li><span>"+(ICON[modes[i]]||"")+" "+esc(N[n].n)+(nights&&nights[i]?" "+BED:"")+"</span><small>"+(t[i+1]!==undefined?stamp(t[i+1]):"")+"</small></li>"});
 return"<div class='jcol'><h3>"+label+"</h3><ol>"+rows+"</ol></div>"
}
function jrow(l,a,b){return"<div class='jr'><span>"+l+"</span><b>"+a+"</b><b>"+b+"</b></div>"}
function journalHtml(){
 var p=S.plan,lm=S.lm,pl=p?(p.skipped?"skipped":mins(p.lost)):"\u2013",ll2=lm?(lm.skipped?"skipped":mins(lm.lost)):"\u2013";
 return"<div class='panel jrnl-wrap'><h2>Journal</h2><div class='jrnl'>"+jcol(S.path,S.modes,S.times,S.nights,"Your journey")+"</div><div class='jsum'>"+jrow("Planning",pl,"")+jrow("Last mile",ll2,"")+jrow("Total time",mins(S.h),"target "+mins(S.target||0))+jrow("Spend","\u00a3"+Math.round(S.spent),"")+"</div></div>"
}
function mapPanel(){return""}
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
// Route search only considers places in a corridor around the journey (start to goal), so the search stays fast however many places exist.
// The player is not restricted: their own options at each stop still come from every link.
var ACT={key:"",set:null},CORRIDOR=true,HEUR=true;
// Width of the travel corridor: wide enough to allow sensible detours (for example via a third country), not just the straight line
function corridorLim(d){return 1.6*d+300}
function activeFor(a,b){
 if(!CORRIDOR)return null;
 var k=a+">"+b+">"+ids.length;if(ACT.key==k)return ACT.set;
 var dd=hav(a,b),lim=corridorLim(dd),set={};
 ids.forEach(function(n){if(hav(a,n)+hav(n,b)<=lim)set[n]=1});
 ACT={key:k,set:set};return set
}
function plan(noise,B,X){X=X||{};var vt=X.vt||VT,st=X.from||S.start,gl=X.to||S.goal,act=activeFor(S.start,S.goal);
 var f=E.map(function(){return{h:1+noise*(Math.random()*2-1),c:1+noise*(Math.random()*2-1)}});
 var H=function(n){return HEUR?hav(n,gl)/800:0};var best={},done={},open=[];hpush(open,{n:st,g:X.g||S.term,c:0,w:0,f:H(st),e:[]});
 while(open.length){
  
  var s=hpop(open),k=s.n+s.g+(X.nb?"":"|"+Math.round(s.c/5));
  if(done[k])continue;done[k]=1;
  if(s.n==gl)return s.e;
  (ADJ[s.n]||[]).forEach(function(j){
   var e=E[j];if(!S.air&&e.m=="air"||X.ban&&X.ban[j])return;var g2=grp(e.m),x=xf(s.n,s.g,g2),to=e.a==s.n?e.b:e.a,c2=s.c+x.c+e.c*f[j].c;if(act&&!act[to])return;if(!X.nb&&c2>B)return;
   var w2=s.w+.6+x.h+x.c/vt+e.h*f[j].h+e.c*f[j].c/vt+(X.pen&&X.pen[j]||0),k2=to+g2+(X.nb?"":"|"+Math.round(c2/5));
   if(best[k2]!==undefined&&best[k2]<=w2)return;
   best[k2]=w2;hpush(open,{n:to,g:g2,c:c2,w:w2,f:w2+H(to),e:s.e.concat([{j:j,to:to}])})})
 }
 return null
}
function run(steps,events){
 var h=0,c=0,ab=0,names=[S.start],times=[0],modes=[],nights=[];
 var cur=S.start,g=S.term;steps.forEach(function(s){var e=E[s.j],g2=grp(e.m),x0=xf(cur,g,g2);h+=x0.h;c+=x0.c;var sc=sched({m:e.m,lg:e.lg,to:s.to,dp:e.dp,ev:e.ev},cur,h);if(sc.night)c+=stayCost(1,cur);var dpt=sc.dep;h=sc.dep+e.h;ab+=Math.floor((8+h)/24)-Math.floor((8+dpt)/24);c+=e.c;if(events){var x=ev(S.ev?roll():3);h+=x.h;c+=x.c;if(sc.night&&roll()<=2)h+=1}g=g2;cur=s.to;names.push(s.to);times.push(h);modes.push(e.m);nights.push(sc.night?1:0)});
 return{names:names,times:times,modes:modes,nights:nights,aboard:ab,h:h,c:c,score:h+c/VT}
}
function newRace(a,b,air,evn,lm){
 var camp=NEXT_CAMP||{money:0,legs:1,start:0,log:[]};NEXT_CAMP=null;
 S={start:a,goal:b,air:air,ev:evn,camp:camp,setup:{air:air,evn:evn,lm:lm},lmOn:!!(lm&&lm.on),planOn:!!(lm&&lm.plan),lmClue:lm&&lm.clue,lmLevel:lm&&lm.level,rooms:[],wait:0,tired:false,pend:null,loc:a,h:0,spent:0,cards:[],path:[a],times:[0],modes:[],nights:[],rev:{},log:["Get from "+(a=="lon"?"Trafalgar Square":N[a].n)+" to "+N[b].n+" before the target time."],phase:(lm&&lm.plan)?"plan":"routes",draft:[],over:null};
 S.term=terms(a)[0];S.arr=0;var B=camp.money+INCOME,p=plan(0,B),t=0;
 while(!p&&t++<4){B=Math.round(B*1.5);p=plan(0,B)}
 if(!p){S=null;return false}
 S.budget=B;S.cash=B;S.opt=run(p,false);S.opts=routeOptions(S.budget);S.target=targetFor(routePool(S.budget),S.opt);return true
}
function load(){try{var r=localStorage.getItem(KEY);if(r){var o=JSON.parse(r);if(o&&o.loc&&o.camp&&placeOf(o.start)&&placeOf(o.goal)){if(!o.camp)o.camp={money:0,legs:1,start:0,log:[]};if(!o.setup)o.setup={air:false,evn:false,lm:{on:true,clue:"off",level:"mixed",plan:true}};S=o}}}catch(e){}}
function save(){try{if(S)localStorage.setItem(KEY,JSON.stringify(S));else localStorage.removeItem(KEY)}catch(e){}}
function say(t){S.log.push(t);if(S.log.length>40)S.log.shift()}
function drop(k){var i=S.cards.indexOf(k);if(i>-1)S.cards.splice(i,1)}
function pad(n){return(n<10?"0":"")+n}
function absH(h){return(S&&S.camp?S.camp.start:0)+h}
function dayAhead(dep){var da=Math.floor((8+dep)/24)-Math.floor((8+S.h)/24);return da>0?(da==1?" tomorrow":" in "+da+" days"):""}
function clk(h){var t=480+Math.round(absH(h)*60),d=Math.floor(t/1440),m=t%1440;return"Day "+(d+1)+", "+pad(Math.floor(m/60))+":"+pad(m%60)}

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
 S.h=dep+o.h+tr;S.cash-=o.c;S.spent+=o.c;S.loc=o.to;S.path.push(o.to);S.modes.push(o.m);(S.times=S.times||[0]).push(S.h);S.nights.push(S.slept?1:0);S.slept=0;
 var x=S.ev?ev(roll()):ev(3),t=x.t;
 if(x.c>0||x.h>0){if(has("fixer")){drop("fixer");x={h:0,c:0};t="Your fixer smooths over the trouble."}}
 S.h=Math.max(0,S.h+x.h);S.cash=Math.max(0,S.cash-x.c);S.spent+=x.c;
 say(clk(S.h)+": "+MODE[o.m]+" to "+N[o.to].n+" ("+o.h+" h, \u00a3"+o.c+"). "+t);
 if(S.loc==S.goal){S.arrH=S.h;if(S.lmOn){S.phase="lastmile";S.draft=[];startLM();return render()}settleBonus();S.over="done";return render()}
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
// Campaign: each new leg gives a fixed income on top of any money carried over from the last leg. Tune here.
var INCOME=350,BONUS=150,PLAN_ALLOW=1.5,LM_ALLOW=1.5,NEXT_CAMP=null;
// Target: the median of the reasonable routes plus a planning allowance. Arriving by then earns BONUS on top of INCOME.
// Interim last-mile work: at a culture-4+ city you can stop for a photo challenge. It costs 2 hours whatever the result.
// Payout: £100 for a spot-on guess, falling to £50 at 2 km out. A city pays out once per campaign, and only one stop per leg.
var INTERIM_HOURS=2,PAY_MIN=50,PAY_MAX=100;
function interimPay(m){
 if(m===undefined||m===null)return 0;
 if(m<=100)return PAY_MAX;
 if(m>=2000)return PAY_MIN;
 return Math.round(PAY_MAX-(PAY_MAX-PAY_MIN)*(m-100)/1900)
}
function canInterim(){
 if(!S||S.over||S.phase!=="move"||S.loc===S.goal||S.interimUsed)return false;
 if(cultRating(S.loc)<4)return false;
 return ((S.camp&&S.camp.paid)||[]).indexOf(S.loc)<0
}
function interimLM(){
 if(!canInterim())return;
 S.h+=INTERIM_HOURS;S.interimUsed=1;S.interimCity=S.loc;S.phase="interim";
 say(clk(S.h)+": Stopped in "+N[S.loc].n+" for last-mile work ("+INTERIM_HOURS+" h).");
 startInterimLM();render()
}
function startInterimLM(){
 var n=N[S.loc];
 MAPX.setLabels(true);LM.start({name:n.n,lat:n.la,lon:n.lo,landmark:false,level:"mixed",clueMode:"off",interim:true},function(r){
  var pay=r.skipped?0:interimPay(r.distM);
  S.cash+=pay;S.camp.paid=((S.camp&&S.camp.paid)||[]).concat([S.interimCity]);
  say(clk(S.h)+": Last-mile work in "+n.n+": "+(r.skipped?"skipped":"earned \u00a3"+pay+" ("+r.distText+" off)")+".");
  S.phase="move";render()
 })
}
// The on-time bonus is decided once, when the leg's total time (planning, travel and last mile) is known
function settleBonus(){
 if(S.bonusSettled)return;S.bonusSettled=1;
 if(S.h<=S.target+1e-9){S.bonus=1;S.cash+=BONUS;say(clk(S.h)+": Arrived on time: +\u00a3"+BONUS+".")}else S.bonus=0
}
function targetFor(pool,fallback){
 // reasonable routes: affordable, and not more than 2.5 times the fastest
 var fast=(pool||[]).reduce(function(m,o){return Math.min(m,o.h)},Infinity);
 var hs=(pool||[]).filter(function(o){return o.h<=2.5*fast}).map(function(o){return o.h}).sort(function(a,b){return a-b});
 var base=hs.length?hs[Math.floor(hs.length/2)]:(fallback?fallback.h:0);
 return base+PLAN_ALLOW+LM_ALLOW
}
var MIN_KM=1000,MAX_KM=2000;
function isCity(i){return!N[i].l&&(N[i].s>=2||EXTRA_CITIES.indexOf(i)>-1)}
// Destination candidates come from the gazetteer, so a city can be chosen even when its region is not loaded.
// Places are kept in the same order as the place list, so the same seed gives the same destination.
var GZ=null;
function gazetteer(){
 if(GZ)return GZ;
 GZ=GAZETTEER.split(";").filter(Boolean).map(function(r){var p=r.split("|"),f=p[6]||"";return{id:p[0],la:+p[2],lo:+p[3],l:f.indexOf("l")>-1,s:+((f.match(/\d/)||[1])[0]),region:p[5]}});
 var pos={};PLACE_ORDER.forEach(function(id,k){pos[id]=k});
 GZ.sort(function(a,b){return(pos[a.id]===undefined?1e9:pos[a.id])-(pos[b.id]===undefined?1e9:pos[b.id])});
 return GZ
}
function gzCity(g){return!g.l&&(g.s>=2||EXTRA_CITIES.indexOf(g.id)>-1)}
// Direction of travel as a unit vector (east, north), so the campaign can keep heading the same general way
function kmBetween(a1,o1,a2,o2){var r=Math.PI/180,x=(o2-o1)*r*Math.cos((a1+a2)/2*r),y=(a2-a1)*r;return Math.sqrt(x*x+y*y)*6371}
// Position of any place, whether or not its region is loaded (the gazetteer always has it)
var GZIDX=null;
function placeOf(id){
 if(N[id])return N[id];
 if(!GZIDX){GZIDX={};gazetteer().forEach(function(g){GZIDX[g.id]=g})}
 return GZIDX[id]||null
}
function unitVecP(A,B){var r=Math.PI/180,x=(B.lo-A.lo)*Math.cos((A.la+B.la)/2*r),y=B.la-A.la,n=Math.sqrt(x*x+y*y)||1;return[x/n,y/n]}
function unitVec(a,b){return unitVecP(N[a],N[b])}
var HEAD_LEGS=3,HEAD_SHARE=.75,HEAD_COS=.7;
function pickDest(from,dirs){
 var F=placeOf(from),c=gazetteer().filter(function(g){if(g.id==from||!gzCity(g))return false;var d=kmBetween(F.la,F.lo,g.la,g.lo);return d>=MIN_KM&&d<=MAX_KM}).map(function(g){return g.id});
 if(!c.length)return null;
 var H=[0,0];(dirs||[]).forEach(function(v){H[0]+=v[0];H[1]+=v[1]});
 var hn=Math.sqrt(H[0]*H[0]+H[1]*H[1]);
 if(hn>0.5&&Math.random()<HEAD_SHARE){
  var on=c.filter(function(i){var u=unitVecP(F,placeOf(i));return(u[0]*H[0]+u[1]*H[1])/hn>=HEAD_COS});
  if(on.length)c=on;
 }
 return c[Math.floor(Math.random()*c.length)]
}

// ---- On-demand regions: a region's map data is loaded when a route needs it, then the world is rebuilt from what is loaded.
// Regions are only added, never removed, so places already on screen stay valid.
var REGION_VARS={uk:"REGION_UK",fr:"REGION_FR",benelux:"REGION_BENELUX",de:"REGION_DE","alps-it":"REGION_ALPS_IT",es:"REGION_ES",scandinavia:"REGION_SCANDINAVIA",east:"REGION_EAST",balkans:"REGION_BALKANS","north-africa":"REGION_NORTH_AFRICA",turkey:"REGION_TURKEY"};
var LOADED_REGIONS={},REGION_SCRIPTS={};
// Drop a region from memory: its places and links leave the world, and its script is removed. It loads again if needed.
function unloadRegion(name){
 var v=REGION_VARS[name];
 if(REGION_SCRIPTS[name]){REGION_SCRIPTS[name].remove();delete REGION_SCRIPTS[name]}
 if(v)try{delete window[v]}catch(e){window[v]=undefined}
 delete LOADED_REGIONS[name];
}
function loadRegion(name){
 var v=REGION_VARS[name];
 if(!v)return Promise.reject(new Error("Unknown region "+name));
 if(LOADED_REGIONS[name])return Promise.resolve();
 return new Promise(function(res,rej){
  if(window[v]!==undefined){LOADED_REGIONS[name]=1;return res()}
  var s=document.createElement("script");s.src="data/regions/"+name+".js";REGION_SCRIPTS[name]=s;
  s.onload=function(){if(window[v]!==undefined){LOADED_REGIONS[name]=1;res()}else rej(new Error("Region "+name+" did not load"))};
  s.onerror=function(){rej(new Error("Could not load the "+name+" map data"))};
  document.head.appendChild(s)
 })
}
// Regions needed for a journey: those of the start and goal, the travel corridor, and a ring of neighbours
// within rail and bus range of the corridor, so a stop next to a border still shows its links
var RING_KM=650;
function regionsFor(a,b){
 var G=gazetteer(),A=null,B=null,out={},corridor=[];
 G.forEach(function(g){if(g.id==a){A=g;out[g.region]=1}if(g.id==b){B=g;out[g.region]=1}});
 if(!A||!B)return Object.keys(out);
 var lim=corridorLim(kmBetween(A.la,A.lo,B.la,B.lo));
 G.forEach(function(g){if(kmBetween(A.la,A.lo,g.la,g.lo)+kmBetween(g.la,g.lo,B.la,B.lo)<=lim){out[g.region]=1;corridor.push(g)}});
 // Neighbours come from the precomputed adjacency table (data/adjacency.js), so this is a table read, not a scan of every place
 if(typeof REGION_ADJ!=="undefined")Object.keys(out).forEach(function(r){(REGION_ADJ[r]||[]).forEach(function(n){out[n]=1})});
 else G.forEach(function(g){if(out[g.region])return;for(var k=0;k<corridor.length;k++){if(kmBetween(corridor[k].la,corridor[k].lo,g.la,g.lo)<=RING_KM){out[g.region]=1;return}}});
 return Object.keys(out)
}
// Rebuild the world from every region loaded so far
function rebuildWorld(){
 var rows=[];
 Object.keys(LOADED_REGIONS).forEach(function(k){var v=window[REGION_VARS[k]];if(v)rows=rows.concat(v.split(";").filter(Boolean))});
 var byId={};rows.forEach(function(r){byId[r.split("|")[0]]=r});
 var list=PLACE_ORDER.filter(function(id){return byId[id]}).map(function(id){return byId[id]});
 var have={};list.forEach(function(r){have[r.split("|")[0]]=1});
 CROSSINGS=CROSSINGS_ALL.split("|").filter(function(s){var p=s.split(" ");return have[p[0]]&&have[p[1]]}).join("|");
 PLACES=list.join(";");
 loadWorld(PLACES);
}
var CROSSINGS_ALL=CROSSINGS;
// Make sure the regions a race needs are loaded and the world includes them
function raceReady(a,b){
 var wanted=regionsFor(a,b),need=wanted.filter(function(r){return!LOADED_REGIONS[r]});
 var drop=Object.keys(LOADED_REGIONS).filter(function(r){return wanted.indexOf(r)<0});
 drop.forEach(unloadRegion);
 return Promise.all(need.map(loadRegion)).then(function(){
  if(need.length||drop.length||!ids.length)rebuildWorld()
 })
}
// Start a race once its regions are ready. camp (optional) carries the campaign state into the new leg
function startRace(a,b,air,evn,lm,camp){
 return raceReady(a,b).then(function(){NEXT_CAMP=camp||null;return newRace(a,b,air,evn,lm)})
}
function begin(random){
 var a=document.getElementById("from"),b=document.getElementById("to"),air=false,evn=false,lm={on:true,clue:"off",level:"mixed",plan:true},x,y;
 if(random){
  x="lon";var t=0;
  var fail=function(err){if(err)console.warn(err);S=null;return render(err&&err.message?"Could not load the map: "+err.message+". Check that every file in data/regions/ is in place.":"Couldn't find a route. Try again.")};
  var tryOne=function(){y=pickDest(x);if(!y)return fail();
   return startRace(x,y,air,evn,lm).then(function(ok){if(ok)return render();if(t++<8)return tryOne();return fail()},fail)};
  return tryOne()
 }
 x=a.value;y=b.value;
 if(x==y){S=null;return render("Choose two different places.")}
 return startRace(x,y,air,evn,lm).then(function(ok){if(!ok)return render("No route found between those places.");render()},function(err){S=null;render("Could not load the map for that journey: "+(err&&err.message||err))})
}
// Continue the campaign: the next leg starts where you finished and goes to a random city in the distance band
// Days: the campaign clock runs across legs. Arriving on day x: rest and explore on day x+1, leave 8am on day x+2.
function arrDay(){return Math.floor((absH(S.arrH||0)+8)/24)+1}
function restHtml(){return"<p class='mute'>Arrived "+stamp(S.arrH||0)+". Rest and explore on Day "+(arrDay()+1)+", leave 8am Day "+(arrDay()+2)+".</p>"}
function campLogHtml(){var l=(S.camp&&S.camp.log)||[];if(!l.length)return"";return"<div class='panel'><h2>Campaign so far</h2><ol class='log'>"+l.map(function(e){return"<li>Leg "+e.leg+": "+esc(e.to)+", arrived "+e.arrived+"</li>"}).join("")+"</ol></div>"}
function nextLeg(){
 if(!S||!S.camp)return;
 var from=S.goal,dirs=((S.camp.dirs||[]).concat([unitVec(S.start,S.goal)])).slice(-HEAD_LEGS),to=pickDest(from,dirs);
 if(!to){S=null;return render("No destination found. Start a new journey.")}
 var log=(S.camp.log||[]).concat([{leg:S.camp.legs,to:N[S.goal].n,arrived:stamp(S.arrH||0)}]),start=(arrDay()+1)*24;
 NEXT_CAMP={money:Math.max(0,S.cash),legs:S.camp.legs+1,start:start,log:log,dirs:dirs,paid:S.camp.paid||[]};
 var st=S.setup||{air:false,evn:false,lm:{on:true,clue:"off",level:"mixed",plan:true}};
 startRace(from,to,st.air,st.evn,st.lm,NEXT_CAMP).then(function(ok){if(!ok){S=null;return render("Couldn't find a route. Start a new journey.")}render()},function(err){S=null;render("Could not load the map: "+(err&&err.message||err))})
}
function reset(){LM.reset();S=null;render()}

var ICON={tube:"\ud83d\ude87",rail:"\ud83d\ude86",hsr:"\ud83d\ude84",bus:"\ud83d\ude8c",ferry:"\u26f4\ufe0f",air:"\u2708\ufe0f"},BED="\ud83d\udecf\ufe0f";
function route(names,modes,nights){if(!modes||modes.length!=names.length-1)return names.map(function(n){return N[n].n}).join(" \u2192 ");return names.map(function(n,i){return N[n].n+(i<modes.length?(nights&&nights[i]?" "+BED:"")+" "+ICON[modes[i]]+" ":"")}).join("")}
function res(l,r){return"<p class='res'><b>"+l+": "+r.h.toFixed(1)+" h, \u00a3"+Math.round(r.c)+", score "+r.score.toFixed(1)+"</b><span>"+route(r.names,r.modes,r.nights)+"</span></p>"}

function mins(h){var m=Math.round(h*60);return m<60?m+" min":Math.floor(m/60)+" h "+(m%60)+" min"}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function startLM(){
 var g=N[S.goal];if(MJ.p)MJ.p.then(function(m){if(m)jvis(m,false)});
 MAPX.setLabels(true);LM.start({name:g.n,lat:g.la,lon:g.lo,landmark:g.l,level:S.lmLevel||"mixed",clueMode:"off"},function(r){
  LM.reset();S.lm=r;S.h+=r.lost;settleBonus();S.over="done";S.phase="move";
  say(clk(S.h)+": Last mile: "+(r.skipped?"skipped.":r.title+", "+r.distText+" off, "+mins(r.lost)+" lost."));render()})
}
function lmHtml(){var r=S.lm;if(!r)return"";return"<p class='res'><b>Last mile: "+(r.skipped?"skipped":esc(r.title)+" ("+r.distText+" off)")+"</b><span>You lost "+mins(r.lost)+".</span></p>"}
function render(msg){
 save();var h="<h1>Role Around the World</h1>";
 if(!S){
  var os=GAZETTEER.split(";").filter(Boolean).map(function(r){var p=r.split("|");return{id:p[0],n:p[1]}}).sort(function(a,b){return a.n<b.n?-1:1}).map(function(g){return"<option value='"+g.id+"'>"+g.n+"</option>"}).join("");
  h+="<p class='sub'>You start in Trafalgar Square with \u00a3350. Each leg takes you to a random city 1,000 to 2,000 km away. Work out where it is on the map, choose a route, travel, and finish with a photo challenge. Arrive by the target time for a bonus. Money you keep carries over, so a campaign can run for as long as you like.</p><div class='panel'>"+(msg?"<p style='color:var(--bad)'>"+msg+"</p>":"")+"<div class='row' style='margin-top:12px'><button class='btn' onclick='begin(1)'>Start journey</button></div><p class='mute' style='margin:14px 0 0'><a href='rules.html'>Rules and guide</a></p></div>";
  document.getElementById("app").innerHTML=h;
  return}
 var st=status();
 h+="<div class='hdr'><div class='r1'><span><b>"+clk(S.h)+"</b></span><span><b>\u00a3"+Math.round(S.cash)+"</b></span><span class='st'><span aria-hidden='true'>"+st[0]+"</span> "+st[1]+"</span></div><div class='r2'><div><small>From</small>"+(S.start=="lon"?"Trafalgar Square":N[S.start].n)+"</div><div class='cur'><small>Now</small>"+N[S.loc].n+"</div><div><small>To "+(S.phase=="plan"&&!S.plan||S.phase=="routes"&&!S.route?"?":arrow(S.loc,S.goal))+"</small>"+N[S.goal].n+"</div></div><div class='rv'>Target "+stamp(S.target||0)+"</div></div>";
 if(S&&S.phase=="plan")h+=planIntro();
 if(S)h+="<div class='row tight modebar'><div class='modes'><button class='btn alt' data-mode='streets'>Streets</button><button class='btn alt' data-mode='sat'>Satellite</button><button class='btn alt' data-mode='hybrid'>Hybrid</button></div><button class='btn alt' onclick='mfit()'>Fit journey</button></div>";h+="<div id='sharedmap' class='smap'></div>";
 if(S.over){
  var you={names:S.path,modes:S.modes,nights:S.nights,h:S.h,c:S.spent,score:S.h+S.spent/VT},m=S.over=="broke"?"Stranded: you can't afford any onward fare from "+N[S.loc].n+".":(S.bonus?"You arrived on time.":"You arrived after the target time.");
  h+="<div class='panel'><p class='big'>"+m+"</p>"+(S.over=="done"||S.path.length>1?journalHtml():"")+"<p class='mute'>Leg "+S.camp.legs+" complete. You carry \u00a3"+Math.max(0,Math.round(S.cash))+" into the next leg"+(S.bonus?", including the \u00a3"+BONUS+" on-time bonus":"")+", plus \u00a3"+INCOME+" income for the next leg.</p>"+restHtml()+campLogHtml()+"<div class='row'><button class='btn' onclick='nextLeg()'>Next leg</button><button class='btn alt' onclick='if(confirm(\"End your campaign? Saved progress will be cleared.\"))reset()'>End campaign</button></div></div>"+mapPanel()
 }else{

  if(S.cards.length)h+="<p class='hand'>Carrying: "+S.cards.map(function(k){return CARDS[k][0]}).join(", ")+"</p>";
  if(S.phase=="lastmile"||S.phase=="interim")h+="<div class='panel'><h2>"+(S.phase=="interim"?"Last-mile work":"Last mile")+"</h2><div id='lm'></div></div>";else if(S.phase=="plan")h+=planPanel();else if(S.phase=="routes")h+=routesPanel()+mapPanel();else h+=mapPanel();
  if(S.phase=="lastmile"||S.phase=="interim"||S.phase=="plan"||S.phase=="routes"){}else if(S.phase=="stay"){var po=opts()[S.pend],ss=sched(po,S.loc,S.h);h+="<div class='panel'><h2>No service until "+tm(ss.dep)+"</h2><p style='margin:0 0 10px'>Where will you sleep in "+N[S.loc].n+"?</p>";S.rooms.forEach(function(x,k){h+="<button class='card' onclick='stay("+k+")'"+(x.c>S.cash?" disabled":"")+"><b>"+x.n+", \u00a3"+x.c+"</b><span>"+(x.q?"A proper night's rest.":"Cheap, but you may sleep badly.")+"</span></button>"});if(!S.rooms.length)h+="<p style='margin:0 0 10px'>No rooms are free in town tonight.</p><button class='card' onclick='stay(-1)'><b>Spend the night at the station</b><span>Free, but you will be tired: 1 h lost on the next leg.</span></button>";h+="<button class='link' onclick='S.phase=\"move\";S.pend=null;render()'>Choose a different option</button></div>"}else if(S.phase=="draft"){
   h+="<div class='panel'><h2>Pick one to take with you</h2>";
   S.draft.forEach(function(k){h+="<button class='card' onclick=\"pick('"+k+"')\"><b>"+CARDS[k][0]+"</b><span>"+CARDS[k][1]+"</span></button>"});
   h+="<button class='link' onclick='pick(null)'>Skip</button></div>"
  }else{
   var all=opts(),v=vis(),last="";
   h+="<div class='panel'><h2>Where next?</h2>"+(canInterim()?"<button class='card' onclick='interimLM()'><b>Stop for last-mile work</b><span>2 hours. Earn £"+PAY_MIN+" to £"+PAY_MAX+" for a photo challenge in "+esc(N[S.loc].n)+".</span></button>":"");
   v.show.sort(function(a,b){var x=ORD.indexOf(all[a].m)-ORD.indexOf(all[b].m);return x||all[a].h-all[b].h});
   v.show.forEach(function(i){
    var o=all[i],sc=sched(o,S.loc,S.h);
    if(o.m!=last){h+="<h3>"+GRP[o.m]+"</h3>";last=o.m}
    h+="<button class='opt' onclick='go("+i+")'"+(o.c>S.cash?" disabled":"")+"><div class='to'>"+N[o.to].n+"<small>heads "+dir(S.loc,o.to)+", departs "+tm(sc.dep)+dayAhead(sc.dep)+(sc.ns?", night service":"")+(S.path.indexOf(o.to)>-1?", already visited":"")+"</small></div><span>"+o.h+" h</span><span>\u00a3"+o.c+"</span></button>"});
   if(v.hid>0)h+="<p class='hand'>"+v.hid+" more long-distance links are not shown here.</p><button class='btn alt' onclick='look()'>Look for routes (0.3 h)</button>";h+=xferHtml();
   h+="</div>"}
 }
 h+="<div class='panel'><h2>Travel log</h2><ol class='log' reversed>";
 S.log.slice(-6).reverse().forEach(function(l){h+="<li>"+l+"</li>"});
 h+="</ol></div><button class='link' onclick='if(confirm(\"End your campaign? Saved progress will be cleared.\"))reset()'>End campaign</button>";
 document.getElementById("app").innerHTML=h;drawMap();bindRouteHover();bindModes();fillFlavour();if(S&&(S.phase=="lastmile"||S.phase=="interim")&&!S.over)LM.attach(document.getElementById("lm"));if(S&&S.phase=="routes")document.querySelectorAll("[data-route]").forEach(function(b){b.onclick=function(){chooseRoute(+b.dataset.route)}})
}
// Startup: show the start screen straight away; if a campaign is saved, load its regions first, then resume it
load();
if(S&&S.phase=="interim")S.phase="move";
if(S){raceReady(S.start,S.goal).then(function(){if(S&&S.phase=="lastmile"&&!S.over)startLM();render()},function(err){S=null;render("Could not load the saved map: "+(err&&err.message||err))})}
else render();
window.addEventListener("resize",function(){drawMap()});

// Safety net: if drawing the screen fails, show what happened and a way to restart, rather than a blank page.
(function(){
 var draw=render;
 render=function(msg){
  try{return draw(msg)}
  catch(e){
  console.error(e);
  var box=document.getElementById("app");
  if(box)box.innerHTML="<div class='panel'><h2>Something went wrong</h2><p class='mute'>"+esc(String(e&&e.message||e))+"</p><button class='btn' id='restartbtn'>Start again</button></div>";
  var rb=document.getElementById("restartbtn");
  if(rb)rb.onclick=function(){try{localStorage.removeItem(KEY)}catch(x){}S=null;render()};
  }
 };
})();
