(async () => {
    try {
      // Fetch CSV data
      const response = await fetch('../../data/olympic_results_join.csv');
      const csvData = await response.text();
  
      // Parse CSV data
      const parsedData = d3.csvParse(csvData);
  
      // Initialize arrays for labels and parents
      const labels = [];
      const parents = [];
  
      // Iterate over the parsed data to create the labels and parents arrays
      parsedData.forEach(row => {
        const gameName = row.game_name;
        const disciplineTitle = row.discipline_title;
        const eventTitle = row.event_title;

        
  
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
        margin: { l: 0, r: 0, b: 0, t: 0 },
        width: 800,
        height: 800
      };
  
      // Plot sunburst chart
      Plotly.newPlot('myDiv', data, layout);
    } catch (error) {
      console.error('Error:', error);
    }
  })();
  
  