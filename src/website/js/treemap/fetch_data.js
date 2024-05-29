/* 
  /Ecole Polytechnique Fédérale de Lausanne
  /Course: COM-480: Data Visualization
  /Project: Olympic History Data Visualization
  /Students: Vincent Roduit, Yannis Laaroussi, Fabio Palmisano

  /Description:
  /This script fetches the discipline and event data.
*/

export async function fetch_discipline(countryCodeISO3, country_name) {
    let new_countryISO = countryCodeISO3;
    let new_country_name = country_name;

    try {
        // Fetch the CSV data
        const csvData = await fetch('../../data/olympic_treemap_discipline.csv');
        const textData = await csvData.text();
        const data = d3.csvParse(textData);

        // Filter and process the data
        const season = window.getOlympicSeason();
        var disciplineData = data
            .filter(d => d.game_season === season && (d.country_3_letter_code === countryCodeISO3 || d.country_name === country_name))
            .map(d => ({ name: d.discipline_title, value: +d.percentage }));

        // If no data is found, fetch the default country data
        if (disciplineData.length === 0) {
            const result = await fetch_country();
            const country_names = result.map(d => d.country_name);
            country_names.sort();
            new_country_name = country_names[0];
            new_countryISO = result.find(d => d.country_name === new_country_name).country_3_letter_code;
            disciplineData = data
                .filter(d => d.game_season === season && d.country_3_letter_code === new_countryISO)
                .map(d => ({ name: d.discipline_title, value: +d.percentage }));
        }

        // Return the final result
        return [new_countryISO, new_country_name, { children: disciplineData }];
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}


export async function fetch_event(countryCodeISO3, country_name, discipline) {
    try {
        const data = await d3.csvParse(await (await fetch('../../data/olympic_treemap_event.csv')).text());
        const season = window.getOlympicSeason();
        const eventData = data
            .filter(d => d.game_season === season && (d.country_3_letter_code === countryCodeISO3 || d.country_name === country_name) && d.discipline_title === discipline)
            .map(d => ({ name: d.event_title, value: +d.percentage }));
        if (eventData.length === 0) {
            console.log("No event found for the discipline", discipline);
            return null;
        }
        return [{ children: eventData }];
    }
    catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export async function fetch_country() {
    try {
        const data = await d3.csvParse(await (await fetch('../../data/olympic_treemap_country_list.csv')).text());
        const season = window.getOlympicSeason();
        const countryData = [...new Set(data
            .filter(d => d.game_season === season))];
        if (countryData.length === 0) {
            console.log("No country found for the season", season);
            return null;
        }
        return countryData;
    }
    catch (error) {
        console.error('Error:', error);
        return null;
    }
}