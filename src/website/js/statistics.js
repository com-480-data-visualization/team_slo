async function generateChart(season_actual) {
  try {
    // Fetch CSV data
    const response = await fetch('../../data/olympic_results_join.csv');
    const csvData = await response.text();

    // Parse CSV data
    const parsedData = d3.csvParse(csvData);

    // Initialize arrays for labels, parents, and values
    const labels = [];
    const parents = [];

    // Iterate over the parsed data to create the labels, parents, and values arrays
    parsedData.forEach(row => {
      const gameName = row.game_name;
      const disciplineTitle = row.discipline_title;
      const eventTitle = row.event_title;
      const season = row.game_season;
      const year = row.game_year;

      if (season !== season_actual) {
        return;
      }

      // Add game name to labels if not already present
      if (!labels.includes(gameName)) {
        labels.push(gameName);
        parents.push('');
      }

      // Add discipline title to labels if not already present
      const uniqueDisciplineTitle = `${year}-${disciplineTitle}`;
      if (!labels.includes(uniqueDisciplineTitle)) {
        labels.push(uniqueDisciplineTitle);
        parents.push(gameName);
      }

      // Add event title to labels if not already present
      const uniqueEventTitle = `${uniqueDisciplineTitle}-${eventTitle}`;
      if (!labels.includes(uniqueEventTitle)) {
        labels.push(uniqueEventTitle);
        parents.push(uniqueDisciplineTitle);
      }
    });

    // Create sunburst data object
    const data = [{
      type: 'sunburst',
      labels: labels,
      parents: parents,
      outsidetextfont: { size: 20, color: '#377eb8' },
      leaf: { opacity: 0.4 },
      marker: { line: { width: 2 } },
      maxdepth: 2, // Show only the gameName nodes initially
      branchvalues: 'total', // Size segments based on total values
      textinfo: 'label',
      hovertemplate: '%{label}<extra></extra>', // Only display label in hover text
    }];

    // Define layout
    const layout = {
      margin: { l: 100, r: 100, b: 200, t: 50 },
      width: 1000, // Adjust this percentage as needed
      height: 800 // Adjust this percentage as needed
    };

    // Plot sunburst chart
    Plotly.newPlot('myDiv', data, layout);
  } catch (error) {
    console.error('Error:', error);
  }
}

var switchElement = document.getElementById('season-switch');

// Determine the initial state of the switch button
var season_actual = switchElement.checked ? 'Winter' : 'Summer';

switchElement.addEventListener('change', function() {
  var newSeason = switchElement.checked ? 'Winter' : 'Summer';
  console.log(newSeason);
  if (newSeason !== season_actual) {
    season_actual = newSeason;
    console.log("Season changed to", season_actual);
    generateChart(season_actual); // Call the function to generate the chart
  }
});

// Call the function initially to generate the chart for the current season
generateChart(season_actual);
  