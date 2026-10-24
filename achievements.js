// Achievements: campaign-wide, so they carry over from leg to leg and are kept in the save file.
var ACHIEVEMENTS=[
 {id:"countries",name:"Countries",desc:"Visit 10 different countries."},
 {id:"continents",name:"Continents",desc:"Visit 5 of the 6 inhabited continents."},
 {id:"pinpoint",name:"Pinpoint accuracy",desc:"Land a checkpoint guess within 500 m."},
 {id:"profiteer",name:"Profiteering",desc:"Sell a good for at least double what you paid."},
 {id:"timewaster",name:"Time waster",desc:"Spend 12 hours waiting for services in one campaign."},
 {id:"late",name:"Better late than never",desc:"Finish a leg after the target time."}
];
// Which continent each region belongs to. Islands are placed with their nearest mainland.
var CONTINENT_OF={"uk":"Europe","fr":"Europe","benelux":"Europe","de":"Europe","alps-it":"Europe","es":"Europe","scandinavia":"Europe","east":"Europe","balkans":"Europe","greece":"Europe","baltic":"Europe","eastern-europe":"Europe","north-atlantic":"Europe",
 "north-africa":"Africa","west-africa":"Africa","sahel":"Africa","west-africa-coast":"Africa","east-africa":"Africa","central-africa":"Africa","southern-africa":"Africa","upper-guinea":"Africa","egypt-libya":"Africa","indian-ocean-islands":"Africa","atlantic-islands":"Africa",
 "turkey":"Asia","caucasus":"Asia","levant":"Asia","iraq":"Asia","iran":"Asia","gulf":"Asia","central-asia":"Asia","afghanistan":"Asia","pakistan":"Asia","india":"Asia","sri-lanka":"Asia","mainland-se-asia":"Asia","bhutan":"Asia","china":"Asia","taiwan":"Asia","mongolia":"Asia","siberia":"Asia","indonesia":"Asia","philippines":"Asia","malaysia-singapore":"Asia","timor":"Asia","korea":"Asia","japan":"Asia",
 "png":"Oceania","australia":"Oceania","new-zealand":"Oceania","pacific-islands":"Oceania","micronesia":"Oceania","hawaii":"Oceania",
 "canada":"North America","usa":"North America","mexico":"North America","central-america":"North America","caribbean-greater":"North America","caribbean-lesser":"North America",
 "sa-north":"South America","brazil":"South America","southern-cone":"South America"};
// Campaign achievement state, created when first needed (so older saves still load)
function campAch(){if(!S||!S.camp)return null;var c=S.camp;c.ach=c.ach||{};c.countries=c.countries||[];c.continents=c.continents||[];c.waited=c.waited||0;return c}
function unlockAch(id){
 var c=campAch();if(!c||c.ach[id])return;
 var a=ACHIEVEMENTS.filter(function(x){return x.id===id})[0];if(!a)return;
 c.ach[id]={at:clk(S.h)};
 say("Achievement unlocked: "+a.name+".");
 achToast(a.name);
}
// Records the country and continent of a place. Called whenever you reach a place.
function trackPlace(id){
 var c=campAch();if(!c||!N[id])return;
 var cc=N[id].c;if(cc&&c.countries.indexOf(cc)<0)c.countries.push(cc);
 var cont=CONTINENT_OF[regionOf(id)];if(cont&&c.continents.indexOf(cont)<0)c.continents.push(cont);
 if(c.countries.length>=10)unlockAch("countries");
 if(c.continents.length>=5)unlockAch("continents");
}
function achToast(name){
 var el=document.createElement("div");el.className="toast";el.setAttribute("role","status");el.textContent="Achievement unlocked: "+name;
 document.body.appendChild(el);setTimeout(function(){el.remove()},4000);
}
function achHtml(){
 var c=campAch();if(!c)return"";
 var n=ACHIEVEMENTS.filter(function(a){return c.ach[a.id]}).length;
 return"<div class='panel'><h2>Achievements ("+n+"/"+ACHIEVEMENTS.length+")</h2><ul class='ach'>"+ACHIEVEMENTS.map(function(a){
  var got=c.ach[a.id];
  return"<li class='"+(got?"got":"")+"'><b>"+esc(a.name)+"</b> "+esc(a.desc)+(got?"<span class='mute'> Unlocked "+esc(got.at)+"</span>":"")+"</li>"
 }).join("")+"</ul></div>";
}
