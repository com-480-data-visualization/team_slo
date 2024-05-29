
// Load the options for the game select element
async function loadGamesList(season) {
  const response = await fetch('../../data/olympic_results_join.csv');
  const csvData = await response.text();

  const parsedData = d3.csvParse(csvData);

  // unique game names
  var games = [...new Set(parsedData.map(row => ({ game_name: row.game_name, season: row.game_season })))];

  var selectElement = document.getElementById('game-select');
  selectElement.innerHTML = '';

  // Add an option for each game in the current season
  for (var i = 0; i < games.length; i++) {
    var existingOption = selectElement.querySelector(`option[value="${games[i].game_name}"]`);
    if (existingOption) continue;
    if (games[i].season === season) {
      var option = document.createElement('option');
      option.value = games[i].game_name;
      option.text = games[i].game_name;
      selectElement.add(option);
    }
  }

  displayWheelChart(season, selectElement.options[0].value);
}

// Generate the display of the medals 
function generateCustomdata(gold, silver, bronze) {
  if (gold !== undefined && silver !== undefined && bronze !== undefined) {
    return [`🥇 Gold: ${gold}<br> 🥈 Silver: ${silver}<br> 🥉 Bronze: ${bronze}`];
  } else {
    return [""];
  }
}

// Display the wheel chart
async function displayWheelChart(season_actual, game_of_interest) {
  // Change select label depending on the season
  var gameSelectLabel = document.getElementById('game-select-label');
  if (season_actual === 'Winter') {
    gameSelectLabel.innerHTML = '❄️ Select a Winter Game ❄️';
  } else {
    gameSelectLabel.innerHTML = '🌞 Select a Summer Game 🌞';
  }

  try {
    const response = await fetch('../../data/olympic_results_join.csv');
    const csvData = await response.text();
    const parsedData = d3.csvParse(csvData);

    const labels = [];
    const parents = [];
    const customdata = [];

  parsedData.forEach(row => {
    const gameName = row.game_name;
    const disciplineTitle = row.discipline_title;
    const eventTitle = row.event_title;
    const season = row.game_season;
    const gold = row.GOLD;
    const silver = row.SILVER;
    const bronze = row.BRONZE;

    if (game_of_interest !== gameName) {
      return;
    }

    if (season !== season_actual) {
      return;
    }
    // Add Game Name node
    if (!labels.includes(gameName)) {
      labels.push(gameName);
      parents.push('');
      customdata.push([""]); 
    }

    // Add Discipline Title node
    if (!labels.includes(disciplineTitle)) {
      labels.push(disciplineTitle);
      parents.push(gameName);
      customdata.push([""]); 
    }

    // Add Event Title node
    labels.push(eventTitle);
    parents.push(disciplineTitle);
    customdata.push(generateCustomdata(gold, silver, bronze)); 
  });


    const data = [{
      type: 'sunburst',
      labels: labels,
      parents: parents,
      customdata: customdata,
      outsidetextfont: { size: 20, color: '#377eb8' },
      leaf: { opacity: 0.4 },
      marker: { line: { width: 2 } },
      maxdepth: 2, 
      branchvalues: 'total', 
      textinfo: 'label',
      hovertemplate: '%{label}<br>%{customdata[0]}<extra></extra>', // Display medalists in hover text
    }];


    const layout = {
      margin: { l: 10, r: 10, b: 10, t: 10 },
      width: window.innerWidth * 0.5, 
      height: window.innerHeight * 0.7, 
      paper_bgcolor: '#f0ece2', 
      plot_bgcolor: 'white',
    };

    Plotly.newPlot('chart', data, layout);
  } catch (error) {
    console.error('Error:', error);
  }
}


// Manage the season switch
var switchElement = document.getElementById('season-switch');
var season_actual = switchElement.checked ? 'Winter' : 'Summer';

switchElement.addEventListener('change', async function() {
  var newSeason = switchElement.checked ? 'Winter' : 'Summer';
  season_actual = newSeason;
  await loadGamesList(season_actual);
  var firstGame = document.getElementById('game-select').options[0].value;

  displayWheelChart(season_actual, firstGame);
  
});

// When the page is loaded
window.onload = async function() {
  var switchElement = document.getElementById('season-switch');
  var season_actual = switchElement.checked ? 'Winter' : 'Summer';

  await loadGamesList(season_actual);

  var firstGame = document.getElementById('game-select').options[0].value;

  displayWheelChart(season_actual, firstGame);
};


// Manage the selection element
var selectElement = document.getElementById('game-select');

selectElement.addEventListener('change', function() {
  var switchElement = document.getElementById('season-switch');
  var season_actual = switchElement.checked ? 'Winter' : 'Summer';
  var selectedGame = selectElement.value;
  displayWheelChart(season_actual, selectedGame);
});



