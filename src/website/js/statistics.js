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
  
      // Initialize arrays for labels, parents, and values
      const labels = [];
      const parents = [];
      //const values = [];

      // Get unique game names
      const games = [...new Set(parsedData.map(row => row.game_name))];
      const disciplines = [...new Set(parsedData.map(row => row.discipline_title))];
      const events = [...new Set(parsedData.map(row => row.event_title))];
      
      // Iterate over the parsed data to create the labels, parents, and values arrays
      parsedData.forEach(row => {
        const gameName = row.game_name;
        const disciplineTitle = row.discipline_title;
        const eventTitle = row.event_title;
        const season = row.game_season;

        if (season !== season_actual) {
          return;
        }

        // Add game name to labels if not already present
        if (!labels.includes(gameName)) {
          labels.push(gameName);
          parents.push('');
          //values.push(1 / games.length); // Each game occupies an equal portion of the wheel chart
        }
        console.log(labels, parents);

        // Add discipline title to labels if not already present
        if (!labels.includes(disciplineTitle)) {
          labels.push(disciplineTitle);
          parents.push(gameName);
          //values.push(1/ games.length); // Add your own logic to calculate the value
        }

        // Add event title to labels if not already present
        if (!labels.includes(eventTitle)) {
          labels.push(eventTitle);
          parents.push(disciplineTitle);
          //values.push(1/ games.length); // Add your own logic to calculate the value
        }
      });


  
    // Create sunburst data object
    const data = [{
      type: 'sunburst',
      labels: labels,
      parents: parents,
      //values: values,
      outsidetextfont: { size: 20, color: '#377eb8' },
      leaf: { opacity: 0.4 },
      marker: { line: { width: 2 } },
      maxdepth: 3, // Show only the gameName nodes initially
      branchvalues: 'total', // Size segments based on total values
      textinfo: 'label',
      hovertemplate: '%{label}<extra></extra>', // Only display label in hover text
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
  