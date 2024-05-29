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
const h = 1500; // height of the map

var minZoom;
var maxZoom;

// This variables check the selected country and season
var currentCountryISO3 = null;
var currentSeason = null;
var current_country_name = null;

var isHostButtonClicked = false;

var switchElement = document.getElementById('season-switch');
var hostButton = document.getElementById('host-button');

var selectedCountry = null;
var selectedCountryISO3 = null;

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
  /**
   * Function to zoom in on the map
   */

  var translate = d3
    .event
    .transform
    ;
  countriesGroup
    .attr("transform", "translate(" + [translate.x, translate.y] + ")scale(" + translate.k + ")")
    ;
  
  // refresh the host countries position
  if (isHostButtonClicked && currentCountryISO3 === null) {
    displayHostCountries();
  }
  
}

function unZoomed() {
  /**
   * Function to unzoom the map
   */

  var translate = d3
    .zoomIdentity
    ;
  countriesGroup
    .attr("transform", "translate(" + [translate.x, t.y] + ")scale(" + translate.k + ")")
    ;
}

function initiateZoom() {
  /**
   * Function to initiate the zoom
   */

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
  /**
   * Function to zoom in on a box
   * 
   * @param {Array} box - The box to zoom in on
   * @param {Array} centroid - The centroid of the box
   * @param {number} paddingPercentage - The padding percentage
   */

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
  /**
   * Call default zoom function
  */
  boxZoom([[0, 0], [w, h]], [w / 2, h / 2], 0);
}

// [ ] --------------------------- END ZOOM FUNCTIONS ----------------------------------- //

// [ ] ---------------------------- BACKGROUND FUNCTIONS --------------------------------- //
function addBackground(countriesGroup) {
  /**
   * Function to add a background to the map
   * 
   * @param {Object} countriesGroup - The group of countries
   */

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
  /**
   * Function to create the countries on the map
   * 
   * @param {Object} json - The JSON data of the countries
   * @param {Object} path - The path object
   * @param {Object} countriesGroup - The group of countries
   */

  const season = window.getOlympicSeason();
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
  /**
   * Function to create the actions for the countries
   * 
   * @param {Object} countries - The countries data
   */

  countries
    .on("mouseover", function (d) {
      d3.select("#countryLabel" + d.properties.iso_a3).style("display", "block");
      d3.select(this).classed("country-over", true);
      d3.select(this).style("cursor", "pointer");
      showPopup(this);
    })
    .on("mouseout", function (d) {
      hidePopup(this);
      d3.select("#countryLabel" + d.properties.iso_a3).style("display", "none");
      if (!this.zoomed) {
        d3.select(this).classed("country-over", false);
      }
    }
    )
    .on("mousemove", function () {
      movePopup(d3.event);
    })
    .on("click", clickCountry);
}

function clickCountry(d) {
  /**
   * Function to handle the click event on a country
   * 
   * @param {Object} d - The country data
   */

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
    svg.attr("width", $("#map-holder").width());
    boxZoom(path.bounds(d), [path.centroid(d)[0], path.centroid(d)[1]], 20);
    // put all other countries to false
    d3.selectAll(".country").each(function () {
      this.zoomed = false;
    });
    clickedCountry.zoomed = true;
    isHostButtonClicked = false;
    // hide the host button
    hostButton.style.display = "none";
    hideHostCountriesLabel();
  } else {
    currentCountryISO3 = null;
    current_country_name = null;
    hideCountryInfo();
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

  if (selectedCountry !== null && selectedCountryISO3 !== null) {
    console.log("Resizing country info");
    displayCountryInfo(selectedCountry, selectedCountryISO3); 
  }

  displayHostCountries();

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
    initiateZoom();
    currentSeason = window.getOlympicSeason();    
  }
);

//* ----------------------------- CREATE COUNTRY INFO PANEL ------------------------------- //

