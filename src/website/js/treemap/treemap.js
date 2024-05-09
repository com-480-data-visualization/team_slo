/* 
  /Ecole Polytechnique Fédérale de Lausanne
  /Course: COM-480: Data Visualization
  /Project: Olympic History Data Visualization
  /Students: Vincent Roduit, Yannis Laaroussi, Fabio Palmisano

  /Description:
  /This script is the main script that draws the treemap visualization.
*/

import {fetch_discipline, fetch_country} from "./fetch_data.js";
import { drawTreemap } from "./draw_treemap.js";

//* ------------------------------ CONSTANTS ---------------------------------------- //
const treemapDiv = document.getElementById('treemap');
const width = treemapDiv.clientWidth;
const height = treemapDiv.clientHeight;

// Create treemap layout
const treemap = d3.treemap()
  .size([width, height])
  .paddingInner(2);

// Create SVG container
const svg = d3.select("#treemap").append("svg")
  .attr("width", width)
  .attr("height", height);

export let season = null;
export let country_name = null;
export let countryISO = null;

  const countrySelect = d3.select('#country-select');

  //* ------------------------------ END CONSTANTS ----------------------------------- //

  //* ------------------------------ FUNCTIONS --------------------------------------- //
  function whenDocumentLoaded(action) {
    //Function that checks if the document is already loaded or not
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", action);
    } else {
      action();
    }
  }

  whenDocumentLoaded(function () {

    makeVisualization();

  });

function makeVisualization() {
  fetch_country().then(function(result) {
    // Select the country-select dropdown
    const country_names = result.map(d => d.country_name);
    country_names.sort();
    if (country_name === null || countryISO === null)  {
      country_name = country_names[0];
      countryISO = result.filter(d => d.country_name === country_name)[0].country_3_letter_code;
    }
    const countrySelect = d3.select('#country-select');
    
    // Clear any existing options in the dropdown
    countrySelect.selectAll('option').remove();
    
    // Populate the dropdown with country names
    country_names.forEach(country => {
        countrySelect.append('option')
            .attr('value', country)  // Set the option value to the country name
            .text(country);  // Set the option text to the country name
    });
    countrySelect.property('value', country_name);

    createSeasonSelector();
    createTreeMap();
  });
  
  countrySelect.on('change', function() {
    const selectedCountry = d3.select(this).property('value');
    console.log("Selected country:", selectedCountry);
    country_name = selectedCountry;
    countryISO = fetch_country().then(function(result) {
      return result.filter(d => d.country_name === selectedCountry)[0].country_3_letter_code;
    });
    if (countryISO !== null) {
      createTreeMap();
    }
  });
}

function createTreeMap() {
  fetch_discipline(countryISO, country_name).then(function(result) {
    const countryISO_ret = result[0];
    countryISO = countryISO_ret;
    const country_name_ret = result[1];
    country_name = country_name_ret;
    countrySelect.property('value', country_name);
    const data = result[2].children;
    const root = d3.hierarchy({children: data})
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);
  
  drawTreemap(treemap, svg, root);
  });
}

function createSeasonSelector() {
  var checkbox = document.querySelector('input[type="checkbox"]');

    checkbox.addEventListener('change', function () {
      makeVisualization();
      if (checkbox.checked) {
        season = 'Winter';
      } else {
        season = 'Summer';
      }
    });
}

//* ------------------------------ END FUNCTIONS ----------------------------------- //
