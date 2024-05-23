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
import { showPopup, hidePopup, movePopup } from "./popup.js";

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
    .attr("class", "node")
    .attr("name", d => d.data.name)
    .attr("percentage", d => d.data.value)

  nodes.append("text")
    .attr("class", "node-label")
    .each(function(d) {
        const self = d3.select(this);
        const text = d.data.name;
        const rectWidth = d.x1 - d.x0;
        const rectHeight = d.y1 - d.y0;

        // Split text into two lines
        const words = text.split(" ");
        const half = Math.ceil(words.length / 2);
        const firstLine = words.slice(0, half).join(" ");
        const secondLine = words.slice(half).join(" ");

        // Initialize font size
        let fontSize = Math.min(rectWidth, rectHeight) / 5;

        // Function to check if the text fits
        const doesTextFit = (text, fontSize) => {
            const tempTspan = self.append("tspan")
                .style("font-size", fontSize + "px")
                .text(text);
            const fits = tempTspan.node().getComputedTextLength() <= rectWidth;
            tempTspan.remove();
            return fits;
        };

        // Adjust font size until both lines fit
        while (!doesTextFit(firstLine, fontSize) || !doesTextFit(secondLine, fontSize)) {
            fontSize -= 1;
            if (fontSize <= 0) {
                self.attr("display", "none");
                return;
            }
        }

        if (fontSize <= 10) {
            self.attr("display", "none");
            return;
        }
        // Set final font size
        self.style("font-size", fontSize + "px")
            .attr("display", "inline")
            .attr("text-anchor", "middle");

        // Calculate the total height of the text block (2 lines)
        const lineHeight = 1.1 * fontSize;
        const textHeight = lineHeight * 2;

        // Calculate the initial y position to center the text vertically
        const initialY = (rectHeight - textHeight) / 2 + fontSize;

        // Clear any existing text content
        self.text(null);

        // Append lines as tspans
        self.append("tspan")
            .text(firstLine)
            .attr("dx", rectWidth / 2)
            .attr("dy", initialY)
            .attr("text-anchor", "middle");

        self.append("tspan")
            .text(secondLine)
            .attr("x", rectWidth / 2)
            .attr("y", initialY + lineHeight)
            .attr("text-anchor", "middle");
    })
    .on("mouseover", function(event, d) {
      d3.select(this.parentNode).select(".node").classed("node-hover", true);
    })
    .on("mouseout", function(event, d) {
      d3.select(this.parentNode).select(".node").classed("node-hover", false);
    });


  // Add a transition to the rectangles and labels
  nodes.selectAll("rect, text")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("dx", d => (d.x1 - d.x0) / 2)
    .attr("dy", d => (d.y1 - d.y0) / 2)

  // Add click event handler to rectangles
  nodes.on("click", function(event, d) {  
    const discipline = this.__data__.data.name;
    fetch_event(countryISO, country_name, discipline).then(function(result) {
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
    showPopup(event);
    }
  );
  nodes.on("mouseout", function(event, d) {
    hidePopup(event);
    }
  );
  nodes.on("mousemove", function(event, d) {
    movePopup(d3.event);
    }
  );
  var textElements = svg.selectAll(".node-label")
  .data(nodes)
  .enter()
  .append("text")
  .attr("class", "node-label")
  .text(function(d) { return d.data.name; });

  textElements.on("mouseover", function(event, d) {
    console.log('bitch')
  showPopup(event);
  d3.select(this.parentNode).classed("node:hover")
  console.log(d3.select(this.parentNode))
  });
  textElements.on("mouseout", function(event, d) {
  hidePopup(event);
  });
  textElements.on("mousemove", function(event, d) {
  movePopup(d3.event);
  }
  );
  textElements.on("click", function(event, d) {
    const discipline = this.__data__.data.name;
    fetch_event(countryISO, country_name, discipline).then(function(result) {
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
    showPopup(event);
    }
  );
  nodes.on("click", function(event, d) {
    hidePopup(event);
    const discipline = this.__data__.data.name;
    fetch_event(countryISO, country_name, discipline).then(function(result) {
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
    showPopup(event);
    }
  );
  nodes.on("mouseout", function(event, d) {
    hidePopup(event);
    }
  );
}