//* ------------------------------ CONSTANTS ---------------------------------------- //

let dataPath = 'http://127.0.0.1:5500/data/world_map.json'

//* ------------------------------ END CONSTANTS ------------------------------------ //

//* ------------------------------ VARIABLES ---------------------------------------- // 
w = 3000; // width of the map
h = 1250; // height of the map
  
var minZoom;
var maxZoom;
var zoomBool = false; // Boolean to check if the map is zoomed or not

var projection = d3
  .geoEquirectangular()
  .center([0, 15]) // set centre to further North as we are cropping more off bottom of map
  .scale([w / (2 * Math.PI)]) // scale to fit group width
  .translate([w / 2, h / 2]) // ensure centered in group
;

var path = d3
        .geoPath()
        .projection(projection);

//* ----------------------------- END VARIABLES ------------------------------------ // 

//* ------------------------------ FUNCTIONS ---------------------------------------- //

//[ ] --------------------------- ZOOM FUNCTIONS ----------------------------------- //
function zoomed() {
  // This function is called when the map is zoomed
  t = d3
    .event
    .transform
  ;
  countriesGroup
    .attr("transform","translate(" + [t.x, t.y] + ")scale(" + t.k + ")")
  ;
}

function unZoomed() {
  // This function is called when the map is unzoomed
  t = d3
    .zoomIdentity
  ;
  countriesGroup
    .attr("transform","translate(" + [t.x, t.y] + ")scale(" + t.k + ")")
  ;
}

// Function that calculates zoom/pan limits and sets zoom to default value 
function initiateZoom() {
  // Define a "minzoom" whereby the "Countries" is as small possible without leaving white space at top/bottom or sides
  minZoom = Math.max($("#map-holder").width() / w, $("#map-holder").height() / h);
  // set max zoom to a suitable factor of this value
  maxZoom = 20 * minZoom;
  // set extent of zoom to chosen values
  // set translate extent so that panning can't cause map to move out of viewport
  zoom
    .scaleExtent([minZoom, maxZoom])
    .translateExtent([[0, 0], [w, h]])
  ;
  // define X and Y offset for centre of map to be shown in centre of holder
  midX = ($("#map-holder").width() - minZoom * w) / 2;
  midY = ($("#map-holder").height() - minZoom * h) / 2;
  // change zoom transform to min zoom and centre offsets
  svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
}

// zoom to show a bounding box, with optional additional padding as percentage of box size
function boxZoom(box, centroid, paddingPerc) {
  minXY = box[0];
  maxXY = box[1];
  // find size of map area defined
  zoomWidth = Math.abs(minXY[0] - maxXY[0]);
  zoomHeight = Math.abs(minXY[1] - maxXY[1]);
  // find midpoint of map area defined
  zoomMidX = centroid[0];
  zoomMidY = centroid[1];
  // increase map area to include padding
  zoomWidth = zoomWidth * (1 + paddingPerc / 100);
  zoomHeight = zoomHeight * (1 + paddingPerc / 100);
  // find scale required for area to fill svg
  maxXscale = $("svg").width() / zoomWidth;
  maxYscale = $("svg").height() / zoomHeight;
  zoomScale = Math.min(maxXscale, maxYscale);
  // handle some edge cases
  // limit to max zoom (handles tiny countries)
  zoomScale = Math.min(zoomScale, maxZoom);
  // limit to min zoom (handles large countries and countries that span the date line)
  zoomScale = Math.max(zoomScale, minZoom);
  // Find screen pixel equivalent once scaled
  offsetX = zoomScale * zoomMidX;
  offsetY = zoomScale * zoomMidY;
  // Find offset to centre, making sure no gap at left or top of holder
  dleft = Math.min(0, $("svg").width() / 2 - offsetX);
  dtop = Math.min(0, $("svg").height() / 2 - offsetY);
  // Make sure no gap at bottom or right of holder
  dleft = Math.max($("svg").width() - w * zoomScale, dleft);
  dtop = Math.max($("svg").height() - h * zoomScale, dtop);
  // set zoom
  svg
    .transition()
    .duration(500)
    .call(
      zoom.transform,
      d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
    );
}

function boxUnZoom() {
  // This function is called when the map is unzoomed. It resets the zoom to the default value
  boxZoom([[0, 0], [w, h]], [w / 2, h / 2], 0);
  }

// [ ] --------------------------- END ZOOM FUNCTIONS ----------------------------------- //

function getTextBox(selection) {
    selection
      .each(function(d) {
        d.bbox = this
          .getBBox();
        })
    ;
  }

// [ ] ----------------------- CREATE COUNTRIES FUNCTIONS ----------------------------- //

function createCountries(json, path, countriesGroup) {
    countries = countriesGroup
      .selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", function(d, i) {
        return "countryName" + d.properties.iso_a3;
      })
      .attr("class", "country")
      .each(function() {
          this.zoomed = false;
      })
      .call(createCountryActions);
  }

