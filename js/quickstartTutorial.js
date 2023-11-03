// Add all scripts to the JS folder

//Creating a map object and seting its initial view
var map = L.map('map').setView([51.505, -0.09], 13);

//Adding OpenStreetMap tile layer to the map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//Adding a marker to the map
var marker = L.marker([51.5, -0.09]).addTo(map);

//Adding a circle to the map
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

//Adding a polygon to the map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

//Binding popups to the marker, circle and polygon
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//Creating a standalone popup
var popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

//Creating an empty popup for later use	
var popup = L.popup();

//Function that handles map click events
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

//Adding a click event listener to the map 
map.on('click', onMapClick);



