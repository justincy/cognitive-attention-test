/**
 * Configuration
 */

var trials = {
      before: [1,3,2],
      middle: [4,3],
      after: [8,3,6]
    },

    // Track whether we are before or after the sms notification
    // May also have the value of 'middle' for the interval we're not measuring
    // during which the sms notification is being sent
    beforeOrAfter = 'before',

    // Index intro trials array for next number to show during the test
    currentTrial = 0,

    // Time each number is shown on the screen
    trialTime = 2500,

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
    trialStartTime;

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
      if(!buttonPressed && beforeOrAfter !== 'middle'){
        buttonPressed = true;
        var responseTime = Date.now() - trialStartTime;
        if(trials[currentTrial] === 3){
          stats[beforeOrAfter].goodResponseTimes.push(responseTime);
        } else {
          stats[beforeOrAfter].badResponseTimes.push(responseTime);
        }
      }

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
  trialStartTime = Date.now();

  // Advance the state when necessary
  if(currentTrial === trials[beforeOrAfter].length){
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

  // Setup event to run when trial is over. Calculate whether there was a
  // bad or missed button press. Then show the next trial.
  setTimeout(function(){

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
  }, trialTime);
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
