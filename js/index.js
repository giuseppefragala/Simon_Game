var audioLink = {
  GREEN_SOUND: "https://s3.amazonaws.com/freecodecamp/simonSound1.mp3",
  RED_SOUND: "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3",
  YELLOW_SOUND: "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3",
  BLUE_SOUND: "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3",
}

// Theese three const are to change the sound playback velocity. Non implemented in this version
const PLAY_BACK_RATE_DOUBLE = 2.0;
const PLAY_BACK_RATE_NORMAL = 1.0;
const PLAY_BACK_RATE_HALF = 0.5;
const BLINK_FREQUENCE = 250; //used as time basis for all iteractions
const DEFAULT_WAITING_TIME = BLINK_FREQUENCE * 4 * 5; // 5 seconds
const ROUND_MAX = 20; //number of round to guess, to win the game
const colorArray = ["green", "red", "yellow", "blue"]; //used to randomly select one color to add to sequence

var simonSequenceArray = []; //contains the sequence of colors selected by player
var playerSequenceArray = []; //contains the sequence of colors generated by Simon
var on_position = "left"; //indicates on witch position the on-off switch is
var led_off = true; //indicates whether the led can be turned on or off
var led_status = "off"; //indicates ... the led status
var game_can_start = false; //used to start game only if the switch on-off is on "ON" position
var display_count = 1; //used to count game's rounds and show them on the display
var error_by_click = false; // indicates that players had selected the wrong sequence
var waiting_time = DEFAULT_WAITING_TIME;

//object used to show "on" and "off" status of game key color
var colorObject = {
  green:  ["#00a74a", "#13ff7c"],
  red:    ["#9f0f17", "#ff4c4c"],
  yellow: ["#cca707", "#fed93f"],
  blue:   ["#094a8f", "#1c8cff"]
}

