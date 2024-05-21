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
    /**
     * Function to move the popup window
     * 
     * @param {MouseEvent} e - The mouse event
     */
  
    var popup = document.getElementById("myPopup");
  
    // If the popup does not have the "show" class, show the popup
    if (!popup.classList.contains("show")) {
      showPopup(e.target);
    }
  
  
    if (e) {
        // Get the mouse cursor position
        var x = e.clientX;
        var y = e.clientY;  
        
        var offsetX = -80;
        var offsetY = -70;
  
        x += offsetX;
        y += offsetY;
  
        // Calculate the adjusted positions
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
  
        // console.log('mouse:', x, y);
        // console.log(popup.style.left, popup.style.top);
  
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