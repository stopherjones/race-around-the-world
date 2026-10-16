// Map sources. Swap these without touching the game code.
var CONFIG={
 // Vector basemap (OpenStreetMap data, no key). We fetch this style and strip it down at runtime.
 STYLE_URL:"https://tiles.openfreemap.org/styles/liberty",
 // Satellite imagery. Default is Esri's public World Imagery endpoint, fine for testing.
 // For a public launch, use a keyed provider and put the key here, for example:
 //  ArcGIS Location Platform: "https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=YOUR_KEY"
 //  MapTiler: "https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=YOUR_KEY"
 SAT:{tiles:["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],maxzoom:19,attribution:"Imagery &copy; Esri, Maxar, Earthstar Geographics"}
};
