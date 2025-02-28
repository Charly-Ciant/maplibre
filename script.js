// AccesToken
/*mapboxgl.accessToken = 'pk.eyJ1IjoiY2hhcmx5LWNpYW50IiwiYSI6ImNtNzM2MXd4YzBpNDgyaXIwZ3o0Yjh2ZmUifQ.U14fhiQVfsqw_yhaIxYbTg';*/

// Configuration de la carte
var map = new maplibregl.Map({
    container: 'map',
    style: 'https://openmaptiles.geo.data.gouv.fr/styles/maptiler-toner/style.json',
    center: [-1.67, 48.11],
    zoom: 12,
    pitch: 20,
    bearing: -10
});


/// askip  ces qq lignes aide à changer les data si chgmt de fond de carte
map.on('style.load', function () {
    RajouteCouche(); // Recharge les sources et couches à chaque changement de style
});
function switchlayer(styleUrl) {
    map.setStyle(styleUrl);
}





///////SOURCES
// Fonction pour ajouter les couches
function RajouteCouche() {
    map.addSource('OMT', {
        type: 'vector',
        url: 'https://openmaptiles.geo.data.gouv.fr/data/france-vector.json'
    }); 
  
 
  map.addSource('Arrets', {
type: 'vector',
url: 'mapbox://ninanoun.58widelk'});
  
  map.addSource('Equipements', {
type: 'vector',
url: 'mapbox://ninanoun.4xcn5ude'});
  
  map.addSource('Proprietes', {
type: 'vector',
 url: 'mapbox://ninanoun.a4kdgiot'});
  
 
  // Ajout BDTOPO
map.addSource('BDTOPO', {
type: 'vector',
url: 'https://data.geopf.fr/tms/1.0.0/BDTOPO/metadata.json',
minzoom: 15,
maxzoom: 19
});
  
   map.addSource('velostar', {
type: 'geojson',
data: 'https://raw.githubusercontent.com/Charly-Ciant/data/refs/heads/main/stations_vls.geojson'
});
  
  map.addSource('Cadastre', {
  type: 'vector',
  url: 'https://openmaptiles.geo.data.gouv.fr/data/cadastre.json' });
  
  
  
  
///////COUCHES
  
   /* map.addLayer({"id": "hydrologie",
    "type": "line",
    "source": "mapbox-streets-v8",
    "source-layer": "waterway",
    "paint": {"line-color": "#9e0f75",
    "line-width": 10}
    }); */
  
  map.addLayer({"id": "hydrologie",
    "type": "fill",
    "source": "OMT",
    "source-layer": "water",
    "paint": {"fill-color" : "blue"}
    });
  
    map.addLayer({
'id': 'Cadastre',
'type': 'line',
'source': 'Cadastre',
'source-layer': 'parcelles',
"filter": ['>', 'contenance', 1000], 
'layout': {'visibility': 'none'},
'paint': {'line-color': '#706385', "line-width": 4},
'minzoom':16, 'maxzoom':19 }); 
  
  
  
   map.addLayer({
    "id": "Routes",
    "type": "line",
    "source": "mapbox-streets-v8",
    "layout": {'visibility': 'visible'},
    "filter": ["all", ["in", "class", "motorway", "trunk", "primary"]],
    "source-layer": "road",
    "paint": {"line-color": "#7f0b1e", "line-width": 4},
    });
  
    
 

  map.addLayer({
    'id': 'batiments',
    'type': 'fill-extrusion',
    'source': 'BDTOPO',
    'source-layer': 'batiment',
    'layout': {'visibility': 'visible'},
    'paint': {
      'fill-extrusion-color': {
        'property': 'hauteur',
        'stops': [
          [1, '#fee5d9'],
          [10, '#fcbba1'],
          [20, '#fc9272'],
          [50, '#fb6a4a'],
          [100, '#ef3b2c'],
          [150, '#cb181d'],
          [200, '#d73027']
        ]
      },
      'fill-extrusion-height':{'type': 'identity','property': 'hauteur'},
      'fill-extrusion-opacity': 0.9,
      'fill-extrusion-base': 0
    },
  });
  
  
  
    map.loadImage('https://cdn-icons-png.flaticon.com/512/5030/5030991.png', function(error, image) {
    if (error) throw error;
    map.addImage('custom-grocery', image);
    map.addLayer({
        'id': 'Arrets',
        'type': 'symbol',
        'source': 'Arrets',
        'source-layer': 'Bus-5ypx1k',
        'layout': {
            'visibility': 'visible',
            'icon-image': 'custom-grocery',
            'icon-size': 0.05
        },
        'minzoom': 12
    });
});

  
  
  
  
 //////// COUCHES PAR API : partie "sources" et partie add.layer"
 
  ///API carto : couche cadastre
  dataCadastre = 'https://apicarto.ign.fr/api/cadastre/commune?code_insee=35238';
jQuery.when( jQuery.getJSON(dataCadastre)).done(function(json) {
for (i = 0; i < json.features.length; i++) {
json.features[i].geometry = json.features[i].geometry;
};
map.addLayer(
{'id': 'Contourcommune',
'type':'line',
'source': {'type': 'geojson','data': json},
'paint' : {'line-color': 'blue',
'line-width':5},
'layout': {'visibility': 'none'},
});
});
  
  
    ///API carto : couche PLU
  dataPLU = 'https://apicarto.ign.fr/api/gpu/zone-urba?partition=DU_243500139';
jQuery.when(jQuery.getJSON(dataPLU)).done(function(json) {
// Filtrer les entités pour ne garder que celles avec typezone = 'U'
var filteredFeatures = json.features.filter(function(feature)
{return feature.properties.typezone === 'N';});
// Créer un objet GeoJSON avec les entités filtrées
var filteredGeoJSON = { type: 'FeatureCollection', features: filteredFeatures};
map.addLayer({
'id': 'PLU',
'type': 'fill',
'source': {'type': 'geojson',
'data': filteredGeoJSON},
'paint': {'fill-color': 'green',
'fill-opacity': 0.4},
});
});
  
  
  
    ///API star : velo VLS
 $.getJSON('https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/vls-stations-etat-tr/records?limit=60',
function(data) 
           {var geojsonVLS = {
            type: 'FeatureCollection',
            features: data.results.map(function(element) {
                return {type: 'Feature',
                geometry: {type: 'Point',
                coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
                properties: { nom: element.nom,
                emplacements: element.nombreemplacementsdisponibles, velos: element.nombrevelosdisponibles}};
                })
};
            
map.addLayer({ 'id': 'VLS',
'type':'circle',
'source': {'type': 'geojson',
'data': geojsonVLS},
'paint': {'circle-color': '#ff6c30',
        'circle-radius': {property: 'velos',
        type: 'exponential',
        stops: [[1, 1],[200, 250]]},
        'circle-opacity': 0.9, 'circle-stroke-width' : 1, 'circle-stroke-color': '#ffe5db', 'circle-blur' : 0.7},
'layout': {'visibility': 'none'}
 
});
});
 
 
  
    ///API star : PARCS RELAIS
 $.getJSON('https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/tco-parcsrelais-star-etat-tr/records?limit=60',
function(data) 
           {var geojsonPR = {
            type: 'FeatureCollection',
            features: data.results.map(function(element) {
                return {type: 'Feature',
                geometry: {type: 'Point',
                coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
                properties: { nom: element.nom,
                emplacements: element.jrdinfosoliste}};
                })
};
            
map.addLayer({ 'id': 'PR',
'type':'circle',
'source': {'type': 'geojson',
'data': geojsonPR},
'paint':  {'circle-color': '#ff6c30',
        'circle-radius': {property: 'emplacements',
        type: 'exponential',
        stops: [[1, 8],[2000, 100]]},
        'circle-opacity': 1}
});
});  
  
  
///////////////// API overpass bus 

const ville = "Rennes";
    $.getJSON(`https://overpass-api.de/api/interpreter?data=[out:json];area[name="${ville}"]->.searchArea;(node["highway"="bus_stop"](area.searchArea););out center;`,
        function (data) {
            var geojsonData = {
                type: 'FeatureCollection',
                features: data.elements.map(function (element) {
                    return {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [element.lon, element.lat] },
                        properties: {}
                    };
                })
            };
            map.addSource('customData', {
                type: 'geojson',
                data: geojsonData
            });
            map.addLayer({
                'id': 'Arrets',
                'type': 'circle',
                'source': 'customData',
                'paint': {
                    'circle-color': 'blue',
                    'circle-radius': 2
                },
                'layout': { 'visibility': 'visible' }
            });
        });
      
        switchlayer = function (lname) {
            if (document.getElementById(lname + "CB").checked) {
                map.setLayoutProperty(lname, 'visibility', 'visible');
            } else {
                map.setLayoutProperty(lname, 'visibility', 'none');
           }
        }
  
  
  
  
///////////////// API overpass BAKERY 

    $.getJSON(`https://overpass-api.de/api/interpreter?data=[out:json];area[name="${ville}"]->.searchArea;(node["shop"="bakery"](area.searchArea););out center;`,
        function (data) {
            var geojsonData = {
                type: 'FeatureCollection',
                features: data.elements.map(function (element) {
                    return {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [element.lon, element.lat] },
                        properties: {}
                    };
                })
            };
            map.addSource('customData2', {
                type: 'geojson',
                data: geojsonData
            });
            map.addLayer({
                'id': 'bakery',
                'type': 'circle',
                'source': 'customData2',
                'paint': {
                    'circle-color': 'yellow',
                    'circle-radius': 6
                },
                'layout': { 'visibility': 'visible' }
            });
        });
      
        switchlayer = function (lname) {
            if (document.getElementById(lname + "CB").checked) {
                map.setLayoutProperty(lname, 'visibility', 'visible');
            } else {
                map.setLayoutProperty(lname, 'visibility', 'none');
           }
        }
  
  

  
} // fin de la fction rajoute couche
 

