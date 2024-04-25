/* 
  /Ecole Polytechnique Fédérale de Lausanne
  /Course: COM-480: Data Visualization
  /Project: Olympic History Data Visualization
  /Students: Vincent Roduit, Yannis Laaroussi, Fabio Palmisano

  /Description:
  /This script is responsible for the snowflake animation when slider is toggled.
*/ 

document.addEventListener("DOMContentLoaded", function () {
    let intervalId = null;
  
    // Function to create snowflakes
    function createSnowflakes() {
        const snowflake = document.createElement("div");
        snowflake.className = "snowflake";
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.animationDuration = `${3 + Math.random() * 5}s`;
        snowflake.style.animationDelay = `${Math.random() * 2}s`;
        
        snowflake.textContent = "❄️";
  
        document.body.appendChild(snowflake);

        snowflake.addEventListener("animationend", () => {
            snowflake.remove();
        });
    }
  
    function stopSnowflakeAnimation() {
        clearInterval(intervalId);
        intervalId = null;
        
        const snowflakes = document.querySelectorAll('.snowflake');
        snowflakes.forEach(snowflake => {
            snowflake.style.transition = 'opacity 1s ease-out';
            snowflake.addEventListener('transitionend', () => {
                snowflake.remove();
            });
        });
    }
  
    var checkbox = document.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
            if (intervalId === null) {
                intervalId = setInterval(createSnowflakes, 200);
                setTimeout(stopSnowflakeAnimation, 5000);
            }
        } else {
            stopSnowflakeAnimation();
        }
    });
  });
  