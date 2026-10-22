// Map sources. Swap these without touching the game code.
// Legs start at a hub drawn by weight. Add a hub by place id; London is the default home.
var START_HUBS=[{id:"lon",w:1}];
// Destination distance band (km), set by the region the leg starts from, so a leg from Nairobi and one from London use their own ranges. "default" applies to any region not listed.
var DISTANCE_BANDS={"default":[1000,2000],"east-africa":[2000,4000],"central-africa":[2000,4000],"southern-africa":[2000,4000],"upper-guinea":[2000,4000],"west-africa-coast":[2000,4000],"sahel":[2000,4000],"west-africa":[2000,4000],"indian-ocean-islands":[2000,4000],"iran":[2000,4000],"gulf":[2000,4000],"central-asia":[2000,4000],"afghanistan":[2000,4000],"china":[1000,4000],"taiwan":[1000,4000],"mongolia":[1000,4000],"siberia":[1000,4000]};
var CONFIG={
 // Vector basemap (OpenStreetMap data, no key). We fetch this style and strip it down at runtime.
 STYLE_URL:"https://tiles.openfreemap.org/styles/liberty",
 // Satellite imagery. Default is Esri's public World Imagery endpoint, fine for testing.
 // For a public launch, use a keyed provider and put the key here, for example:
 //  ArcGIS Location Platform: "https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=YOUR_KEY"
 //  MapTiler: "https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=YOUR_KEY"
 SAT:{tiles:["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],maxzoom:19,attribution:"Imagery &copy; Esri, Maxar, Earthstar Geographics"}
};
