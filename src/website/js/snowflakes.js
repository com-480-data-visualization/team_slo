document.addEventListener("DOMContentLoaded", function () {
    let intervalId = null;
  
    // Function to create snowflakes
    function createSnowflakes() {
        const snowflake = document.createElement("div");
        snowflake.className = "snowflake";
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.animationDuration = `${3 + Math.random() * 5}s`;
        snowflake.style.animationDelay = `${Math.random() * 2}s`;
        
        // Set the content of the snowflake div to a snowflake emoji
        snowflake.textContent = "❄️";
  
        document.body.appendChild(snowflake);
  
        // Remove snowflake after the animation ends
        snowflake.addEventListener("animationend", () => {
            snowflake.remove();
        });
    }
  
    // Function to stop the snowflake animation and fade out snowflakes
    function stopSnowflakeAnimation() {
        clearInterval(intervalId);
        intervalId = null;
        
        // Fade out all snowflakes
        const snowflakes = document.querySelectorAll('.snowflake');
        snowflakes.forEach(snowflake => {
            snowflake.style.transition = 'opacity 1s ease-out';
            snowflake.style.opacity = '0';
            // Remove the snowflake from the DOM after the transition ends
            snowflake.addEventListener('transitionend', () => {
                snowflake.remove();
            });
        });
    }
  
    // Link the snowflake animation to the checkbox
    var checkbox = document.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function () {
        if (!checkbox.checked) {
            // Start the snowflake animation
            if (intervalId === null) {
                intervalId = setInterval(createSnowflakes, 200);
                setTimeout(stopSnowflakeAnimation, 7000);
            }
        } else {
            // Stop the snowflake animation
            stopSnowflakeAnimation();
        }
    });
  });
  