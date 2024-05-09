// Sample hierarchical data (modify as needed)
const data = {
    name: 'root',
    children: [
        {
            name: 'Category 1',
            children: [
                { name: 'Country A', size: 100 },
                { name: 'Country B', size: 150 }
            ]
        },
        {
            name: 'Category 2',
            children: [
                { name: 'Country C', size: 200 },
                { name: 'Country D', size: 50 }
            ]
        }
    ]
};

const width = 800;
const height = 600;

// Create a treemap layout
const treemap = d3.treemap()
    .size([width, height]) // Set the size of the treemap
    .padding(2); // Padding between rectangles

// Initialize the treemap with data
const root = d3.hierarchy(data)
    .sum(d => d.size); // Use size for area calculation

treemap(root);

// Create an SVG element to contain the treemap
const svg = d3.select('#treemap')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
const color = d3.scaleOrdinal(d3.schemeCategory10);
// Add rectangles for each node
svg.selectAll('rect')
    .data(root.leaves())
    .enter()
    .append('rect')
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .style('fill', d => color(d.data.name)); // Color based on category or other property

// Populate the country-select dropdown
const countrySelect = d3.select('#country-select');
root.leaves().forEach(d => {
    countrySelect.append('option')
        .attr('value', d.data.name)
        .text(d.data.name);
});
// Add an event listener to handle user selections
countrySelect.on('change', function() {
    const selectedCountry = d3.select(this).property('value');
    // Handle the selected country (e.g., highlight the corresponding rectangle in the treemap)
    svg.selectAll('rect')
        .style('opacity', d => (d.data.name === selectedCountry) ? 1 : 0.5);
});
