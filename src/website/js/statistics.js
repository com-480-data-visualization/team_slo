// Function to load the list of games
async function loadGamesList(season) {
  // Fetch CSV data
  const response = await fetch('../../data/olympic_results_join.csv');
  const csvData = await response.text();

  // Parse CSV data
  const parsedData = d3.csvParse(csvData);

  // Get the unique game names
  var games = [...new Set(parsedData.map(row => ({ game_name: row.game_name, season: row.game_season })))];

  // Get the select element
  var selectElement = document.getElementById('game-select');

  // Clear the select element
  selectElement.innerHTML = '';

  for (var i = 0; i < games.length; i++) {
    // Check if the game's season matches the actual season
    var existingOption = selectElement.querySelector(`option[value="${games[i].game_name}"]`);
    if (existingOption) continue;
    if (games[i].season === season) {
      // Create a new option element
      var option = document.createElement('option');

      // Set the value and text of the option
      option.value = games[i].game_name;
      option.text = games[i].game_name;

      // Add the option to the select element
      selectElement.add(option);
    }
  }

  // Display the wheel chart for the first game of the new season
  displayWheelChart(season, selectElement.options[0].value);
}




async function displayWheelChart(season_actual, game_of_interest) {
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

      if (game_of_interest !== gameName) {
        return;
      }
      console.log(game_of_interest, gameName);

      console.log(season_actual, season);

      if (season !== season_actual) {
        console.log("Season mismatch");
        return;
      }
      console.log(season_actual, season);

      // Add game name to labels if not already present
      if (!labels.includes(gameName)) {
        labels.push(gameName);
        parents.push('');
      }

      // Add discipline title to labels if not already present
      if (!labels.includes(disciplineTitle)) {
        labels.push(disciplineTitle);
        parents.push(gameName);
      }

      labels.push(eventTitle);
      parents.push(disciplineTitle);

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

switchElement.addEventListener('change', async function() {
  var newSeason = switchElement.checked ? 'Winter' : 'Summer';
  console.log(newSeason);

  season_actual = newSeason;
  await loadGamesList(season_actual);
  console.log("Season changed to", season_actual);

  // Get the first game of the new season
  var firstGame = document.getElementById('game-select').options[0].value;

  // Display the wheel chart for the first game of the new season
  displayWheelChart(season_actual, firstGame);
  
});


window.onload = async function() {
  // Determine the initial state of the switch button
  var switchElement = document.getElementById('season-switch');
  var season_actual = switchElement.checked ? 'Winter' : 'Summer';

  await loadGamesList(season_actual);

  // Get the first game of the current season
  var firstGame = document.getElementById('game-select').options[0].value;

  // Display the wheel chart for the first game of the current season
  displayWheelChart(season_actual, firstGame);
};


// Get the select element
var selectElement = document.getElementById('game-select');

// Add an event listener to the select element
selectElement.addEventListener('change', function() {
  var switchElement = document.getElementById('season-switch');
  var season_actual = switchElement.checked ? 'Winter' : 'Summer';
  // Get the selected game
  var selectedGame = selectElement.value;
  console.log("Season is", season_actual);
  // Update the wheel chart
  displayWheelChart(season_actual, selectedGame);
});



