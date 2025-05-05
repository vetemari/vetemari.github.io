//panen kaardi ja zoomi ja asukoha
let map = L.map('map').setView([58.373523, 26.716045], 12);

//openstreet maps
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'OpenStreetMap contributors',
});

//lisan kaardile
osm.addTo(map);

// Add GeoJSON layer and create a heatmap
async function addGeoJson(url) {
  const response = await fetch(url);
  const data = await response.json();

  // Convert GeoJSON features to heatmap-compatible data
  const heatData = data.features.map(heatDataConvert);

  // Create and add the heatmap layer to the map
  const heatMap = L.heatLayer(heatData, { radius: 10 });
  heatMap.addTo(map);
}

// Convert a GeoJSON feature to heatmap-compatible array
function heatDataConvert(feature) {
  return [
    feature.geometry.coordinates[1], // Latitude
    feature.geometry.coordinates[0], // Longitude
    feature.properties.area || 1,    // Intensity (default to 1 if area is missing)
  ];
}

// Call the function with the GeoJSON file
addGeoJson('geojson/tartu_city_celltowers_edu.geojson');

// default map settings
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12);
}