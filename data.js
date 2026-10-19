// Places: id|name|lat|lon|country|flags (r rail, a airport, p port, h high-speed, l landmark, digit = size 1-3)
var ALL_ROWS=[typeof REGION_UK!=="undefined"?REGION_UK:"",typeof REGION_FR!=="undefined"?REGION_FR:"",typeof REGION_BENELUX!=="undefined"?REGION_BENELUX:"",typeof REGION_DE!=="undefined"?REGION_DE:"",typeof REGION_ALPS_IT!=="undefined"?REGION_ALPS_IT:"",typeof REGION_ES!=="undefined"?REGION_ES:""].join(";").split(";").filter(Boolean);
// Place order is fixed, so route search breaks ties the same way as before the regions were split
var PLACE_ORDER="lon brt cnt dov fol ash nhv sou por poo ply exe sal oxf brs car bir man liv lee yor new edi gla cam nor har par cal dnk bou lil ami rou die hav cae che rns ros bre nan tou orl rei str lyo bor tls mar nic bru ams rot hoh hly dub cor rsl bel san bil sse bia mad bcn val zar col fra ber ham muc zrh gva bsl mil tur ven flo rom nap".split(" ");
var PLACE_BY_ID={};ALL_ROWS.forEach(function(r){PLACE_BY_ID[r.split("|")[0]]=r});
var PLACES=PLACE_ORDER.filter(function(id){return PLACE_BY_ID[id]}).map(function(id){return PLACE_BY_ID[id]}).join(";");
// Hand-set crossings and Eurostar-style links: from to mode hours cost
var CROSSINGS="dov cal ferry 2.2 42|dov dnk ferry 2.7 45|nhv die ferry 4.5 48 10 1|por hav ferry 8 75 22.5 1|por cae ferry 6.5 62 9 1|por che ferry 5.5 58 8.5 2|poo che ferry 4.5 55 14.5 1|ply ros ferry 8 85 21.5 1|hly dub ferry 3.2 55|liv dub ferry 8 55 20.5 1|liv bel ferry 8 50 20.5 1|rsl che ferry 18 90 20 2|cor ros ferry 14 85 18 3|por bil ferry 28 150 16.5 3|ply san ferry 20 130 17 3|har hoh ferry 8.5 75 23 1|lon par hsr 3 140|lon lil hsr 2 120|lon bru hsr 2.4 130|lon ams hsr 4 150|lon par bus 9 28|lon lil bus 8.5 27|lon bru bus 9.5 32";
// Smaller places that still count as cities for random destinations (every place of size 2 or 3 does too)
var EXTRA_CITIES="brt oxf cam yor exe nor rou ami cae tou rei bre cnt".split(" ");
// Cultural value of a place (0 to 5): used to find routes with the most to see. Places not listed score by size (3, 2) or 1 if in EXTRA_CITIES.
var CULTURE={par:5,rom:5,flo:5,ven:5,bcn:5,lon:4,edi:4,ams:4,ber:4,mad:4,mil:4,nap:4,bru:3,lyo:3,muc:3,dub:3,lil:2,mar:3,nic:3,bor:3,tur:3,brs:2,yor:3,oxf:3,cam:3,man:2,gla:3,liv:3,str:3,col:3,fra:2,ham:2,zrh:2,gva:2,val:3,zar:2,bil:3,rou:3,tou:2};
// If a region file is missing, drop the links that touch its places rather than failing to load
CROSSINGS=CROSSINGS.split("|").filter(function(s){var p=s.split(" ");return PLACE_BY_ID[p[0]]&&PLACE_BY_ID[p[1]]}).join("|");