// The game object. Contains the methods (functions) for the game
var game = {
  off: function(){
    $(".display").html("");
    //turn off the led
    $(".led").css("background-color","#000");
    led_status = "off";
    
    led_off = true;    
    game_can_start = false;
    game.reset();
  },
  
  on: function(){
    $(".display").html("--");
    led_off = false;
    game_can_start = true;
  },
  
  start: function(){
    if(game_can_start){
      if(display_count === 1){
        game.blink_display("--");
      }
      setTimeout(function(){ //after 2 seconds (BLINK_FREQUENCE * 8 = 250 * 8 = 2000), game can start
        var display_count_00 = "";
        if(display_count < 10){
          display_count_00 = "0" + display_count;           
        }else{
          display_count_00 = display_count;
        }
        $(".display").html(display_count_00);
        game.lets_play();
      }, BLINK_FREQUENCE * 4 * 2); // 2 seconds
    }
  },
  
  reset: function(){
    
    // reset all timeouts
    var id = window.setTimeout(function() {}, 0);
    while (id--) {
      window.clearTimeout(id);
    };
    
    // reset the counter
    display_count = 1;
    
    //reset player sequence
    playerSequenceArray = [];
      
    //reset generated sequence
    simonSequenceArray = [];
    
    //disable user interaction
    $(".color-button").css("pointer-events", "none");
    
    //turn off buttons' "ligth"
    $("#green").css("background-color", colorObject["green"][0]); 
    $("#red").css("background-color", colorObject["red"][0]); 
    $("#yellow").css("background-color", colorObject["yellow"][0]); 
    $("#blue").css("background-color", colorObject["blue"][0]); 
    
  },
  
   //return true if both sequences are the same
  checkSequences: function(){
    var result = simonSequenceArray.length == playerSequenceArray.length && simonSequenceArray.every((element, index)=> element === playerSequenceArray[index] );
    return result;
  },
  
  //check partial player sequence against the generated one, every time player adds a color
  checkAfterClick: function(){
    var topIndex = playerSequenceArray.length;
    return playerSequenceArray.every((element, index)=> element === simonSequenceArray.slice(0, topIndex)[index] );
  },
  
  //Now you dance! 
  lets_play: function(){
    if(display_count <= ROUND_MAX){ //if Player give correct sequence ROUND_MAX times
      if(game.checkSequences() === true){// if player gave the correct sequence
        waiting_time = DEFAULT_WAITING_TIME; //reset the waiting time to its default value (5 seconds)
        playerSequenceArray =[];  // delete the player's sequence                   
        game.new_sequence(); //generate a new sequence with one more color
      }    
      setTimeout(function(){ // wait a time equal to time to play current sequence plus 2 seconds
        $(".color-button").css("pointer-events", "none"); // after this time, player cannot click
        if(game.checkSequences() === false){ // if player's sequence is incorrect
          playerSequenceArray =[];  // delete the player's sequence            
          if(error_by_click === false){//if player didn't yet make an error while clicking, or rather the time is over and player inserted a partial sequence (all colors inserted are correct)
            game.playError();
          }else{
            error_by_click = false;
          }
          waiting_time = DEFAULT_WAITING_TIME;  //reset the waiting time to its default value (5 seconds)
          setTimeout(function(){ // wait 2 seconds
            game.play_sequence();     // play again Simon's sequence (after Simon plays sequence, Player can click again). This repeat until Player insert the correct current sequence
          },(BLINK_FREQUENCE * 4 * 2)); // 2 seconds  
        }else{
          display_count++; //so far so good, can increment display number before call the next round
        }
        //waiting_time = 2000;
        game.start(); //if Player's sequence is correct, game restart after the 10 seconds and a new sequence will be generated
      },(BLINK_FREQUENCE * 2 * display_count) + waiting_time);
      // BLINK_FREQUENCE * 2 * display_count = the time Simon takes to play the current sequence;
    
    }else{ // After ROUND_MAX correct answers Player will win !!
      game.blink_display("W");
      game.playWinner(); //execute winnere sound-color sequecence
      setTimeout(function(){ // wait 2 seconds and than reset and restart game
        game.reset();
        game.start();
      },(BLINK_FREQUENCE * 4 * 2)); // 2 seconds             
    }
  },
  
  new_sequence: function(){
    simonSequenceArray.push(game.randomColor());
    game.play_sequence(); 
  },
  
  play_sequence: function(){
    for(var start = 0; start < simonSequenceArray.length; start++) {
      (function(i){
        setTimeout(function(){
          game.playSound(simonSequenceArray[i]);
          //only after last sequence sound, player can click
          if(i >= simonSequenceArray.length - 1){
            $(".color-button").css("pointer-events", "auto");
          }
        }, (BLINK_FREQUENCE * 2) * i) // BLINK_FREQUENCE = 250 mSec
      })(start);
    }         
  },
  
  playWinner: function(){
    // 3 times yellow (half duration) - 1 time green - 1 time yellow - 1 time green - 1 time yellow - 1 time green
    var duration = BLINK_FREQUENCE;
    setTimeout(function(){ //1 time yellow half duration 
      game.playSound("yellow");
      setTimeout(function(){ //1 time yellow half duration 
        game.playSound("yellow");
        setTimeout(function(){ //1 time yellow half duration 
          game.playSound("yellow");
          setTimeout(function(){ //1 time green
            game.playSound("green");
            setTimeout(function(){ //1 time yellow
              game.playSound("yellow");
              setTimeout(function(){ //1 time green
                game.playSound("green");
                setTimeout(function(){ //1 time yellow
                  game.playSound("yellow");
                  setTimeout(function(){ //1 time green
                    game.playSound("green");
                  }, duration); 
                }, duration);    
              }, duration);    
            }, duration);    
          }, duration);    
        }, duration * 0.5);    
      }, duration * 0.5);    
    }, duration * 0.5);
  },
  
  playError: function(){
    game.playSound("green");
    game.playSound("red");
    game.playSound("yellow");
    game.playSound("blue");
    game.blink_display("!!");
    
    //if player selected "STRICT", after 2 seconds restart the game
    if(led_status === "on"){    
      setTimeout(function(){
       game.reset();
       game.start();
      }, BLINK_FREQUENCE * 4 * 2);       
    }      
   },
  
  playSound: function(color){
    var soundToPlay = new game.audioColor(color);
    soundToPlay.play();
    game.blink_color(color);

  },
  
  audioColor: function(color){
    this.color = color.toUpperCase();
    var audio = document.createElement('audio');
    audio.setAttribute('src', audioLink[this.color + "_SOUND"]);
    return audio;
  },
    
  
  randomColor: function(){
    return colorArray[Math.floor(Math.random() * colorArray.length)];
  },
  
  blink_display: function(stringToBlink){
    $(".display").html(""); //display off      
    setTimeout(function(){
      $(".display").html(stringToBlink); //display on
      setTimeout(function(){
        $(".display").html(""); //display off
        setTimeout(function(){
          $(".display").html(stringToBlink); //display on
        }, BLINK_FREQUENCE);
      }, BLINK_FREQUENCE);        
    }, BLINK_FREQUENCE);
  },
  
  blink_color: function(color){
    var original_color = colorObject[color][0];
    var ligth_color = colorObject[color][1];
    $("#" + color).css("background-color", ligth_color);
    setTimeout(function(){
      $("#" + color).css("background-color", original_color); 
    }, BLINK_FREQUENCE);        
  },
  
};


  $(".on-off").click(function() {
    if(on_position === "left"){
      game.on();      
      $(".on-switch").css("margin-left","22px");
      on_position = "rigth";      
    }else{
      game.off();
      $(".on-switch").css("margin-left","0px");
      on_position = "left";         
    }
  });

  $("#button-strict").click(function() {
    if(!led_off){
      if(led_status === "off"){      
        $(".led").css("background-color","#f00");
        led_status = "on";      
      }else{
        $(".led").css("background-color","#000");
        led_status = "off";         
      }
    }
  });

  $("#button-start").click(function() {
    game.start();
  });

  $('.color-button').mousedown(function() {
    if($(".color-button").css("pointer-events") === "auto"){
      game.playSound($(this).attr("id"));
      playerSequenceArray.push($(this).attr("id"));
      if(game.checkAfterClick() === false){
        playerSequenceArray = [];
        game.playError();
        //after an error player cannot click and have to wait until the current sequence will be played again
        $(".color-button").css("pointer-events", "none");
        error_by_click = true;
      }else{
        waiting_time += BLINK_FREQUENCE * 4; //every time player select a correct color increase the time Simon wait to check sequences by 1 second
      }
    }
  });