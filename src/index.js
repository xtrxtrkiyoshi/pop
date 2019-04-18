import Phaser from "phaser";
import pop from "./assets/pop.png";

import * as firebase from "firebase/app";

import "firebase/database";


firebase.initializeApp({
  apiKey: "AIzaSyC8MB_8t7okThwpTS8aW0JYlIf_lcNraoU",
  authDomain: "pop-34e61.firebaseapp.com",
  databaseURL: "https://pop-34e61.firebaseio.com",
  projectId: "pop-34e61",
  storageBucket: "",
  messagingSenderId: "477113503823"
});

var database = firebase.database();

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 480,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var pop1;
var start;
var pressed;
var notDead;
var extra;
var velocity;
var labelScore;
var scoreKeeper;
var obstacles;
var score;
var key;
var v;

var game = new Phaser.Game(config);

function preload() {
  this.load.image("pop", pop);
}

function create() {

  //sets bg to white
  this.cameras.main.setBackgroundColor('#ffffff');

  pop1 = this.physics.add.image(100, 245, "pop");
  pop1.setScale(0.3);

  start = false;
  pressed = false;
  notDead = true;
  extra = true;
  velocity = 150;
  scoreKeeper = 0;
  score = 0;

  //obstacles
  obstacles = this.add.group();
  addColOfObstacle(this);


  labelScore = this.add.text(320, 20, "0",
                    { font: "30px Arial", fill: "#000000"  });

  //event listener
  key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);



}

function update() {
  if(notDead){
    if(Phaser.Input.Keyboard.JustDown(key) && (pop1.body.velocity.y != 0 || !start)) {
       move(this);
    }  
  } else {
    if(Phaser.Input.Keyboard.JustDown(key)) {
      restartGame(this);
    }  

  }
  

  //up and down goes the ball
    if(pop1.y < 35) {
      pop1.body.velocity.y = velocity;
    }

    if(pop1.y > 445) {
      pop1.body.velocity.y = -velocity;
    }


  
    this.physics.add.overlap(pop1, obstacles, endGame, null, this);

    if(pressed && notDead){
      score += 1;
      labelScore.text = score;
      pressed = false;
      scoreKeeper +=  1;
      if(scoreKeeper == 4) {
        scoreKeeper = 0;
        velocity = velocity + 25;
      }

    }

    //when dead, catch the extra score
    if(!notDead && extra) {
      if(score != 0) { score -= 1; }
      labelScore.text = score;
      extra = false;
      saveScore(score);
    }

    obstacles.children.each(function (child) {
        if(child.body.position.x < -40) {
          child.destroy(child, true);
        }
    });


}

function addOneObstacle(game, x, y) {
  //create obstacle on x, y 
    var obstacle = game.physics.add.image(x, y, 'pop').setInteractive();
    obstacle.setScale(0.3);

    obstacles.add(obstacle);

    //kill if no longer visible

    // game.physics.world.setBoundsCollision(true, true,  true, true);

    // obstacle.setCollideWorldBounds(true);

    // obstacle.onWorldBOunds = true;

    // obstacle.body.world.on('worldbounds', function(body) {
    //   console.log("hello");
    //   if(body.gameObject === game) {
    //     body.kill();
    //   }  
    // }, game);
}

function addColOfObstacle(game) {
  if(!start) {
      var hole = Math.floor(Math.random() * 6);

      for (var i = 0; i < 8; i++) {
        if(i!= hole && i != hole + 1) {
          addOneObstacle(game, 200, i*60+30);
        }
      }
      
      hole = Math.floor(Math.random() * 6);

      for (var i = 0; i < 8; i++) {
        if(i!= hole && i != hole + 1) {
          addOneObstacle(game, 400, i*60+30);
        }
      }

      hole = Math.floor(Math.random() * 6);

      for (var i = 0; i < 8; i++) {
        if(i!= hole && i != hole + 1) {
          addOneObstacle(game, 600, i*60+30);
        }
      }     
    } else {
      var hole = Math.floor(Math.random() * 6);

      for (var i = 0; i < 8; i++) {
        if(i!= hole && i != hole + 1) {
          addOneObstacle(game, 800, i*60+30);
        }
      }
    }
}

function move(game) {
  console.log(notDead);
  if(notDead){
      if(!start) {
        //beginning
        pop1.body.velocity.y = velocity; 
        start = true;
        addColOfObstacle(game);
      } else {
        //after the first spacebar
        v = pop1.body.velocity.y;      
        pressed = true;
        pop1.body.velocity.y = 0;
        obstacles.children.iterate(function (child) {
            child.body.velocity.x = -1000;
        });

        game.time.delayedCall(215, stop, [game], this);
        
      }
  }
}

function stop(game) {
  //stops the obstacles
  obstacles.children.iterate(function (child) {
      child.body.velocity.x = 0;
  });
  //if not dead, resumes the ball and displays the last column of obstacle
    if(notDead){
      pop1.body.velocity.y = v;  
      addColOfObstacle(game);
    }
}

function endGame() {
  //stops the ball
  pop1.body.velocity.y = 0;
  notDead = false;
  stop();
}

function restartGame(game) {
  //restarts the game
  game.scene.restart();
}

function saveScore(score) {
  var temp = firebase.database().ref().push().getKey()
  firebase.database().ref().child(temp + ' :  ' + score).set({score: "true"});
}
