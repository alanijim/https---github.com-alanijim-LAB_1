//declare map variable globally so all functions have access
var map;
var minValue;

//step 1 create map
function createMap(){

    //create the map
    map = L.map('map', {
        center: [0, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
};

function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var location of data.features){
        //loop through each year
        for(var year = 2000; year <= 2008; year+=2){
              //get population for current year
              var value = location.properties["Yr_"+ String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allValues)

    return minValue;
}

function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("_")[1];
    this.Attendance = this.properties[attribute];
    this.formatted = "<p><b>Location:</b> " + this.properties.Location + "</p><p><b>Attendance in " + this.year + ":</b> " + this.Attendance + " million</p>";
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
};

//Step 3: Add circle markers for point features to the map
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    //check
    console.log(attribute);

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

   //create new popup content 
   var popupContent = new PopupContent(feature.properties, attribute);

    //create another popup based on the first
    var popupContent2 = Object.create(popupContent);

    //change the formatting
    popupContent.formatted = "<h2>" + popupContent.Attendance + " million</h2>";
     //change the formatting of popup 2

    popupContent2.formatted = "<h2>" + popupContent.Attendance + " million</h2>";

     //add popup to circle marker    
     layer.bindPopup(popupContent2.formatted)

    //bind the popup to the circle marker
    layer.bindPopup(popupContent.formatted, {
        offset: new L.Point(0,-options.radius) 
    });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
    
};

//Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Step 1: Create new sequence controls
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

    // Step 5: click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = parseInt(document.querySelector('.range-slider').value); // Convert to number

            // Step 6: increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 5 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 5 : index;
            };

            // Step 8: update slider
            document.querySelector('.range-slider').value = index;

            // Step 9: pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        });
    });

    // Step 5: input listener for slider
    sliderElement.addEventListener('input', function(){            
        // Step 6: get the new index value
        var index = parseInt(this.value); // Convert to number
        console.log(index);
        // Step 9: pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
};


function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Yr") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            var popupContent = new PopupContent(feature.properties, attribute);

            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent.formatted).update();
        };
    });
};
//Step 2: Import GeoJSON data
function getData(){
    //load the data
    fetch("data/Summer_Sports.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create an attributes array
            var attributes = processData(json);
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
        })
};




document.addEventListener('DOMContentLoaded',createMap)