function displayCountryInfo(country, countryCodeISO3) {
  /**
   * Function to display the country info panel
   * 
   * @param {string} country - Name of the country
   * @param {string} countryCodeISO3 - ISO 3166-1 alpha-3 code of the country
   * 
   */

  console.log("displaying country info");
  var countryInfo = document.getElementById("country-info");
  var map = document.getElementById("map-holder");

  selectedCountry = country;
  selectedCountryISO3 = countryCodeISO3;

  // Set width of the map and country info panel
  map.style.width = "50%";
  countryInfo.style.width = "50%";
  
  // Clear country info
  countryInfo.innerHTML = "";

  // add country name and flag in the same div
  var countryFlagContainer = document.createElement("div");
  countryFlagContainer.classList.add("country-stats");
  countryFlagContainer.style.backgroundColor = "#8b929a";
  countryFlagContainer.style.textAlign = "center";

  // add flag
  flag = getFlag(countryCodeISO3);

  flag.then(function (result) {
    // Create a container for the flag and country name
    var flagAndNameContainer = document.createElement("div");
    flagAndNameContainer.style.display = "flex";
    flagAndNameContainer.style.justifyContent = "center";
    flagAndNameContainer.style.marginTop = "5px";

    if (result !== null) {
      flagAndNameContainer.appendChild(result);
    }

    // add country name next to the flag
    var countryName = document.createElement("h1");
    countryName.innerHTML = country;
    countryName.style.marginLeft = "10px"; // Add some space between the flag and the country name
    countryName.style.fontSize = $(countryInfo).height() * 0.05 + "px";

    flagAndNameContainer.appendChild(countryName);

    // Append the container to the country flag container
    countryFlagContainer.appendChild(flagAndNameContainer);
  });

  countryFlagContainer.style.height = "12%";

  // append the country info div to the country info element
  countryInfo.appendChild(countryFlagContainer);

  // display medals below the flag
  displayMedals(countryCodeISO3, country);

  // display best athlete below the medals
  displayBestAthlete(countryCodeISO3, country);
}

function hideCountryInfo() {
  /**
   * Function to hide the country info panel
   */

  console.log("hiding country info");

  // Reset selected country
  selectedCountry = null;

  var countryInfo = document.getElementById("country-info");
  var map = document.getElementById("map-holder");

  // Reset the width of the map and country info panel
  map.style.width = "100%";
  countryInfo.style.width = "0";

  // Clear country info
  countryInfo.innerHTML = "";

  displayHostCountries();

  // Show the host button
  hostButton.style.display = "block";
}

