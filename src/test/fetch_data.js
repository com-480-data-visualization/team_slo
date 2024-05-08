export async function fetch_discipline(countryCodeISO3, country_name) {
    try {
        const data = await d3.csvParse(await (await fetch('../../data/olympic_treemap_discipline.csv')).text());
        const season = 'Winter' //window.getOlympicSeason();
        console.log("Season:", season);
        console.log("Country code:", countryCodeISO3);
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