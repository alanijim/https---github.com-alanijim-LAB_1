// Declare map variable globally so all functions have access
var map;
var minValue;

function calcPropRadius(attValue) {
    // Constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    // Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue / minValue, 0.5715) * minRadius;
    return radius;
}

// Step 1: Create the map
function createMap() {
    // Create the map
    map = L.map('map', {
        center: [0, 0],
        zoom: 2
    });

    // Add OSM base tile layer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    // Call getData function
    getData();
}

function calculateMinValue(data) {
    // Create an empty array to store all data values
    var allValues = [];

    // Loop through each city
    for (var location of data.features) {
        // Loop through each year
        for (var year = 2000; year <= 2008; year += 2) {
            // Get population for the current year
            var value = location.properties["Yr_" + year];
            // Add value to the array
            allValues.push(value);
        }
    }

    // Get the minimum value of our array
    minValue = Math.min(...allValues);

    return minValue;
}

// Step 3: Add circle markers for point features to the map
function pointToLayer(feature, latlng, attributes) {
    // Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

    // Create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    // For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    // Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    // Create circle marker layer
    var layer = L.circleMarker(latlng, options);

    // Build popup content string
    var popupContent = "<p><b>Location:</b> " + feature.properties.Location + "</p>";

    // Add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Attendance in " + year + ":</b> " + feature.properties[attribute] + " million</p>";

    // Bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -options.radius)
    });

    // Return the circle marker to the L.geoJson pointToLayer option
    return layer;
}

// Add circle markers for point features to the map
function createPropSymbols(data, attributes) {
    // Create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
}

// Step 1: Create new sequence controls
function createSequenceControls(attributes) {
    // Create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend', slider);

    // Set slider attributes
    var sliderElement = document.querySelector(".range-slider");
    sliderElement.max = attributes.length - 1;
    sliderElement.min = 0;
    sliderElement.value = 0;
    sliderElement.step = 1;

    document.querySelector('#panel').insertAdjacentHTML('beforeend', '<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend', '<button class="step" id="forward">Forward</button');
    document.querySelector('#reverse').insertAdjacentHTML('beforeend', "<img src='img/reverse.png'>");
    document.querySelector('#forward').insertAdjacentHTML('beforeend', "<img src='img/forward.png'>");

    // Step 5: Click listener for buttons
    document.querySelectorAll('.step').forEach(function (step) {
        step.addEventListener("click", function () {
            var index = parseInt(document.querySelector('.range-slider').value); // Convert to number

            // Step 6: Increment or decrement depending on button clicked
            if (step.id == 'forward') {
                index++;
                // Step 7: If past the last attribute, wrap around to the first attribute
                index = index > attributes.length - 1 ? 0 : index;
            } else if (step.id == 'reverse') {
                index--;
                // Step 7: If past the first attribute, wrap around to the last attribute
                index = index < 0 ? attributes.length - 1 : index;
            }

            // Step 8: Update slider
            document.querySelector('.range-slider').value = index;

            // Step 9: Pass the new attribute to update symbols
            updatePropSymbols(attributes[index]);
        });
    });

    // Step 5: Input listener for slider
    sliderElement.addEventListener('input', function () {
        // Step 6: Get the new index value
        var index = parseInt(this.value); // Convert to number
        // Step 9: Pass the new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
}

function processData(data) {
    // Empty array to hold attributes
    var attributes = [];

    // Properties of the first feature in the dataset
    var properties = data.features[0].properties;

    // Push each attribute name into the attributes array
    for (var attribute in properties) {
        // Only take attributes with population values
        if (attribute.indexOf("Yr") > -1) {
            attributes.push(attribute);
        }
    }

    return attributes;
}

// Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute) {
    map.eachLayer(function (layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            // Access feature properties
            var props = layer.feature.properties;

            // Update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            // Build popup content string
            var popupContent = "<p><b>Location:</b> " + props.Location + "</p>";
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Attendance in " + year + ":</b> " + props[attribute] + " million</p";

            // Update popup content
            var popup = layer.getPopup();
            popup.setContent(popupContent).update();
        }
    });
}

// Step 2: Import GeoJSON data
function getData() {
    // Load the data
    fetch("data/Summer_Sports.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            // Create an attributes array
            var attributes = processData(json);
            // Calculate the minimum data value
            minValue = calculateMinValue(json);
            // Call the function to create proportional symbols
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
        });
}

document.addEventListener('DOMContentLoaded', createMap);
