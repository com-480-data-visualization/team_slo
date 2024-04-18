/* 
  /Ecole Polytechnique Fédérale de Lausanne
  /Course: COM-480: Data Visualization
  /Project: Olympic History Data Visualization
  /Students: Vincent Roduit, Yannis Laaroussi, Fabio Palmisano

  /Description:
  /This script is responsible for the switch that changes the Olympic season.
*/ 


function whenDocumentLoaded(action) {
  //Function that checks if the document is already loaded or not
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    //// `DOMContentLoaded` already fired
    action();
  }
}

//Define the function that will be called when the document is loaded
whenDocumentLoaded(function () {
  var checkbox = document.querySelector('input[type="checkbox"]');
  var OlympicSeason = 'Winter';

  window.getOlympicSeason = function() {
    // Return the current Olympic season (Summer or Winter)
    return OlympicSeason;
  }

  // Store the checkbox state in the local storage
  var checkboxState = localStorage.getItem('checkboxState');
  if (checkboxState !== null) {
    checkbox.checked = checkboxState === 'true';

    // Change the Olympic season based on the checkbox state
    if (checkbox.checked) {
      OlympicSeason = 'Summer';
    } else {
      OlympicSeason = 'Winter';
    }
  }

  // Change the Olympic season when the checkbox changes
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