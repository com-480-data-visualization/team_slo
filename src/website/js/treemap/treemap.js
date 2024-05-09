/* 
  /Ecole Polytechnique Fédérale de Lausanne
  /Course: COM-480: Data Visualization
  /Project: Olympic History Data Visualization
  /Students: Vincent Roduit, Yannis Laaroussi, Fabio Palmisano

  /Description:
  /This script is the main script that draws the treemap visualization.
*/

import {fetch_discipline, fetch_event} from "./fetch_data.js";
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
    fetch_discipline("USA", "United States").then(function(result) {
      const root = d3.hierarchy({children: result})
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

      console.log("Root:", root);
    
      drawTreemap(treemap, svg, root);

      addCountryOptions(result);
    });
  });

  function addCountryOptions(root) {
    root.leaves().forEach(d => {
      countrySelect.append('option')
          .attr('value', d.data.name)
          .text(d.data.name);
  });
  }

countrySelect.on('change', function() {
    const selectedCountry = d3.select(this).property('value');
    // Handle the selected country (e.g., highlight the corresponding rectangle in the treemap)
    svg.selectAll('rect')
        .style('opacity', d => (d.data.name === selectedCountry) ? 1 : 0.5);
});
  //* ------------------------------ END FUNCTIONS ----------------------------------- //
