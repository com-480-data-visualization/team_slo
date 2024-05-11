/* 
  /Ecole Polytechnique Fédérale de Lausanne
  /Course: COM-480: Data Visualization
  /Project: Olympic History Data Visualization
  /Students: Vincent Roduit, Yannis Laaroussi, Fabio Palmisano

  /Description:
  /This script is responsible for the switch that changes the Olympic season.
*/

var OlympicSeason = null;

function whenDocumentLoaded(action) {
  //Function that checks if the document is already loaded or not
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    action();
  }
}

//Define the function that will be called when the document is loaded
whenDocumentLoaded(function () {
  createCheckbox();
  document.querySelector('.switch').style.display = 'block';
  });

  function createCheckbox() {
  var checkbox = document.querySelector('.switch input[type="checkbox"]');
  checkbox.checked = false;
  if (sessionStorage.getItem('checkboxState') === 'true') {
    checkbox.checked = true;
    OlympicSeason = 'Winter';
  } else {
    OlympicSeason = 'Summer';
  }
  console.log('Initial Olympic season:', OlympicSeason);
  checkbox.addEventListener('change', function () {
    sessionStorage.setItem('checkboxState', checkbox.checked);
    if (checkbox.checked) {
      OlympicSeason = 'Winter';
    } else {
      OlympicSeason = 'Summer';
    }
  });
}

window.getOlympicSeason = function () {
  // Return the current Olympic season (Summer or Winter)
  return OlympicSeason;
}