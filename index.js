/**
 * Configuration
 */

var DEV = document.location.search.indexOf('dev') !== -1,

    trials = {
      before: [5,7,6,4,8,2,7,3,6,1,2,9,7,5,4,8,2,2,6,3,2,3,9,4,9,6,3,5,2,1,1,3,5,6,9,8,8,3,7,5,2,1,2,3,8,7,6,5,4,3,2,1,9,3,2,4,6,5,7,8,3,8,6,4,8,2,5,3,6,4,9,1,5,3,3,2,6,8,7,6,1,9,4,2,3,1,5,5,5,6,8,3,7,2,3,8,8,7,3,9,4,6,8,2,1,1,8,3,4,3,5,3,9,7,6,2,2,8,4,7,9,4,5,9,5,3,8,7,2,1,9,4,5,7,9,2,1,3,8,5,5,6,4,3,8,7,3,9,2,1,2,1,3,2,5,4,3,5,6,7,2,3,8,4,7,6,3,5,6,7,9,8,1,3,1,2],
      middle: [9,2,1,1,4,6,3,8,7,8,3,6,5,7,3,9,2,6,9,1,7,3,5,4,4,5,3,7,1,9,6,2,9,3,7,5,6,3,8,7,8,3,6,4,1,1,2,9],
      after: [8,3,2,7,3,8,6,5,5,5,1,3,2,4,9,1,6,7,8,6,2,3,3,5,1,9,4,6,3,5,2,8,4,6,8,3,8,7,5,6,4,2,3,9,1,2,3,4,5,6,7,8,3,2,1,2,5,7,3,8,8,9,6,5,3,1,1,2,5,3,6,9,4,9,3,2,3,6,2,2,8,4,5,7,9,2,1,6,3,7,2,8,4,6,7,5,7,6,3,5,4,5,4,3,9,8,1,2,1,3,4,8,1,4,8,3,7,6,3,4,4,3,5,8,3,7,1,2,3,1,8,9,7,6,5,8,1,3,8,7,4,5,4,2,6,7,8,1,3,2,4,6,3,9,1,8,7,3,7,5,2,4,5,6,2,1,8,3,9,4,9,3,4,5,6,8]
    },

    // Track whether we are before or after the sms notification
    // May also have the value of 'middle' for the interval we're not measuring
    // during which the sms notification is being sent
    beforeOrAfter = 'before',

    // Index intro trials array for next number to show during the test
    currentTrial = 0,

    // Time each number is shown on the screen
    trialTime = 1500,

    // Stats are separated into before and after the sms notification which
    // occurs half way through the test
    stats = {
      before: {
        goodResponseTimes: [],
        badResponseTimes: [],
        badPresses: 0, // Number of times the user incorrectly presses the button
        missedPresses: 0 // Number of times the user should've pressed the button but didn't
      },
      after: {
        goodResponseTimes: [],
        badResponseTimes: [],
        badPresses: 0,
        missedPresses: 0
      }
    },

    // Track when the button is pressed
    buttonPressed = true,

    // Trial start time; used to calculate response time
    trialStartTime,

    // Allow us to cancel the show trial timer when the user presses the button
    // so that we can display the next trial early
    showTrialTimer;

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

      // Record the response time for the first button press
      if(beforeOrAfter !== 'middle'){
        buttonPressed = true;
        var responseTime = Date.now() - trialStartTime;
        if(trials[currentTrial] === 3){
          stats[beforeOrAfter].goodResponseTimes.push(responseTime);
        } else {
          stats[beforeOrAfter].badResponseTimes.push(responseTime);
        }
      }

      // Move to next trial when the button is pressed
      endTrial();

    }
  });

  // Show first trial
  showTrial();
}

/**
 * Show a trial (number) on the screen and set a timer for the next one
 */
function showTrial(){

  if(showTrialTimer){
    clearTimeout(showTrialTimer);
  }

  // Reset state
  buttonPressed = false;
  trialStartTime = Date.now();

  // Advance the state when necessary
  if(currentTrial === trials[beforeOrAfter].length || (DEV && currentTrial == 3)){
    if(beforeOrAfter === 'before'){
      beforeOrAfter = 'middle';
      currentTrial = 0;
    } else if(beforeOrAfter === 'middle'){
      beforeOrAfter = 'after';
      currentTrial = 0;
    } else {
      end();
      return;
    }
  }

  // Display the next number
  $('#trial').text(trials[beforeOrAfter][currentTrial]);

  // Setup event to run when trial is over
  showTrialTimer = setTimeout(endTrial, trialTime);
}

/**
 * End the trial, record some data, prepare for next trial
 */
 function endTrial(){

   // Should they have pressed the button?
   if(beforeOrAfter !== 'middle'){
     if(trials[beforeOrAfter][currentTrial] === 3 && buttonPressed === false){
       stats[beforeOrAfter].missedPresses++;
     } else if(trials[beforeOrAfter][currentTrial] !== 3 && buttonPressed === true){
       stats[beforeOrAfter].badPresses++;
     }
   }

   // Show the next trial
   currentTrial++;
   showTrial();
 }

/**
 * Display the end screen and test results
 */
function end(){
  $('#app').removeClass('test').addClass('end');
  $('#results').html([
    '<h3>Before</h3>',
    statsTable(stats.before),
    '<h3>After</h3>',
    statsTable(stats.after)
  ].join(''));
}

/**
 * Generate an HTML table of the stats
 *
 */
function statsTable(stats){
  return valueTable({
    'Mean Response Time (ms)': ss.mean(stats.goodResponseTimes.concat(stats.badResponseTimes)) || 0,
    'Mean Good Response Time (ms)': ss.mean(stats.goodResponseTimes) || 0,
    'Mean Bad Response Time (ms)': ss.mean(stats.badResponseTimes) || 0,
    'Bad Presses': stats.badPresses,
    'Missed Presses': stats.missedPresses
  });
}

/**
 * Generate a simple key:value pair HTML table
 *
 * @param {Object} values
 * @return {String} html
 */
function valueTable(values){
  var html = '<table>';
  for(var key in values){
    html += `<tr><th>${key}</th><td>${values[key]}</td></tr>`;
  }
  return html += '</table>';
}
