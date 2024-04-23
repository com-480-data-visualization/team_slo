//* ------------------------------ CONSTANTS ---------------------------------------- //

let dataPath = '../../data/world_map.json'

//* ------------------------------ END CONSTANTS ------------------------------------ //

//* ------------------------------ VARIABLES ---------------------------------------- // 
w = 3000; // width of the map
h = 1250; // height of the map
  
var minZoom;
var maxZoom;
var zoomBool = false; // Boolean to check if the map is zoomed or not

var currentCountryISO3 = null;
var currentSeason = null;
var current_country_name = null;

var switchElement = document.getElementById('season-switch');

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
      d3.select(this).classed("country-on", true);
    })
    .on("mouseout", function(d, i) {
        d3.select("#countryLabel" + d.properties.iso_a3).style("display", "none");
        if(!this.zoomed){
          d3.select(this).classed("country-on", false);
        }
    })
    .on("click", clickCountry);
}

function clickCountry(d, i) {
  var clickedCountry = this;
  var isCountryZoomed = clickedCountry.zoomed;
  currentCountryISO3 = d.properties.iso_a3;
  current_country_name = d.properties.name;
  d3.selectAll(".country").classed("country-selected", false);
  d3.select(this).classed("country-on", false);
  d3.select(this).classed("country-selected", true);
  if (!isCountryZoomed) {
      // reduce width of the map to 50%
      displayCountryInfo(d.properties.name, d.properties.iso_a3);
      // resize the width of the svg
      // console.log(mapWidth);
      svg.attr("width", $("#map-holder").width());
      boxZoom(path.bounds(d), [path.centroid(d)[0], path.centroid(d)[1]], 20);
      // put all other countries to false
      d3.selectAll(".country").each(function() {
          this.zoomed = false;
      });
      clickedCountry.zoomed = true;
  } else {
      hideCountryInfo();
      svg.attr("width", $("#map-holder").width());
      boxUnZoom();
      d3.selectAll(".country").each(function() {
        this.zoomed = false;
      });
      d3.selectAll(".country").classed("country-selected", false)
      
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
      d3.select(this).style("display", "block");
      d3.select("#countryName" + d.properties.iso_a3).classed("country-on", true);
    })
    .on("mouseout", function(d, i) {
        d3.select(this).style("display", "none");
        d3.select("#countryName" + d.properties.iso_a3).classed("country-on", false);
    })
    .on("click", clickLabel);
}

function clickLabel(d, i) {
    var clickedCountry = this;
    var isCountryZoomed = clickedCountry.zoomed;
    current_country_name = d.properties.name;
    currentCountryISO3 = d.properties.iso_a3;
    d3.selectAll(".country").classed("country-selected", false);
    d3.select("#countryName" + d.properties.iso_a3).classed("country-selected", true);
    currentCountryISO3 = d.properties.iso_a3;
    if (!isCountryZoomed) {
      // reduce width of the map to 50%
      displayCountryInfo(d.properties.name, d.properties.iso_a3);
      // resize the width of the svg
      // console.log(mapWidth);
      svg.attr("width", $("#map-holder").width());
      boxZoom(path.bounds(d), [path.centroid(d)[0], path.centroid(d)[1]], 20);
      // put all other countries to false
      d3.selectAll(".countryLabel").each(function() {
          this.zoomed = false;
      });
      clickedCountry.zoomed = true;
  } else {
      hideCountryInfo();
      svg.attr("width", $("#map-holder").width());
      boxUnZoom();
      d3.selectAll(".countryLabel").each(function() {
        this.zoomed = false;
      });
      d3.selectAll(".country").classed("country-selected", false)
      
  }
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
    currentSeason = window.getOlympicSeason();
  }
);

//* ----------------------------- CREATE COUNTRY INFO PANEL ----------------------------------- //

