var season_actual = 'Winter';

(async () => {
    try {
      // Fetch CSV data
      const response = await fetch('../../data/olympic_results_join.csv');
      const csvData = await response.text();
      // To link with the switch of current season

      console.log(season_actual);
      // Parse CSV data
      const parsedData = d3.csvParse(csvData);
  
      // Initialize arrays for labels and parents
      const labels = [];
      const parents = [];
  
      // Iterate over the parsed data to create the labels and parents arrays
      parsedData.forEach(row => {
        const gameName = row.game_name;
        const disciplineTitle = row.discipline_title;
        //const eventTitle = row.event_title;
        const season = row.game_season;

        if (season !== season_actual) {
          return;
        }

        // Add game name to labels if not already present
        if (!labels.includes(gameName)) {
          labels.push(gameName);
          parents.push('');
        }
  
        // Add discipline title to labels if not already present

          labels.push(disciplineTitle);
          parents.push(gameName);
  
        // Add event title to labels
        //labels.push(eventTitle);
        //parents.push(disciplineTitle);
      });
  
      // Create sunburst data object
      const data = [{
        type: 'sunburst',
        labels: labels,
        parents: parents,
        outsidetextfont: { size: 20, color: '#377eb8' },
        leaf: { opacity: 0.4 },
        marker: { line: { width: 2 } },
      }];
  
      // Define layout
      const layout = {
        margin: { l: 100, r: 100, b: 200, t: 50 },
        width: 800, // Adjust this percentage as needed
        height: 800 // Adjust this percentage as needed
    };
  
      // Plot sunburst chart
      Plotly.newPlot('myDiv', data, layout);
    } catch (error) {
      console.error('Error:', error);
    }
  })();
  

  var switchElement = document.getElementById('season-switch');

  switchElement.addEventListener('change', function() {
    var newSeason = switchElement.checked ? 'Winter' : 'Summer';
    console.log(newSeason);
    if (newSeason !== season_actual) {
      season_actual = newSeason;
      console.log("Season changed to", season_actual);
    }
  });