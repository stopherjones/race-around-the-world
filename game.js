var VT=20,KEY="route-generator-v4",S=null,IDX={U:1.15,F:1,B:1.05,N:1.05,G:1.05,S:.85,T:.95,C:1.6,R:1.1,D:1.3,E:.7,K:.75,Y:.6,M:.7,V:.65,H:.8,Q:.6,Z:.6,J:.6,L:.75,P:.95,I:.9,O:.8,X:.6,W:.8,A:.7,a:.75,b:.85,c:.95,d:1.2,e:.7,f:.8,g:.7,h:.6,i:.6,j:1.1,k:1.2,l:1.2,m:.9,n:.95,o:.85,p:.85,q:.8,r:.8,s:.8,t:.85,u:.9,v:.8,w:.8,x:1,y:.75,z:1.2,CV:1,ST:1,KM:.8,MG:.6,MU:1.4,SC:1.8,GE:.85,AM:.9,AZ:.9,JO:.9,IL:1.4,LB:1.3,SY:.6,PS:.7,IQ:.8,IR:.8,SA:1.5,AE:1.6,QA:1.6,BH:1.4,KW:1.3,OM:1.1,YE:.6,KZ:.9,UZ:.6,TM:.9,KG:.6,TJ:.6,AF:.6,FI:1.5,EE:1,LV:.9,LT:.9,BY:.6,UA:.5,MD:.4,RO:.7,SK:.9,SI:1.1,RU:1,PT:.95,IS:1.6,FO:1.6,SH:1.4,PK:.6,IN:.5,NP:.5,BD:.5,LK:.8,MM:.5,TH:.8,LA:.5,KH:.5,VN:.5,BT:.8,CN:.6,HK:1.6,MO:1.5,TW:1.1,MN:.5,ID:.4,PH:.6,MY:.8,SG:1.5,BN:1.1,TL:.7,KP:1,KR:1.3,JP:1.6,PG:1.1,AU:1.8,NZ:1.8,FJ:.8,WS:.8,TO:.8,VU:.8,NC:1.5,SB:.9,TV:1.2,NR:1.5,PW:1.4,MH:1.2,FM:1.1,KI:1,US:2,CA:1.6,MX:1.2,GT:.8,BZ:1.6,HN:.7,SV:.8,NI:.6,CR:1.6,PA:1.2,CO:.8,VE:.6,EC:.7,PE:.7,BO:.6,BR:1,PY:.6,UY:1.4,AR:.9,CL:1.4,GY:1,SR:1,CU:.5,JM:.8,HT:.4,DO:.8,BS:2,TT:1.4,BB:1.8};
var N={};
function loadWorld(str){N={};str.split(";").forEach(function(s){var p=s.split("|"),f=p[5];N[p[0]]={n:p[1],la:+p[2],lo:+p[3],c:p[4],r:f.indexOf("r")>-1,a:f.indexOf("a")>-1,p:f.indexOf("p")>-1,h:f.indexOf("h")>-1,l:f.indexOf("l")>-1,s:+(f.match(/\d/)||[1])[0]}});ids=Object.keys(N);towns=ids.filter(function(i){return!N[i].l});E=[];ADJ={};seen={};buildLinks()}
var MODE={tube:"metro",bus:"bus",coach:"coach",rail:"train",hsr:"fast train",ferry:"ferry",air:"flight",shared:"shared minibus"},GRP={rail:"Trains",hsr:"Fast trains",coach:"Coaches",bus:"Buses",ferry:"Ferries",air:"Flights",tube:"Metro",shared:"Shared transport"},ORD=["rail","hsr","coach","bus","shared","ferry","air","tube"];

function hav(a,b){var A=N[a],B=N[b],r=Math.PI/180,x=(B.lo-A.lo)*r*Math.cos((A.la+B.la)/2*r),y=(B.la-A.la)*r;return Math.sqrt(x*x+y*y)*6371}
function arrow(a,b){if(a==b)return"\u2713";var A=N[a],B=N[b],r=Math.PI/180,x=(B.lo-A.lo)*Math.cos((A.la+B.la)/2*r),y=B.la-A.la,i=Math.round(((Math.atan2(x,y)/r+360)%360)/45)%8;return["\u2191 N","\u2197 NE","\u2192 E","\u2198 SE","\u2193 S","\u2199 SW","\u2190 W","\u2196 NW"][i]}
function status(){if(S.phase==="arrive")return["\ud83c\udf89","Arrived"];if(S.phase==="rest")return["\ud83d\udecf\ufe0f","Rest day"];if(S.over)return["\ud83c\udfc1","Finished"];if(S.phase=="plan")return["\ud83e\udded","Planning"];if(S.phase=="routes")return["\ud83d\uddfa\ufe0f","Choosing a route"];if(S.phase=="lastmile")return["\ud83d\udccd","Checkpoint"];if(S.phase=="interim")return["\ud83d\udccd","Checkpoint work"];if(S.phase=="stay")return["\ud83d\udecf\ufe0f","Finding a bed"];return{r:["\ud83d\ude86","Train station"],b:["\ud83d\ude8c","Bus station"],f:["\u26f4\ufe0f","Ferry terminal"],a:["\u2708\ufe0f","Airport"]}[S.term]}
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
// Landmass: each island is its own group, so no road or rail link is made across the sea. Cape Verde islands are split by place.
var ISLAND_G={MG:4,KM:5,MU:6,SC:7,ST:9,FI:10,IS:11,SH:12,FO:13,LK:14,TW:15,AU:16,NZ:17,FJ:18,WS:19,TO:20,VU:21,NC:22,SB:23,TV:24,NR:25,PW:26,MH:27,FM:28,KI:29,US:30,CA:30,MX:30,GT:30,BZ:30,HN:30,SV:30,NI:30,CR:30,PA:30,CO:31,VE:31,EC:31,PE:31,BO:31,BR:31,PY:31,UY:31,AR:31,CL:31,GY:31,SR:31,CU:32,JM:33,HT:34,DO:34,BS:35,TT:36,BB:37};
// Landmass by place, for islands that share a country code: Java, Sumatra, etc. are separate, and Borneo is one landmass
var PLACE_LANDMASS={jkt:"java",bdo:"java",jog:"java",sub:"java",mdan:"sumatra",plm:"sumatra",mks:"sulawesi",den:"bali",ppt:"borneo",bpn:"borneo",kkb:"borneo",kch:"borneo",bsb:"borneo",sin:"singapore",mnl:"luzon",ceb:"cebu",dav:"mindanao",dil:"timor",kpg:"timor",tyo:"honshu",osa:"honshu",ngo:"honshu",spk:"hokkaido",fuk:"kyushu",oka:"okinawa",pom:"newguinea",lae:"newguinea",jyp:"newguinea",hnl:"hawaii"};
function G(i){var c=N[i].c;if(PLACE_LANDMASS[i])return PLACE_LANDMASS[i];if(c=="CV")return"cv-"+i;if(ISLAND_G[c]!==undefined)return ISLAND_G[c];return c=="U"?1:c=="R"?3:2}
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

