const DIRECTION = {
    LEFT: "left",
    RIGHT: "right",
    UP: "up",
    DOWN: "down",
  };
  
  class PlayGame extends Phaser.Scene {
  
    jellysnake = [];
    pearl = {};
    squareSize = 15; // The length of a side of the squares. Our image is 15x15 pixels.
    score = 0;
    speed = 1;
    updateDelay = 0;
    maxScore = 0;
    direction = DIRECTION.RIGHT; // The direction of our jellysnake.
    newDirection = null; // A buffer to store the new direction into.
    shouldAddNew = false; // A variable used when an pearl has been eaten. Boolean
    //
    cursors;
    scoreText;
    speedText;
  
    constructor() {
      super("PlayGame");
    }
  
    preload() {
      this.load.image('pearl', 'assets/pearl.png');
      this.load.image('jellysnake', 'assets/jellysnake.png');
    }
  
    create() {
      // Set up a Phaser controller for keyboard input.
      this.cursors = this.input.keyboard.createCursorKeys();
  
      // Generate the initial jellysnake stack. Our jellysnake will be 10 elements long.
      // Beginning at X=150 Y=150 and increasing the X on every iteration.
      for (let i = 0; i < 3; i++) {
        this.jellysnake[i] = this.add.sprite(150 + i * this.squareSize, 150, 'jellysnake'); // Parameters are (X coordinate, Y coordinate, image)
      }
  
      // Generate the first pearl.
      this.generatePearl();
  
      // Speed value
      this.speedText = this.add.text(15, 18, 'Speed: 1', {
        fontSize: '22px',
        fill: '#6A1B9A',
      });
  
      // Score value
      this.scoreText = this.add.text(330, 18, 'Score: 0', {
        fontSize: '22px',
        fill: '#6A1B9A',
      });
  
      this.maxScore = localStorage.getItem('maxScore') || 0;
  
      this.maxScoreText = this.add.text(
        630,
        18,
        `Max Score: ${this.maxScore}`,
        {
          fontSize: '22px',
          fill: '#6A1B9A',
        }
      );
    }
  
    update() {
      // jellysnake movement
      // Handle arrow key presses, while not allowing illegal direction changes that will kill the player.
      if (this.cursors.right.isDown && this.direction !== DIRECTION.LEFT) {
        this.newDirection = DIRECTION.RIGHT;
      } else if (this.cursors.left.isDown && this.direction !== DIRECTION.RIGHT) {
        this.newDirection = DIRECTION.LEFT;
      } else if (this.cursors.up.isDown && this.direction !== DIRECTION.DOWN) {
        this.newDirection = DIRECTION.UP;
      } else if (this.cursors.down.isDown && this.direction !== DIRECTION.UP) {
        this.newDirection = DIRECTION.DOWN;
      }
  
      // A formula to calculate game speed based on the score.
      // The higher the score, the higher the game speed, with a maximum of 10;
      this.speed = Math.min(10, Math.floor(this.score / 5) + 1);
      // Update speed value on the game screen.
      this.speedText.text = `Speed: ${this.speed}`;
  
      // Since the update function of Phaser has an update rate of around 60 FPS,
      // we need to slow that down to make the game playable.
  
      // Increase a counter on every update call.
      this.updateDelay++;
  
      // Do game stuff only if the counter is aliquot to (10 - the game speed).
      // The higher the speed, the more frequently this is fulfilled,
      // making the jellysnake move faster.
      if (this.updateDelay % (10 - this.speed) === 0) {
        // jellysnake movement
  
        let firstCell = this.jellysnake[this.jellysnake.length - 1];
        let lastCell = this.jellysnake.shift();
        // let { x, y } = lastCell;
        let oldLastCellx = lastCell.x;
        let oldLastCelly = lastCell.y;
  
        // If a new direction has been chosen from the keyboard, make it the direction of the jellysnake now.
        if (this.newDirection) {
          this.direction = this.newDirection;
          this.newDirection = null;
        }
  
        // Change the last cell's coordinates relative to the head of the jellysnake, according to the direction.
  
        if (this.direction === DIRECTION.RIGHT) {
          lastCell.x = (firstCell.x + this.squareSize) % (this.squareSize * 52);
          lastCell.y = firstCell.y;
        } else if (this.direction === DIRECTION.LEFT) {
          lastCell.x =
            (firstCell.x - this.squareSize + this.squareSize * 52) %
            (this.squareSize * 52);
          lastCell.y = firstCell.y;
        } else if (this.direction === DIRECTION.UP) {
          lastCell.x = firstCell.x;
          lastCell.y =
            (firstCell.y - this.squareSize + this.squareSize * 40) %
            (this.squareSize * 40);
        } else if (this.direction === DIRECTION.DOWN) {
          lastCell.x = firstCell.x;
          lastCell.y = (firstCell.y + this.squareSize) % (this.squareSize * 40);
        }
  
        // Place the last cell in the front of the stack.
        // Mark it as the first cell.
        this.jellysnake.push(lastCell);
        firstCell = lastCell;
        // End of jellysnake movement
  
        // Increase length of jellysnake if an pearl has been eaten.
        // Create a block in the back of the jellysnake with the old position of the previous last block
        // (it has moved now along with the rest of the jellysnake).
  
        if (this.shouldAddNew) {
          this.jellysnake.unshift(
            this.add.sprite(oldLastCellx, oldLastCelly, 'jellysnake')
          );
          this.shouldAddNew = false;
        }
  
        // Check for pearl collision.
        this.pearlCollision();
  
        // Check for collision with self. The parameter is the head of the jellysnake.
        this.selfCollision(firstCell);
      }
    }
  
    generatePearl() {
     
      const randomX = Math.floor(Math.random() * 52) * this.squareSize;
      const randomY = Math.floor(Math.random() * 40) * this.squareSize;
  
      // Add a new pearl.
      this.pearl = this.add.sprite(randomX, randomY, 'pearl');
      this.pearl.setScale(0.8);
    }
  
    pearlCollision() {
      // Check if any part of the jellysnake is overlapping the pearl.
      // This is needed if the pearl spawns inside the jellysnake.
      for (let i = 0; i < this.jellysnake.length; i++) {
        if (
          this.jellysnake[i].x === this.pearl.x &&
          this.jellysnake[i].y === this.pearl.y
        ) {
          // Next time the jellysnake moves, a new block will be added to its length.
          this.shouldAddNew = true;
  
          // Destroy the old pearl.
          this.pearl.destroy();
  
          // Make a new one.
          this.generatePearl();
  
          // Increase score.
          this.score++;
  
          if (this.score > this.maxScore) {
            this.maxScore = this.score;
            this.maxScoreText.setText('Max Score: ' + this.maxScore);
            localStorage.setItem('maxScore', this.maxScore);
          }
  
          // Refresh scoreboard.
          this.scoreText.text = `Score: ${this.score}`;
        }
      }
    }
  
    selfCollision(head) {
      // Check if the head of the jellysnake overlaps with any part of the jellysnake.
      for (let i = 0; i < this.jellysnake.length - 1; i++) {
        if (head.x === this.jellysnake[i].x && head.y === this.jellysnake[i].y) {
         
          this.jellysnake = [];
          this.scene.start('GameOver', { score: this.score });
        }
      }
    }
  }
  export default PlayGame;
  