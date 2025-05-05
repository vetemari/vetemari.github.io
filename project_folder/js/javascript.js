//panen kaardi ja zoomi ja asukoha
let map = L.map('map').setView([58.373523, 26.716045], 12)


//openstreet maps
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'OpenStreetMap contributors',
  })
  
  //lisan kaardile
  osm.addTo(map)
  // add geoJSON polygons layer*
async function addDistrictsGeoJson(url) {
    const response = await fetch(url)
    const data = await response.json()
    const polygons = L.geoJson(data)
    polygons.addTo(map)
  }
  addDistrictsGeoJson('geojson/tartu_city_districts_edu.geojson')

// add popup to each feature- function
function popUPinfo(feature, layer) {
  layer.bindPopup(feature.properties.NIMI)
}

// add geoJSON polygons layer
async function addDistrictsGeoJson(url) {
  const response = await fetch(url)
  const data = await response.json()
  const polygons = L.geoJson(data, {
    onEachFeature: popUPinfo,
  })
  polygons.addTo(map)
}

// Updated color scale based on property ranges
function getColor(property) {
  if (property <= 33) {
    return "#e5f5e0";
  } else if (property > 33 && property < 75) {
    return "#a1d99b";
  } else if (property > 75 && property <= 143) {
    return "#74c476";
  } else if (property > 143 && property <= 299) {
    return "#31a354";
  } else {
    return "#006d2c";
  }
}

// Polygon style using the updated getColor function
function polygonStyle(feature) {
  return {
    fillColor: getColor(feature.properties.TOWERS),  // Use a property that holds numerical values
    fillOpacity: 0.5,
    weight: 1,
    opacity: 1,
    color: 'grey',
  };
}

async function addDistrictsGeoJson(url) {
  const response = await fetch(url)
  const data = await response.json()
  const polygons = L.geoJson(data, {
    onEachFeature: popUPinfo,
    style: polygonStyle,
  })
  polygons.addTo(map)
}

// add geoJSON points layer*
async function addCelltowersGeoJson(url) {
  const response = await fetch(url)
  const data = await response.json()
  const markers = L.geoJson(data)
  markers.addTo(map)
}
addCelltowersGeoJson('geojson/tartu_city_celltowers_edu.geojson')

function createCircle(feature, latlng) {
  let options = {
    radius: 5,
    fillColor: 'lightblue',
    fillOpacity: 0.5,
    color: 'blue',
    weight: 1,
    opacity: 1,
  }
  return L.circleMarker(latlng, options)
}

async function addCelltowersGeoJson(url) {
  const response = await fetch(url)
  const data = await response.json()
  const circles = L.geoJson(data, {
    pointToLayer: createCircle,
  })
  circles.addTo(map)
}

// add geoJSON layer
async function addCelltowersGeoJson(url) {
  const response = await fetch(url)
  const data = await response.json()
  const markers = L.geoJson(data)
  const clusters = L.markerClusterGroup()
  clusters.addLayer(markers)
  clusters.addTo(map)
}

// default map settings
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12)
}