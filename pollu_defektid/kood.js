// NDVI MUUTUSTE JÄLGIMINE //

// Uurimisala määramine
/* 
Lisa uurimisala kasutades Assets võimalust 
Assets -> New -> Table Upload -> shape files -> lae üles pollud.zip -> lisa nimi -> Upload 
Oota kuni Tasks aknas näitab, et fail on üleslaetud ning tee siis assets aknale värskendus

1. Võimalus uurimisala kuvamiseks kasutades Assets akent 
Ava oma äsja loodud fail -> import 
Selle tulemusena peaks scriptis avanema riba nimega var table: Table projects/magister-458413/assets/pollud
Muuda muutuja nimi table --> StudyArea 


2. Võimalus uurimisala lisamiseks on koodi teel.  */
var StudyArea = ee.FeatureCollection("projects/magister-458413/assets/pollud"); // asenda siin path enda omaga

// Kaardi keskpunkti seadistamine uurimisalale
Map.centerObject(StudyArea, 11);

/* Huvipunktide (ROI - Region of Interest) lisamine NDVI  analüüsiks. 
jällegi kaks võimalust 
1. Võimalus valida alad kaardiaknas. Vasakul üleval servas valida "Add a marker" 
Vahetada muutuja nimi geometry -- roi 
Kokku luua kaks huvipunkti -- huvipunktide paneelilt (geometry imports) valida new layer ja nimed panna roi, roi1
Nii moodi huvipunkte luues on võimalik neid hiljem ka lihtsalt liigutada. Klikid kaardiaknas markeri aktiivseks 
ja liiguad uude kohta 

2. Võimalus huvipunkide määramine koordinaatide järgi    */

// var roi = /* color: #ffc82d */ee.Geometry.Point([27.483, 57.803]),
//     roi1 = /* color: #00ffff */ee.Geometry.Point([27.498, 57.783]),



// - tähistavad ühele reale lisatud kommentaari 
/*
võib 
kommntaari 
kirjutad 
mitmele 
reale 
*/

/////////////Sentinel-2 piltide lisamine ja töötlemine/////////////

// Funktsioon, mis lõikab pildi uurimisala järgi
var MaskStudyArea = function(image) {
  return image.clip(StudyArea);
};

////////////// Satelliidiandmete valimine, ajavahemiku määramine ja uurimisala maski rakendamine///////////////////////////
/* Kasutame sentinel-2 pilte. Selleks, et saada rohkem tehnilist infot tasub siin samal lehel avada otsingu 
funktsioon ja otsida Harmonized Sentinel-2 MSI ning valida level 2A 
Sealt on võimalik selle ülesande jaoks olulist infot nagu näiteks satelliidi missiooni pikkus ehk siis 
ajavahemik mille kohta saab analüüsi teha 
Lisaks on seal ka info kanalite (bands) kohta, mida läheb vaja NDVI arvutamiseks 
*/

var S2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                  .filter(ee.Filter.date('2019-05-01', '2023-08-31')) //seda saab muuta vastavalt enda soovile 
                  .map(MaskStudyArea);
                

// Funktsioon binaarsete andmete eraldamiseks, mida läheb vaja järgmise koodi jupi jaoks
function bitwiseExtract(value, fromBit, toBit) {
  if (toBit === undefined) toBit = fromBit;
  var maskSize = ee.Number(1).add(toBit).subtract(fromBit);
  var mask = ee.Number(1).leftShift(maskSize).subtract(1);
  return value.rightShift(fromBit).bitwiseAnd(mask);
}

// Funktsioon pilvede eemaldamiseks Sentinel-2 piltidelt
var maskClouds = function(image) {
  var quality = image.select('QA60'); // Pilvede kvaliteedikanal, vaata sentinel 2 andmetest mida QA60 endast kujutab 
  var cloudState = bitwiseExtract(quality, 10); // 10. bitt näitab tavaliste pilvede olemasolu
  var cirrusState = bitwiseExtract(quality, 11); // 11. bitt näitab kiudpilvede olemasolu
  var mask = cloudState.eq(0).and(cirrusState.eq(0)); // Valime välja ainult pilvitud pikslid
  return image.updateMask(mask);
};

// Rakendame pilvede filtri oma uurimisalale
var filtereds2 = S2.map(maskClouds);


/////////////////////////NDVI arvutamine //////////////////////////////////
//Siin osas looma süsteemi, mis aitab valida ja visualiseerida soovitud kuude NDVI

// Aastad ja kuud
var years = ee.List.sequence(2019, 2023); //valime aastad 
var months = ee.List.sequence(5, 8); // kasvuperioodi kuud 

// Koostame kuupõhised NDVI komposiidid
//aasta ja kuu tsükkel 
var yearMonthNDVI = years.map(function(year) {
  return months.map(function(month) {
    var startDate = ee.Date.fromYMD(year, month, 1);  //kuu algus kuupäev
    var endDate = startDate.advance(1, 'month');    //lõpu kuupäev 
    
    // valime sobivad kanalid mediaan NDVI arvutamiseks ja puhastema need pilvedest 
var medianImage = filtereds2.filterDate(startDate, endDate)
  .select(['B8', 'B4'])
  .median();

//arvutame NDVI mediaani järgi 
var ndvi = medianImage.expression(   
  '(NIR - RED) / (NIR + RED)', {
    'NIR': medianImage.select('B8'),
    'RED': medianImage.select('B4')
  }).rename('NDVI');

//metaandmed pildile juurde 
var image = ndvi
  .set('system:time_start', startDate)
  .set('year', year)
  .set('month', month);
    return image;
  });
}).flatten(); // loob ühe listi mida saab edaspidi kasutada 

