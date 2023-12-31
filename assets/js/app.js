$(document).ready(function(){
  
  // event listeners
  $("#remaining-time").hide();
  $('#next-hundred').hide();
  $('#rest-message').hide();
  $("#start").on('click', function() {
    DST.startGame(1);
  });
  $('#next-hundred').on('click', function() {
    $('#next-hundred').hide();  // Hide the button
    $('#rest-message').hide();
    DST.nextQuestion();      // Proceed to the next question
  });
  $("#start_test").on('click', function() {
    DST.startGame(0);
  });
  
  $(document).on('click' , '.option', DST.guessChecker);
  $(document).on('keydown', function(e){
    if(e.keyCode === 49 || e.keyCode === 97) { // "1" on the main keyboard or numpad
      selectOption(1);
    } else if(e.keyCode === 50 || e.keyCode === 98) { // "2" on the main keyboard or numpad
      selectOption(2);
    } else if(e.keyCode === 51 || e.keyCode === 99) { // "3" on the main keyboard or numpad
      selectOption(3);
    }else if(e.keyCode === 32) { // Space bar
      // Logic for next question
      triggerNextQuestion();
    }
  });
  $('#submit-user-info').on('click', function() {
    const subject_name = $('#user-name').val();
    const experiment_times = $('#user-id').val();

    // Validate input (if necessary)
    if (!subject_name || !experiment_times) {
      alert("Please enter both your name and experiment ID.");
      return;
    }
    DST.subject_name=subject_name;
    DST.experiment_times=experiment_times;
    $('#user-info').hide();
  });

  $('#submit-range').on('click', function() {
    const startRange = parseInt($('#start-range').val(), 10);
    const endRange = parseInt($('#end-range').val(), 10);

    // Validate input
    if (isNaN(startRange) || isNaN(endRange) || startRange >= endRange) {
      alert("Please enter valid numbers for start and end range.");
      return;
    }
    DST.startImage=startRange
    DST.endImage=endRange
    console.log("startImage:"+DST.startImage)
    console.log("endImage:"+DST.endImage)

    // Optionally, hide the input fields and submit button after submission
    $('#range-selector').hide();
  });

  $('#generate-report').on('click', function(){
    generateReport();
  });

  function selectOption(optionIndex) {
    // Use the optionIndex to find the corresponding button
    // Assume the buttons have a class '.option' and they are in the same order as the options
    var $button = $('.option').eq(optionIndex - 1); // eq is 0-based index
    // Trigger a click event on the button
    $button.click();
  }

  function triggerNextQuestion() {
    // Your logic to move to the next question.
    // This might be a call to DST.guessResult or similar, depending on your code structure.
    if (DST.questionAnswered == true) {  // Check if the "Next Question" button exists
      $('#next-question').click();  // Trigger the click event on the "Next Question" button
    }
  }
  
  function generateReport() {
    reportData = `Subject Name:${DST.subject_name}\n` + `Experiment times: ${DST.experiment_times}\n` +
     `Correct Answers: ${DST.correct}\n`+`Incorrect Answers: ${DST.incorrect}\n` + `Unanswered: ${DST.unanswered}\n` +
      `Correctly Answered Questions: ${DST.correctlyAnswered.join(', ')}\n` + `Unanswered Questions: ${DST.unansweredQuestion.join(', ')}\n` +
      `Incorrectly Answered Questions: ${DST.incorrectlyAnswered.join(', ')}\n`+`Start Images:${DST.startImage}\n`+`End Images:${DST.endImage}\n`;
  
    reportData += `Correct Answers (catch trial): ${DST.correct_fake}\n`;
    reportData += `Incorrect Answers (catch trial): ${DST.incorrect_fake}\n`;
    reportData += `Unanswered (catch trial): ${DST.unanswered_fake}\n`;
    reportData += `Correctly Answered Questions(catch trial): ${DST.correctlyAnswered_fake.join(', ')}\n`;
    reportData += `Incorrectly Answered Questions(catch trial): ${DST.incorrectlyAnswered_fake.join(', ')}\n`;
    reportData += `Unanswered Questions(catch trial): ${DST.unansweredQuestion_fake.join(', ')}\n`;
    
    reportData += 'Time taken for each question:\n';

    for (let i = 0; i < timeRecords.length; i++) {
      reportData += `Question ${i + DST.startImage}: ${timeRecords[i]} ms\n`;
    }

    reportData += 'Time taken for each catch trial question:\n';
    for (let i = 0; i < timeRecords_fake.length; i++) {
      reportData += `Question ${i + Math.floor((DST.startImage+1)/10)}(catch trial): ${timeRecords_fake[i]} ms\n`;
    }
    
    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `DST_report_${DST.subject_name}_${DST.experiment_times}.txt`;
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(function(){
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
  
})

var timeRecords = [];
var timeRecords_fake = [];
var startTime;
var endTime;

var DST = {
  // DST properties
  subject_name: '',
  experiment_times:'',
  mode:1,
  islastFake:0,
  correctlyAnswered: [],
  incorrectlyAnswered: [],
  unansweredQuestion: [],
  correctlyAnswered_fake: [],
  incorrectlyAnswered_fake: [],
  unansweredQuestion_fake: [],
  startImage:0,
  endImage:100,
  correct: 0,
  incorrect: 0,
  correct_fake: 0,
  incorrect_fake: 0,
  unanswered: 0,
  unanswered_fake: 0,
  currentSet: 0,
  timer: 20,
  timerOn: false,
  questionAnswered: false,
  timerId : '',
  questions: new Array(500).fill('Which image is diffrernt from the other two?'),
  options: new Array(500).fill(['1', '2', '3']),
  answers: new Array(500).fill(''), // This will be filled in later based on the images
  images: new Array(500).fill([]),
  images_fake: new Array(250).fill([]),
  questions_fake: new Array(250).fill('Which image is diffrernt from the other two?'),
  options_fake: new Array(250).fill(['1', '2', '3']),
  answers_fake: new Array(250).fill(''), 
  pre_images: new Array(1),
  // DST methods
  // method to initialize game
  startGame: function(mode){
    // restarting game results
    DST.mode = mode
    DST.currentSet = 0;
    DST.correct = 0;
    DST.incorrect = 0;
    DST.unanswered = 0;
    clearInterval(DST.timerId);
    $('#initial-images').hide();
    
    // show game section
    $('#game').show();
    
    //  empty last results
    $('#results').html('');
    
    // show timer
    $('#timer').text(DST.timer);
    
    // remove start button
    $('#start').hide();
    $('#start_test').hide();
    $('#range-selector').hide();

    // $('#remaining-time').show();

    DST.pre_images.push('./assets/images/pre/pre_image.jpg');
    DST.pre_images.push('./assets/images/pre/pre_image.jpg');
    DST.pre_images.push('./assets/images/pre/pre_image.jpg');


    if (DST.mode===0){
      DST.startImage=0
      DST.endImage=3
      for (let i = 0; i < 3; i++) {
        let images = [];
        if (i===1){
          images.push('./assets/images/example/original/' + (i+1) + '.JPEG');
        }else{
          images.push('./assets/images/example/original/' + (i+1) + '.jpg');
        }
        images.push('./assets/images/example/set1/' + (i+1) + '.jpg');
        images.push('./assets/images/example/set2/' + (i+1) + '.jpg');
        // // Randomly shuffle the images for this question
        images.sort(() => Math.random() - 0.5);
        DST.images[i] = images;
        // // Determine the answer based on which image ends with ".JPEG"
        DST.answers[i] = String(images.findIndex(img => img.endsWith('.JPEG')) + 1); // 1-based index for answer
      }
    }
    else{
      if (DST.endImage-DST.startImage>500){
        DST.endImage=DST.startImage+500
      }
      for (let i = 0; i < DST.endImage-DST.startImage; i++) {
        let images = [];
        images.push('./assets/images/original/' + (i+1+DST.startImage) + '.JPEG');
        images.push('./assets/images/set1/' + (i+1+DST.startImage) + '.jpg');
        images.push('./assets/images/set2/' + (i+1+DST.startImage) + '.jpg');
        // // Randomly shuffle the images for this question
        images.sort(() => Math.random() - 0.5);
        DST.images[i] = images;
        // // Determine the answer based on which image ends with ".JPEG"
        DST.answers[i] = String(images.findIndex(img => img.endsWith('.JPEG')) + 1); // 1-based index for answer
      }
      for (let i = 0; i < 210; i++){
        let images = [];
        images.push('./assets/images/catch_trial/original/' + (i+1) + '.JPEG');
        images.push('./assets/images/catch_trial/set1/' + (i+1) + '.jpg');
        images.push('./assets/images/catch_trial/set2/' + (i+1) + '.jpg');
        // // Randomly shuffle the images for this question
        images.sort(() => Math.random() - 0.5);
        DST.images_fake[i] = images;
        DST.answers_fake[i] = String(images.findIndex(img => img.endsWith('.JPEG')) + 1); // 1-based index for answer
      }
    }

    // ask first question
    DST.nextQuestion();
    
  },
  // New methods to show and hide the 'Next Question' button
  showNextButton: function() {
    $('#next-question').show();
  },
  hideNextButton: function() {
    $('#next-question').hide();
  },

  

  // method to loop through and display questions and options 
  nextQuestion : function(){

    // set timer to 3.3 seconds each question
    DST.timer = 33;
    $('#timer').removeClass('last-seconds');
    $('#timer').text(DST.timer);
    startTime = new Date().getTime();

    
    // to prevent timer speed up
    if(!DST.timerOn){
      DST.timerId = setInterval(DST.timerRunning, 100);
      DST.timerOn = true;
    }

    // gets all the questions then indexes the current questions
    var questionContent = Object.values(DST.questions)[DST.currentSet];
    $('#question').text(questionContent);
    
    // an array of all the user options for the current question
    var questionOptions = Object.values(DST.options)[DST.currentSet];
    // creates all the DST guess options in the html
    $.each(questionOptions, function(index, key){
      $('#options').append($('<button class="option btn btn-info btn-lg">'+key+'</button>'));
    })
    // Get all the images for the current question
    var questionImages = Object.values(DST.pre_images);
    // Clear existing images
    $('#images').html('');
    // Add each image to the HTML
    $.each(questionImages, function(index, path){
      $('#images').append($('<img src="'+ path +'" class="question-image">'));
    });
    

    $('#next-question').one('click', function(){
      DST.questionAnswered = false;
      // Hide the 'Next Question' button
      DST.hideNextButton();
      // Go to the next question
      DST.guessResult();
    });
    
  },
  // method to decrement counter and count unanswered if timer runs out
  timerRunning : function(){
    // if timer still has time left and there are still questions left to ask
    if(DST.timer > 0 && DST.currentSet < Object.keys(DST.questions).length){
      $('#timer').text(DST.timer);
      DST.timer--;
    }
    if (DST.timer === 30){
      // Get all the images for the current question
      if ((DST.currentSet+DST.startImage+1) % 10 === 0 && !DST.islastFake){
        var questionImages = Object.values(DST.images_fake)[Math.floor((DST.currentSet+DST.startImage+1)/10)-1];
        // Clear existing images
        $('#images').html('');
        // Add each image to the HTML
        $.each(questionImages, function(index, path){
          $('#images').append($('<img src="'+ path +'" class="question-image">'));
        });
      }
      else{
        var questionImages = Object.values(DST.images)[DST.currentSet];
        // Clear existing images
        $('#images').html('');
        // Add each image to the HTML
        $.each(questionImages, function(index, path){
          $('#images').append($('<img src="'+ path +'" class="question-image">'));
        });
      }
    }
    else if(DST.timer === 22){
      // Get all the images for the current question
      var questionImages = Object.values(DST.pre_images);
      // Clear existing images
      $('#images').html('');
      // Add each image to the HTML
      $.each(questionImages, function(index, path){
        $('#images').append($('<img src="'+ path +'" class="question-image">'));
      });
    }
    // the time has run out and increment unanswered, run result
    else if(DST.timer === 0){
      if ((DST.currentSet+DST.startImage+1) % 10 === 0 && !DST.islastFake){
        DST.unanswered_fake++;
        DST.unansweredQuestion_fake.push(Math.floor((DST.currentSet+DST.startImage+1)/10)-1)
      }
      else{
        DST.unanswered++;
        DST.unansweredQuestion.push(DST.currentSet+DST.startImage);
      }
      DST.questionAnswered=true
      DST.result = false;
      endTime = new Date().getTime();
      clearInterval(DST.timerId);
      DST.timerOn = false;
      resultId = setTimeout(DST.showNextButton, 5);
      $('#results').html('<h3>Out of time! ' +'</h3>');
      // $('#results').html('<h3>Out of time! The answer was '+ Object.values(DST.answers)[DST.currentSet] +'</h3>');
    }
    // if all the questions have been shown end the game, show results
    else if(DST.currentSet >= DST.endImage-DST.startImage){
      
      // adds results of game (correct, incorrect, unanswered) to the page
      $('#results')
        .html('<h3>Thank you for playing!</h3>');
      
      // hide game sction
      $('#game').hide();
      
      // show start button to begin a new game
      $('#start').show();
    }
    
  },
  // method to evaluate the option clicked
  guessChecker : function() {
    
    // timer ID for gameResult setTimeout
    var resultId;

    if (DST.questionAnswered) {
      return;
    }
    DST.questionAnswered = true;
    endTime = new Date().getTime();
    
    if ((DST.currentSet+DST.startImage+1) % 10 === 0 && !DST.islastFake){
      console.log("Fake question"); // Debugging line
      var currentAnswer = Object.values(DST.answers_fake)[Math.floor((DST.currentSet+DST.startImage+1)/10)-1];
      DST.timerOn = false;
      clearInterval(DST.timerId);
      $(this).addClass('btn-success').removeClass('btn-info');
      if($(this).text() === currentAnswer){
        // turn button green for correct
        $(this).addClass('btn-success').removeClass('btn-info');
        DST.correct_fake++;
        DST.correctlyAnswered_fake.push(Math.floor((DST.currentSet+DST.startImage+1)/10)-1);
      }
      // else the user picked the wrong option, increment incorrect
      else{
        $(this).addClass('btn-success').removeClass('btn-info');
        DST.incorrect_fake++;
        DST.incorrectlyAnswered_fake.push(Math.floor((DST.currentSet+DST.startImage+1)/10)-1);
    }
    }
    else{
      // the answer to the current question being asked
      var currentAnswer = Object.values(DST.answers)[DST.currentSet];
      console.log("Clicked: " + $(this).text()); // Debugging line
      console.log("Correct answer: " + currentAnswer); // Debugging line
      
      // if the text of the option picked matches the answer of the current question, increment correct
      if($(this).text() === currentAnswer){
        // turn button green for correct
        $(this).addClass('btn-success').removeClass('btn-info');
        
        DST.correct++;
        clearInterval(DST.timerId);
        DST.timerOn = false;
        DST.correctlyAnswered.push(DST.currentSet+DST.startImage);
        // resultId = setTimeout(DST.guessResult, 1000);
        // $('#results').html('<h3>Correct Answer!</h3>');
      }
      // else the user picked the wrong option, increment incorrect
      else{
        $(this).addClass('btn-success').removeClass('btn-info');
        DST.incorrectlyAnswered.push(DST.currentSet+DST.startImage);
        // $(this).addClass('btn-danger').removeClass('btn-info');
        
        DST.incorrect++;
        clearInterval(DST.timerId);
        DST.timerOn = false;
        // resultId = setTimeout(DST.guessResult, 1000);
        // $('#results').html('<h3>Better luck next time! '+ currentAnswer +'</h3>');
    }
    }
    
    DST.showNextButton();
    
  },
  // method to remove previous question results and options
  guessResult : function(){
    
    // increment to next question set

    DST.currentSet++;
    if ((DST.currentSet+DST.startImage) % 10 === 0 && !DST.islastFake){
      DST.currentSet--;
      DST.islastFake=1;
      console.log("Fake question, reduce the count")
      // const endTime = new Date().getTime();
      const timeInterval = endTime - startTime;
      timeRecords_fake.push(timeInterval);
    }
    else{
      DST.islastFake=0;
      // const endTime = new Date().getTime();
      const timeInterval = endTime - startTime;
      timeRecords.push(timeInterval);
    }
    if(DST.currentSet >= DST.endImage-DST.startImage){
      // adds results of game (correct, incorrect, unanswered) to the page
    if (DST.mode===0){
      $('#results')
        .html('<h3>Thank you for playing! Please refresh the page, and click "start game" to start the real test. Remember to select the image range, input your name and many times has this been your experiment into the textbox. </h3>');
    }
    else{
      $('#results')
        .html('<h3>Thank you for playing! Press generate report to get the report.</h3>');
    }
      // hide game sction
      $('#game').hide();
      // show start button to begin a new game
      $('.option').remove();
    }
    else{
      console.log("Go to next question:"+DST.currentSet);
      // remove the options and results
      $('.option').remove();
      $('#results h3').remove();
      // begin next question

      if (DST.currentSet!=0 && DST.currentSet%100==0){
        $('#next-hundred').show();
        $('#rest-message').show();
        $('#images').html('');
        
      }else{
        DST.nextQuestion();
      }
    }
  }

}

// Import notice:
// All the file name is start from 1, actually all the record in this test are start with 0!