function opts(all){
 return(ADJ[S.loc]||[]).filter(function(j){return(S.air||E[j].m!="air")&&(all||grp(E[j].m)==S.term)}).map(function(j){
  var e=E[j],h=e.h,c=e.c;
  return{to:e.a==S.loc?e.b:e.a,m:e.m,h:h,c:c,lg:e.lg,dp:e.dp,ev:e.ev}})
}
// Choose which long-distance links to show at this stop: toward, sideways, a diversion, and red herrings, with a spread of departure times.
// The choice is seeded by the journey, the place and the time, so refreshing the page or reloading a save shows the same list.
function curateLong(all,lg){
 if(lg.length<=5)return lg;
 var seed=hsh(S.start+S.goal+S.loc+Math.floor(S.h*4)),cur=hav(S.loc,S.goal),tw=[],sd=[],aw=[],r=seed;
 lg.forEach(function(i){var d=hav(all[i].to,S.goal);if(d<cur*.95)tw.push(i);else if(d>cur*1.05)aw.push(i);else sd.push(i)});
 var pickN=function(arr,n,key){var s=arr.slice().sort(function(x,y){return key(all[x])-key(all[y])}),out=[];while(out.length<n&&s.length){r=(r*31+7)%1000;out.push(s.splice(r%Math.min(3,s.length),1)[0])}return out};
 var target=Math.min(lg.length,5+seed%4),pick=[];
 pick=pick.concat(pickN(tw,2,function(o){return o.h}));
 pick=pick.concat(pickN(sd,2,function(o){return o.h}));
 pick=pick.concat(pickN(lg.filter(function(i){return pick.indexOf(i)<0&&aw.indexOf(i)<0&&cultRating(all[i].to)>=3}),1,function(o){return o.h}));
 pick=pick.concat(pickN(aw,2,function(o){return o.c}));
 pick=pick.concat(pickN(lg.filter(function(i){return pick.indexOf(i)<0&&aw.indexOf(i)<0}),Math.max(0,target-pick.length),function(o){return o.h}));
 pick=pick.slice(0,target);
 var wait=function(i){return sched(all[i],S.loc,S.h).dep-S.h};
 if(pick.length>1&&!pick.some(function(i){return wait(i)<=1.5})){var soon=lg.filter(function(i){return pick.indexOf(i)<0&&wait(i)<=1.5})[0];if(soon!==undefined)pick[pick.length-1]=soon}
 if(pick.length>1&&!pick.some(function(i){return wait(i)>=3})){var late=lg.filter(function(i){return pick.indexOf(i)<0&&wait(i)>=3})[0];if(late!==undefined)pick[pick.length-1]=late}
 return lg.filter(function(i){return pick.indexOf(i)>=0})
}
// Look for routes: the curated set, plus a few more links ordered toward the goal.
// Away options stay limited to two in total, and the list never grows beyond 12.
function revealSet(all,idx){
 var base=curateLong(all,idx);
 var cur=hav(S.loc,S.goal);
 var dirOf=function(i){var d=hav(all[i].to,S.goal);return d<cur*.95?0:d>cur*1.05?2:1};
 var awayShown=base.filter(function(i){return dirOf(i)===2}).length;
 var rest=idx.filter(function(i){return base.indexOf(i)<0}).sort(function(x,y){
  var dx=dirOf(x),dy=dirOf(y);return dx!==dy?dx-dy:hav(all[x].to,S.goal)-hav(all[y].to,S.goal)});
 var extra=[];
 rest.forEach(function(i){
  if(base.length+extra.length>=12)return;
  if(dirOf(i)===2){if(awayShown>=2)return;awayShown++}
  extra.push(i)
 });
 return base.concat(extra)
}
function vis(){
 var all=opts(),idx=all.map(function(_,i){return i}),loc=idx.filter(function(i){return!all[i].lg}),lg=idx.filter(function(i){return all[i].lg});
 if(S.rev[S.loc+S.term]){var rs=revealSet(all,idx);return{show:rs,hid:idx.length-rs.length}}
 var cl=curateLong(all,idx);return{show:cl,hid:idx.length-cl.length}
}
var WIN={tube:[5.5,23.5],bus:[8,22],rail:[7,22],ferry:[6,21],hsr:[6.5,21],air:[6,21],coach:[6,23]};
function hsh(s){var x=0;for(var i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))%1000;return x}
var HW={tube:.12,bus:.6,rail:.8,hsr:1.5,ferry:2,air:4};
// Service frequency: headway grows with leg length (short hops run often, long hops less often); ferries run about half as often again
function hdw(o,from){var b=o.lg&&o.m=="bus"?3:o.lg&&o.m=="rail"?2:HW[o.m],f=Math.min(3,.7+hav(from,o.to)/500);return b*f*(o.m=="ferry"?2:1)*[0,1.5,1,.7][N[from].s]}
function nextDep(o,from,t){if(o.dp!=null){var evd=o.ev||1,pd=hsh(from+o.to)%evd,A=8+t,dy=Math.floor(A/24);for(var k=0;k<=evd*2+1;k++){var d=dy+k;if(d%evd==pd&&d*24+o.dp>=A-1e-9)return d*24+o.dp-8}}var H=hdw(o,from),ph=hsh(from+o.to+o.m)/1000*H,n=Math.ceil((8+t-ph)/H-1e-9);return ph+n*H-8}
// Local names for shared vehicles, by the country of departure (generic where not listed)
var SHARED_NAME={M:"grand taxi",V:"dolmuş",K:"kombi",Y:"marshrutka",Q:"taxi brousse",Z:"car rapide",W:"matatu",A:"daladala",I:"danfo",P:"trotro",X:"minibus",J:"microbus",L:"shared taxi",O:"bush taxi",a:"matatu",b:"minibus",c:"bush taxi",d:"taxi",e:"minibus",f:"minibus",g:"kombi",h:"minibus",i:"chapa",j:"minibus taxi",k:"combi",l:"combi",m:"candongueiro",n:"gbaka",o:"taxi brousse",p:"wewe",q:"taxi brousse",r:"taxi brousse",s:"poda-poda",t:"taxi",u:"minibus",v:"toca-toca",w:"taxi",x:"taxi",y:"taxi",z:"taxi",CV:"aluguer",ST:"taxi",KM:"taxi-brousse",MG:"taxi-be",MU:"bus",SC:"taxi",GE:"marshrutka",AM:"marshrutka",AZ:"marshrutka",JO:"service",IL:"sherut",LB:"service",SY:"service",PS:"service",IQ:"taxi",IR:"service",SA:"taxi",AE:"taxi",QA:"taxi",BH:"taxi",KW:"taxi",OM:"taxi",YE:"service",KZ:"marshrutka",UZ:"marshrutka",TM:"taxi",KG:"marshrutka",TJ:"marshrutka",AF:"service",FI:"taxi",EE:"minibus",LV:"marshrutka",LT:"marshrutka",BY:"marshrutka",UA:"marshrutka",MD:"marshrutka",RO:"maxi-taxi",SK:"minibus",SI:"minibus",RU:"marshrutka",PT:"taxi",IS:"taxi",FO:"taxi",SH:"taxi",PK:"qingqi",IN:"shared jeep",NP:"micro",BD:"CNG",LK:"tuk-tuk",MM:"minibus",TH:"songthaew",LA:"minibus",KH:"minibus",VN:"xe khach",BT:"taxi",CN:"minibus",HK:"minibus",MO:"taxi",TW:"taxi",MN:"taxi",ID:"angkot",PH:"jeepney",MY:"minibus",SG:"bus",BN:"bus",TL:"minibus",KP:"bus",KR:"bus",JP:"bus",PG:"PMV",AU:"bus",NZ:"bus",FJ:"bus",WS:"bus",TO:"bus",VU:"bus",NC:"bus",SB:"bus",TV:"bus",NR:"bus",PW:"bus",MH:"bus",FM:"bus",KI:"bus",US:"bus",CA:"bus",MX:"combi",GT:"microbus",BZ:"bus",HN:"rapidito",SV:"microbus",NI:"chapa",CR:"bus",PA:"bus",CO:"colectivo",VE:"por puestos",EC:"buseta",PE:"combi",BO:"micro",BR:"onibus",PY:"bus",UY:"bus",AR:"colectivo",CL:"micro",GY:"minibus",SR:"minibus",CU:"almendron",JM:"route taxi",HT:"tap-tap",DO:"concho",BS:"jitney",TT:"maxi taxi",BB:"minibus"};
function sharedName(from){return SHARED_NAME[N[from]&&N[from].c]||"shared minibus"}
// A wait is an overnight if it lasts more than 4 hours and is still going at 3 am on the clock: evening services will have left, and morning ones have not started
function spansNight(t,d){if(d-t<=4)return false;for(var k=Math.floor((t-19)/24);k*24+19<d;k++){if(k*24+19>t)return true}return false}
function sched(o,from,t){
 // Shared vehicles leave when full: the wait is an estimate, seeded so it is the same for everyone
 if(o.m=="shared"){var w=0.5+hsh(from+o.to+Math.floor(t))/333;return{dep:t+w,night:0,ns:0,nn:1}}
 // Timetabled crossings with a regular headway
 if(o.hw>0&&o.dp>=0){var step=Math.max(24,o.hw),base=o.dp-8,dd=base+Math.max(0,Math.ceil((t-base)/step-1e-9))*step;if(dd<t-1e-9)dd+=step;var da=Math.floor((8+dd)/24)-Math.floor((8+t)/24);return{dep:dd,night:spansNight(t,dd)?1:0,nn:Math.max(1,da),ns:0}}
 var d0=nextDep(o,from,t),tod=(8+d0)%24,day=Math.floor((8+d0)/24),w=WIN[o.m];
 if((o.m=="rail"||o.m=="bus")&&o.lg)w=[6,23];
 // Leaving inside the operating hours: travel on, but still find a bed if the wait spans the night
 if(tod>=w[0]&&tod<=w[1])return{dep:d0,night:spansNight(t,d0)?1:0,ns:0};
 // Some long-distance services run through the night; you ride, so no hotel
 if((o.m=="bus"&&o.lg&&hsh(from+o.to+day)%100<60)||(o.m=="rail"&&o.lg&&hsh(from+o.to+day)%100<30))return{dep:d0,night:0,ns:1};
 // Otherwise wait for the service to reopen
 var ws=(tod<w[0]?day*24:(day+1)*24)+w[0]-8,d2=nextDep(o,from,ws);
 return{dep:d2,night:spansNight(t,d2)?1:0,ns:0}
}
function stayCost(k,n){return Math.round([0,22,65][k]*IDX[N[n].c]*[0,.9,1.1,1.4][N[n].s])}
function hpush(a,x){a.push(x);var i=a.length-1;while(i>0){var p=(i-1)>>1;if((a[p].f||a[p].w)<=(a[i].f||a[i].w))break;var t=a[p];a[p]=a[i];a[i]=t;i=p}}
function hpop(a){var t=a[0],l=a.pop();if(a.length){a[0]=l;var i=0,n=a.length;for(;;){var c=2*i+1;if(c>=n)break;if(c+1<n&&(a[c+1].f||a[c+1].w)<(a[c].f||a[c].w))c++;if((a[i].f||a[i].w)<=(a[c].f||a[c].w))break;var u=a[i];a[i]=a[c];a[c]=u;i=c}}return t}
function mkRooms(){var n=N[S.loc],pav=[0,.5,.8,.95][n.s],base=45*IDX[n.c]*[0,.9,1.1,1.4][n.s];if(Math.random()>=pav)return[];var c=Math.round(base*(.5+Math.random()*1.5));return[{n:"Find a room",c:c,q:c>=base?1:0}]}
function ll(n){return[N[n].lo,N[n].la]}
// ---- Journey map: overlay layers on the shared MapLibre map (map.js)
var MJ={p:null,fit:""},JL=["j-ferry","j-nodes","j-opt","j-me","j-opts","j-optlab","j-pts","j-ptlab"];
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
 ["j-opt","j-me","j-opts","j-pts"].forEach(function(id){map.addSource(id,{type:"geojson",data:fc([])})});
 map.addLayer({id:"j-opt",type:"line",source:"j-opt",layout:{"line-cap":"round"},paint:{"line-color":"#566872","line-width":2,"line-dasharray":[0.5,2.5]}});
 map.addLayer({id:"j-me",type:"line",source:"j-me",layout:{"line-join":"round"},paint:{"line-color":"#1b6f63","line-width":3.5}});
 map.addLayer({id:"j-opts",type:"circle",source:"j-opts",paint:{"circle-radius":6,"circle-color":"#ffffff","circle-stroke-color":"#1b6f63","circle-stroke-width":2}});
 map.addLayer({id:"j-optlab",type:"symbol",source:"j-opts",layout:{"text-field":["get","name"],"text-font":F,"text-size":12,"text-offset":[0,1],"text-anchor":"top","symbol-sort-key":1},paint:halo});
 map.addLayer({id:"j-pts",type:"circle",source:"j-pts",paint:{"circle-radius":["match",["get","kind"],"goal",8,"me",7,5],"circle-color":["match",["get","kind"],"start","#13242f","me","#1b6f63","rgba(0,0,0,0)"],"circle-stroke-color":["match",["get","kind"],"goal","#d0432b","#ffffff"],"circle-stroke-width":["match",["get","kind"],"goal",3,2]}});
 map.addLayer({id:"j-ptlab",type:"symbol",source:"j-pts",layout:{"text-field":["get","label"],"text-font":F,"text-size":12,"text-offset":[0,1.1],"text-anchor":"top","text-allow-overlap":true,"symbol-sort-key":0},paint:halo})
}
function fitJourney(map){
 var p=[ll(S.start),ll(S.goal),ll(S.loc)];if(S.over&&S.opt)p=p.concat(S.opt.names.map(ll));
 var b=new maplibregl.LngLatBounds(p[0],p[0]);p.forEach(function(c){b.extend(c)});
 map.fitBounds(b,{padding:48,maxZoom:8,duration:0})
}
function updateJourney(map){
 MJ.cur=map;
 jvis(map,true);
 var src=function(id,d){var s=map.getSource(id);if(s)s.setData(d)};
 src("j-me",MJ.anim?animLine():lnf(S.path.map(ll)));src("j-opt",S.over&&S.opt?lnf(S.opt.names.map(ll)):fc([]));
 var o=[];if(!S.over&&S.phase=="move"){var all=opts();vis().show.forEach(function(i){o.push(ptf(ll(all[i].to),{name:N[all[i].to].n}))})}
 src("j-opts",fc(o));
 src("j-pts",fc([ptf(ll(S.start),{kind:"start",label:""}),ptf(ll(S.goal),{kind:"goal",label:N[S.goal].n}),ptf(ll(S.loc),{kind:"me",label:S.loc==S.goal?"":N[S.loc].n})]));
 var key=S.start+S.goal+(S.over?"o":"");if(MJ.fit!=key){MJ.fit=key;fitJourney(map)}
}
function drawMap(){
 var box=document.getElementById("sharedmap");if(!box||!S)return;
 MJ.p=MJ.p||MAPX.init(box).catch(function(e){MJ.p=null;console.warn("Map failed",e);var pf=document.getElementById("planfail");if(pf)pf.hidden=false});
 MAPX.attach(box);
 MJ.p.then(function(map){var b=document.getElementById("sharedmap");if(!map||!b||!S)return;if(S.phase!="lastmile"&&S.phase!="interim")MAPX.setLabels(false);if(MJ.resetView&&S.phase!="lastmile"&&S.phase!="interim"){map.setMaxBounds(null);map.setMinZoom(0);MJ.fit="";MJ.resetView=false}
 MAPX.attach(b);setupJourney(map);if(S.phase=="plan")planMap(map);else{planClean(map);updateJourney(map)}})
}
// ---- Planning phase: guess where the destination is on the unlabelled map; the error becomes time lost before you leave
var PL={on:false,pin:null,truth:null,guess:null,fn:null},PLAN_KM_PER_H=150,PLAN_MAX_H=8;
function kmc(a,b){var r=Math.PI/180,x=(b[0]-a[0])*r*Math.cos((a[1]+b[1])/2*r),y=(b[1]-a[1])*r;return Math.sqrt(x*x+y*y)*6371}
function planLost(km){return Math.min(PLAN_MAX_H,km/PLAN_KM_PER_H)}
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
function planPanel(){return planPanelBase()}
// Destination introductions: generated live through the Groq proxy (Cloudflare Worker), one request per city, cached for the session
var FLAVOUR_URL="https://groq-proxy.chrisjones59.workers.dev/chat/completions",FLAVOUR_MODEL="openai/gpt-oss-120b",FLAV={};
function flavourPrompt(c){return"You are producing a travel TV show - provide a short, light, informative voiceover script introducing "+c+". Your response should start \""+c+"\", then cover its geographic location, history and current significance. Keep it to around 100 words."}
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
// One combined sentence for the journey, built from the modes on offer. No place names beyond the start and finish.
function routeFlavourFallback(from,to,options){
 var kinds={};(options||[]).forEach(function(o){(o.modes||[]).forEach(function(m){kinds[m]=1})});
 var pick=function(list){return list[mkHash(from+">"+to+">"+(options||[]).length)%list.length]};
 var fast=kinds.hsr?"fast, reliable but expensive trains":kinds.rail?"quicker trains, at a premium":kinds.air?"flights":"the quickest connections on offer";
 var slow;
 if(kinds.ferry&&(kinds.bus||kinds.coach||kinds.shared))slow="the tourist route along the coast, joining up local buses and ferries";
 else if(kinds.ferry)slow="the coastal route by ferry, with some waiting for sailings";
 else if(kinds.shared)slow="the cheap way, joining up shared minibuses and local buses";
 else if((kinds.bus||kinds.coach)&&kinds.rail)slow="the tourist route, joining up local buses and trains";
 else if(kinds.bus||kinds.coach)slow="cheaper long-distance buses, which take their time";
 else slow=null;
 var verb=pick(["you can opt for ","you could take ","you can choose "]);
 if(!slow)return"To get from "+from+" to "+to+", "+pick(["you can take ","you could travel by "])+fast+".";
 return"To get from "+from+" to "+to+", "+verb+fast+", or "+slow+"."
}
function fillRouteFlavour(){
 var el=document.getElementById("route-flavour");if(!el||!S||S.phase!=="routes")return;
 var from=S.start=="lon"?"London":N[S.start].n,to=N[S.goal].n,key=S.start+">"+S.goal;
 var current=document.getElementById("route-flavour");if(current)current.textContent=routeFlavourFallback(from,to,S.opts)
}
// ============ REST DAY ============
// After a leg, the rest day is a free day in the arrival town: trade at the stall, find buyers, then leave at 8am on day x+2.
// Stock, prices and buyers come from the Groq proxy, and are scored on one universal 1 to 10 scale (see the market prototype).
var MK_KINDS=["luxury","useful","cultural","food"];
var MK_BAND_NEUTRAL={character:"No clear character, so buyers want things in the usual way.",weights:{luxury:3,useful:3,cultural:3,food:3}};
var MK_CAP=6;
function mkHash(str){var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mkRand(){var parts=Array.prototype.slice.call(arguments),a=mkHash(parts.join("|"));a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
function mkRoll(lo,hi){var parts=Array.prototype.slice.call(arguments,2);return lo+(hi-lo)*mkRand.apply(null,parts)}
function mkMoney(v){return Math.round(15*Math.pow(1.5,Math.min(10,Math.max(1,v))-1))}
function mkBuy(v,supply){return mkMoney(v)*(0.6+0.08*(11-supply))}
function mkSell(v,demand){return mkMoney(v)*(0.6+0.08*demand)}
function mkClamp(v,d){var n=Math.round(Number(v));if(!isFinite(n))n=d;return Math.min(10,Math.max(1,n))}
function mkJson(text){var t=String(text||"").trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");try{return JSON.parse(t)}catch(e){var a=t.indexOf("{"),b=t.lastIndexOf("}");if(a>=0&&b>a){try{return JSON.parse(t.slice(a,b+1))}catch(e2){}}throw new Error("unexpected format")}}
function mkAsk(prompt){return fetch(FLAVOUR_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:FLAVOUR_MODEL,messages:[{role:"user",content:prompt}],temperature:0.9})}).then(function(r){if(!r.ok)throw new Error("status "+r.status);return r.json()}).then(function(j){return mkJson(j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content)})}
function mkPips(n){var h="<span class='pips'>";for(var i=1;i<=10;i++)h+="<i"+(i<=n?" class='on'":"")+"></i>";return h+"</span>"}
function mkGbp(n){return "\u00a3"+Math.round(n).toLocaleString("en-GB")}
function mkCity(){return N[S.goal]?N[S.goal].n:""}
function mkDayNo(){return arrDay()+1}
function mkMarket(){
 var c=S.camp;if(!c.market||c.market.key!==mkCity()+"|"+mkDayNo())c.market={key:mkCity()+"|"+mkDayNo(),stall:null,profile:null};
 return c.market
}
function mkSeed(){return(S.camp&&S.camp.seed)||1}
// One request for everything the market needs: the town's profile, its stock and a buyer for each unsold item
function mkVisitPrompt(needStall,todo){
 var c=mkCity(),parts=["You are producing a travel game set in "+c+". Answer every part below in one reply."];
 if(needStall)parts.push("PROFILE: describe what the buyers of "+c+" tend to want, using general knowledge of the town's wealth, cost of living, fashions, working economy and cultural life. Give character as one short phrase, and weights scoring each kind of item from 1 (little interest) to 5 (strong interest), with 3 as neutral: luxury (fine craft, jewellery, fragrance), useful (tools, cookware, textiles, staples), cultural (folk art, instruments, ritual objects), food (produce, preserves, drink). A fashionable affluent city leans to luxury; a working port or farming region leans to useful goods.");
 if(needStall)parts.push("STOCK: list 3 to 5 specialist items genuinely associated with "+c+": local crafts, foods, produce or trades a visitor could buy from a maker or market there. Be specific and avoid generic goods. For each give name; craft (who makes it, one short phrase); origin_note (12 words maximum); value: a whole number 1 to 10 on a universal scale that means the same anywhere (1 is an everyday item, 10 a rare treasure); supply: a whole number 1 to 10 for how readily available it is in "+c+" (10 abundant, 1 scarce); kind: one of luxury, useful, cultural or food. Spread scores across the range: a typical town should sit around 5.");
 if(todo.length)parts.push("BUYERS: for each traveller item listed below, invent one local buyer who would realistically be shopping in "+c+". Give name; type (dealer, collector, shop owner or agent); line: one in-character sentence about the item and where they might try to sell it, which can be far away; demand: a whole number 1 to 10 for how much "+c+"'s buyers want this kind of item, on the same universal scale as the item's value, based on the town's wealth, climate, tastes, existing crafts and how far the item is from local life. Many should be 2 to 5, and only a genuine match 8 or more. savvy: a whole number 1 to 5 for how well they know the trade. Copy each item's ref exactly. Items: "+JSON.stringify(todo.map(function(x){return{ref:x.uid,name:x.name,craft:x.craft,origin:x.origin,value:x.value}})));
 var shape=[];
 if(needStall)shape.push('"character":"","weights":{"luxury":3,"useful":3,"cultural":3,"food":3},"items":[{"name":"","craft":"","origin_note":"","value":5,"supply":5,"kind":"useful"}]');
 if(todo.length)shape.push('"buyers":[{"ref":0,"name":"","type":"","line":"","demand":4,"savvy":3}]');
 parts.push("Return ONLY valid JSON, with no markdown: {"+shape.join(",")+"}");
 return parts.join("\n\n");
}
function passingDealer(){return{name:'A passing dealer',type:'dealer',line:'Takes a look, shrugs, and makes an offer.',demand:4,savvy:3}}
function mkBuyer(b){return{name:String(b.name||'A buyer').slice(0,60),type:String(b.type||'dealer').slice(0,20),line:String(b.line||'').slice(0,300),demand:mkClamp(b.demand,4),savvy:Math.min(5,Math.max(1,Math.round(Number(b.savvy)||3)))}}
function mkApply(j,needStall,todo){
 var m=mkMarket();
 if(needStall){
  var w=j.weights||{},weights={};MK_KINDS.forEach(function(k){weights[k]=Math.min(5,Math.max(1,Math.round(Number(w[k])||3)))});
  var list=(j.items||[]).slice(0,5);if(!list.length)throw new Error('no items');
  m.profile={character:String(j.character||'').slice(0,120),weights:weights};
  m.stall=list.map(function(x,i){var id='d'+mkDayNo()+'i'+i;var item={name:String(x.name||'Unnamed').slice(0,60),craft:String(x.craft||'').slice(0,90),origin:String(x.origin_note||'').slice(0,120),value:mkClamp(x.value,5),supply:mkClamp(x.supply,5),kind:MK_KINDS.indexOf(x.kind)>=0?x.kind:'useful',id:id};item.ask=Math.round(mkBuy(item.value,item.supply)*mkRoll(0.95,1.05,mkSeed(),mkCity(),mkDayNo(),id,'ask'));return item});
 }
 var byRef={};(j.buyers||[]).forEach(function(b){byRef[String(b.ref)]=b});
 todo.forEach(function(x){var b=byRef[String(x.uid)];x.buyer=b?mkBuyer(b):passingDealer()});
}
function mkFallback(needStall,todo){
 var m=mkMarket();
 if(needStall){m.profile=MK_BAND_NEUTRAL;m.stall=mkDemoStock().map(function(x,i){var id='d'+mkDayNo()+'i'+i;return Object.assign({},x,{id:id,ask:Math.round(mkBuy(x.value,x.supply)*mkRoll(0.95,1.05,mkSeed(),mkCity(),mkDayNo(),id,'ask'))})})}
 todo.forEach(function(x){if(!x.buyer)x.buyer=passingDealer()});
}
function restVisit(){
 var m=mkMarket();S.camp.marketOpen=true;
 var needStall=!m.stall,todo=S.camp.pack.filter(function(x){return!x.buyer});
 if(m.finding||(!needStall&&!todo.length)){render();return}
 m.finding=true;render();
 var pre=MK_PRE&&needStall&&MK_PRE.key===mkCacheKey()&&todo.every(function(x){return MK_PRE.uids.indexOf(x.uid)>=0})?MK_PRE.promise:null;
 MK_PRE=null;
 (pre||mkAsk(mkVisitPrompt(needStall,todo)))
  .then(function(j){mkApply(j,needStall,todo)})
  .catch(function(){mkFallback(needStall,todo)})
  .then(function(){m.finding=false;render()});
}
function mkDemoStock(){return[
 {name:"Hand-thrown clay vessel",craft:"Local potter's workshop",origin:"Clay from the nearby hills, a long tradition",value:3,supply:9,kind:"useful"},
 {name:"Aged local olive oil",craft:"Family press",origin:"Pressed from groves outside the old walls",value:5,supply:6,kind:"food"},
 {name:"Hand-woven textile",craft:"Weaver's cooperative",origin:"A pattern unique to this town's looms",value:8,supply:2,kind:"cultural"}]}