function displayCountryInfo(country, countryCodeISO3) {
  console.log("displaying country info");
  var countryInfo = document.getElementById("country-info");
  var map = document.getElementById("map-holder");
  // Reduce width of map
  // console.log(map.style.width);
  map.style.width = "50%";
  // Expand width of country info
  countryInfo.style.width = "50%";
  // console.log($("#map-holder").width());
  // Display country info
  // console.log(country);

  // Clear country info
  countryInfo.innerHTML = "";

  // add country name and flag in the same div
  var countryFlagContainer = document.createElement("div");
  countryFlagContainer.classList.add("country-stats");
  // countryFlagContainer.style.position = "absolute";
  // // countryFlagContainer.style.left = 0;
  // countryFlagContainer.style.width = "100%";
  countryFlagContainer.style.backgroundColor = "grey";
  countryFlagContainer.style.textAlign = "center";
  // countryFlagContainer.style.top = 0;

  // add flag
  flag = getFlag(countryCodeISO3);


  flag.then(function(result) {
    if (result !== null) { 
      countryFlagContainer.appendChild(result); 
    }
    // add country name next to the flag
    var countryName = document.createElement("h1");
    countryName.innerHTML = country;
    countryName.style.display = "inline-block";
    countryName.style.position = "absolute"; // Adjust the margin-top value to move the name higher
    countryFlagContainer.appendChild(countryName);
  });

  // append the country info div to the country info element
  countryInfo.appendChild(countryFlagContainer);

  // display medals below the flag
  displayMedals(countryCodeISO3,country);
}

function hideCountryInfo() {
  console.log("hiding country info");
  var countryInfo = document.getElementById("country-info");
  // get innerHTML
  var map = document.getElementById("map-holder");

  // Expand width of map
  map.style.width = "100%";
  // Reduce width of country info
  countryInfo.style.width = "0%";
  
  // console.log($("#map-holder").width());
  // Clear country info
  countryInfo.innerHTML = "";
}

async function getFlag(countryCodeISO3) {
  try {
    // Fetch country data
    const response = await fetch('https://restcountries.com/v3.1/all');
    const countries = await response.json();

    // Find the country with the given ISO 3166-1 alpha-3 code
    const country = countries.find(country => country.cca3 === countryCodeISO3);

    if (!country) {
        throw new Error('Country not found');
    }
    // Get country code
    const countryCode = country.cca2;

    // Fetch flag image URL
    const flagResponse = await fetch(`https://flagcdn.com/${countryCode.toLowerCase()}.svg`);
    const flagDataURL = await flagResponse.blob();

    // Create flag image element
    const flagImage = document.createElement('img');
    flagImage.src = URL.createObjectURL(flagDataURL);
    // flagImage.alt = `${countryName} flag`;
    flagImage.width = 100;
    flagImage.height = 100;
    return flagImage;
  } catch (error) {
    // console.error('Error:', error);
    console.log("Error fetching flag");
    return null;
  }
}

