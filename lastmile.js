// Last-mile challenge: a landmark photo; pin where it was taken. Lazy-loads MapLibre. Photos from Wikipedia, tiles per config.js.
var LM=(function(){
 var root=null,R=null,map=null,built=null,pinMk=null,truthMk=null,pin=null,mode="streets",cb=null;
 function $(id){return root.querySelector("#"+id)}
var WALK=4500,HINT_H=.25;
function hav(a,b,c,d){var r=Math.PI/180,x=(d-b)*r*Math.cos((a+c)/2*r),y=(c-a)*r;return Math.sqrt(x*x+y*y)*6371000}
function bearingWord(a,b,c,d){var r=Math.PI/180,x=(d-b)*Math.cos((a+c)/2*r),y=c-a,g=(Math.atan2(x,y)/r+360)%360;return["north","north-east","east","south-east","south","south-west","west","north-west"][Math.round(g/45)%8]}
// Delay on the last mile: no delay within 100 m, then one minute for every 10 m beyond that
function lostHours(m){return Math.max(0,m-100)/10/60}
function tier(m){return m<50?"Spot on":m<250?"Nearly there":m<1000?"Lost for a while":"Wandered half the city"}
function randn(){var u=1-Math.random(),v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function mins(h){var m=Math.round(h*60);return m<60?m+" min":Math.floor(m/60)+" h "+(m%60)+" min"}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function distText(m){return m<1000?Math.round(m)+" m":(m/1000).toFixed(1)+" km"}

// ---- Landmarks: Wikipedia articles near a point that have a lead photo, ranked by recent page views
function wikiQuery(lat,lon,r){return"https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=geosearch&ggscoord="+lat+"%7C"+lon+"&ggsradius="+r+"&ggslimit=50&ggsnamespace=0&prop=pageimages%7Ccoordinates%7Cpageviews%7Cdescription&piprop=thumbnail&pithumbsize=900&pilimit=50&colimit=50"}
function parseLandmarks(j){
 var out=[],pg=(j&&j.query&&j.query.pages)||{};
 Object.keys(pg).forEach(function(k){
  var p=pg[k],t=p.thumbnail,c=p.coordinates&&p.coordinates[0];
  if(!t||!c||!/\.jpe?g(\/|$)/i.test(t.source)||t.width<500)return;
  if(/logo|map|coat|flag|plan|diagram|emblem|seal|stamp|poster|portrait/i.test(decodeURIComponent(t.source.split("/").pop())))return;
  var views=0;Object.keys(p.pageviews||{}).forEach(function(d){views+=p.pageviews[d]||0});
  out.push({title:p.title,lat:c.lat,lon:c.lon,src:t.source,views:views,desc:p.description||""})});
 return out.sort(function(a,b){return b.views-a.views})
}
function pickLandmark(list,level){
 var n=list.length,slice=level=="easy"?list.slice(0,Math.min(8,n)):level=="hard"?list.slice(Math.floor(n/2)):list.slice(0,Math.min(25,n));
 if(!slice.length)slice=list;return slice[Math.floor(Math.random()*slice.length)]
}
function getLandmark(city,level){
 return fetch(wikiQuery(city[2],city[3],10000)).then(function(r){return r.json()}).then(function(j){
  var l=parseLandmarks(j);if(l.length<5)throw new Error("Too few landmarks");var c=pickLandmark(l,level);c.all=l;return c})
}

// ---- Clue layers: icon-only POI categories (no names) and a dots layer of nearby notable places, bought with time
var CLUES={
 stn:{icon:"\ud83d\ude89",name:"Stations",f:["any",["==",["get","class"],"railway"],["==",["get","subclass"],"bus_station"],["==",["get","subclass"],"station"]]},
 wor:{icon:"\u26ea",name:"Places of worship",f:["any",["==",["get","class"],"place_of_worship"],["==",["get","subclass"],"place_of_worship"],["==",["get","class"],"monastery"]]},
 mus:{icon:"\ud83c\udfdb\ufe0f",name:"Museums and galleries",f:["any",["in",["get","subclass"],["literal",["museum","gallery","arts_centre"]]],["==",["get","class"],"museum"]]},
 spt:{icon:"\ud83c\udfdf\ufe0f",name:"Stadiums and sport",f:["any",["==",["get","class"],"stadium"],["==",["get","class"],"sports_centre"]]},
 edu:{icon:"\ud83c\udf93",name:"Universities and hospitals",f:["any",["==",["get","class"],"college"],["==",["get","class"],"hospital"],["==",["get","subclass"],"university"]]},
 sig:{icon:"\ud83c\udff0",name:"Castles and monuments",f:["any",["in",["get","class"],["literal",["castle","monument","attraction","tower","ruins"]]],["in",["get","subclass"],["literal",["castle","monument","memorial","viewpoint","attraction","observation_tower","ruins"]]]]}
};
var CLUE_MIN=10,DOTS_MIN=20;
function clueIcon(ch){var s=64,c=document.createElement("canvas");c.width=c.height=s;var x=c.getContext("2d");x.fillStyle="#fff";x.strokeStyle="#13242f";x.lineWidth=3;x.beginPath();x.arc(s/2,s/2,s/2-3,0,7);x.fill();x.stroke();x.font="34px system-ui,'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(ch,s/2,s/2+2);return x.getImageData(0,0,s,s)}
function addClue(k){
 if(!map||map.getLayer("clue-"+k))return;
 var id="clue-img-"+k;if(!map.hasImage(id))map.addImage(id,clueIcon(CLUES[k].icon),{pixelRatio:2});
 map.addLayer({id:"clue-"+k,type:"symbol",source:built.vsrc,"source-layer":"poi",minzoom:11.5,filter:CLUES[k].f,layout:{"icon-image":id,"icon-size":.85,"icon-allow-overlap":true,"icon-ignore-placement":true}})
}
function addDots(){
 if(map.getSource("dots"))return;
 map.addSource("dots",{type:"geojson",data:{type:"FeatureCollection",features:R.lm.all.map(function(p){return{type:"Feature",properties:{},geometry:{type:"Point",coordinates:[p.lon,p.lat]}}})}});
 map.addLayer({id:"dots",type:"circle",source:"dots",paint:{"circle-radius":6,"circle-color":"#f2a900","circle-stroke-color":"#13242f","circle-stroke-width":2}})
}
function clueCostText(){var m=Math.round(R.cost*60);return m?"Clues so far: "+m+" min lost.":"Each reveal costs time. Choose what the photo suggests."}
function renderClues(){
 var el=$("clues");if(R.clueMode=="off"){el.hidden=true;$("cluecost").hidden=true;return}
 el.hidden=false;$("cluecost").hidden=false;var h="";
 if(R.clueMode=="pay")Object.keys(CLUES).forEach(function(k){h+="<button class='btn alt"+(R.bought[k]?" on":"")+"' data-clue='"+k+"'"+(R.bought[k]?" disabled":"")+">"+CLUES[k].icon+" "+CLUES[k].name+(R.bought[k]?"":" ("+CLUE_MIN+" min)")+"</button>"});
 h+="<button class='btn alt"+(R.bought.dots?" on":"")+"' data-clue='dots'"+(R.bought.dots?" disabled":"")+">\ud83d\udccd Notable places nearby"+(R.bought.dots?"":" ("+DOTS_MIN+" min)")+"</button>";
 el.innerHTML=h;$("cluecost").textContent=clueCostText();
 el.querySelectorAll("[data-clue]").forEach(function(b){b.onclick=function(){buy(b.dataset.clue)}})
}
function buy(k){
 if(!R||R.done||R.bought[k])return;R.bought[k]=1;
 if(k=="dots"){addDots();R.cost+=DOTS_MIN/60}else{addClue(k);R.cost+=CLUE_MIN/60}
 renderClues()
}

 function getNamed(cfg){
  var q="https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&titles="+encodeURIComponent(cfg.name)+"&prop=pageimages%7Ccoordinates%7Cdescription&piprop=thumbnail&pithumbsize=900";
  return Promise.all([fetch(q).then(function(r){return r.json()}),fetch(wikiQuery(cfg.lat,cfg.lon,5000)).then(function(r){return r.json()}).then(parseLandmarks).catch(function(){return[]})]).then(function(a){
   var pg=a[0].query&&a[0].query.pages,p=pg&&pg[Object.keys(pg)[0]];
   if(!p||!p.thumbnail)throw new Error("No photo for "+cfg.name);
   var c=p.coordinates&&p.coordinates[0],lm={title:p.title,lat:c?c.lat:cfg.lat,lon:c?c.lon:cfg.lon,src:p.thumbnail.source,views:0,desc:p.description||"",all:a[1]};
   if(!lm.all.some(function(x){return x.title==lm.title}))lm.all=lm.all.concat([lm]);return lm})
 }
 function setMode(m){mode=m;if(root)root.querySelectorAll("[data-mode]").forEach(function(x){x.classList.toggle("on",x.dataset.mode==m)});MAPX.setMode(m)}
 function onClick(e){if(!R||R.done)return;pin=e.lngLat;if(pinMk)pinMk.remove();pinMk=new maplibregl.Marker({color:"#1b6f63"}).setLngLat(pin).addTo(map);$("guess").disabled=false}
 function ensureMap(){var sb=document.getElementById("sharedmap");return MAPX.init(sb).then(function(m){map=m;built=MAPX.built();MAPX.attach(sb);map.on("click",onClick);map.setMinZoom(10.5)})}
 function build(){
  root=document.createElement("div");root.id="lmroot";
  root.innerHTML="<div id='clue'></div><div id='mapwrap' hidden><div class='row tight' id='clues' hidden style='margin-top:10px'></div><p class='mute' id='cluecost' hidden></p><div class='row'><button class='btn' id='guess' disabled>Lock in guess</button><button class='btn alt' id='hintbtn'>Ask a local (0.25 h)</button></div><div class='hint' id='hint' hidden></div></div><div id='result' hidden></div>";
  root.querySelectorAll("[data-mode]").forEach(function(b){b.onclick=function(){setMode(b.dataset.mode)}});
  $("guess").onclick=guess;$("hintbtn").onclick=hint
 }
 function fail(msg){
  $("mapwrap").hidden=true;
  $("clue").innerHTML="<h2>Couldn't load the last-mile challenge</h2><p class='mute'>"+esc(msg||"Check your connection.")+"</p><div class='row'><button class='btn' id='skip'>Skip the last mile</button></div>";
  $("skip").onclick=function(){finish({skipped:true,lost:0})}
 }
 function finish(r){var f=cb;cb=null;if(f)f(r)}
 // Zoom and pan the photo inside its own box, like the map does
function bindPhoto(){
 var im=document.querySelector("#clue img.lmphoto");if(!im)return;
 var box=im.parentNode,s=1,x=0,y=0,drag=null,ptrs={},pinch=null;
 function apply(){s=Math.max(1,Math.min(4,s));if(s==1){x=0;y=0}im.style.transform="translate("+x+"px,"+y+"px) scale("+s+")"}
 function gap(){var a=Object.keys(ptrs).map(function(k){return ptrs[k]});return Math.hypot(a[0].clientX-a[1].clientX,a[0].clientY-a[1].clientY)}
 document.getElementById("pzin").onclick=function(){s*=1.5;apply()};
 document.getElementById("pzout").onclick=function(){s/=1.5;apply()};
 document.getElementById("pzreset").onclick=function(){s=1;apply()};
 box.onpointerdown=function(e){
  ptrs[e.pointerId]=e;if(box.setPointerCapture)box.setPointerCapture(e.pointerId);
  if(Object.keys(ptrs).length==2){pinch={d:gap(),s:s};drag=null}
  else if(s>1){drag={x:e.clientX-x,y:e.clientY-y}}
 };
 box.onpointermove=function(e){
  if(!ptrs[e.pointerId])return;ptrs[e.pointerId]=e;
  if(pinch&&Object.keys(ptrs).length==2){s=pinch.s*gap()/pinch.d;apply()}
  else if(drag&&s>1){x=e.clientX-drag.x;y=e.clientY-drag.y;apply()}
 };
 function end(e){delete ptrs[e.pointerId];if(Object.keys(ptrs).length<2)pinch=null;if(!Object.keys(ptrs).length)drag=null}
 box.onpointerup=end;box.onpointercancel=end;box.onpointerleave=end;
 apply()
}
function start(cfg,onDone){
  reset();build();cb=onDone;
  R={cfg:cfg,done:false,hinted:false,bought:{},cost:0,clueMode:cfg.clueMode||"pay"};
 if(cfg.interim&&$("hintbtn"))$("hintbtn").hidden=true;
  $("clue").innerHTML="<h2>Finding the spot in "+esc(cfg.name)+"...</h2>";
  MAPX.load().then(function(){return cfg.landmark?getNamed(cfg):getLandmark([cfg.name,"",cfg.lat,cfg.lon],cfg.level||"mixed")}).then(function(lm){
   R.lm=lm;
   $("clue").innerHTML="<h2>Where was this photo taken"+(cfg.landmark?"":" in "+esc(cfg.name))+"?</h2><div class='pz'><div class='pzbox'><img class='lmphoto' alt='A landmark near "+esc(cfg.name)+"' src='"+esc(lm.src)+"'></div><div class='zc'><button type='button' id='pzin'>+</button><button type='button' id='pzout'>\u2212</button><button type='button' id='pzreset'>Reset</button></div></div><p class='credit'>Photo from Wikipedia (Wikimedia Commons). Credit and licence are on the article, linked after you guess.</p>";
   $("mapwrap").hidden=false;bindPhoto();
   return ensureMap()
  }).then(function(){
   var a=Math.random()*2*Math.PI,off=800+Math.random()*1500,c=[cfg.lon+Math.sin(a)*off/(111000*Math.cos(cfg.lat*Math.PI/180)),cfg.lat+Math.cos(a)*off/111000];
   map.setMaxBounds([[cfg.lon-.2,cfg.lat-.12],[cfg.lon+.2,cfg.lat+.12]]);
   map.resize();map.jumpTo({center:c,zoom:12.5});setMode(mode);
   if(R.clueMode=="free")Object.keys(CLUES).forEach(addClue);
   renderClues()
  }).catch(function(e){console.warn(e);fail(e&&e.message)})
 }
 function attach(el){if(root&&el){el.appendChild(root);if(map)setTimeout(function(){map.resize()},30)}}
 function reset(){
  if(map){map.off("click",onClick);map.setMaxBounds(null);map.setMinZoom(0);["miss","dots"].concat(Object.keys(CLUES).map(function(k){return"clue-"+k})).forEach(function(id){if(map.getLayer(id))map.removeLayer(id)});["miss","dots"].forEach(function(id){if(map.getSource(id))map.removeSource(id)})}
  if(pinMk)pinMk.remove();if(truthMk)truthMk.remove();
  map=null;built=null;pinMk=null;truthMk=null;pin=null;R=null;cb=null;if(root&&root.parentNode)root.parentNode.removeChild(root);root=null}
 function hint(){
  if(!R||R.done||R.hinted||!R.lm)return;R.hinted=true;$("hintbtn").disabled=true;var h=$("hint"),lm=R.lm,m=hav(R.cfg.lat,R.cfg.lon,lm.lat,lm.lon);
  h.hidden=false;h.textContent="A local says"+(lm.desc?": it's a "+lm.desc.replace(/^[A-Z]/,function(c){return c.toLowerCase()}):"")+(lm.desc?", ":": ")+"about "+(m<300?"right here in the area":(m/1000).toFixed(1)+" km "+bearingWord(R.cfg.lat,R.cfg.lon,lm.lat,lm.lon)+" of the centre")+"."
 }
 function guess(){
  if(!R||R.done||!pin||!R.lm)return;R.done=true;$("guess").disabled=true;$("hintbtn").disabled=true;
  var t=R.lm,m=hav(pin.lat,pin.lng,t.lat,t.lon),extra=(R.hinted?HINT_H:0)+R.cost,mine=lostHours(m)+extra;
  truthMk=new maplibregl.Marker({color:"#2e9e4f"}).setLngLat([t.lon,t.lat]).addTo(map);
  map.addSource("miss",{type:"geojson",data:{type:"Feature",geometry:{type:"LineString",coordinates:[[pin.lng,pin.lat],[t.lon,t.lat]]}}});
  map.addLayer({id:"miss",type:"line",source:"miss",paint:{"line-color":"#d0432b","line-width":3,"line-dasharray":[2,2]}});
  var b=new maplibregl.LngLatBounds([pin.lng,pin.lat],[pin.lng,pin.lat]);b.extend([t.lon,t.lat]);map.fitBounds(b,{padding:70,maxZoom:18,duration:800});
  var link="https://en.wikipedia.org/wiki/"+encodeURIComponent(t.title.replace(/ /g,"_")),r=$("result");r.hidden=false;
  r.innerHTML="<p class='big2'>"+tier(m)+"</p><p>It was <b>"+esc(t.title)+"</b> (<a href='"+esc(link)+"' target='_blank' rel='noopener'>article, photo credit and licence</a>).</p><p>"+(R.cfg.interim?"You were "+distText(m)+" off, you worked for "+INTERIM_HOURS+" hours and earned \u00a3"+interimPay(m):"You were "+distText(m)+" off: "+mins(mine)+" lost"+(extra>0?" (including "+mins(extra)+" on clues)":""))+".</p><div class='row'><button class='btn' id='lmdone'>Continue</button></div>";
  $("lmdone").onclick=function(){finish({title:t.title,distText:distText(m),distM:m,lost:mine})}
 }
 return{start:start,attach:attach,reset:reset}
})();