function restBuyAt(i){
 var m=mkMarket(),x=m.stall&&m.stall[i];
 if(!x||S.cash<x.ask||S.camp.pack.length>=MK_CAP)return;
 S.cash-=x.ask;
 S.camp.pack.push(Object.assign({},x,{uid:S.camp.nextUid=(S.camp.nextUid||0)+1,boughtIn:mkCity(),buyer:null}));
 say("Bought "+x.name+" in "+mkCity()+" for "+mkGbp(x.ask)+".");render();
}
// The offer: the town's view of the item, moved by what the town wants from its profile, with a roll narrowed by savvy
function restEffDemand(x){var m=mkMarket(),b=x.buyer||{demand:4},w=((m.profile||MK_BAND_NEUTRAL).weights||{})[x.kind]||3;return Math.min(10,Math.max(1,b.demand+Math.round(w-3)))}
function restOffer(x){
 var b=x.buyer||{savvy:3},base=mkSell(x.value,restEffDemand(x)),width=0.36-0.06*b.savvy,
  r=mkRoll(-1,1,mkSeed(),mkCity(),mkDayNo(),x.id||x.uid,"offer"),key=mkCity()+"|"+x.name,
  repeat=Math.max(0.5,1-0.15*((S.camp.sales||{})[key]||0));
 return Math.max(5,Math.round(base*(1+width*r)*repeat))
}
function restSell(uid){
 var i=S.camp.pack.findIndex(function(p){return p.uid===uid});if(i<0)return;
 var x=S.camp.pack[i],price=restOffer(x);
 S.camp.pack.splice(i,1);S.cash+=price;
 S.camp.sales=S.camp.sales||{};var key=mkCity()+"|"+x.name;S.camp.sales[key]=(S.camp.sales[key]||0)+1;
 say("Sold "+x.name+" in "+mkCity()+" to "+(x.buyer?x.buyer.name:"a buyer")+" for "+mkGbp(price)+" (paid "+mkGbp(x.ask)+").");render();
}
function restLeave(){nextLeg()}
function restStart(){
 S.phase="rest";S.camp.market=null;S.camp.marketOpen=false;say("Rest day in "+mkCity()+".");render();
}
function restCloseMarket(){S.camp.marketOpen=false;render()}
function restPage(){
 var arr=arrDay(),city=mkCity();
 var tl="<div class='tl'><div><b>Arrived</b>day "+arr+"</div><div class='now'><b>Rest day</b>day "+(arr+1)+"</div><div><b>Leave 8am</b>day "+(arr+2)+"</div></div>";
 var h="<div class='panel'><h2>Rest day in "+esc(city)+"</h2><p class='mute mb6'>A free day. Visit the market to trade, explore the town, then leave at 8am.</p>"+tl+"</div>";
 h+=S.camp.marketOpen?marketHtml():"<div class='panel'><h2>Market</h2><p class='mute mb10'>Sell what you carry and buy local goods to take on the next leg.</p><button class='btn' onclick='restVisit()'>Visit the market</button></div>";
 h+=thingsHtml();
 h+="<div class='panel'><button class='btn' onclick='restLeave()'>Leave for the next leg (8am, day "+(arr+2)+")</button><p class='mute mt8'>Items you're carrying come with you. Buyers are found afresh in each town.</p></div>";
 return h
}
// Market view: goods to sell first, then the stock to buy
function marketHtml(){
 var m=mkMarket(),busy=!!m.finding,unsold=S.camp.pack.some(function(x){return!x.buyer});
 var h="<div class='panel'><h2>Goods for trade ("+S.camp.pack.length+"/"+MK_CAP+")</h2>";
 if(!S.camp.pack.length)h+="<p class='mute mb8'>Nothing to sell yet. Buy local goods below.</p>";
 else h+=packSellHtml();
 if(unsold&&!busy)h+="<div class='row mt10'><button class='btn alt' onclick='restVisit()'>Find buyers for my pack</button></div>";
 h+="</div><div class='panel'><h2>Buy local goods</h2>";
 if(!m.stall)h+="<p class='mute'>"+(busy?"Asking around the market\u2026":"The market is closed today.")+"</p>";
 else{
  var full=S.camp.pack.length>=MK_CAP;
  h+="<p class='mute mb8'>"+esc(m.profile&&m.profile.character?m.profile.character:"")+"</p>";
  h+="<div class='mgrid'>"+m.stall.map(function(x,i){
   var owned=S.camp.pack.some(function(p){return p.id===x.id}),can=!owned&&!full&&S.cash>=x.ask;
   return"<div class='mcard'><b>"+esc(x.name)+"</b><div class='mute fine'>"+esc(x.craft)+"</div><div class='mute fine'><em>"+esc(x.origin)+"</em></div>"+
    "<div class='mstats'>Value <b>"+x.value+"</b> "+mkPips(x.value)+" &nbsp; Supply <b>"+x.supply+"</b> "+mkPips(x.supply)+"</div>"+
    "<div class='mrow'><b class='price'>"+mkGbp(x.ask)+"</b><button class='btn' "+(can?"":"disabled")+" onclick='restBuyAt("+i+")'>"+(owned?"In pack":full?"Pack full":S.cash<x.ask?"Too dear":"Buy")+"</button></div></div>"
  }).join("")+"</div>";
 }
 h+="<div class='row mt12'><button class='btn alt' onclick='restCloseMarket()'>Close market</button></div></div>";
 return h
}
// Goods in the pack, each with its buyer and offer
function packSellHtml(){
 return "<div class='mgrid sell'>"+S.camp.pack.map(function(x){
  var o=restOffer(x),d=o-x.ask,dm=restEffDemand(x);
  var buyer=x.buyer?"<div class='buyer'><b>"+esc(x.buyer.name)+"</b> ("+esc(x.buyer.type)+"): "+esc(x.buyer.line)+"<div class='mt4'>Demand here <b>"+dm+"</b> "+mkPips(dm)+" \u00b7 savvy "+x.buyer.savvy+"/5</div></div>":"<div class='mute fine'>No buyer found yet.</div>";
  return"<div class='mcard'><b>"+esc(x.name)+"</b><div class='mute fine'>Paid "+mkGbp(x.ask)+"</div>"+buyer+
   "<div class='mrow mt6'><b>Offer "+mkGbp(o)+"</b><span class='delta "+(d>=0?"up":"down")+"'>"+(d>=0?"+":"\u2212")+mkGbp(Math.abs(d))+"</span></div>"+
   "<button class='btn mt6 wfull' "+(x.buyer?"":"disabled")+" onclick='restSell("+x.uid+")'>Sell</button></div>"
 }).join("")+"</div>";
}
// Things to do on a rest day: search links for the town
function thingsHtml(){
 var q=function(s){return encodeURIComponent(s).replace(/%20/g,"+")},c=q(mkCity());
 var items=[
  ["Discover the local music scene","Acts across traditional, mainstream and experimental music.","https://www.google.com/search?q=tell+me+about+the+music+scene+in+"+c+".+Give+me+examples+of+acts+covering+traditional%2C+mainstream+and+contemporary+%2F+experimental+music"],
  ["Paint a local street scene","Painting inspiration from the town.","https://www.google.com/search?q=give+me+painting+inspiration+from+"+c+""],
  ["Visit the local galleries and museums","What's on, and where to go.","https://www.google.com/search?q=art+galleries+and+museums+in+"+c],
  ["Watch a short documentary","Films about the town and its surroundings.","https://www.google.com/search?q=short+documentary+about+"+c+"&udm=7"],
  ["Learn the town's history","Key events and places from its past.","https://www.google.com/search?q=history+of+"+c]
 ];
 return "<div class='panel'><h2>Things to do</h2>"+items.map(function(i){return"<a class='btn' href='"+i[2]+"' target='_blank' rel='noopener'>"+esc(i[0])+"</a><p class='mute note'>"+esc(i[1])+"</p>"}).join("")+"</div>";
}
function planIntro(){
 var n=N[S.goal].n;
 return"<div class='panel'><h2>Destination: "+esc(n)+"</h2><p class='flavour' id='flavour-text'>Loading an introduction to "+esc(n)+"…</p>"+"</div>"
}
function planPanelBase(){
 return"<div class='panel'>"+(S.plan?"":"<div class='guessbox'><p class='guessprompt'>Where is "+esc(N[S.goal].n)+"? Tap the map to drop a pin. The further off you are, the more time you lose working out how to get there.</p><div class='row m0'><button class='btn' id='planguess' onclick='planGuess()'"+(PL.guess?"":" disabled")+">Lock in guess</button></div></div>")+"<div id='planres'>"+(S.plan?planResHtml():"")+"</div><div id='planfail' hidden><p class='mute'>The map couldn't load.</p><button class='btn alt' onclick='planDone(1)'>Skip planning</button></div></div>"
}
function planResHtml(){var p=S.plan;return"<p>You were "+Math.round(p.km)+" km off: "+mins(p.lost)+" lost.</p><button class='btn' onclick='planDone()'>Start travelling</button>"}
function planGuess(){
 if(S.phase!="plan"||S.plan||!PL.guess)return;
 var t=ll(S.goal),km=kmc(PL.guess,t);
 S.plan={km:km,lost:planLost(km)};
 if(document.getElementById("planguess"))document.getElementById("planguess").hidden=true;document.getElementById("planres").innerHTML=planResHtml();
 var g=PL.guess;
 MJ.p&&MJ.p.then(function(map){if(!map)return;PL.truth=new maplibregl.Marker({color:"#2e9e4f"}).setLngLat(t).addTo(map);
  map.addSource("p-miss",{type:"geojson",data:lnf([g,t])});map.addLayer({id:"p-miss",type:"line",source:"p-miss",paint:{"line-color":"#d0432b","line-width":3,"line-dasharray":[2,2]}});
  var b=new maplibregl.LngLatBounds(g,g);b.extend(t);map.fitBounds(b,{padding:60,maxZoom:6,duration:600})})
}
function planDone(skip){
 if(S.phase!="plan")return;
 if(!S.plan){if(!skip)return;S.plan={km:0,lost:0,skipped:1}}
 var p=S.plan;S.h+=p.lost;
 S.phase="routes";S.departed=0;S.opts=routeOptions(S.budget);say(p.skipped?"Planning skipped.":"Planning: "+Math.round(p.km)+" km off, "+mins(p.lost)+" lost before leaving.");render()
}
function routesPanel(){
 var next=departNeeded()?departChoicesHtml():"<button class='btn' onclick='beginTravel()'>Begin journey</button>";
 return"<div class='panel'><h2>Where to?</h2><p class='mute'>Your journey begins in "+esc(N[S.start].n)+" and ends in "+esc(N[S.goal].n)+".</p><p class='route-flavour' id='route-flavour' aria-live='polite'>"+esc(routeFlavourFallback(S.start=="lon"?"London":N[S.start].n,N[S.goal].n,S.opts))+"</p><p class='mute'>Target: arrive by "+stamp(S.target||0)+" to earn the £"+BONUS+" bonus. Choose individual services as you travel.</p>"+next+"</div>"
}
function bindModes(){
 document.querySelectorAll(".modebar [data-mode]").forEach(function(b){
  b.classList.toggle("on",b.dataset.mode==MAPX_MODE());
  b.onclick=function(){if(window.MAPX){MAPX.setMode(b.dataset.mode);document.querySelectorAll(".modebar [data-mode]").forEach(function(x){x.classList.toggle("on",x===b)})}};
 });
}
function MAPX_MODE(){return window.MAPX&&MAPX.mode?MAPX.mode():"streets"}
function departNeeded(){return!!(S&&S.phase==="routes"&&!S.departed&&S.loc===S.start&&terms(S.loc).length>1)}
function departChoicesHtml(){
 var b=terms(S.loc).map(function(g){return"<button class='card' onclick='chooseDepart(\""+g+"\")'><b>"+TV[g]+"</b><span>Set off from the "+TN[g]+" in "+esc(N[S.loc].n)+".</span></button>"}).join("");
 return"<h3>Choose where to set off</h3><p class='mute mb10'>The routes available depend on your departure terminal.</p>"+b
}
function chooseDepart(g){if(!S||S.phase!=="routes")return;S.term=g;S.departed=1;S.opts=routeOptions(S.budget);S.target=targetFor(routePool(S.budget),S.opt);beginTravel()}
function beginTravel(){
 if(!S||S.phase!=="routes"||departNeeded())return;
 S.phase="move";say("Set out from "+N[S.start].n+" towards "+N[S.goal].n+".");render()
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
 return"<div class='panel jrnl-wrap'><h2>Journal</h2><div class='jrnl'>"+jcol(S.path,S.modes,S.times,S.nights,"Your journey")+"</div><div class='jsum'>"+jrow("Planning",pl,"")+jrow("Checkpoint",ll2,"")+jrow("Total time",mins(S.h),"target "+mins(S.target||0))+jrow("Spend","\u00a3"+Math.round(S.spent),"")+"</div></div>"
}
function journalPanelHtml(){
 var h=journalHtml()+"<div class='panel'><h2>Travel notes</h2><ol class='log' reversed>";
 (S.log||[]).slice().reverse().forEach(function(line){h+="<li>"+esc(line)+"</li>"});
 h+="</ol></div>"+campLogHtml();
 return h
}
function inventoryPanelHtml(){
 var h="<div class='panel'><h2>Money &amp; inventory</h2><div class='inventory-stats'><div><small>Available</small><b>\u00a3"+Math.round(S.cash)+"</b></div><div><small>Spent this leg</small><b>\u00a3"+Math.round(S.spent)+"</b></div><div><small>Leg budget</small><b>\u00a3"+Math.round(S.budget)+"</b></div></div><p class='mute'>Campaign leg "+S.camp.legs+". You receive \u00a3"+INCOME+" at the start of each leg.</p></div>";
  if(S.camp.pack&&S.camp.pack.length)h+="<div class='panel'><h2>Goods for trade ("+S.camp.pack.length+"/"+MK_CAP+")</h2><ul class='log'>"+S.camp.pack.map(function(x){return"<li>"+esc(x.name)+" (paid \u00a3"+Math.round(x.ask)+")</li>"}).join("")+"</ul></div>";
 return h
}
var activePanel="play",panelScrollTimer=null;
function bindPanels(){
 if(panelScrollTimer){clearTimeout(panelScrollTimer);panelScrollTimer=null}
 var track=document.getElementById("panel-track");if(!track)return;
 var selected=track.querySelector("[data-game-panel='"+activePanel+"']");
 if(selected&&window.matchMedia("(max-width: 1099px)").matches)track.scrollLeft=selected.offsetLeft-track.offsetLeft;
 document.querySelectorAll("[data-panel-target]").forEach(function(b){
  b.onclick=function(){
   var name=b.getAttribute("data-panel-target"),panel=track.querySelector("[data-game-panel='"+name+"']");
   if(panel)track.scrollLeft=panel.offsetLeft-track.offsetLeft;
   activePanel=name;updatePanelNav()
  }
 });
 track.onscroll=function(){
  if(panelScrollTimer)clearTimeout(panelScrollTimer);
  panelScrollTimer=setTimeout(function(){
   var panels=track.querySelectorAll("[data-game-panel]"),best=null,distance=Infinity;
   panels.forEach(function(panel){var d=Math.abs(panel.offsetLeft-track.offsetLeft-track.scrollLeft);if(d<distance){distance=d;best=panel}});
   if(best){activePanel=best.getAttribute("data-game-panel");updatePanelNav()}
  },100)
 };
 updatePanelNav()
}
function updatePanelNav(){
 document.querySelectorAll("[data-panel-target]").forEach(function(b){
  var selected=b.getAttribute("data-panel-target")===activePanel;
  b.classList.toggle("on",selected);b.setAttribute("aria-pressed",selected?"true":"false")
 })
}
function mfit(){if(MJ.p)MJ.p.then(function(map){if(map&&S)fitJourney(map)})}
var TN={r:"train station",b:"bus station",f:"ferry terminal",a:"airport"},TV={r:"Train station",b:"Bus station",f:"Ferry terminal",a:"Airport"};
function grp(m){return{tube:"r",rail:"r",hsr:"r",bus:"b",coach:"b",shared:"b",ferry:"f",air:"a"}[m]}
function terms(n){var o={},r=[];(ADJ[n]||[]).forEach(function(j){var e=E[j];if(S.air||e.m!="air")o[grp(e.m)]=1});["r","b","f","a"].forEach(function(g){if(o[g])r.push(g)});return r}
function xf(n,a,b){if(a==b)return{h:0,c:0};var s=N[n].s,k=IDX[N[n].c],air=a=="a"||b=="a",fer=a=="f"||b=="f";return{h:air?[0,1.2,1.2,1.5][s]:fer?[0,.6,.7,.9][s]:[0,.25,.35,.5][s],c:Math.round((air?20:fer?6:2)*k)}}
function xfer(g){if(S.over||S.phase!="move")return;var x=xf(S.loc,S.term,g);if(x.c>S.cash)return;S.h+=x.h;S.cash-=x.c;S.spent+=x.c;S.term=g;S.arr=S.h;say(clk(S.h)+": You make your way to the "+TN[g]+" in "+N[S.loc].n+" ("+x.h+" h, \u00a3"+x.c+").");render()}
function xferHtml(){var t=terms(S.loc).filter(function(g){return g!=S.term});if(!t.length)return"";var s="<h3>Go somewhere else in "+N[S.loc].n+"</h3>";t.forEach(function(g){var x=xf(S.loc,S.term,g);s+="<button class='opt' onclick=\"xfer('"+g+"')\""+(x.c>S.cash?" disabled":"")+"><div class='to'>"+TV[g]+"</div><span>"+x.h+" h</span><span>\u00a3"+x.c+"</span></button>"});return s}
function roll(){return 1+Math.floor(Math.random()*6)}
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
function run(steps){
 var h=0,c=0,ab=0,names=[S.start],times=[0],modes=[],nights=[];
 var cur=S.start,g=S.term;steps.forEach(function(s){var e=E[s.j],g2=grp(e.m),x0=xf(cur,g,g2);h+=x0.h;c+=x0.c;var sc=sched({m:e.m,lg:e.lg,to:s.to,dp:e.dp,ev:e.ev},cur,h);if(sc.night)c+=stayCost(1,cur);var dpt=sc.dep;h=sc.dep+e.h;ab+=Math.floor((8+h)/24)-Math.floor((8+dpt)/24);c+=e.c;g=g2;cur=s.to;names.push(s.to);times.push(h);modes.push(e.m);nights.push(sc.night?1:0)});
 return{names:names,times:times,modes:modes,nights:nights,aboard:ab,h:h,c:c,score:h+c/VT}
}
function newJourney(a,b,air,evn,lm){
 var camp=NEXT_CAMP||{money:0,legs:1,start:0,log:[],pack:[],seed:(Math.random()*1e9)|0,sales:{},nextUid:0};NEXT_CAMP=null;
 S={legNotes:[],start:a,goal:b,air:air,ev:evn,camp:camp,setup:{air:air,evn:evn,lm:lm},lmOn:!!(lm&&lm.on),planOn:!!(lm&&lm.plan),lmClue:lm&&lm.clue,lmLevel:lm&&lm.level,rooms:[],wait:0,tired:false,pend:null,loc:a,h:0,spent:0,path:[a],times:[0],modes:[],nights:[],rev:{},log:["Begin your journey from "+(a=="lon"?"Trafalgar Square":N[a].n)+" to "+N[b].n+"."],phase:(lm&&lm.plan)?"plan":"routes",draft:[],over:null};
 S.term=terms(a)[0];S.arr=0;var B=camp.money+INCOME,p=plan(0,B),t=0;
 while(!p&&t++<4){B=Math.round(B*1.5);p=plan(0,B)}
 if(!p){S=null;return false}
 S.budget=B;S.cash=B;S.opt=run(p);S.opts=routeOptions(S.budget);S.target=targetFor(routePool(S.budget),S.opt);return true
}
function load(){try{var r=localStorage.getItem(KEY);if(r){var o=JSON.parse(r);if(o&&o.loc&&o.camp&&placeOf(o.start)&&placeOf(o.goal)){if(!o.camp)o.camp={money:0,legs:1,start:0,log:[]};if(!o.setup)o.setup={air:false,evn:false,lm:{on:true,clue:"off",level:"mixed",plan:true}};S=o}}}catch(e){}}
function save(){try{if(S)localStorage.setItem(KEY,JSON.stringify(S));else localStorage.removeItem(KEY)}catch(e){}}
function say(t){S.log.push(t);if(S.log.length>40)S.log.shift()}
function pad(n){return(n<10?"0":"")+n}
function absH(h){return(S&&S.camp?S.camp.start:0)+h}
function clk(h){var t=480+Math.round(absH(h)*60),d=Math.floor(t/1440),m=t%1440;return"Day "+(d+1)+", "+pad(Math.floor(m/60))+":"+pad(m%60)}