function displayMedals(countryCodeISO3,country_name, year = -1) {
  /**
   * Function to display the medals of a country
   * 
   * @param {string} countryCodeISO3 - ISO 3166-1 alpha-3 code of the country
   * @param {number} year - Year of the Olympics. Default is -1, which means all time
   */

  console.log("displaying medals");
  var countryInfo = document.getElementById("country-info");
  var oldMedals = document.getElementById("medals");
  if (oldMedals !== null) {
    countryInfo.removeChild(oldMedals);
  }
  var medals = document.createElement("div");
  medals.id = "medals";
  console.log("medals:",medals);
  medals.classList.add("country-stats");
  medals.style.marginTop = "100px";
  medals.style.backgroundColor = "darkblue";
  
  var medalsFontSize = "50px";
  
  // Add "Medals" text above the emojis
  var medalsText = document.createElement("h2");
  medalsText.textContent = "Medals";
  medalsText.style.fontSize = "50px";
  medals.appendChild(medalsText)

  var nbGold = 0, nbSilver = 0, nbBronze = 0;
  fetchMedalData(countryCodeISO3,country_name).then(function(result) {
    if (result !== null) {
      nbGold = result.goldMedal;
      nbSilver = result.silverMedal;
      nbBronze = result.bronzeMedal;
      console.log("Medals:", nbGold, nbSilver, nbBronze);
        // Create containers for each medal and its counter
      var goldContainer = document.createElement("div");
      goldContainer.style.display = "inline-block";
      goldContainer.style.margin = "20px";
      var goldMedal = document.createElement("div");
      goldMedal.textContent = "🥇";
      goldMedal.style.fontSize = medalsFontSize;
      var goldCounter = document.createElement("div");
      goldCounter.textContent = "0";
      goldCounter.style.fontSize = medalsFontSize;
      goldContainer.appendChild(goldMedal);
      goldContainer.appendChild(goldCounter);

      animateCounter(goldCounter, nbGold, 2000);

      var silverContainer = document.createElement("div");
      silverContainer.style.display = "inline-block";
      silverContainer.style.margin = "20px";
      var silverMedal = document.createElement("div");
      silverMedal.textContent = "🥈";
      silverMedal.style.fontSize = medalsFontSize;
      var silverCounter = document.createElement("div");
      silverCounter.textContent = "0";
      silverCounter.style.fontSize = medalsFontSize;
      silverContainer.appendChild(silverMedal);
      silverContainer.appendChild(silverCounter);

      animateCounter(silverCounter, nbSilver, 2000);

      var bronzeContainer = document.createElement("div");
      bronzeContainer.style.display = "inline-block";
      bronzeContainer.style.margin = "20px";
      var bronzeMedal = document.createElement("div");
      bronzeMedal.textContent = "🥉";
      bronzeMedal.style.fontSize = medalsFontSize;
      var bronzeCounter = document.createElement("div");
      bronzeCounter.textContent = "0";
      bronzeCounter.style.fontSize = medalsFontSize;
      bronzeContainer.appendChild(bronzeMedal);
      bronzeContainer.appendChild(bronzeCounter);

      animateCounter(bronzeCounter, nbBronze, 2000);

      // Append medal containers to the medals div
      medals.appendChild(goldContainer);
      medals.appendChild(silverContainer);
      medals.appendChild(bronzeContainer);
    }
    else {  
      // Display message if no data is found
      var noData = document.createElement("h2");
      noData.textContent = "Oops! This country never won any medals :(";
      medals.appendChild(noData);
      medals.removeChild(goldContainer);
      medals.removeChild(silverContainer);
      medals.removeChild(bronzeContainer);
      console.log("No data found");
    }
  }).catch(function(error) {
    console.log('Error:', error);
  });
  // Inserting medals after existing elements in countryInfo
  countryInfo.appendChild(medals);
}

function animateCounter(counterElement, finalValue, duration) {
  var start = 0;
  var stepTime = Math.abs(Math.floor(duration / finalValue));
  var obj = counterElement;
  var current = start;
  var timer = setInterval(function() {
    current += 1;
    obj.textContent = current;
    if (current >= finalValue) {
      clearInterval(timer);
    }
  }, stepTime);
}


async function fetchMedalData(countryCodeISO3,country_name) {
  try {
    const data = await d3.csvParse(await (await fetch('../../data/olympic_medals_processed.csv')).text());
    const season = window.getOlympicSeason();
    console.log("Season:", season);
    console.log("Country code:", countryCodeISO3);
    const countryData = data.filter(d => d.game_season === season && (d.country_3_letter_code === countryCodeISO3 || d.country_name === country_name));

    if (countryData.length === 0) {
      console.log("Country not found");
      return null;
    }
    var goldMedal = 0, silverMedal = 0, bronzeMedal = 0;
    if (countryData[0] !== null) {
      // Get the total number of gold medals
      goldMedal = parseInt(countryData[0].GOLD);
      // Get the total number of silver medals
      silverMedal = parseInt(countryData[0].SILVER);
      // Get the total number of bronze medals
      bronzeMedal = parseInt(countryData[0].BRONZE);
    }
    return {goldMedal, silverMedal, bronzeMedal};
  } 
  catch (error) {
    console.error('Error:', error);
    return null;
  }
}


// [ ] -------------------------------- END CREATE COUNTRY INFO PANEL ----------------------------------- //

switchElement.addEventListener('change', function() {
  var newSeason = switchElement.checked ? 'Winter' : 'Summer';
  console.log(newSeason);
  if (newSeason !== currentSeason && currentCountryISO3 !== null) {
    currentSeason = newSeason;
    console.log("Season changed to", currentSeason);
    console.log("Current country:", currentCountryISO3);
    // Update the medals
    displayMedals(currentCountryISO3,current_country_name);
  }
});