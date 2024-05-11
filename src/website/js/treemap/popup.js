/* 
  /Ecole Polytechnique Fédérale de Lausanne
  /Course: COM-480: Data Visualization
  /Project: Olympic History Data Visualization
  /Students: Vincent Roduit, Yannis Laaroussi, Fabio Palmisano

  /Description:
  /This script is responsible for the popup window
*/
export function showPopup(e) {
  // Get the popup element
  var popup = document.getElementById("myPopup");

  // Check if `e` contains the expected data
  if (e && e.data) {
      // Extract `name` and `value` from the data object
      var firstLine = e.data.name;  // Get the `name` attribute from `e.data`
      var secondLine = e.data.value + "%";  // Get the `value` attribute from `e.data` and append '%'

      // Set the inner HTML of the popup with `name` and `value`
      popup.innerHTML = firstLine + "<br>" + secondLine;

      // Add the `show` class to the popup
      popup.classList.add("show");

      // Fade in the popup (assuming `fadeIn` is a defined function)
      fadeIn(popup);
  } else {
      console.warn('e does not contain expected data object');
  }
}

  
export function hidePopup() {
    var popup = document.getElementById("myPopup");
    popup.classList.remove("show");
    fadeOut(popup);
  }
  
export function movePopup(e) {
    var popup = document.getElementById("myPopup");
    var div = document.getElementById("treemap");

    // Retrieve the bounding rectangle of the div
    var divRect = div.getBoundingClientRect();

    // If the popup does not have the "show" class, show the popup
    if (!popup.classList.contains("show")) {
        showPopup(e.target);
    }

    // Calculate the mouse position relative to the div
    if (e) {
        var x = e.clientX;
        var y = e.clientY;
        var relativeX = x - divRect.left;
        var relativeY = y - divRect.top;
        // Adjustments based on viewport dimensions
        var xOffset = 0.02 * window.innerWidth; // 5% of the viewport width
        var yOffset = 0.2 * window.innerHeight; // 20% of the viewport height

        // Calculate the adjusted positions
        popup.style.left = `${relativeX - xOffset}px`;
        popup.style.top = `${relativeY + yOffset}px`;

        console.log('mouse:', x, y);
        console.log(popup.style.left, popup.style.top);

        // Display the popup
        popup.style.display = 'block';
    } else {
        // If the event is not provided, hide the popup
        popup.style.display = 'none';
        popup.textContent = '';
    }
}

  
function fadeIn(element) {
    var op = 0.1;
    element.style.display = 'block';
    element.style.opacity = op;
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        op += op * 0.1;
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    }, 10);
  }
  
function fadeOut(element) {
    var op = 1; 
    element.style.opacity = op;
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.display = 'none';
        }
        op -= op * 0.1;
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    }, 10);
  }