// Loome ImageCollectioni ehk siis teeme listist pildikogu mida saab visualiseerida 
var ndviCollection = ee.ImageCollection(yearMonthNDVI);

/////////////////// Visualiseerimine////////////////////////////

// loome ja lisame kaardile keskmised kuupõhised ndvi kihid meie valitud ajaperioodil 

var calculateMonthlyComposite = function(year, month) {
  var startDate = ee.Date.fromYMD(year, month, 1); //kuu algus 
  var endDate = startDate.advance(1, 'month');  // kuu lõpp 
  
  //valime ainult kindlas kuus olevad pildid 
  var monthlyNDVI = ndviCollection.filterDate(startDate, endDate);
  
  // arvutama kuu keskmise ndvi 
  var meanNDVI = monthlyNDVI.mean().clip(StudyArea);
  
  // visualiseerimine 
  var ndviParams = {min: -1, max: 1, palette: ['white', 'green']};
  
  // lisame kihi kaardile 
  Map.addLayer(meanNDVI, ndviParams, 'Mean NDVI ' + year + '-' + month, false);
};

// teeme tsükkli, mis loob kihi iga valitud aasta ja kuu kohta 
years.getInfo().forEach(function(year) {
  for (var month = 5; month <= 8; month++) {
    calculateMonthlyComposite(year, month);
  }
});

///////////////////////Graafikud //////////////////////////////

// Loome graafiku: keskmine NDVI väärtus ROI piirkonnas
var ndviChart = ui.Chart.image.seriesByRegion({
  imageCollection: ndviCollection,
  band: 'NDVI',
  regions: roi,
  reducer: ee.Reducer.mean(),
  scale: 10, //skaala on 10 sest sentinel 2 ndvi on 10m resolutsiooniga
  seriesProperty: 'month',
  xProperty: 'system:time_start'
}).setChartType('ColumnChart') // valime pulkdiagrammi 
  .setOptions({
    title: 'Kuupõhine NDVI (mai–august) esimene ala ', //lisame nime 
    hAxis: {
      title: 'Aasta ja kuu',
      format: 'yyyy-MM',
      slantedText: true
    },
    vAxis: {title: 'NDVI', viewWindow: {min: 0, max: 1}},
    legend: {position: 'none'},
    colors: ['#1b7837']
  });

print(ndviChart);
  
//samasugune graafik teisele ROIle 
var ndviChart1 = ui.Chart.image.seriesByRegion({
  imageCollection: ndviCollection,
  band: 'NDVI',
  regions: roi1,
  reducer: ee.Reducer.mean(),
  scale: 10,
  seriesProperty: 'month',
  xProperty: 'system:time_start'
}).setChartType('ColumnChart') 
  .setOptions({
    title: 'Kuupõhine NDVI (mai–august) teine ala',
    hAxis: {
      title: 'Aasta ja kuu',
      format: 'YYYY-MM',
      slantedText: true
    },
    vAxis: {title: 'NDVI', viewWindow: {min: 0, max: 1}},
    legend: {position: 'none'},
    colors: ['#1b7837']
  });

print(ndviChart1);


///////////////////Leiame püsivalt madala väärtusega kohad///////////////////////////////////


//Määrame, mis vahemikus on tegu kehva NDVI väärtusega
var lowNDVI = function(image) {
  return image.gte(-1).and(image.lte(0.3)); // -1 kuni 0.3 näitab alasid kus pole taimi või on kehva kasvuga
};



// Siin on funktsioon mille abil saame määrata kui suure osa ajast peaksid NDVI 
//väärtused olema kehvas vahemikus, et me neid defektseteks kohtadeks loeks 
var detectPersistentLowNDVI = function(ndviCollection, thresholdPercentage) {
  // binaarne muutuja, kus omistame igale pikslile 0 või 1 väärtuse 
  var lowNDVIMask = ndviCollection.map(function(image) {
    return lowNDVI(image); // rakendame seda meie NDVI rastritele 
  });

  // arvutame protsendi defektsuse määramiseks 
  var lowNDVIPercentage = lowNDVIMask.sum().divide(ndviCollection.size()).multiply(100);

  // loome uue kihi, mis märgistab alad, kus madala NDVI pikslite osakaal on suurem v võrdne määratud piiriga 
  var persistentLowNDVI = lowNDVIPercentage.gte(thresholdPercentage); // saame seda piiri muuta

 
  // loome kaardikihi, kus visualiseerime tulemusi, antud hetkel roheline on 0 väärtus ja 
  //punane on 1 ehk siis kõik defektiga kohad peaksid olema kuvatud punaselt 
  var persistentLowNDVIParams = {min:0, max: 1, palette: ['green', 'red']};
  Map.addLayer(persistentLowNDVI, persistentLowNDVIParams, 'Persistent Low NDVI Areas', true);

  return persistentLowNDVI;
};

//alles siin saame lõpuks defineerida, mis lävendit me madala ndvi puhul kasutame
//praeguses näites loeme madala ndvi aladeks kõik alad, kus ndvi on jäänud vahemikku -1-0,3 vähemalt 55% ajast
var persistentLowNDVIAreas = detectPersistentLowNDVI(ndviCollection, 50); 

/////// tulemuste importimine///////
Export.image.toDrive({
  image: persistentLowNDVIAreas,
  description: 'Persistent_Low_NDVI_Export',
  folder: 'EarthEngineExports',
  scale: 10, // resolutsioon
  region: StudyArea, // mis alalt soovime tulemusi installida
  maxPixels: 1e13
});




  