function createCountryActions(countries){
  countries
    .on("mouseover", function(d, i) {
      d3.select("#countryLabel" + d.properties.iso_a3).style("display", "block");
    })
    .on("mouseout", function(d, i) {
        d3.select("#countryLabel" + d.properties.iso_a3).style("display", "none");
    })
    .on("click", clickCountry);
}

function clickCountry(d, i) {
  var clickedCountry = this;
  var isCountryZoomed = clickedCountry.zoomed;
  d3.selectAll(".country").classed("country-on", false);
  d3.select(this).classed("country-on", true);
  if (!isCountryZoomed) {
      boxZoom(path.bounds(d), path.centroid(d), 20);
      d3.selectAll(".country").each(function() {
          this.zoomed = false;
      });
      clickedCountry.zoomed = true;
  } 
  else {
      boxUnZoom();
      clickedCountry.zoomed = true;
      d3.selectAll(".country").classed("country-on", false)
      .each(function() {
          this.zoomed = false;
      });
  }
}

// [ ] ----------------------- END CREATE COUNTRIES FUNCTIONS ----------------------------- //

// [ ] ----------------------- CREATE COUNTRY LABELS FUNCTIONS ----------------------------- //
function createCountryLabels(json, path, countriesGroup){
  countryLabels = countriesGroup
  .selectAll("g")
  .data(json.features)
  .enter()
  .append("g")
  .attr("class", "countryLabel")
  .attr("id", function(d) {
    return "countryLabel" + d.properties.iso_a3;
  })
  .attr("transform", function(d) {
    return (
      "translate(" + path.centroid(d)[0] + "," + path.centroid(d)[1] + ")"
    );
  })
  .each(function() {
      // Add zoom property to each country element
      this.zoomed = true;
  })
  .call(createLabelActions)
  .call(addTextBox);
}

function createLabelActions(labels){
  labels
    .on("mouseover", function(d, i) {
      console.log("yessir");
      d3.select(this).style("display", "block");
    })
    .on("mouseout", function(d, i) {
        d3.select(this).style("display", "none");
    })
    .on("click", function(d, i) {
        var clickedCountry = this;
        var isCountryZoomed = clickedCountry.zoomed;
        d3.selectAll(".country").classed("country-on", false);
        d3.select("#countryName" + d.properties.iso_a3).classed("country-on", true);
        if (isCountryZoomed) {
            boxZoom(path.bounds(d), path.centroid(d), 20);
            d3.selectAll(".countryLabel").each(function() {
                this.zoomed = true;
            });
            clickedCountry.zoomed = false;
        } else {
            boxUnZoom();
            clickedCountry.zoomed = true;
        }
    });
}

function addTextBox(labels){
  labels
    .append("text")
    .attr("class", "countryName")
    .style("text-anchor", "middle")
    .attr("dx", 0)
    .attr("dy", 0)
    .text(function(d) {
      return d.properties.name;
    })
    .call(getTextBox);
  // add a background rectangle the same size as the text
  labels
    .insert("rect", "text")
    .attr("class", "countryLabelBg")
    .attr("transform", function(d) {
      return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
    })
    .attr("width", function(d) {
      return d.bbox.width + 4;
    })
    .attr("height", function(d) {
      return d.bbox.height;
    });
}

// [ ] ----------------------- END CREATE COUNTRY LABELS FUNCTIONS ------------------------ //

// [ ] -------------------------------- OTHER MAP FUNCTION --------------------------------//
function addBackground(countriesGroup) {
  // add a background rectangle
  countriesGroup
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", w)
    .attr("height", h)
    .attr("class", "background")
    .on("click", boxUnZoom);
  return countriesGroup;
}

// [ ] -------------------------------- END OTHER MAP FUNCTION ---------------------- //

//* ----------------------------- END FUNCTIONS ------------------------------------ //

//* ------------------------------ OBJECTS ----------------------------------------- //      

// Define map zoom behaviour
var zoom = d3
  .zoom()
  .on("zoom", zoomed);

var unZoom = d3
  .zoom()
  .on("zoom", unZoomed);

// on window resize
$(window).resize(function() {
  // Resize SVG
  svg
    .attr("width", $("#map-holder").width())
    .attr("height", $("#map-holder").height())
  ;
  initiateZoom();
});
//* ----------------------------- END OBJECTS -------------------------------------- //

//* ------------------------------ CREATE MAP -------------------------------------- //

// create an SVG
var svg = d3
.select("#map-holder")
.append("svg")
.attr("width", $("#map-holder").width())
.attr("height", $("#map-holder").height())
.call(zoom);

// get map data
d3.json(dataPath,
  function(json) {
    //Bind data and create one path per GeoJSON feature
    countriesGroup = svg.append("g").attr("id", "map")

    countriesGroup = addBackground(countriesGroup);
    createCountries(json, path, countriesGroup);
    createCountryLabels(json, path, countriesGroup);
    initiateZoom();
  }
);