async function getFlag(countryCodeISO3) {
  /**
   * Function to fetch the flag of a country
   * 
   * @param {string} countryCodeISO3 - ISO 3166-1 alpha-3 code of the country
   * 
   * @returns {HTMLImageElement} - The flag image element
   */

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
    flagImage.width = 100;
    var countryInfo = document.getElementById("country-info");
    flagImage.height = $(countryInfo).height() * 0.1;
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
  console.log("medals:", medals);
  medals.classList.add("country-stats");
  medals.style.top = "12%";
  medals.style.height = "38%";
  medals.style.position = "absolute";

  var medalsFontSize = $(countryInfo).height() * 0.05 + "px";

  var medalsText = document.createElement("h2");
  medalsText.textContent = "Medals";
  medalsText.style.fontSize = medalsFontSize;
  medals.appendChild(medalsText);

  var nbGold = 0,
    nbSilver = 0,
    nbBronze = 0;

  fetchMedalData(countryCodeISO3, country_name).then(function (result) {
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

      const season = window.getOlympicSeason();
      if (season === "Summer") {
        medals.style.backgroundColor = "darkgoldenrod";
      } else {
        medals.style.backgroundColor = "darkslategray";
      }
    }
    else {
      // Display message if no data is found
      const season = window.getOlympicSeason();
      var noData = document.createElement("h2");
      noData.textContent = "Oops! This country never won any medals in the " + season + " Olympics.";

      medals.appendChild(noData);
      medals.removeChild(goldContainer);
      medals.removeChild(silverContainer);
      medals.removeChild(bronzeContainer);
      
      if (season === "Summer") {
        medals.style.backgroundColor = "darkgoldenrod";
      } else {
        medals.style.backgroundColor = "darkslategray";
      }
    }
  }).catch(function (error) {
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
  var timer = setInterval(function () {
    current += 1;
    obj.textContent = current;
    if (current >= finalValue) {
      clearInterval(timer);
    }
  }, stepTime);
}

function displayBestAthlete(countryCodeISO3, countryName) {
  /**
   * Function to display the best athlete of a country
   * 
   * @param {string} countryCodeISO3 - ISO 3166-1 alpha-3 code of the country
   * @param {string} countryName - Name of the country
   */
  
  var countryInfo = document.getElementById("country-info");
  var oldAthlete = document.getElementById("best-athlete");

  if (oldAthlete !== null) {
    countryInfo.removeChild(oldAthlete);
  }

  var athlete = document.createElement("div");
  athlete.id = "best-athlete";
  athlete.classList.add("country-stats");
  athlete.style.top = "50%";
  athlete.style.height = "50%";
  athlete.style.position = "absolute";

  var athleteFontSize = $(countryInfo).height() * 0.05 + "px";

  // Add text above the emojis
  var athleteText = document.createElement("h1");
  athleteText.textContent = "Most decorated athlete";
  athleteText.style.fontSize = athleteFontSize;
  athlete.appendChild(athleteText)

  // Fetch best athlete data
  fetchBestAthleteData(countryCodeISO3, countryName).then(function (result) {
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
          .then(function (response) {
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
          .catch(function (error) {
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
      athleteName.style.fontSize = athleteFontSize;
      athleteInfoContainer.appendChild(athleteName);

      // Create container for the athlete's sport
      var athleteSport = document.createElement("h2");
      athleteSport.textContent = result.sport;
      athleteSport.style.fontSize = athleteFontSize;
      athleteInfoContainer.appendChild(athleteSport);

      // Create container for the athlete's medals
      var athleteMedals = document.createElement("h2");
      athleteMedals.textContent = result.medals + " medals";
      athleteMedals.style.fontSize = athleteFontSize;
      athleteInfoContainer.appendChild(athleteMedals);

      athleteContainer.appendChild(athleteInfoContainer);
      athlete.appendChild(athleteContainer);
      const season = window.getOlympicSeason();
      if (season === "Summer") {
        athlete.style.backgroundColor = "darkred";
      } else {
        athlete.style.backgroundColor = "darkblue";
      }
    }
    else {
      // Display message if no data is found
      var noData = document.createElement("h2");
      const season = window.getOlympicSeason();
      noData.textContent = "No athlete has won any medals in the " + season + " Olympics for this country.";
      athlete.appendChild(noData);
      console.log("No data found");
      if (season === "Summer") {
        athlete.style.backgroundColor = "darkred";
      } else {
        athlete.style.backgroundColor = "darkblue";
      }
    }
  }).catch(function (error) {
    console.log('Error:', error);
  });
  
  // Inserting athlete after existing elements in countryInfo
  countryInfo.appendChild(athlete);
}


async function fetchMedalData(countryCodeISO3, country_name) {
  /**
   * Function to fetch the medal data of a country
   * 
   * @param {string} countryCodeISO3 - ISO 3166-1 alpha-3 code of the country
   * @param {string} country_name - Name of the country
   * 
   * @returns {Object} - The medal data: gold, silver, and bronze medals
   */

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
    return { goldMedal, silverMedal, bronzeMedal };
  }
  catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function fetchBestAthleteData(countryCodeISO3, country_name) {
  /**
   * Function to fetch the best athlete data of a country
   * 
   * @param {string} countryCodeISO3 - ISO 3166-1 alpha-3 code of the country
   * @param {string} country_name - Name of the country
   * 
   * @returns {Object} - The best athlete data: name, sport, and medals
   */
  try {
    const data = await d3.csvParse(await (await fetch('../../data/olympic_top_athlete_per_country.csv')).text());
    const season = window.getOlympicSeason();
    console.log("Season:", season);
    console.log("Country code:", countryCodeISO3);
    const athleteData = data.filter(d => d.game_season === season && 
      (d.country_3_letter_code === countryCodeISO3 || d.country_name === country_name));

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

// [ ] ---------------------------------------- SEASON SWITCH ------------------------------------------ //

switchElement.addEventListener('change', function () {
  var newSeason = switchElement.checked ? 'Winter' : 'Summer';
  console.log(newSeason);
  if (newSeason !== currentSeason && currentCountryISO3 !== null) {
    currentSeason = newSeason;
    console.log("Season changed to", currentSeason);
    console.log("Current country:", currentCountryISO3);
    // check if a country is selected
    // Update the medals
    displayMedals(currentCountryISO3, current_country_name);
    // Update the best athlete
    displayBestAthlete(currentCountryISO3, current_country_name);
  }
  if (isHostButtonClicked) {
    // Update the host countries
    displayHostCountries();
  }
  // update color of the countries according to the season
  if (newSeason === "Summer") {
    d3.selectAll(".country").classed("country-summer", true);
    d3.selectAll(".country").classed("country-winter", false);
  }
  else {
    d3.selectAll(".country").classed("country-winter", true);
    d3.selectAll(".country").classed("country-summer", false);
  }

});

// [ ] -------------------------------------- END SEASON SWITCH ---------------------------------------- //

// [ ] ---------------------------------------- HOST BUTTON ------------------------------------------ //

// Add event listener to the host button
hostButton.addEventListener('click', function () {
  isHostButtonClicked = !isHostButtonClicked;
  displayHostCountries();
});

function displayHostCountries() {
  /**
   * Function to display the host countries on the map
   */

  if (isHostButtonClicked) {
    fetchHostData().then(function (result) {
      if (result !== null) {
        // Highlight the host countries on the map
        d3.selectAll(".country").classed("country-selected", false);
        d3.selectAll(".country").classed("country-over", false);
        d3.selectAll(".country").each(function () {
          this.zoomed = false;
        });

        for (let i = 0; i < result.length; i++) {
          let hostCountry = result[i];
          d3.select("#countryName" + hostCountry.country_3_letter_code).classed("country-selected", true);
        }
        hideHostCountriesLabel();
        // Display the game names above each host country, there can be multiple games in the same country
        d3.selectAll(".country").each(function () {
          let country = d3.select(this);
          let countryCode = country.attr("id").substring(11);
          let hostGames = result.filter(d => d.country_3_letter_code === countryCode);
          if (hostGames.length > 0) {
            let gameNames = hostGames.map(d => d.game_name);
            let gameNamesString = gameNames.join(",\n");
        
            let geoCentroid = d3.geoCentroid(country.datum());
            let screenCentroid = projection(geoCentroid);
        
            // Get the current zoom and pan transformation
            let transform = d3.zoomTransform(svg.node());
        
            // Apply the transformation to the centroid coordinates
            let transformedCentroid = transform.apply(screenCentroid);
            
            // Add a rectangle and text above the host country
            svg.append("rect")
              .attr("x", transformedCentroid[0] - gameNamesString.length * 5 / 2 - 10)
              .attr("y", transformedCentroid[1] - 20)
              .attr("width", gameNamesString.length * 5 + 20)
              .attr("height", 30)
              .attr("rx", 15)
              .attr("ry", 15)
              .style("stroke", "lightgrey")
              .style("stroke-width", "1px")
              .style("fill", "white")
              .classed("host-background", true);

            svg.append("text")
              .attr("x", transformedCentroid[0])
              .attr("y", transformedCentroid[1])
              .attr("text-anchor", "middle")
              .attr("font-size", "10px")
              .attr("fill", "black")
              .text(gameNamesString)
              .classed("host-text", true);
          }
        });
        hostButton.textContent = "Hide host countries";
      }
    }).catch(function (error) {
      console.log('Error:', error);
    });
  } else {
    d3.selectAll(".country").classed("country-selected", false);
    d3.selectAll(".country").classed("country-over", false);
    d3.selectAll(".country").each(function () {
      this.zoomed = false;
    });
    hostButton.textContent = "Show host countries";
    // remove the game names above the host countries
    hideHostCountriesLabel();
  }
}

function hideHostCountriesLabel() {
  /**
   * Function to hide the game names above the host countries
   */

  d3.selectAll(".host-background").remove();
  d3.selectAll(".host-text").remove();
}


async function fetchHostData() {
  /**
   * Function to fetch the host data
   * 
   * @returns {Object} - The host data
   */

  try {
    const data = await d3.csvParse(await (await fetch('../../data/olympic_hosts_processed.csv')).text());
    const season = window.getOlympicSeason();
    const hostData = data.filter(d => d.game_season === season);
    return hostData;
  }
  catch (error) {
    console.error('Error:', error);
    return null;
  }

}

// [ ] -------------------------------------- END HOST BUTTON ---------------------------------------- //

// [ ] -------------------------------------- POPUP WINDOW ------------------------------------------ //
function showPopup(e, text = "None") {
  /**
   * Function to display the popup window
   * 
   * @param {HTMLElement} e - The element that triggered the popup
   * @param {string} text - The text to display in the popup
   * 
   * @returns {HTMLElement} - The popup window
   */

  var popup = document.getElementById("myPopup");
  if (text === "None") {
    popup.textContent = e.getAttribute('title'); 
  } else {
    popup.textContent = text;
  }
  popup.classList.add("show");
  fadeIn(popup);
}

function hidePopup() {
  /**
   * Function to hide the popup window
   */

  var popup = document.getElementById("myPopup");
  popup.classList.remove("show");
  fadeOut(popup);
}

function movePopup(e) {
  /**
   * Function to move the popup window
   * 
   * @param {MouseEvent} e - The mouse event
   */

  var popup = document.getElementById("myPopup");

  // If the popup does not have the "show" class, show the popup
  if (!popup.classList.contains("show")) {
    showPopup(e.target);
  }


  if (e) {
      // Get the mouse cursor position
      var x = e.clientX;
      var y = e.clientY;  
      
      var offsetX = -80;
      var offsetY = -60;

      x += offsetX;
      y += offsetY;

      // Calculate the adjusted positions
      popup.style.left = `${x}px`;
      popup.style.top = `${y}px`;

      // console.log('mouse:', x, y);
      // console.log(popup.style.left, popup.style.top);

      // Display the popup
      popup.style.display = 'block';
  } else {
      // If the event is not provided, hide the popup
      popup.style.display = 'none';
      popup.textContent = '';
  }
}

function fadeIn(element) {
  /**
   * Function to fade in an element
   * 
   * @param {HTMLElement} element - The element to fade in
   */

  var op = 0.1;
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
  /**
   * Function to fade out an element
   * 
   * @param {HTMLElement} element - The element to fade out
   */

  var op = 1; 
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

// [ ] -------------------------------------- END POPUP WINDOW ------------------------------------------ //