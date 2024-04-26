// Wait Dom to be ready
document.addEventListener('DOMContentLoaded', function() {
  //get div
  var popupTrigger = document.querySelector('.popup');
  popup = document.getElementById('myPopup');
  //add mouseover, mouseout and mousemove events
  popupTrigger.addEventListener('mouseover', showPopup);
  popupTrigger.addEventListener('mouseout', hidePopup);
  popupTrigger.addEventListener('mousemove', movePopup);
});

// When the user hovers over the element, show the popup
function showPopup() {
  popup.classList.add("show");
  fadeIn(popup);
}

// When the user moves the mouse away from the element, hide the popup
function hidePopup() {
  popup.classList.remove("show");
  fadeOut(popup);
}

// When the user moves the mouse, move the popup
// When the user moves the mouse, move the popup
function movePopup(e) {
  var popup = document.getElementById("myPopup"); // Ensure popup is properly referenced

  // If event exists, show and move the popup
  if (e) {
    popup.style.left = `${e.clientX - 80}px`;
    popup.style.top = `${e.clientY - 50}px`; // Subtract 20 pixels from the Y position
    popup.style.display = 'block';
  } else {
    // If event does not exist, hide the popup
    popup.style.display = 'none';
    popup.textContent = '';
  }
}


// Fade in function
function fadeIn(element) {
  var op = 0.1;  // initial opacity
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
  var op = 1;  // initial opacity
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