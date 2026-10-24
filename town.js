// Town: the market, rest days, stranded legs, things to do, and the wait before a service.
// Loaded after game.js. Everything here is a global function, which game.js calls when it needs it.

// ============ REST DAY ============
// After a leg, the rest day is a free day in the arrival town: trade at the stall, find buyers, then leave at 8am on day x+2.
// Stock, prices and buyers come from the Groq proxy, and are scored on one universal 1 to 10 scale (see the market prototype).
var MK_KINDS=["luxury","useful","cultural","food"];

var MK_BAND_NEUTRAL={character:"No clear character, so buyers want things in the usual way.",weights:{luxury:3,useful:3,cultural:3,food:3}};

var MK_CAP=6;

// Stranded: no onward fare is affordable and no checkpoint work is open. The leg ends here as a rest day, and the next income is smaller
var STRANDED_INCOME=250;

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

function strandLeg(){
 S.stranded=1;S.arrH=S.h;S.phase="rest";S.camp.market=null;S.camp.marketOpen=false;
 say(clk(S.h)+": Stranded in "+N[S.loc].n+". No onward fare is affordable.");
}

function restCloseMarket(){S.camp.marketOpen=false;render()}

function restPage(){
 var arr=arrDay(),city=mkCity();
 var tl="<div class='tl'><div><b>Arrived</b>day "+arr+"</div><div class='now'><b>Rest day</b>day "+(arr+1)+"</div><div><b>Leave 8am</b>day "+(arr+2)+"</div></div>";
 var h=S.stranded?"<div class='panel'><h2>Stranded in "+esc(city)+"</h2><p class='mute mb6'>No onward fare is affordable. Sell what you carry at the market, then leave at 8am. You receive \u00a3"+STRANDED_INCOME+" when you set off, which covers most onward fares, but flights and fast trains will be out of reach for a while.</p>"+tl+"</div>":"<div class='panel'><h2>Rest day in "+esc(city)+"</h2><p class='mute mb6'>A free day. Visit the market to trade, explore the town, then leave at 8am.</p>"+tl+"</div>";
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

// While you wait: the market and things to do cost no time, so the service still leaves on schedule
function waitHtml(){
 var o=opts()[S.pend],v=vehicleName(o.m),to=N[o.to].n;
 var h="<div class='panel'><h2>Waiting for the "+esc(v)+" to "+esc(to)+"</h2><p class='mute mb10'>It leaves at "+esc(clk(S.waitDep))+", "+mins(S.waitDep-S.h)+" from now. Explore "+esc(N[S.loc].n)+" while you wait. The market and the things to do cost no time.</p>"+
  "<div class='row'><button class='btn' onclick='boardWaiting()'>Board the "+esc(v)+" at "+esc(clk(S.waitDep))+"</button><button class='link' onclick='cancelWait()'>Choose a different option</button></div></div>";
 h+=S.camp.marketOpen?marketHtml():"<div class='panel'><h2>Market</h2><p class='mute mb10'>Sell what you carry and buy local goods.</p><button class='btn alt' onclick='restVisit()'>Visit the market</button></div>";
 h+=thingsHtml();
 return h
}

function boardWaiting(){
 if(S.phase!=="wait")return;
 var i=S.pend,dep=S.waitDep;
 S.pend=null;S.waitDep=null;S.camp.marketOpen=false;S.phase="move";
 hop(i,dep);
}

function cancelWait(){S.phase="move";S.pend=null;S.waitDep=null;S.camp.marketOpen=false;render()}

var MK_PRE=null;

function mkCacheKey(){return mkCity()+"|"+mkDayNo()}

// Start the market's stock and buyers for the pack as it stands, so the visit is ready when the player gets there
function prefetchMarket(){
 var todo=S.camp.pack.filter(function(x){return!x.buyer});
 var entry={key:mkCacheKey(),uids:todo.map(function(x){return x.uid}),promise:mkAsk(mkVisitPrompt(true,todo))};
 MK_PRE=entry;
 entry.promise.catch(function(){if(MK_PRE===entry)MK_PRE=null});
}

