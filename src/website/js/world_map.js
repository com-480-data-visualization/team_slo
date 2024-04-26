/* 
  /Ecole Polytechnique Fédérale de Lausanne
  /Course: COM-480: Data Visualization
  /Project: Olympic History Data Visualization
  /Students: Vincent Roduit, Yannis Laaroussi, Fabio Palmisano

  /Description:
  /This script is responsible for the world map animation.
*/

//* ------------------------------ CONSTANTS ---------------------------------------- //

const dataPath = '../../data/world_map.json'

//* ------------------------------ END CONSTANTS ------------------------------------ //

//* ------------------------------ VARIABLES ---------------------------------------- // 
const w = 3000; // width of the map
const h = 1250; // height of the map

var minZoom;
var maxZoom;

// This variables check the selected country and season
var currentCountryISO3 = null;
var currentSeason = null;
var current_country_name = null;

var switchElement = document.getElementById('season-switch');

var projection = d3
  .geoEquirectangular()
  .center([0, 15]) //center map
  .scale([w / (2 * Math.PI)])
  .translate([w / 2, h / 2])
  ;

var path = d3
  .geoPath()
  .projection(projection);

//* ----------------------------- END VARIABLES ------------------------------------ // 


//* ------------------------------ FUNCTIONS ---------------------------------------- //

//[ ] --------------------------- ZOOM FUNCTIONS ----------------------------------- //
function zoomed() {
  var translate = d3
    .event
    .transform
    ;
  countriesGroup
    .attr("transform", "translate(" + [translate.x, translate.y] + ")scale(" + translate.k + ")")
    ;
}

function unZoomed() {
  var translate = d3
    .zoomIdentity
    ;
  countriesGroup
    .attr("transform", "translate(" + [translate.x, t.y] + ")scale(" + translate.k + ")")
    ;
}

function initiateZoom() {
  minZoom = Math.max($("#map-holder").width() / w, $("#map-holder").height() / h);
  maxZoom = 20 * minZoom;
  zoom
    .scaleExtent([minZoom, maxZoom])
    .translateExtent([[0, 0], [w, h]])
    ;

  center_X = ($("#map-holder").width() - minZoom * w) / 2;
  center_Y = ($("#map-holder").height() - minZoom * h) / 2;

  svg.call(zoom.transform, d3.zoomIdentity.translate(center_X, center_Y).scale(minZoom));
}


function boxZoom(box, centroid, paddingPercentage) {
  const [minPoint, maxPoint] = box;

  zoomWidth = Math.abs(minPoint[0] - maxPoint[0]);
  zoomHeight = Math.abs(minPoint[1] - maxPoint[1]);

  const [midX, midY] = centroid

  zoomWidth = zoomWidth * (1 + paddingPercentage / 100);
  zoomHeight = zoomHeight * (1 + paddingPercentage / 100);

  const svgWidth = $("svg").width();
  const svgHeight = $("svg").height();

  const scaleX = svgWidth / zoomWidth;
  const scaleY = svgHeight / zoomHeight;

  let zoomFactor = Math.min(scaleX, scaleY);

  zoomFactor = Math.min(zoomFactor, maxZoom);

  zoomFactor = Math.max(zoomFactor, minZoom);

  const offsetMidX = zoomFactor * midX;
  const offsetMidY = zoomFactor * midY;

  let translateX = Math.min(0, svgWidth / 2 - offsetMidX);
  let translateY = Math.min(0, svgHeight / 2 - offsetMidY);

  translateX = Math.max(svgWidth - w * zoomFactor, translateX);
  translateY = Math.max(svgHeight - h * zoomFactor, translateY);

  svg
    .transition()
    .duration(300)
    .call(
      zoom.transform,
      d3.zoomIdentity.translate(translateX, translateY).scale(zoomFactor)
    );
}

function boxUnZoom() {
  boxZoom([[0, 0], [w, h]], [w / 2, h / 2], 0);
}

// [ ] --------------------------- END ZOOM FUNCTIONS ----------------------------------- //

// [ ] ---------------------------- TEXT BOX FUNCTIONS --------------------------------- //

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

// [ ] ---------------------------- END TEXT BOX FUNCTIONS ------------------------------- //

// [ ] ----------------------- CREATE COUNTRIES FUNCTIONS ----------------------------- //

function createCountries(json, path, countriesGroup) {
  countries = countriesGroup
    .selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", function (d, i) {
      return "countryName" + d.properties.iso_a3;
    })
    .attr("class", "country")
    .attr("title", function (d, i) {
      return d.properties.name;
    })
    .each(function () {
      this.zoomed = false;
    })
    .call(createCountryActions);
}

