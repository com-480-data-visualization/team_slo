/* 
  /Ecole Polytechnique Fédérale de Lausanne
  /Course: COM-480: Data Visualization
  /Project: Olympic History Data Visualization
  /Students: Vincent Roduit, Yannis Laaroussi, Fabio Palmisano

  /Description:
  /This script draws the treemap visualization.
*/

import {fetch_discipline,fetch_event} from "./fetch_data.js";

// Function to draw treemap
export function drawTreemap(treemap, svg, root) {
    // Clear existing nodes
    svg.selectAll("*").remove();
  
    // Calculate treemap
    treemap(root);
  
    // Create nodes
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
  
    // Add click event handler
    nodes.on("click", function(event, d) {
        console.log("Click on", d.data.name);
        fetch_event("USA", "United States", d.data.name).then(function(result) {
          if (result !== null) {
            const root = d3.hierarchy({children: result})
              .sum(d => d.value)
              .sort((a, b) => b.value - a.value);
            drawTreemap(treemap, svg, root);
          }
        });
    });
  }