import { fetch_discipline } from "./fetch_data.js";

// Sample data in hierarchical format
const data = [
  { name: "Athletics", value: 80 },
  { name: "Beach volley", value: 20 }
];

const athletics = [
  { name: "100m", value: 30 },
  { name: "200m", value: 50 },
  { name: "400m", value: 20 }
];

// Define dimensions of the treemap
const width = 600;
const height = 400;

// Create treemap layout
const treemap = d3.treemap()
  .size([width, height])
  .paddingInner(2);

// Create root node and calculate treemap
const root = d3.hierarchy({children: data})
  .sum(d => d.value)
  .sort((a, b) => b.value - a.value);

// Create SVG container
const svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

// Draw initial treemap
drawTreemap(root);

// Function to draw treemap
function drawTreemap(root) {
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
      if (d.data.name === "Athletics") {
        fetch_discipline("USA", "United States").then(function(result) {
          const root = d3.hierarchy({children: result})
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
          drawTreemap(root);
        });
      } 
  });
}