function go(i){
 var o=opts()[i];if(!o||S.over||S.phase!="move"||vis().show.indexOf(i)<0||o.c>S.cash)return;
 var sc=sched(o,S.loc,S.h);
 if(sc.night){S.pend=i;S.rooms=mkRooms();S.phase="stay";return render()}
 hop(i,sc.dep)
}
// Flavour for uneventful stops: a line for the transport type, short hops (3 h or less) and long ones. {to} is the destination.
var FLAVOUR={
 bus:{s:["The bus rattles through market towns, and a child in the back row waves at every stop.","A conductor squeezes past with a tray of tea and a grin.","The driver takes the bends with great confidence and a loud horn.","Passengers swap snacks, and the view opens out towards {to} across the fields.","Someone's radio plays the same song twice. Nobody minds."],
  l:["Hours on the road give you time to watch the country change outside the window.","A stop at a roadside cafe for bread, tea and a long argument about football.","The bus crawls through a market town, and everyone holds their bags a little tighter.","Night falls, and the bus settles into a steady hum as the lights of {to} come into view.","Someone shares a map and traces the route ahead to {to} with a finger on the glass."]},
 coach:{s:["The coach glides along the motorway with the air conditioning on full.","A tannoy announces the next stop, and the driver's voice is oddly calming.","Someone opens a bag of crisps, and soon the whole back row is involved.","Service stations come and go as the signs count down the miles to {to}.","The coach pulls into {to} right on schedule, somehow."],
  l:["The coach runs through the night, the overhead lights dimmed for those trying to sleep.","A long stop at a rest area gives time for a coffee and a stretch.","You watch a storm roll across the plain, then clear as the coach keeps on.","Mountains loom to one side as the road winds on towards {to}.","The passenger in the seat ahead teaches you a card game for the last hour."]},
 rail:{s:["The train rattles past allotments and small stations, one wave at a time.","A trolley squeaks down the aisle, and the coffee is surprisingly good.","The line follows a river for a while, glinting in the afternoon sun.","You change seats twice to get a better view of the countryside.","The announcer says {to} in a voice that makes it sound like a destination."],
  l:["The train crosses a long viaduct, and the whole carriage goes quiet to look down.","The dining car serves lunch on real china, and the cutlery rattles with each bend.","Your carriage fills with students, then empties again over the afternoon.","The track runs through tunnels, and every time you emerge the scenery has changed.","The sun sets behind you as the train pulls into {to}."]},
 hsr:{s:["The fast train hushes through the countryside, barely a tremor in the cup.","Announcements flash past in two languages as the train makes its quick stops.","Your reflection hangs over the fields as the train races along.","The carriage hums quietly, and the next station is called almost before you have settled.","A glimpse of a distant skyline on the horizon, then {to}."],
  l:["The train runs for hours at speed, the countryside sliding past in blurs.","A fellow passenger lends you a charger, and the carriage slowly falls asleep.","The dining car is busy, and somehow the coffee is still hot at full speed.","A long tunnel, then open country, with the sea glimpsed briefly to one side.","The train slows gently into {to}, almost on time."]},
 ferry:{s:["Gulls wheel alongside as the ferry leaves the harbour.","You stand on deck with spray on your face and the coast shrinking behind you.","Sunlight dances on the water, and a fishing boat waves as you pass.","A crew member points out a dolphin, and everyone crowds to the rail.","The ferry noses into the harbour at {to}, and the ramp comes down."],
  l:["The ferry rolls gently through the night, and the lounge fills with snoring travellers.","A long afternoon on deck, the coast slowly becoming a thin line on the horizon.","The cafeteria runs out of chips, and a crew member finds a spare packet.","Cargo ships pass in the distance, and the ferry turns for the approach to {to}.","At dawn the ferry reaches {to}, with the sun rising over the harbour walls."]},
 air:{s:["The plane climbs above the clouds, and the cabin settles into a steady drone.","The captain announces a smooth descent, and the view of {to} is spectacular.","A small snack and a film you will forget by the time you land.","The window seat reveals a river snaking across the land below.","The cabin lights go down, and most of the plane falls asleep."],
  l:["A long flight over open water, with little to see but cloud and the odd blinking light.","The sun follows you across the sky as the plane flies on.","Turbulence rattles the cups for a minute, then everything smooths out again.","You land at dusk, and the lights of {to} spread out beneath the wing.","The flight crosses a mountain range at dawn, glowing gold in the first light."]},
 tube:{s:["The carriage is packed, then thins out as you reach the outer stations.","Someone reads a paperback with the spine broken in three places.","A busker's melody drifts through the tunnel as the train pulls away.","A stranger in the next seat is doing the crossword, and it is nearly finished.","The doors open at {to}, and the platform smells of coffee and rain."],
  l:["A long ride across the city, with the station names rolling past in a blur.","A street musician plays on the platform for the whole journey.","The train emerges from underground, and the city spreads out in the evening light."]},
 shared:{s:["The minibus fills up, and the driver whistles along to the radio.","A goat wanders onto the road, and everyone waits patiently.","The driver chats about football, the price of rice and the road to {to}.","Windows down, and the smell of charcoal from the roadside stalls drifts in.","The minibus rolls into {to} with a cheery toot of its horn."],
  l:["The shared minibus is full of stories, and the driver knows every shortcut.","A stop at a village market, with fresh fruit handed up through the window.","Passengers share a bag of oranges and an argument about the best route to {to}.","The road climbs into the hills, and the minibus takes the bends with a good deal of roar.","As night falls, the driver switches on a single bulb and carries on."]}
};
var FLAV_TITLES=["On the road","Smooth going","Good journey","All aboard"];
function travelFlavour(o){var p=FLAVOUR[o.m]||FLAVOUR.bus,pool=o.h<=3?p.s:p.l,line=pool[Math.floor(Math.random()*pool.length)];return{title:FLAV_TITLES[Math.floor(Math.random()*FLAV_TITLES.length)],t:line.replace(/\{to\}/g,N[o.to]?N[o.to].n:"the next stop")}}
// Slight delays and quicker runs, per mode
var SLIGHT={bus:["A queue at a level crossing holds the bus up for a while.","The bus stops twice while bags are loaded onto the roof."],coach:["A lorry shedding its load slows the coach for a few miles.","The coach waits at a barrier while the road is checked."],rail:["A signal check holds the train at a junction for a few minutes.","The train waits at a station for a late connection from another line."],hsr:["A speed restriction on the line means the train eases off for a while.","The train holds at a junction while a freight train clears the track."],ferry:["The ferry lingers at the quay while a late vehicle is loaded.","Choppy water means a slower approach to the harbour."],air:["The flight waits on the taxiway for a busy runway slot.","A short holding pattern over the city before landing."],tube:["A signal failure means a short wait between stations.","The train is held in a tunnel while the line is cleared."],shared:["The minibus stops at a market for produce to be loaded.","The driver takes a detour round a flooded dip in the road."]};
var SAVED=["The connection was waiting, so you were away a little sooner.","The driver found a clear road and made up some time.","Everything lined up, and the crossing went faster than planned."];
// Travel events, per mode. One d6 per hop: 1 breakdown or failure (+20% of the hop's time), 2 bad weather (+10%), 3 to 5 nothing, 6 a papers problem (fee of 50% of the fare, or +10% time on a free hop)
function eventFor(o,r){
 var m=o.m,name=(m=="shared"?"minibus":(MODE[m]||"vehicle")).toLowerCase();
 // Shared minibuses break down on a 2 as well as a 1
 if(r==1||(m=="shared"&&r==2)){var d=o.h*0.2,air=m=="air",ferry=m=="ferry";
  return{kind:"hazard",h:d,c:0,title:ferry?"Mechanical failure":air?"Technical fault":"Breakdown",label:"Breakdown",
   t:"The "+name+" "+(ferry?"suffers a mechanical failure":air?"suffers a technical fault":"breaks down")+": +"+mins(d)+"."}}
 if(r==2){var w=o.h*0.1;
  return{kind:"hazard",h:w,c:0,title:"Bad weather",label:"Bad weather",t:(m=="ferry"?"Rough seas slow the crossing":"Bad weather slows the journey")+": +"+mins(w)+"."}}
 if(r==3){var fee=Math.round(o.c*0.5);
  if(fee>0)return{kind:"hazard",h:0,c:fee,title:"Problem with your papers",label:"Papers",t:"Problem with your papers: a fee of \u00a3"+fee+"."};
  var dl=o.h*0.1;return{kind:"hazard",h:dl,c:0,title:"Problem with your papers",label:"Papers",t:"Problem with your papers: +"+mins(dl)+" (no fare to take a fee from)."}}
 if(r>=4&&r<=6){var sd=o.h*(r==4?0.03:0.05),pool=SLIGHT[m]||SLIGHT.bus;
  return{kind:"slight",h:sd,c:0,title:"Slight delay",label:"Slight delay",t:pool[Math.floor(Math.random()*pool.length)]+" +"+mins(sd)+"."}}
 if(r==7){var sv=o.h*0.05;
  return{kind:"saving",h:-sv,c:0,title:"Quicker than planned",label:"Quicker",t:SAVED[Math.floor(Math.random()*SAVED.length)]+" "+mins(sv)+" saved."}}
 var fl=travelFlavour(o);return{kind:"none",h:0,c:0,title:fl.title,label:fl.title,t:fl.t};
}
// Overlay layer on the body, so it survives re-renders of the game
function evLayer(html){var el=document.createElement("div");el.className="evlayer";el.innerHTML=html;document.body.appendChild(el);return el}
function vehicleName(m){return m=="shared"?"minibus":(MODE[m]||"vehicle")}
// The result stage: the die stays on its roll, with the outcome beneath it
function resultStage(el,x,resume){
 el.querySelector(".evbox").innerHTML="<h3>"+esc(x.title)+"</h3><p>"+esc(x.t)+"</p><button class='btn'>Continue</button>";
 el.querySelector("button").onclick=function(){el.remove();resume()};
}
// Shown once the route is half way: the question, a second's roll, then the result
function travelSequence(o,r,x,resume){
 var el=evLayer("<div class='evbox evcard'><h3>The "+vehicleName(o.m)+" makes its way to "+esc(N[o.to].n)+".</h3><p>Will everything run smoothly?</p></div>");
 setTimeout(function(){resultStage(el,x,resume)},1500);
}
// Draws the leg: the route runs, pauses half way for the dice when events are on, then calls done
function hopAnimate(from,to,o,r,x,done){
 if(reduceMotion()){MJ.anim=null;if(r==null){setTimeout(done,0);return}var el=evLayer("<div class='evbox evcard'></div>");resultStage(el,x,done);return}
 var A={from:from,to:to,p:0,dur:1200,last:null,pauseAt:r==null?null:0.5,started:false,paused:false,done:done,
  onPause:function(resume){travelSequence(o,r,x,resume)}};
 MJ.anim=A;
 setTimeout(function(){if(MJ.anim===A&&!A.started){A.started=true;A.last=null;animRoute()}},0);
}
// Applies the leg's outcome once the player has seen the roll
function settleHop(o,x){
 S.h=Math.max(0,S.h+x.h);S.cash=Math.max(0,S.cash-x.c);S.spent+=x.c;
 if(x.kind!="none")S.legNotes.push(x.t);
 say(clk(S.h)+": "+(o.m=="shared"?sharedName(S.loc):MODE[o.m])+" to "+N[o.to].n+" ("+o.h+" h, \u00a3"+o.c+"). "+x.t);
 if(S.loc==S.goal){S.arrH=S.h;arrivalPrefetch();S.phase="arrive";return render()}
 S.arr=S.h;S.term=grp(o.m);
 if(opts(1).every(function(p){return p.c>S.cash}))S.over="broke";
 render();
}
function hop(i,dep){
 if(MJ.anim)return;
 var o=opts()[i];if(!o||o.c>S.cash){S.phase="move";S.pend=null;return render()}
 var from=S.loc;
 var tr=S.tired?1:0;S.tired=false;S.pend=null;S.phase="move";
 if(tr){say("Tired after a poor night: 1 h lost.");S.legNotes.push("Tired after a poor night: 1 h lost.")}
 S.h=dep+o.h+tr;S.cash-=o.c;S.spent+=o.c;S.loc=o.to;S.path.push(o.to);S.modes.push(o.m);
 (S.times=S.times||[0]).push(S.h);S.nights.push(S.slept?1:0);S.slept=0;
 var r=S.ev?roll():null,x=eventFor(o,r||3);
 hopAnimate(from,o.to,o,r,x,function(){settleHop(o,x)});
 render();
}
function stay(k){
 var i=S.pend,o=opts()[i],rm=k<0?{n:"the station",c:0,q:2}:S.rooms[k],c=rm.c,sc=sched(o,S.loc,S.h);
 if(c>S.cash)return;
 S.cash-=c;S.spent+=c;var poor=k<0||(rm.q==0&&roll()<=2);S.tired=poor;
 say((k<0?"No room found: you spent the night at the station in ":"Stayed in a "+rm.n.toLowerCase()+" in ")+N[S.loc].n+(c?" (\u00a3"+c+")":"")+"."+(poor?" You slept badly.":""));
 S.legNotes.push((k<0?"Spent the night at the station in ":"Stayed a night in ")+N[S.loc].n+(poor?", slept badly":"")+".");
 S.slept=1;hop(i,sc.dep)
}
function look(){S.h+=.3;S.rev[S.loc+S.term]=1;say(clk(S.h)+": You ask around and check timetables at "+N[S.loc].n+".");render()}
// Campaign: each new leg gives a fixed income on top of any money carried over from the last leg. Tune here.
var INCOME=350,BONUS=150,PLAN_ALLOW=1.5,LM_ALLOW=1.5,NEXT_CAMP=null;
// Target: the median of the reasonable routes plus a planning allowance. Arriving by then earns BONUS on top of INCOME.
// Interim checkpoint work: at a culture-4+ city you can stop for a photo challenge. It costs 2 hours whatever the result.
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
 if(cultRating(S.loc)<4&&!needsEmergencyWork())return false;
 return ((S.camp&&S.camp.paid)||[]).indexOf(S.loc)<0
}
function canAffordOnward(){return opts(1).some(function(o){return o.c<=S.cash})}
function canAffordTerminalChange(){return terms(S.loc).some(function(g){return g!==S.term&&xf(S.loc,S.term,g).c<=S.cash})}
function needsEmergencyWork(){return!canAffordOnward()&&canAffordTerminalChange()}
function interimLM(){
 if(!canInterim())return;
 S.h+=INTERIM_HOURS;S.interimUsed=1;S.interimCity=S.loc;S.phase="interim";
 say(clk(S.h)+": Stopped in "+N[S.loc].n+" for checkpoint work ("+INTERIM_HOURS+" h).");
 startInterimLM();render()
}
function startInterimLM(){MJ.resetView=true;
 var n=N[S.loc];
 MAPX.setLabels(true);LM.start({name:n.n,lat:n.la,lon:n.lo,landmark:false,level:"mixed",clueMode:"off",interim:true},function(r){
  var pay=r.skipped?0:interimPay(r.distM);
  S.cash+=pay;S.camp.paid=((S.camp&&S.camp.paid)||[]).concat([S.interimCity]);
  say(clk(S.h)+": Checkpoint work in "+n.n+": "+(r.skipped?"skipped":"earned \u00a3"+pay+" ("+r.distText+" off)")+".");
  S.phase="move";render()
 })
}
// The on-time bonus is decided once, when the leg's total time (planning, travel and checkpoint) is known
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
// Distance band for a leg starting in a given region (config.js DISTANCE_BANDS)
function bandFor(region){var b=DISTANCE_BANDS[region]||DISTANCE_BANDS["default"];return b}
// Region a place belongs to, whether or not that region is loaded
function regionOf(id){var g=gazetteer().filter(function(x){return x.id==id})[0];return g?g.region:null}
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
 var F=placeOf(from),b=bandFor(regionOf(from)),c=gazetteer().filter(function(g){if(g.id==from||!gzCity(g))return false;var d=kmBetween(F.la,F.lo,g.la,g.lo);return d>=b[0]&&d<=b[1]}).map(function(g){return g.id});
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
var REGION_VARS={uk:"REGION_UK",fr:"REGION_FR",benelux:"REGION_BENELUX",de:"REGION_DE","alps-it":"REGION_ALPS_IT",es:"REGION_ES",scandinavia:"REGION_SCANDINAVIA",east:"REGION_EAST",balkans:"REGION_BALKANS","north-africa":"REGION_NORTH_AFRICA",turkey:"REGION_TURKEY",greece:"REGION_GREECE","west-africa":"REGION_WEST_AFRICA","egypt-libya":"REGION_EGYPT_LIBYA","central-africa":"REGION_CENTRAL_AFRICA","southern-africa":"REGION_SOUTHERN_AFRICA","upper-guinea":"REGION_UPPER_GUINEA","atlantic-islands":"REGION_ATLANTIC_ISLANDS","indian-ocean-islands":"REGION_INDIAN_OCEAN_ISLANDS",caucasus:"REGION_CAUCASUS",levant:"REGION_LEVANT",iraq:"REGION_IRAQ",iran:"REGION_IRAN",gulf:"REGION_GULF","central-asia":"REGION_CENTRAL_ASIA",afghanistan:"REGION_AFGHANISTAN",baltic:"REGION_BALTIC","eastern-europe":"REGION_EASTERN_EUROPE","north-atlantic":"REGION_NORTH_ATLANTIC",pakistan:"REGION_PAKISTAN",india:"REGION_INDIA","sri-lanka":"REGION_SRI_LANKA","mainland-se-asia":"REGION_MAINLAND_SE_ASIA",bhutan:"REGION_BHUTAN",china:"REGION_CHINA",taiwan:"REGION_TAIWAN",mongolia:"REGION_MONGOLIA",siberia:"REGION_SIBERIA",indonesia:"REGION_INDONESIA",philippines:"REGION_PHILIPPINES","malaysia-singapore":"REGION_MALAYSIA_SINGAPORE",timor:"REGION_TIMOR",korea:"REGION_KOREA",japan:"REGION_JAPAN",png:"REGION_PNG",australia:"REGION_AUSTRALIA","new-zealand":"REGION_NEW_ZEALAND","pacific-islands":"REGION_PACIFIC_ISLANDS",micronesia:"REGION_MICRONESIA",hawaii:"REGION_HAWAII",canada:"REGION_CANADA",usa:"REGION_USA",mexico:"REGION_MEXICO","central-america":"REGION_CENTRAL_AMERICA","sa-north":"REGION_SA_NORTH",brazil:"REGION_BRAZIL","southern-cone":"REGION_SOUTHERN_CONE","caribbean-greater":"REGION_CARIBBEAN_GREATER","caribbean-lesser":"REGION_CARIBBEAN_LESSER",sahel:"REGION_SAHEL","west-africa-coast":"REGION_WEST_AFRICA_COAST","east-africa":"REGION_EAST_AFRICA"};
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
// Make sure the regions a journey needs are loaded and the world includes them
function journeyReady(a,b){
 var wanted=regionsFor(a,b),need=wanted.filter(function(r){return!LOADED_REGIONS[r]});
 var drop=Object.keys(LOADED_REGIONS).filter(function(r){return wanted.indexOf(r)<0});
 drop.forEach(unloadRegion);
 return Promise.all(need.map(loadRegion)).then(function(){
  if(need.length||drop.length||!ids.length)rebuildWorld()
 })
}
// Start a journey once its regions are ready. camp (optional) carries the campaign state into the new leg
function startJourney(a,b,air,evn,lm,camp){
 return journeyReady(a,b).then(function(){NEXT_CAMP=camp||null;return newJourney(a,b,air,evn,lm)})
}
// Testing: pick any start and destination, grouped by region, to reach a place without waiting for a random draw
function testPickerHtml(){
 var byRegion={};
 GAZETTEER.split(";").filter(Boolean).forEach(function(r){var p=r.split("|");(byRegion[p[5]]=byRegion[p[5]]||[]).push({id:p[0],name:p[1]})});
 var opts=function(sel){return Object.keys(byRegion).sort().map(function(reg){
  return "<optgroup label='"+esc(reg)+"'>"+byRegion[reg].sort(function(a,b){return a.name<b.name?-1:1}).map(function(c){return "<option value='"+c.id+"'"+(c.id===sel?" selected":"")+">"+esc(c.name)+"</option>"}).join("")+"</optgroup>"
 }).join("")};
 return "<details class='mt14'><summary class='mute'>Testing: choose a start and destination</summary>"+
  "<div class='row mt10'><label class='mute tfield'>From<select id='testFrom'>"+opts("lon")+"</select></label>"+
  "<label class='mute tfield'>To<select id='testTo'>"+opts("rom")+"</select></label></div>"+
  "<div class='row mt10'><button class='secondary' onclick='beginTestPick()'>Start this journey</button></div></details>"
}
function beginTestPick(){beginTo(document.getElementById('testFrom').value,document.getElementById('testTo').value)}
function beginTo(from,to){
 if(!from||!to||from===to){S=null;return render("Choose two different places.")}
 activePanel="play";
 var lm={on:true,clue:"off",level:"mixed",plan:true};
 return startJourney(from,to,false,true,lm).then(function(ok){if(ok)return render();S=null;return render("No route found between those places.")},function(err){S=null;return render("Could not load the map: "+(err&&err.message||err))})
}
// Draw a start hub by weight from START_HUBS (config.js)
function pickHub(){var t=0;START_HUBS.forEach(function(h){t+=h.w});var r=Math.random()*t;for(var i=0;i<START_HUBS.length;i++){r-=START_HUBS[i].w;if(r<0)return START_HUBS[i].id}return START_HUBS[0].id}
function begin(){
 activePanel="play";var from=pickHub(),to=pickDest(from),lm={on:true,clue:"off",level:"mixed",plan:true},tries=0;
 var fail=function(err){if(err)console.warn(err);S=null;return render(err&&err.message?"Could not load the map: "+err.message+". Check that every file in data/regions/ is in place.":"Couldn't find a route. Try again.")};
 var tryOne=function(){
  if(!to)return fail();
  return startJourney(from,to,false,true,lm).then(function(ok){if(ok)return render();if(tries++<8){from=pickHub();to=pickDest(from);return tryOne()}return fail()},fail)
 };
 return tryOne()
}
// Continue the campaign: the next leg starts where you finished and goes to a random city in the distance band
// Days: the campaign clock runs across legs. Arriving on day x: rest and explore on day x+1, leave 8am on day x+2.
function arrDay(){return Math.floor((absH(S.arrH||0)+8)/24)+1}
function restHtml(){return"<p class='mute'>Arrived "+stamp(S.arrH||0)+". Rest and explore on Day "+(arrDay()+1)+", leave 8am Day "+(arrDay()+2)+".</p>"}
function campLogHtml(){var l=(S.camp&&S.camp.log)||[];if(!l.length)return"";return"<div class='panel'><h2>Campaign so far</h2><ol class='log'>"+l.map(function(e){return"<li>Leg "+e.leg+": "+esc(e.to)+", arrived "+e.arrived+"</li>"}).join("")+"</ol></div>"}
function nextLeg(){
 if(!S||!S.camp)return;
 var from=S.goal,dirs=((S.camp.dirs||[]).concat([unitVec(S.start,S.goal)])).slice(-HEAD_LEGS);
 var log=(S.camp.log||[]).concat([{leg:S.camp.legs,to:N[S.goal].n,arrived:stamp(S.arrH||0)}]),start=(arrDay()+1)*24;
 var camp={money:Math.max(0,S.cash),legs:S.camp.legs+1,start:start,log:log,dirs:dirs,paid:S.camp.paid||[],pack:(S.camp.pack||[]).map(function(x){return Object.assign({},x,{buyer:null})}),seed:S.camp.seed,sales:S.camp.sales||{},nextUid:S.camp.nextUid||0};
 var st=S.setup||{air:false,evn:true,lm:{on:true,clue:"off",level:"mixed",plan:true}},tries=0;
 var attempt=function(){
  var to=pickDest(from,dirs);
  if(!to){S=null;return render("No destination found. Start a new journey.")}
  return startJourney(from,to,st.air,st.evn,st.lm,camp).then(function(ok){
   if(ok)return render();
   if(tries++<8)return attempt();
   S=null;return render("Couldn't find a route from "+N[from].n+". Start a new journey.");
  },function(err){S=null;render("Could not load the map: "+(err&&err.message||err))});
 };
 return attempt();
}
function reset(){LM.reset();S=null;activePanel="play";render()}

