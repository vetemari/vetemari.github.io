// Initialize the map and set its view to Tartu city
let map = L.map('map').setView([58.373523, 26.716045], 12);

// Add OpenStreetMap raster tile layer
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'OpenStreetMap contributors',
});
osm.addTo(map);

// Add GeoJSON layer with choropleth configuration
async function addGeoJson(url) {
  const response = await fetch(url);
  const data = await response.json();

  // Add choropleth layer
  L.choropleth(data, {
    valueProperty: 'OBJECTID', // Attribute for cell tower count
    scale: ['#ffffff', '#008000'],    // Color palette (white to orange)
    steps: 5,                         // Number of color steps
    mode: 'q',                        // Quantile mode
    style: {
      color: '#fff',                  // Border color
      weight: 2,                      // Border width
      fillOpacity: 0.8,               // Fill opacity
    },
    onEachFeature: function (feature, layer) {
      // Configure popup to display district name and cell tower count
      const districtName = feature.properties.NIMI || 'Unknown';
      const cellTowerCount = feature.properties.OBJECTID || 0;
      layer.bindPopup(
        `<strong>District:</strong> ${districtName}<br>
         <strong>Cell Towers:</strong> ${cellTowerCount}`
      );
    },
  }).addTo(map);
}

// Call the function with the GeoJSON file
addGeoJson('geojson/tartu_city_districts_edu.geojson');

// Default map settings function
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12);
}