function createCountryActions(countries) {
  countries
    .on("mouseover", function (d, i) {
      d3.select("#countryLabel" + d.properties.iso_a3).style("display", "block");
      d3.select(this).classed("country-over", true);
      d3.select(this).style("cursor", "pointer");
      showPopup(this);
    })
    .on("mouseout", function (d, i) {
      hidePopup(this);
      d3.select("#countryLabel" + d.properties.iso_a3).style("display", "none");
      if (!this.zoomed) {
        d3.select(this).classed("country-over", false);
      }
    }
    )
    .on("mousemove", function (d, i) {
      movePopup(d3.event);
    })
    .on("click", clickCountry);
}

function clickCountry(d, i) {
  var clickedCountry = this;
  var isCountryZoomed = clickedCountry.zoomed;
  currentCountryISO3 = d.properties.iso_a3;
  current_country_name = d.properties.name;
  d3.selectAll(".country").classed("country-selected", false);
  d3.selectAll(".country").classed("country-over", false);
  d3.select(this).classed("country-selected", true);
  if (!isCountryZoomed) {
    // reduce width of the map to 50%
    //displayCountryInfo(d.properties.name, d.properties.iso_a3);
    // resize the width of the svg
    // console.log(mapWidth);
    svg.attr("width", $("#map-holder").width());
    boxZoom(path.bounds(d), [path.centroid(d)[0], path.centroid(d)[1]], 20);
    // put all other countries to false
    d3.selectAll(".country").each(function () {
      this.zoomed = false;
    });
    clickedCountry.zoomed = true;
  } else {
    //hideCountryInfo();
    svg.attr("width", $("#map-holder").width());
    boxUnZoom();
    d3.selectAll(".country").each(function () {
      this.zoomed = false;
    });
    d3.selectAll(".country").classed("country-selected", false)
    d3.selectAll(".country").classed("country-over", false);
  }
}

// [ ] ----------------------- END CREATE COUNTRIES FUNCTIONS ----------------------------- //

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
$(window).resize(function () {
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
  function (json) {
    //Bind data and create one path per GeoJSON feature
    countriesGroup = svg.append("g").attr("id", "map")

    countriesGroup = addBackground(countriesGroup);
    createCountries(json, path, countriesGroup);
    //createCountryLabels(json, path, countriesGroup);
    initiateZoom();
    currentSeason = window.getOlympicSeason();
  }
);
// [ ] -------------------------------- END CREATE COUNTRY INFO PANEL ----------------------------------- //

switchElement.addEventListener('change', function () {
  var newSeason = switchElement.checked ? 'Winter' : 'Summer';
  console.log(newSeason);
  if (newSeason !== currentSeason && currentCountryISO3 !== null) {
    currentSeason = newSeason;
    console.log("Season changed to", currentSeason);
    console.log("Current country:", currentCountryISO3);
    // // Update the medals
    // displayMedals(currentCountryISO3, current_country_name);
    // // Update the best athlete
    // displayBestAthlete(currentCountryISO3, current_country_name);
  }
});





// When the user hovers over the element, show the popup
function showPopup(e) {
  var popup = document.getElementById("myPopup"); // Ensure popup is properly referenced
  popup.textContent = e.getAttribute('title'); // Set the text of the popup to the title of the hovered element
  popup.classList.add("show");
  fadeIn(popup);
}

// When the user moves the mouse away from the element, hide the popup
function hidePopup() {
  var popup = document.getElementById("myPopup"); // Ensure popup is properly referenced
  popup.classList.remove("show");
  fadeOut(popup);
}

// When the user moves the mouse, move the popup
// When the user moves the mouse, move the popup
function movePopup(e) {
  var popup = document.getElementById("myPopup"); // Ensure popup is properly referenced

  // If event exists, show and move the popup
  if (e) {
    popup.style.left = `${e.clientX - 80}px`;
    popup.style.top = `${e.clientY + 280}px`; // Subtract 20 pixels from the Y position
    popup.style.display = 'block';
  } else {
    // If event does not exist, hide the popup
    popup.style.display = 'none';
    popup.textContent = '';
  }
}


// Fade in function
function fadeIn(element) {
  var op = 0.1;  // initial opacity
  element.style.display = 'block';
  element.style.opacity = op;
  var timer = setInterval(function () {
      if (op >= 1){
          clearInterval(timer);
      }
      op += op * 0.1;
      element.style.opacity = op;
      element.style.filter = 'alpha(opacity=' + op * 100 + ")";
  }, 10);
}

function fadeOut(element) {
  var op = 1;  // initial opacity
  element.style.opacity = op;
  var timer = setInterval(function () {
      if (op <= 0.1){
          clearInterval(timer);
          element.style.display = 'none';
      }
      op -= op * 0.1;
      element.style.opacity = op;
      element.style.filter = 'alpha(opacity=' + op * 100 + ")";
  }, 10);
}