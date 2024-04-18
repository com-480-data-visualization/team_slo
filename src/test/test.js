function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}
document.addEventListener('DOMContentLoaded', function () {
    var checkbox = document.querySelector('input[type="checkbox"]');
    var OlympicSeason = 'Winter';
  
    checkbox.addEventListener('change', function () {
      if (checkbox.checked) {
        var OlympicSeason = 'Summer';
        console.log(OlympicSeason);
      } else {
        var OlympicSeason = 'Winter';
        console.log(OlympicSeason);
      }
    });
  });