// Ajout initial des couches
map.on('load', RajouteCouche);

// Gestion du changement de style
document.getElementById('style-selector').addEventListener('change', function () {
    map.setStyle(this.value);
    map.once('style.load', RajouteCouche); // Recharge les couches après changement de style
});

var nav = new maplibregl.NavigationControl();
map.addControl(nav, 'top-left');

map.addControl(new maplibregl.ScaleControl({
    maxWidth: 120,
    unit: 'metric'
}));

map.addControl(new maplibregl.GeolocateControl({
    positionOptions: {enableHighAccuracy: true},
    trackUserLocation: true,
    showUserHeading: true
}));





///// INTERACTIVITE 

//Interactivité CLICK sur arret bus
map.on('click', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['Arrets'] });
    if (!features.length) {
        return;
    }
    var feature = features[0];
    var popup = new mapboxgl.Popup({ className: "Mypopupclick", offset: [0, -15] })
        .setLngLat(feature.geometry.coordinates)
        .setHTML('<h2>' + feature.properties.nom + '</h2><hr><h3>'
            + "Mobilier : " + feature.properties.mobilier + '</h3><p>')
        .addTo(map);
});
map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['Arrets'] });
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
});









//Interactivité HOVER sur parc relais

var popup = new maplibregl.Popup({
    className: "Mypopuphover",
    closeButton: false,
    closeOnClick: false }); 

map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['PR'] });
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
    if (!features.length) {
        popup.remove();
        return;
    }
    var feature = features[0];
    popup.setLngLat(feature.geometry.coordinates)
        .setHTML('<h3>' + feature.properties.nom + '</h3><hr><h4>'
            + "Nombre de places : " + feature.properties.emplacements + '</h4><p>')
        .addTo(map);
});








//// config des fly to 
// Configuration onglets geographiques
document.getElementById('Charly').addEventListener('click', function () {
    map.flyTo({
        zoom: 20,
        center: [ -1.660992, 48.086465],
        pitch: 50,
        bearing: 200
    });
});

document.getElementById('istanbul').addEventListener('click', function () {
    map.flyTo({
        zoom: 20,
        center: [-1.708185 , 48.123118 ],
        pitch: 50,
        bearing: 200
    });
});


document.getElementById('Rennes2').addEventListener('click', function () {
    map.flyTo({
        zoom: 17,
        center: [ -1.702495, 48.119486],
        pitch: 50,
        bearing: 200
    });
});