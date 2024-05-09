/* 
  /Ecole Polytechnique Fédérale de Lausanne
  /Course: COM-480: Data Visualization
  /Project: Olympic History Data Visualization
  /Students: Vincent Roduit, Yannis Laaroussi, Fabio Palmisano

  /Description:
  /This script fetches the discipline and event data.
*/

export async function fetch_discipline(countryCodeISO3, country_name) {
    try {
        const data = await d3.csvParse(await (await fetch('../../data/olympic_treemap_discipline.csv')).text());
        const season = window.getOlympicSeason();
        console.log("Season:", season);
        console.log("Country code:", countryCodeISO3);
        console.log("country_name:", country_name);
        const disciplineData = data
            .filter(d => d.game_season === season && (d.country_3_letter_code === countryCodeISO3 || d.country_name === country_name))
            .map(d => ({ name: d.discipline_title, value: +d.percentage }));
        if (disciplineData.length === 0) {
            console.log("No discipline found for the country with code", countryCodeISO3);
            return null;
        }
        return [{ children: disciplineData }];
    }
    catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export async function fetch_event(countryCodeISO3, country_name, discipline) {
    try {
        const data = await d3.csvParse(await (await fetch('../../data/olympic_treemap_event.csv')).text());
        const season = window.getOlympicSeason();
        console.log("Season:", season);
        console.log("Country code:", countryCodeISO3);
        console.log("Discipline:", discipline);
        console.log("country_name:", country_name)
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