function whenDocumentLoaded(action) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    // `DOMContentLoaded` already fired
    action();
  }
}

whenDocumentLoaded(function () {
  var checkbox = document.querySelector('input[type="checkbox"]');
  var OlympicSeason = 'Winter';

  window.getOlympicSeason = function() {
    return OlympicSeason;
  }

  console.log(getOlympicSeason());

  // Retrieve the checkbox state from the local storage and apply it to the checkbox
  var checkboxState = localStorage.getItem('checkboxState');
  if (checkboxState !== null) {
    checkbox.checked = checkboxState === 'true';
    if (checkbox.checked) {
      OlympicSeason = 'Summer';
    } else {
      OlympicSeason = 'Winter';
    }
  }

  checkbox.addEventListener('change', function () {
    if (checkbox.checked) {
      OlympicSeason = 'Summer';
    } else {
      OlympicSeason = 'Winter';
    }
    // Store the checkbox state in the local storage when it changes
    localStorage.setItem('checkboxState', checkbox.checked);
  });

  // Show the slider
  document.querySelector('.switch').style.display = 'block';
});