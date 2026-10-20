// Shared map: one MapLibre instance for the whole game. Lazy-loads MapLibre, strips the OpenFreeMap style of
// every label except road names, and adds satellite and hybrid modes. Features add their own layers and clean up after themselves.
var MAPX=(function(){
 var ML="https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/",el=null,map=null,built=null,mode="streets",loadP=null,initP=null,labelsOn=false;
 function load(){
  if(window.maplibregl)return Promise.resolve();
  if(loadP)return loadP;
  loadP=new Promise(function(res,rej){var l=document.createElement("link");l.rel="stylesheet";l.href=ML+"maplibre-gl.css";document.head.appendChild(l);var s=document.createElement("script");s.src=ML+"maplibre-gl.js";s.onload=res;s.onerror=function(){loadP=null;rej(new Error("MapLibre failed to load"))};document.head.appendChild(s)});
  return loadP
 }
function buildStyle(st){
 var out=JSON.parse(JSON.stringify(st)),names=[],base=[],labels=[];
 out.layers=out.layers.filter(function(l){
  if(l.type=="background")return true;
  if(l.type=="symbol"){if(l["source-layer"]=="transportation_name"){names.push(l.id);return true}if(l["source-layer"]=="place"||l["source-layer"]=="water_name"||l["source-layer"]=="poi"){l.layout=l.layout||{};l.layout.visibility="none";if(l["source-layer"]=="poi"){l.minzoom=Math.max(l.minzoom||0,12)}else if(l["source-layer"]=="place"){l.minzoom=Math.min(l.minzoom===undefined?99:l.minzoom,6)}labels.push(l.id);return true}return false}
  base.push(l.id);return true});
 out.sources=out.sources||{};
 out.sources.sat={type:"raster",tiles:CONFIG.SAT.tiles,tileSize:256,maxzoom:CONFIG.SAT.maxzoom,attribution:CONFIG.SAT.attribution};
 var bgIdx=out.layers.findIndex(function(l){return l.type=="background"});
 out.layers.splice(bgIdx+1,0,{id:"sat",type:"raster",source:"sat",layout:{visibility:"none"}});
 var hyb=[];
 out.layers.filter(function(l){return names.indexOf(l.id)>-1}).forEach(function(l){
  var c=JSON.parse(JSON.stringify(l));c.id=l.id+"-hyb";c.layout=c.layout||{};c.layout.visibility="none";
  c.paint=Object.assign({},c.paint,{"text-color":"#ffffff","text-halo-color":"rgba(0,0,0,0.8)","text-halo-width":1.6});
  out.layers.push(c);hyb.push(c.id)});
 var nl=out.layers.filter(function(l){return l.id==names[0]})[0],tf=nl&&nl.layout&&nl.layout["text-font"];
 return{style:out,font:(Array.isArray(tf)&&typeof tf[0]=="string"&&["literal","get","case","match","step","interpolate"].indexOf(tf[0])<0)?tf:["Noto Sans Regular"],base:base,names:names,labels:labels,hyb:hyb,vsrc:Object.keys(out.sources).filter(function(k){return out.sources[k].type=="vector"})[0]}
}
 function vis(id,on){if(map.getLayer(id))map.setLayoutProperty(id,"visibility",on?"visible":"none")}
 function setMode(m){
  mode=m;if(!map||!built||!map.isStyleLoaded())return;
  vis("sat",m!="streets");
  built.base.forEach(function(id){vis(id,m=="streets")});
  built.names.forEach(function(id){vis(id,m=="streets")});
  built.hyb.forEach(function(id){vis(id,m=="hybrid")});
  built.labels.forEach(function(id){vis(id,labelsOn)})
 }
 function init(container){
  if(initP)return initP;
  initP=load().then(function(){return fetch(CONFIG.STYLE_URL)}).then(function(r){return r.json()}).then(function(st){
   built=buildStyle(st);el=document.createElement("div");el.className="gmap";el.style.cssText="width:100%;height:100%";
   if(container)container.appendChild(el);
   map=new maplibregl.Map({container:el,style:built.style,center:[10,50],zoom:3,minZoom:0,maxZoom:19.5,attributionControl:{compact:true}});
   map.addControl(new maplibregl.NavigationControl({showCompass:false}),"top-right");
   return new Promise(function(res){map.on("load",function(){setMode(mode);res(map)})})
  }).catch(function(e){initP=null;throw e});
  return initP
 }
 function attach(c){if(el&&c){c.appendChild(el);if(map)setTimeout(function(){map.resize()},30)}}
 return{load:load,init:init,attach:attach,setMode:setMode,mode:function(){return mode},setLabels:function(on){labelsOn=on;setMode(mode)},built:function(){return built},map:function(){return map}}
})();
