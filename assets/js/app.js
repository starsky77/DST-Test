$(document).ready(function(){
  
  // event listeners
  $("#remaining-time").hide();
  $("#start").on('click', trivia.startGame);
  $(document).on('click' , '.option', trivia.guessChecker);
  $(document).on('keydown', function(e){
    if(e.keyCode === 49 || e.keyCode === 97) { // "1" on the main keyboard or numpad
      selectOption(1);
    } else if(e.keyCode === 50 || e.keyCode === 98) { // "2" on the main keyboard or numpad
      selectOption(2);
    } else if(e.keyCode === 51 || e.keyCode === 99) { // "3" on the main keyboard or numpad
      selectOption(3);
    }
  });
  function selectOption(optionIndex) {
    // Use the optionIndex to find the corresponding button
    // Assume the buttons have a class '.option' and they are in the same order as the options
    var $button = $('.option').eq(optionIndex - 1); // eq is 0-based index
    // Trigger a click event on the button
    $button.click();
  }
  
})

var trivia = {
  // trivia properties
  correct: 0,
  incorrect: 0,
  unanswered: 0,
  currentSet: 0,
  timer: 20,
  timerOn: false,
  timerId : '',
  questions: new Array(100).fill('Which image is diffrernt from the other two?'),
  options: new Array(100).fill(['1', '2', '3']),
  answers: new Array(100).fill(''), // This will be filled in later based on the images
  images: new Array(100).fill([]),
  // trivia methods
  // method to initialize game
  startGame: function(){
    // restarting game results
    trivia.currentSet = 0;
    trivia.correct = 0;
    trivia.incorrect = 0;
    trivia.unanswered = 0;
    clearInterval(trivia.timerId);
    
    // show game section
    $('#game').show();
    
    //  empty last results
    $('#results').html('');
    
    // show timer
    $('#timer').text(trivia.timer);
    
    // remove start button
    $('#start').hide();

    $('#remaining-time').show();

    for (let i = 0; i < 100; i++) {
      let images = [];
      images.push('./assets/images/original/' + (i + 1) + '.JPEG');
      images.push('./assets/images/set1/' + (i + 1) + '.jpg');
      images.push('./assets/images/set2/' + (i + 1) + '.jpg');
      // // Randomly shuffle the images for this question
      images.sort(() => Math.random() - 0.5);
      trivia.images[i] = images;
      // // Determine the answer based on which image ends with ".JPEG"
      trivia.answers[i] = String(images.findIndex(img => img.endsWith('.JPEG')) + 1); // 1-based index for answer
    }
    
    // ask first question
    trivia.nextQuestion();
    
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
    
    // set timer to 20 seconds each question
    trivia.timer = 1;
     $('#timer').removeClass('last-seconds');
    $('#timer').text(trivia.timer);
    
    // to prevent timer speed up
    if(!trivia.timerOn){
      trivia.timerId = setInterval(trivia.timerRunning, 1000);
      trivia.timerOn = true;
    }
    
    // gets all the questions then indexes the current questions
    var questionContent = Object.values(trivia.questions)[trivia.currentSet];
    $('#question').text(questionContent);
    
    // an array of all the user options for the current question
    var questionOptions = Object.values(trivia.options)[trivia.currentSet];
    
    // creates all the trivia guess options in the html
    $.each(questionOptions, function(index, key){
      $('#options').append($('<button class="option btn btn-info btn-lg">'+key+'</button>'));
    })

    // Get all the images for the current question
    var questionImages = Object.values(trivia.images)[trivia.currentSet];
    
    // Clear existing images
    $('#images').html('');
    
    // Add each image to the HTML
    $.each(questionImages, function(index, path){
      $('#images').append($('<img src="'+ path +'" class="question-image">'));
    });


    $('#next-question').one('click', function(){
      // Hide the 'Next Question' button
      trivia.hideNextButton();
      // Go to the next question
      trivia.guessResult();
    });
    
  },
  // method to decrement counter and count unanswered if timer runs out
  timerRunning : function(){
    // if timer still has time left and there are still questions left to ask
    if(trivia.timer > -1 && trivia.currentSet < Object.keys(trivia.questions).length){
      $('#timer').text(trivia.timer);
      trivia.timer--;
        if(trivia.timer === 4){
          $('#timer').addClass('last-seconds');
        }
    }
    // the time has run out and increment unanswered, run result
    else if(trivia.timer === -1){
      trivia.unanswered++;
      trivia.result = false;
      clearInterval(trivia.timerId);
      trivia.timerOn = false;
      resultId = setTimeout(trivia.showNextButton, 1000);
      $('#results').html('<h3>Out of time! ' +'</h3>');
      // $('#results').html('<h3>Out of time! The answer was '+ Object.values(trivia.answers)[trivia.currentSet] +'</h3>');
    }
    // if all the questions have been shown end the game, show results
    else if(trivia.currentSet === Object.keys(trivia.questions).length){
      
      // adds results of game (correct, incorrect, unanswered) to the page
      $('#results')
        .html('<h3>Thank you for playing!</h3>'+
        '<p>Correct: '+ trivia.correct +'</p>'+
        '<p>Incorrect: '+ trivia.incorrect +'</p>'+
        '<p>Unaswered: '+ trivia.unanswered +'</p>'+
        '<p>Please play again!</p>');
      
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
    
    // the answer to the current question being asked
    var currentAnswer = Object.values(trivia.answers)[trivia.currentSet];

    console.log("Clicked: " + $(this).text()); // Debugging line
    console.log("Correct answer: " + currentAnswer); // Debugging line
    
    // if the text of the option picked matches the answer of the current question, increment correct
    if($(this).text() === currentAnswer){
      // turn button green for correct
      $(this).addClass('btn-success').removeClass('btn-info');
      
      trivia.correct++;
      clearInterval(trivia.timerId);
      trivia.timerOn = false;
      // resultId = setTimeout(trivia.guessResult, 1000);
      // $('#results').html('<h3>Correct Answer!</h3>');
    }
    // else the user picked the wrong option, increment incorrect
    else{
      $(this).addClass('btn-success').removeClass('btn-info');
      // $(this).addClass('btn-danger').removeClass('btn-info');
      
      trivia.incorrect++;
      clearInterval(trivia.timerId);
      trivia.timerOn = false;
      // resultId = setTimeout(trivia.guessResult, 1000);
      // $('#results').html('<h3>Better luck next time! '+ currentAnswer +'</h3>');
    }
    trivia.showNextButton();
    
  },
  // method to remove previous question results and options
  guessResult : function(){
    
    // increment to next question set
    trivia.currentSet++;
    console.log("Go to next question:"+trivia.currentSet);

    
    // remove the options and results
    $('.option').remove();
    $('#results h3').remove();
    
    // begin next question
    trivia.nextQuestion();
     
  }

}