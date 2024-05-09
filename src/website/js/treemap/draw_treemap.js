/* 
  /Ecole Polytechnique Fédérale de Lausanne
  /Course: COM-480: Data Visualization
  /Project: Olympic History Data Visualization
  /Students: Vincent Roduit, Yannis Laaroussi, Fabio Palmisano

  /Description:
  /This script draws the treemap visualization.
*/

import {fetch_discipline,fetch_event} from "./fetch_data.js";
import { season, country_name, countryISO} from "./treemap.js";

export function drawTreemap(treemap, svg, root) {
  // Clear existing nodes
  svg.selectAll("*").remove();

  // Calculate treemap
  treemap(root);

  const nodes = svg.selectAll("g")
    .data(root.leaves())
    .enter().append("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  // Create rectangles
  nodes.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .style("fill", "steelblue");

  // Create labels
  nodes.append("text")
    .attr("dx", 4)
    .attr("dy", 14)
    .text(d => d.data.name);

  // Add a transition to the rectangles and labels
  nodes.selectAll("rect, text")
    .transition()
    .duration(1000)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("dx", 4)
    .attr("dy", 14)
    .text(d => d.data.name);

  // Add click event handler to rectangles
  nodes.on("click", function(event, d) {  
    const discipline = this.__data__.data.name;
    console.log(discipline);
    fetch_event(countryISO, country_name, discipline).then(function(result) {
      console.log(result);
      const eventData = result;
      if (eventData === null) {
        console.log("No event data found for the discipline", discipline);
        return;
      }
      const eventRoot = d3.hierarchy({ children: eventData })
        .sum(d => d.value);
      drawTreemap(treemap, svg, eventRoot);
    });
  });
}