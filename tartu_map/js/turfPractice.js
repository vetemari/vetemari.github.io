import { pointsCollection } from "../js/points.js"

function turfFunctions(map) {

  const pointCoords = [26.71552, 58.37393]
  
  // define a point
  const myPoint = turf.point(pointCoords)
  // convert the point to geoJSON object
  const geoJSON_point = L.geoJSON(myPoint)
  // add the geoJSON object to the map
  geoJSON_point.addTo(map)
  const pointCoords2 = [26.71489, 58.37439]

    // define a point
    const myPoint2 = turf.point(pointCoords2)
    // convert the point to geoJSON object
    const geoJSON_point2 = L.geoJSON(myPoint2)
    // add the geoJSON object to the map  
    geoJSON_point2.addTo(map)

   const pointCoords3 = [26.71216, 58.37428]
    // define a point
    const myPoint3 = turf.point(pointCoords3)
    // convert the point to geoJSON object
    const geoJSON_point3 = L.geoJSON(myPoint3)
    // add the geoJSON object to the map  
    geoJSON_point3.addTo(map)
    

  const options = { units: 'meters' }

  // replace point1 and point2 with the actual names you used to define your Turf points
const distance = turf.distance(pointCoords, pointCoords2, options)
//console.log(`distance is ${distance} meters`)
// round the distance to nearest integer
const distanceRounded = Math.round(distance)
// distance is first multiplied by 100, then rounded and divided by 100 to keep two digits after the decimal point
const roundedToTwoDecimals = Math.round(distance*100)/100
// compare the results
//console.log(`rounded to nearest integer: ${distanceRounded}`)
//console.log(`rounded to two decimal points: ${roundedToTwoDecimals}`)

  const lineCoords = [
    [26.71379, 58.37476],
    [26.71554, 58.37349],
    [26.71553, 58.37434],
    [26.71630, 58.37378],
    [26.71473, 58.37407]
  ]
  // define the line object
  const myLine = turf.lineString(lineCoords) 

  const geoJSON_line = L.geoJSON(myLine)
  // add the geoJSON object to the map
  geoJSON_line.addTo(map)

  // define polygon coordinates
const polygonCoords = [[
    [26.71355, 58.37468],
    [26.71404, 58.37430],
    [26.71433, 58.37429],
    [26.71550, 58.37345],
    [26.71660, 58.37388],
    [26.71615, 58.37420],
    [26.71589, 58.37431],
    [26.71552, 58.37461],
    [26.71521, 58.37496],
    [26.71480, 58.37481],
    [26.71449, 58.37502],
    [26.71355, 58.37468]
  ]]
  // define polygon object
  const myPolygon = turf.polygon(polygonCoords)

  const geoJSON_polygon = L.geoJSON(myPolygon)
  // add the geoJSON object to the map
  geoJSON_polygon.addTo(map)


const areaMeasurement = turf.area(myPolygon)
const areaRounded = Math.round(areaMeasurement)
console.log(`Area without rounding: ${areaMeasurement}`)
console.log(`Rounded area is ${areaRounded} square meters`)


// buffer 
const statueBuffer = turf.buffer(myPoint, 20, {units: 'meters'})
//L.geoJSON(statueBuffer).addTo(map)

const lineBuffer = turf.buffer(myLine, 10, {units: 'meters'})
//L.geoJSON(lineBuffer).addTo(map)

const polygonBuffer = turf.buffer(myPolygon, -5, {units: 'meters'})
//L.geoJSON(polygonBuffer).addTo(map)

// create a feature collection
const features = turf.featureCollection([myPoint, myPoint3, myLine, myPolygon])
// create the envelope
const enveloped = turf.envelope(features)
// add to map
L.geoJSON(enveloped).addTo(map)

const points = turf.points(pointsCollection)
//L.geoJSON(points).addTo(map) 

const pointsWithinBorders = turf.pointsWithinPolygon(points, myPolygon)
// this should log an object that contains all the features within the park polygon
console.log(pointsWithinBorders)
L.geoJSON(pointsWithinBorders).addTo(map)
  // define point coordinates

  map.on('click', function(event) {
    console.log(`[${event.latlng.lng}, ${event.latlng.lat}]`)
    // define coordinates of the point
    let pointCoords = [event.latlng.lng, event.latlng.lat]
    // create a turf point
    let turfPoint = turf.point(pointCoords)
    // convert the point to GeoJSON format and add it to the map
    //L.geoJSON(turfPoint).addTo(map)
  })

//panin ise keskpunkti pargi polügoonile 
  const centroid = turf.centroid(myPolygon);
  L.geoJSON(centroid, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 8, // Size of the marker
            fillColor: '#ff7800', // Fill color
            color: '#000', // Border color
            weight: 1, // Border width
            opacity: 1, // Border opacity
            fillOpacity: 0.8 // Fill opacity
        });
    }
}).addTo(map);



  }

export { turfFunctions }

