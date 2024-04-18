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

  window.getOlympicSeason = function() {
    return OlympicSeason;
  }

  console.log(getOlympicSeason());

  checkbox.addEventListener('change', function () {
    if (checkbox.checked) {
      OlympicSeason = 'Summer';
    } else {
      OlympicSeason = 'Winter';
    }
  });
});