var ICON={tube:"\ud83d\ude87",rail:"\ud83d\ude86",hsr:"\ud83d\ude84",bus:"\ud83d\ude8c",ferry:"\u26f4\ufe0f",air:"\u2708\ufe0f"},BED="\ud83d\udecf\ufe0f";
function route(names,modes,nights){if(!modes||modes.length!=names.length-1)return names.map(function(n){return N[n].n}).join(" \u2192 ");return names.map(function(n,i){return N[n].n+(i<modes.length?(nights&&nights[i]?" "+BED:"")+" "+ICON[modes[i]]+" ":"")}).join("")}
function res(l,r){return"<p class='res'><b>"+l+": "+r.h.toFixed(1)+" h, \u00a3"+Math.round(r.c)+", score "+r.score.toFixed(1)+"</b><span>"+route(r.names,r.modes,r.nights)+"</span></p>"}

function mins(h){var m=Math.round(h*60);return m<60?m+" min":Math.floor(m/60)+" h "+(m%60)+" min"}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
// ============ ARRIVAL, ROUTE DRAWING AND PREFETCH ============
function reduceMotion(){return !!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)}
// A point part of the way along the great circle from a to b, both as [lon, lat]
function gcPoint(a,b,f){
 var r=Math.PI/180;
 function vec(p){var la=p[1]*r,lo=p[0]*r;return[Math.cos(la)*Math.cos(lo),Math.cos(la)*Math.sin(lo),Math.sin(la)]}
 var A=vec(a),B=vec(b),c=Math.max(-1,Math.min(1,A[0]*B[0]+A[1]*B[1]+A[2]*B[2])),d=Math.acos(c);
 if(d<1e-9)return a;
 var s1=Math.sin((1-f)*d)/Math.sin(d),s2=Math.sin(f*d)/Math.sin(d);
 var x=s1*A[0]+s2*B[0],y=s1*A[1]+s2*B[1],z=s1*A[2]+s2*B[2];
 return[Math.atan2(y,x)/r,Math.atan2(z,Math.hypot(x,y))/r];
}
// The journey so far, plus the new leg drawn part of the way along
function animLine(){
 var A=MJ.anim,e=1-Math.pow(1-A.p,3),n=Math.max(2,Math.ceil(48*e)),pts=S.path.slice(0,-1).map(ll);
 for(var i=0;i<=n;i++)pts.push(gcPoint(ll(A.from),ll(A.to),e*i/n));
 return lnf(pts);
}
function drawRoute(){var m=MJ.cur;if(m){var src=m.getSource&&m.getSource("j-me");if(src)src.setData(animLine())}}
function animRoute(){
 var A=MJ.anim;if(!A||A.paused)return;
 var now=performance.now();if(A.last==null)A.last=now;
 A.p=Math.min(1,A.p+(now-A.last)/A.dur);A.last=now;
 if(A.pauseAt!=null&&A.p>=A.pauseAt){
  A.p=A.pauseAt;A.pauseAt=null;A.paused=true;drawRoute();
  A.onPause(function(){A.paused=false;A.last=null;animRoute()});
  return
 }
 drawRoute();
 if(A.p<1)requestAnimationFrame(animRoute);
 else{MJ.anim=null;var m=MJ.cur;if(m)updateJourney(m);if(A.done)A.done()}
}
function arrivalPrefetch(){
 var g=N[S.goal];
 if(S.lmOn&&g.l&&window.LM&&LM.prefetch)LM.prefetch({name:g.n,lat:g.la,lon:g.lo,landmark:g.l});
 prefetchMarket();
}
var MK_PRE=null;
function mkCacheKey(){return mkCity()+"|"+mkDayNo()}
// Start the market's stock and buyers for the pack as it stands, so the visit is ready when the player gets there
function prefetchMarket(){
 var todo=S.camp.pack.filter(function(x){return!x.buyer});
 var entry={key:mkCacheKey(),uids:todo.map(function(x){return x.uid}),promise:mkAsk(mkVisitPrompt(true,todo))};
 MK_PRE=entry;
 entry.promise.catch(function(){if(MK_PRE===entry)MK_PRE=null});
}
function arriveHtml(){
 var g=N[S.goal].n,on=S.h<=S.target+1e-9,notes=S.legNotes||[];
 var status=on?"You arrive on time":"You arrive "+mins(S.h-S.target)+" late";
 var slept=notes.some(function(t){return /slept badly|Tired/.test(t)});
 var nights=(S.nights||[]).reduce(function(a,b){return a+b},0);
 var lines=[slept?"You are tired after a poor night.":"You arrive rested."];
 if(nights)lines.push("You spent "+nights+(nights==1?" night":" nights")+" on the road.");
 var h="<div class='panel arrive'><p class='kicker'>Arrived "+esc(clk(S.h))+"</p><h2 class='arrive-h'>Welcome to "+esc(g)+"</h2><p class='big'>"+status+"</p>";
 if(S.lmOn)h+="<p>You now need to find the checkpoint in "+esc(g)+".</p>";
 h+="<p>"+lines.join(" ")+"</p>";
 if(notes.length)h+="<h3>On the way</h3><ul class='log'>"+notes.map(function(t){return"<li>"+esc(t)+"</li>"}).join("")+"</ul>";
 h+="<button class='btn' onclick='arriveContinue()'>"+(S.lmOn?"Continue to Checkpoint":"Continue")+"</button></div>";
 return h
}
function arriveContinue(){
 if(S.phase!=="arrive")return;
 if(S.lmOn){S.phase="lastmile";startLM();return render()}
 settleBonus();S.over="done";S.phase="move";render();
}
function startLM(){MJ.resetView=true;
 var g=N[S.goal];if(MJ.p)MJ.p.then(function(m){if(m)jvis(m,false)});
 MAPX.setLabels(true);LM.start({name:g.n,lat:g.la,lon:g.lo,landmark:g.l,level:S.lmLevel||"mixed",clueMode:"off"},function(r){
  LM.reset();S.lm=r;S.h+=r.lost;S.arrH=S.h;settleBonus();S.over="done";S.phase="move";
  say(clk(S.h)+": Checkpoint: "+(r.skipped?"skipped.":r.title+", "+r.distText+" off, "+mins(r.lost)+" lost."));render()})
}
// Stranded: nothing at this stop can be paid for, including a cheaper change of terminal
function stranded(){
 if(!S||S.over||S.phase!=="move")return false;
 return!canAffordOnward()&&!canAffordTerminalChange()
}
var MAPVIEW="std";
// Switch the map between its default 4:3 size, minimised and full screen
function mapView(v){MAPVIEW=(MAPVIEW===v)?"std":v;render()}
// Keep the header's height in a CSS variable, so a full-screen map can sit just below it
function setHdrVar(){var h=document.querySelector(".hdr");document.documentElement.style.setProperty("--hdr-h",(h?h.getBoundingClientRect().bottom:0)+"px")}
// Map dock: the map fills the top half of the screen, with its view buttons laid over it; the actions scroll below
function mapDockHtml(){
 var min=MAPVIEW==="min",full=MAPVIEW==="full";
 return "<div class='mapdock'><div id='sharedmap' class='smap'></div><div class='mapctl'><button class='btn alt' onclick='mapView(\"min\")'>"+(min?"Restore map":"Minimise")+"</button><button class='btn alt' onclick='mapView(\"full\")'>"+(full?"Exit full screen":"Full screen")+"</button></div><div class='modebar mapbtns'><div class='modes'><button class='btn alt' data-mode='streets'>Streets</button><button class='btn alt' data-mode='sat'>Satellite</button><button class='btn alt' data-mode='hybrid'>Hybrid</button></div><button class='btn alt' onclick='mfit()'>Fit journey</button></div></div>";
}
// Opening screen: title, introduction, and the sections for each way to play
function welcomeHtml(msg){
 var err=msg?"<p class='welcome-err' role='alert'>"+esc(msg)+"</p>":"";
 return "<header class='welcome-hero'>"+
  "<svg class='route-art' viewBox='0 0 360 120' aria-hidden='true' focusable='false'>"+
  "<path class='route-line' d='M24 92 C 70 30, 120 104, 170 58 S 280 24, 336 44'/>"+
  "<circle class='route-stop' cx='24' cy='92' r='5'/>"+
  "<circle class='route-stop' cx='170' cy='58' r='4'/>"+
  "<circle class='route-goal' cx='336' cy='44' r='7'/>"+
  "</svg>"+
  "<p class='kicker'>A solo travel RPG</p>"+
  "<h1 class='wordmark'>Role Around<span>the World</span></h1>"+
 "</header>"+
 "<p class='intro'>Set out from Trafalgar Square with a budget, a clock and a destination you have never seen before. Each leg sends you somewhere new on the globe, and you choose how to get there: trains, coaches, ferries and whatever else the road offers. Arrive on time to earn a bonus, or spend freely and risk running late. When you land, try to pin where a photo was taken on an unlabelled map. Each leg starts where the last one ended, so the campaign carries you round the world.</p>"+
 "<section class='welcome-sec' aria-labelledby='sec-campaign'>"+
  "<h2 id='sec-campaign'>Campaign</h2>"+
  "<div class='welcome-card featured'>"+
   "<h3>Start a new campaign</h3>"+
   "<p class='mute'>One continuing journey across the world. Your money, travel journal and legs carry over from one destination to the next.</p>"+
   err+
   "<div class='row'><button class='btn' onclick='begin()'>Start journey</button><a class='link-btn' href='rules.html'>Rules and guide</a></div>"+
  "</div>"+
 "</section>"+
 "<section class='welcome-sec' aria-labelledby='sec-more'>"+
  "<h2 id='sec-more'>More ways to play</h2>"+
  "<div class='welcome-grid'>"+
   "<div class='welcome-card soon' aria-disabled='true'>"+
    "<span class='badge'>Coming soon</span><h3>Classic itineraries</h3>"+
    "<p class='mute'>Shorter, set routes with a fixed start and finish, for a quick game.</p></div>"+
   "<div class='welcome-card soon' aria-disabled='true'>"+
    "<span class='badge'>Coming soon</span><h3>Guided tours</h3>"+
    "<p class='mute'>Themed journeys with stops chosen for you.</p></div>"+
  "</div>"+
 "</section>"+
 testPickerHtml();
}
function render(msg){
 if(stranded())S.over="broke";
 save();
 if(!S){
  document.body.classList.remove("mapscreen","map-min","map-full");
  var app=document.getElementById("app");app.classList.remove("wide");app.innerHTML=welcomeHtml(msg);
  return}
 var h="<h1 class='sr-only'>Role Around the World</h1>";
 var mapped=S.phase!=="rest";
 document.body.classList.toggle("mapscreen",mapped);
 document.body.classList.toggle("map-min",mapped&&MAPVIEW==="min");
 document.body.classList.toggle("map-full",mapped&&MAPVIEW==="full");
 var st=status();
 h+="<div class='hdr'><div class='r1'><span><b>"+(S.phase==="rest"?"Day "+(arrDay()+1)+" \u00b7 rest":clk(S.h))+"</b>"+(S.phase==="rest"?"":"<small class='rv'>Target "+stamp(S.target||0)+"</small>")+"</span><span><b>\u00a3"+Math.round(S.cash)+"</b></span><span class='st'><span aria-hidden='true'>"+st[0]+"</span> "+st[1]+"</span></div><div class='r2'><div class='cur'><small>Now</small>"+N[S.loc].n+"</div><div><small>To</small>"+(S.phase==="rest"?"?":S.phase=="plan"&&!S.plan||S.phase=="routes"&&!S.route?"?":arrow(S.loc,S.goal))+" "+(S.phase==="rest"?"Next leg":N[S.goal].n)+"</div></div></div>";
 h+=mapped?mapDockHtml()+"<div class='actions'>":"";
 h+="<nav class='panel-nav' aria-label='Game panels'><button type='button' data-panel-target='play'>Game</button><button type='button' data-panel-target='journal'>Journal</button><button type='button' data-panel-target='inventory'>Inventory</button></nav><p class='panel-hint'>Swipe between panels or choose a section</p><div class='game-panels' id='panel-track'><section class='game-panel' data-game-panel='play' aria-label='Game'>";
 if(S&&S.phase=="plan")h+=planIntro();
 if(S.phase==="rest"){h+=restPage();}else if(S.over){
  var m=S.over=="broke"?"Stranded: you can't afford any onward fare from "+N[S.loc].n+".":(S.bonus?"You arrived on time.":"You arrived after the target time.");
  h+="<div class='panel'><p class='big'>"+m+"</p><p class='mute'>Leg "+S.camp.legs+" complete. You carry \u00a3"+Math.max(0,Math.round(S.cash))+" into the next leg"+(S.bonus?", including the \u00a3"+BONUS+" on-time bonus":"")+". A further \u00a3"+INCOME+" income is paid at the start of the next leg, when you set off at 8am on Day "+(arrDay()+2)+".</p>"+restHtml()+"<div class='row'><button class='btn' onclick='restStart()'>Rest day</button></div></div>"
 }else{

  if(S.phase=="lastmile"||S.phase=="interim")h+="<div class='panel'><h2>"+(S.phase=="interim"?"Checkpoint work":"Checkpoint")+"</h2><div id='lm'></div></div>";else if(S.phase=="plan")h+=planPanel();else if(S.phase=="routes")h+=routesPanel();
  if(S.phase=="lastmile"||S.phase=="interim"||S.phase=="plan"||S.phase=="routes"){}else if(S.phase=="arrive"){h+=arriveHtml();}else if(S.phase=="stay"){var po=opts()[S.pend],ss=sched(po,S.loc,S.h);h+="<div class='panel'><h2>No service until "+clk(ss.dep)+"</h2><p class='mb10'>Where will you sleep in "+N[S.loc].n+"?</p>";S.rooms.forEach(function(x,k){h+="<button class='card' onclick='stay("+k+")'"+(x.c>S.cash?" disabled":"")+"><b>"+x.n+", \u00a3"+x.c+"</b><span>"+(x.q?"A proper night's rest.":"Cheap, but you may sleep badly.")+"</span></button>"});h+="<button class='card' onclick='stay(-1)'><b>Spend the night at the station</b><span>Free, but you will be tired: 1 h lost on the next leg.</span></button>";if(!S.rooms.length)h+="<p class='mb10'>No rooms are free in town tonight.</p>";h+="<button class='link' onclick='S.phase=\"move\";S.pend=null;render()'>Choose a different option</button></div>"}else{
   var all=opts(),v=vis(),last="";
   h+="<div class='panel'><h2>Where next?</h2>"+(canInterim()?"<button class='card' onclick='interimLM()'><b>"+(needsEmergencyWork()?"Earn money for the next fare":"Stop for checkpoint work")+"</b><span>Spend 2 hours on a photo challenge in "+esc(N[S.loc].n)+" and earn £"+PAY_MIN+" to £"+PAY_MAX+".</span></button>":"");
   v.show.sort(function(a,b){var x=ORD.indexOf(all[a].m)-ORD.indexOf(all[b].m);return x||all[a].h-all[b].h});
   v.show.forEach(function(i){
    var o=all[i],sc=sched(o,S.loc,S.h);
    if(o.m!=last){h+="<h3>"+GRP[o.m]+"</h3>";last=o.m}
    h+="<button class='opt' onclick='go("+i+")'"+(o.c>S.cash?" disabled":"")+"><div class='to'>"+N[o.to].n+"<small>heads "+dir(S.loc,o.to)+" · leaves "+clk(sc.dep)+" · arrives "+clk(sc.dep+o.h)+(sc.night?"<br>Overnight: hotel from about £"+stayCost(1,S.loc):sc.ns?"<br>Night service: sleep on board":"")+(S.path.indexOf(o.to)>-1?" · already visited":"")+"</small></div><span>"+o.h+" h</span><span>\u00a3"+o.c+"</span></button>"});
   if(v.hid>0)h+="<p class='hand'>"+v.hid+" more long-distance links are not shown here.</p><button class='btn alt' onclick='look()'>Look for routes (0.3 h)</button>";h+=xferHtml();
   h+="</div>"}
 }
 h+="<button class='link' onclick='if(confirm(\"End your campaign? Saved progress will be cleared.\"))reset()'>End campaign</button></section><section class='game-panel' data-game-panel='journal' aria-label='Travel journal'>"+journalPanelHtml()+"</section><section class='game-panel' data-game-panel='inventory' aria-label='Money and inventory'>"+inventoryPanelHtml()+"</section></div>";
 if(mapped)h+="</div>";
 var app=document.getElementById("app");app.classList.add("wide");app.innerHTML=h;setHdrVar();drawMap();bindPanels();bindModes();fillFlavour();fillRouteFlavour();if(S&&(S.phase=="lastmile"||S.phase=="interim")&&!S.over)LM.attach(document.getElementById("lm"))
}
// Startup: show the start screen straight away; if a campaign is saved, load its regions first, then resume it
load();
if(S&&S.phase=="interim")S.phase="move";
if(S){journeyReady(S.start,S.goal).then(function(){if(S&&S.phase=="lastmile"&&!S.over)startLM();render()},function(err){S=null;render("Could not load the saved map: "+(err&&err.message||err))})}
else render();
window.addEventListener("resize",function(){setHdrVar();drawMap();if(MJ.p)MJ.p.then(function(m){if(m)m.resize()})});

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