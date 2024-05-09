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
  console.log(root);
  const nodes = svg.selectAll("g")
    .data(root.leaves())
    .enter().append("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  // Create rectangles
  nodes.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("class", "node")

  // Create labels
nodes.append("text")
  .attr("class", "node-label")
  .style("font-size", d => {
    const fontSize = Math.min(d.x1 - d.x0, d.y1 - d.y0) / 10; // Adjust the denominator to get the desired font size
    return fontSize >= 10 ? fontSize + "px" : 0;
  })
  .attr("display", d => {
    const fontSize = Math.min(d.x1 - d.x0, d.y1 - d.y0) / 10; // Adjust the denominator to get the desired font size
    return fontSize >= 10 ? "inline" : "none";
  })
  .text(d => d.data.name)
  .each(function(d) {
    const self = d3.select(this);
    const textLength = self.node().getComputedTextLength();
    const rectWidth = d.x1 - d.x0;
    if (textLength > rectWidth) {
      self.attr("textLength", rectWidth)
        .attr("lengthAdjust", "spacingAndGlyphs"); // Adjust spacing and glyphs
    }
  });



  // Add a transition to the rectangles and labels
  nodes.selectAll("rect, text")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("dx", d => (d.x1 - d.x0) / 2)
    .attr("dy", d => (d.y1 - d.y0) / 2)
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
  nodes.on("mouseover", function(event, d) {
    d3.select(this).select("rect").style("fill", "orange");
  }
  );
  nodes.on("mouseout", function(event, d) {
    d3.select(this).select("rect").style("fill", "steelblue");
  }
  );
}