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
  var OlympicSeason = checkbox.checked ? 'Winter' : 'Summer';
  console.log('Initial Olympic season:', OlympicSeason);
  checkbox.addEventListener('change', function () {
    if (checkbox.checked) {
      OlympicSeason = 'Winter';
    } else {
      OlympicSeason = 'Summer';
    }
  });
}













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
    action();
  }
}

//Define the function that will be called when the document is loaded
whenDocumentLoaded(function () {
  var checkbox = document.querySelector('.switch input[type="checkbox"]');
  document.querySelector('.switch').style.display = 'block';
  const slider = document.querySelector('.slider');
  slider.classList.add('.slider')
  var OlympicSeason = checkbox.checked ? 'Winter' : 'Summer';
  console.log('Initial Olympic season:', OlympicSeason);

  window.getOlympicSeason = function () {
    // Return the current Olympic season (Summer or Winter)
    return OlympicSeason;
  }

  var checkboxState = sessionStorage.getItem('checkboxState');
  if (checkboxState !== null) {
    checkbox.checked = checkboxState === 'true';
  }

  // Change the Olympic season when the checkbox changes
  checkbox.addEventListener('change', function () {
    console.log('Checkbox state:', checkbox.checked);
    if (checkbox.checked) {
      OlympicSeason = 'Winter';
      slider.style.backgroundColor = '#1d92c4'; // Color for "checked" state
      slider.style.boxShadow = '0 0 1px #1d92c4';
    } else {
      OlympicSeason = 'Summer';
    }
    // Store the checkbox state in the session storage when it changes
    sessionStorage.setItem('checkboxState', checkbox.checked);
  });
  });