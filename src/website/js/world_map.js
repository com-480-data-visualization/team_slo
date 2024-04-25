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
    .attr("transform","translate(" + [translate.x, translate.y] + ")scale(" + translate.k + ")")
  ;
}

function unZoomed() {
  var translate = d3
    .zoomIdentity
  ;
  countriesGroup
    .attr("transform","translate(" + [translate.x, t.y] + ")scale(" + translate.k + ")")
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

  const [midX,midY] = centroid

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
function getTextBox(selection) {
    selection
      .each(function(d) {
        d.bbox = this
          .getBBox();
        })
    ;
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
      d3.select(this).classed("country-over", true);
    })
    .on("mouseout", function(d, i) {
        d3.select("#countryLabel" + d.properties.iso_a3).style("display", "none");
        if(!this.zoomed){
          d3.select(this).classed("country-over", false);
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
  d3.selectAll(".country").classed("country-over", false);
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
      d3.selectAll(".country").classed("country-over", false);
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
      this.zoomed = true;
  })
  .call(createLabelActions)
  .call(addTextBox);
}

function createLabelActions(labels){
  labels
    .on("mouseover", function(d, i) {
      d3.select(this).style("display", "block");
      d3.select("#countryName" + d.properties.iso_a3).classed("country-over", true);
    })
    .on("mouseout", function(d, i) {
        d3.select(this).style("display", "none");
        d3.select("#countryName" + d.properties.iso_a3).classed("country-over", false);
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

// [ ] ----------------------- END CREATE COUNTRY LABELS FUNCTIONS ------------------------ //

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

//* ----------------------------- CREATE COUNTRY INFO PANEL ------------------------------- //

function displayCountryInfo(country, countryCodeISO3) {
  console.log("displaying country info");
  var countryInfo = document.getElementById("country-info");
  var map = document.getElementById("map-holder");
  // Reduce width of map
  map.style.width = "50%";
  // Expand width of country info
  countryInfo.style.width = "50%";

  // Clear country info
  countryInfo.innerHTML = "";

  // add country name and flag in the same div
  var countryFlagContainer = document.createElement("div");
  countryFlagContainer.classList.add("country-stats");
  countryFlagContainer.style.backgroundColor = "grey";
  countryFlagContainer.style.textAlign = "center";

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
  displayMedals(countryCodeISO3, country);
 
  // display best athlete below the medals
  displayBestAthlete(countryCodeISO3, country);
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

function displayMedals(countryCodeISO3, country_name) {
  /**
   * Function to display the medals of a country
   * 
   * @param {string} countryCodeISO3 - ISO 3166-1 alpha-3 code of the country
   * @param {string} country_name - Name of the country
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
  fetchMedalData(countryCodeISO3, country_name).then(function(result) {
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
  /**
   * Function to animate the counter element of the medals
   * 
   * @param {HTMLElement} counterElement - The element that displays the counter
   * @param {number} finalValue - The final value of the counter
   * @param {number} duration - The duration of the animation in milliseconds
   */
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

function displayBestAthlete(countryCodeISO3, countryName) {
  console.log("displaying best athlete");
  var countryInfo = document.getElementById("country-info");
  var oldAthlete = document.getElementById("best-athlete");
  if (oldAthlete !== null) {
    countryInfo.removeChild(oldAthlete);
  }
  var athlete = document.createElement("div");
  athlete.id = "best-athlete";
  athlete.classList.add("country-stats");
  athlete.style.marginTop = "400px";
  athlete.style.backgroundColor = "red";
  
  // Add "Best Athlete" text above the emojis
  var athleteText = document.createElement("h1");
  athleteText.textContent = "Most decorated athlete";
  athleteText.style.fontSize = "30px";
  athlete.appendChild(athleteText)

  // Fetch best athlete data
  fetchBestAthleteData(countryCodeISO3, countryName).then(function(result) {
    if (result !== null) {
      // Create containers for the athlete's name, sport, and medals

      // Create container to the left of textual description for the athlete's image if available
      var athleteContainer = document.createElement("div");
      athleteContainer.style.display = "flex";
      athleteContainer.style.alignItems = "center";
      athleteContainer.style.margin = "20px";
      athleteContainer.style.justifyContent = "center"; // Add this line to center the container horizontally

      // Create container for the athlete's image
      var athleteImageContainer = document.createElement("div");
      athleteImageContainer.style.marginRight = "20px";
      
      var img_path = `../../data/image_athletes/${result.name_lower}.jpg`;

  
      if (img_path !== null) {
        // Check if the image file exists
        fetch(img_path)
          .then(function(response) {
        if (response.ok) {
          var athleteImage = document.createElement("img");
          athleteImage.src = `../../data/image_athletes/${result.name_lower}.jpg`;
          athleteImage.alt = `${result.name} image`;
          athleteImage.width = 150;
          athleteImage.height = 150;
          athleteImage.style.borderRadius = "50%";  
          console.log(athleteImage.src);
          athleteImageContainer.appendChild(athleteImage);
          athleteContainer.insertBefore(athleteImageContainer, athleteInfoContainer); // Insert the image container before the info container
        }
          })
          .catch(function(error) {
        console.log('Error:', error);
          });
      }
      // Create container for the athlete's name, sport, and medals
      var athleteInfoContainer = document.createElement("div");
      athleteInfoContainer.style.display = "flex";
      athleteInfoContainer.style.flexDirection = "column";

      // Create container for the athlete's name
      var athleteName = document.createElement("h1");
      athleteName.textContent = result.name;
      athleteName.style.fontSize = "30px";
      athleteInfoContainer.appendChild(athleteName);

      // Create container for the athlete's sport
      var athleteSport = document.createElement("h2");
      athleteSport.textContent = result.sport;
      athleteSport.style.fontSize = "20px";
      athleteInfoContainer.appendChild(athleteSport);

      // Create container for the athlete's medals
      var athleteMedals = document.createElement("h2");
      athleteMedals.textContent = result.medals + " medals";
      athleteMedals.style.fontSize = "20px";
      athleteInfoContainer.appendChild(athleteMedals);

      athleteContainer.appendChild(athleteInfoContainer);
      athlete.appendChild(athleteContainer);
    }
    else {
      // Display message if no data is found
      var noData = document.createElement("h2");
      const season = window.getOlympicSeason();
      noData.textContent = "No athlete has won any medals in the " + season + " Olympics for this country.";
      athlete.appendChild(noData);
      console.log("No data found");
    }
  }).catch(function(error) {
    console.log('Error:', error);
  });
  // Inserting athlete after existing elements in countryInfo
  countryInfo.appendChild(athlete);
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

async function fetchBestAthleteData(countryCodeISO3, country_name) {
  try {
    const data = await d3.csvParse(await (await fetch('../../data/olympic_top_athlete_per_country.csv')).text());
    const season = window.getOlympicSeason();
    console.log("Season:", season);
    console.log("Country code:", countryCodeISO3);
    const athleteData = data.filter(d => d.game_season === season && (d.country_3_letter_code === countryCodeISO3 || d.country_name === country_name));

    if (athleteData.length === 0) {
      console.log("No athlete found for the country with code", countryCodeISO3);
      return null;
    }
    var bestAthlete = athleteData[0];
    return {
      name: bestAthlete.athlete_full_name, 
      sport: bestAthlete.discipline_title, 
      medals: bestAthlete.num_medals, 
      name_lower: bestAthlete.athlete_full_name_lower
    };
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
    // Update the best athlete
    displayBestAthlete(currentCountryISO3, current_country_name);
  }
});