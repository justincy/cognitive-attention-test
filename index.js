/**
 * Configuration
 */

var trials = [1,3,2,8,3],

    // Time each number is shown on the screen
    trialTime = 1200,

    // Index intro trials array for next number to show during the test
    currentTrial = 0,

    // Number of times the user incorrectly presses the button
    badPresses = 0,

    // Number of times the user should've pressed the button but didn't
    missedPresses = 0,

    // Track when the button is pressed
    buttonPressed = true;

setup();

/**
 * Setup event listeners
 */
function setup(){
  $('#startBtn').click(run);
}

/**
 * Run the test
 */
function run(){
  $('#app').removeClass('start').addClass('test');

  // Check if spacebar was pressed
  $(window).keypress(function (e) {
    if (e.keyCode === 0 || e.keyCode === 32) {
      buttonPressed = true;
    }
  });

  // Show first trial
  showTrial();
}

/**
 * Show a trial (number) on the screen and set a timer for the next one
 */
function showTrial(){

  // Reset state
  buttonPressed = false;

  // We're done when we're at the end of the array
  if(currentTrial === trials.length){
    end();
  }

  // Not done...
  else {

    // Display the next number
    $('#trial').text(trials[currentTrial]);

    // Setup event to run when trial is over. Calculate whether there was a
    // bad or missed button press. Then show the next trial.
    setTimeout(function(){

      // Should they have pressed the button?
      if(trials[currentTrial] === 3 && buttonPressed === false){
        missedPresses++;
      } else if(trials[currentTrial] !== 3 && buttonPressed === true){
        badPresses++;
      }

      // Show the next trial
      currentTrial++;
      showTrial();
    }, trialTime);
  }
}

/**
 * Display the end screen and test results
 */
function end(){
  $('#app').removeClass('test').addClass('end');

  $('#results').text(`Bad Presses: ${badPresses}\nMissed Presses: ${missedPresses}`);
}
