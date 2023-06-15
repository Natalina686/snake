export default class Jellysnake{
    constructor(scene) {
        this.scene = scene;
        this.timeLastMove = 0;
        this.moveInterval = 250;

        this.tileSize = 16;

        this.direction = Phaser.Math.Vector2.RIGHT;
        this.body = [];

        this.body.push(
            this.scene.add
            .rectangle(this.scene.game.config.width / 2, this.scene.game.config.height / 2, this.tileSize, this.tileSize, 0xff0000)
            .setOrigin(0)
        );

        this.pearl = this.scene.add
            .rectangle(0,0, this.tileSize, this.tileSize, 0x00ff00).setOrigin(0);

        this.placepearl();

        this.scene.input.keyboard.on('keydown', e => {
            this.keydown(e);
        })
    }

    placepearl() {
        if(this.pearl == this.body){
            this.placepearl();
        } else{
            this.pearl.x = Math.floor( Math.random() * this.scene.game.config.width / this.tileSize) * this.tileSize;
        this.pearl.y = Math.floor( Math.random() * this.scene.game.config.height / this.tileSize) * this.tileSize;
        }
        
    }

    keydown(event) {
        console.log(event);
        
        switch(event.keyCode) {
            case 37: //left
                if(this.direction !== Phaser.Math.Vector2.RIGHT){
                    this.direction = Phaser.Math.Vector2.LEFT;
                }
                break;
            case 38: //UP
                if(this.direction !== Phaser.Math.Vector2.DOWN){
                    this.direction = Phaser.Math.Vector2.UP;
            }
                    break;
            case 39: //RIGHT
                if(this.direction !== Phaser.Math.Vector2.LEFT){
                    this.direction = Phaser.Math.Vector2.RIGHT;
            }
                break;
            case 40: //DOWN
                if(this.direction !== Phaser.Math.Vector2.UP){
                    this.direction = Phaser.Math.Vector2.DOWN;
            }
                break;
        }
    }

    update(time) {
        if(time >= this.timeLastMove + this.moveInterval)
        {
            this.timeLastMove = time;
            this.move();
        }
        
    }

    checkpearl(x, y) {
        if(this.pearl.x === x && this.pearl.y === y)
        {
            this.placepearl();
            this.body.push(
                this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, 0xffffff).setOrigin(0));
        }

    }

    checkDeath(x, y){
        if(x < 0 || x >= this.scene.game.config.width || y < 0 || y >= this.scene.game.config.height){
            this.scene.scene.restart();
        }

        let tail = this.body.slice(1);
        if(tail.some(segment =>  segment.x === x && segment.y === y)){
            this.scene.scene.restart();
        }
    }

    move() {

        let x = this.body[0].x + this.direction.x * this.tileSize;
        let y = this.body[0].y + this.direction.y * this.tileSize;

        this.checkpearl(x, y);
        this.checkDeath(x, y);


        for(let i = this.body.length - 1; i > 0; i--)
        {
            this.body[i].x = this.body[i-1].x;
            this.body[i].y = this.body[i-1].y;
        }
        this.body[0].x = x; 
        this.body[0].y = y;
    }
}