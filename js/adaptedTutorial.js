/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
};

//function to retrieve the data and place it on the map
// ..

function getData() {
    // Load the data
    fetch("data/MegaCities.geojson")
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            // Define a function to create a circle marker for each feature
            function createCircleMarker(feature, latlng) {
                var geojsonMarkerOptions = {
                    radius: 8,
                    fillColor: "#ff7800",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                };

                return L.circleMarker(latlng, geojsonMarkerOptions);
            }

            // Define a function to bind popups to each feature
            function onEachFeature(feature, layer) {
                if (feature.properties && feature.properties.City) {
                    layer.bindPopup("City: " + feature.properties.City);
                }
            }

            // Create a Leaflet GeoJSON layer with pointToLayer and onEachFeature functions
            L.geoJson(json, {
                pointToLayer: createCircleMarker,
                onEachFeature: onEachFeature
            }).addTo(map);
        });
}

// ...


document.addEventListener('DOMContentLoaded',createMap)