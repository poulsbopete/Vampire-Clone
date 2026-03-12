// THE GAME ITSELF

// modules to import
import { GameOptions } from '../gameOptions';   // game options   

// PlayGame class extends Phaser.Scene class
export class PlayGame extends Phaser.Scene {

    constructor() {
        super({
            key : 'PlayGame'
        });
    }

    controlKeys     : any;                                                  // keys used to move the player
    player          : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;    // the player
    enemyGroup      : Phaser.Physics.Arcade.Group;                          // group with all enemies
    coinGroup       : Phaser.Physics.Arcade.Group;                          // group with all coins

    // method to be called once the instance has been created
    create() : void {

        // add player, enemies group, coins group and bullets group
        this.player = this.physics.add.sprite(GameOptions.gameSize.width / 2, GameOptions.gameSize.height / 2, 'player');
        this.enemyGroup = this.physics.add.group();
        this.coinGroup = this.physics.add.group();
        const bulletGroup : Phaser.Physics.Arcade.Group = this.physics.add.group();

        // set keyboard controls
        const keyboard : Phaser.Input.Keyboard.KeyboardPlugin = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin; 
        this.controlKeys = keyboard.addKeys({
            'up'    : Phaser.Input.Keyboard.KeyCodes.W,
            'left'  : Phaser.Input.Keyboard.KeyCodes.A,
            'down'  : Phaser.Input.Keyboard.KeyCodes.S,
            'right' : Phaser.Input.Keyboard.KeyCodes.D
        });
        
        // set outer rectangle and inner rectangle; enemy spawn area is between these rectangles
        const outerRectangle : Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(-100, -100, GameOptions.gameSize.width + 200, GameOptions.gameSize.height + 200);
        const innerRectangle : Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(-50, -50, GameOptions.gameSize.width + 100, GameOptions.gameSize.height + 100);

        // timer event to add enemies
        this.time.addEvent({
            delay       : GameOptions.enemyRate,
            loop        : true,
            callback    : () => {
                const spawnPoint : Phaser.Geom.Point = Phaser.Geom.Rectangle.RandomOutside(outerRectangle, innerRectangle);
                const enemy : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'enemy'); 
                this.enemyGroup.add(enemy); 
            },
        });

        // timer event to fire bullets
        this.time.addEvent({
            delay       : GameOptions.bulletRate,
            loop        : true,
            callback    : () => {
                const closestEnemy : any = this.physics.closest(this.player, this.enemyGroup.getMatching('visible', true));
                if (closestEnemy != null) {
                    const bullet : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody = this.physics.add.sprite(this.player.x, this.player.y, 'bullet'); 
                    bulletGroup.add(bullet); 
                    this.physics.moveToObject(bullet, closestEnemy, GameOptions.bulletSpeed);
                }
            },
        });

        // bullet Vs enemy collision
        this.physics.add.collider(bulletGroup, this.enemyGroup, (bullet : any, enemy : any) => {
            const coin : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody = this.physics.add.sprite(enemy.x, enemy.y, 'coin'); 
            this.coinGroup.add(coin); 
            bulletGroup.killAndHide(bullet);
            bullet.body.checkCollision.none = true;
            this.enemyGroup.killAndHide(enemy);
            enemy.body.checkCollision.none = true;
        });

        // player Vs enemy collision
        this.physics.add.collider(this.player, this.enemyGroup, () => {
            this.scene.restart();
        });  

        // player Vs coin collision
        this.physics.add.collider(this.player, this.coinGroup, (player : any, coin : any) => {
            this.coinGroup.killAndHide(coin);
            coin.body.checkCollision.none = true;
        });  
    }

    // metod to be called at each frame
    update() {   
        
        // set movement direction according to keys pressed
        let movementDirection : Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);  
        if (this.controlKeys.right.isDown) {
            movementDirection.x ++;  
        }
        if (this.controlKeys.left.isDown) {
            movementDirection.x --;
        }
        if (this.controlKeys.up.isDown) {
            movementDirection.y --;    
        }
        if (this.controlKeys.down.isDown) {
            movementDirection.y ++;    
        }
        
        // set player velocity according to movement direction
        this.player.setVelocity(0, 0);
        if (movementDirection.x == 0 || movementDirection.y == 0) {
            this.player.setVelocity(movementDirection.x * GameOptions.playerSpeed, movementDirection.y * GameOptions.playerSpeed);
        }
        else {
            this.player.setVelocity(movementDirection.x * GameOptions.playerSpeed / Math.sqrt(2), movementDirection.y * GameOptions.playerSpeed / Math.sqrt(2));    
        } 

        // get coins inside magnet radius and move them towards player
        const coinsInCircle : Phaser.Physics.Arcade.Body[] = this.physics.overlapCirc(this.player.x, this.player.y, GameOptions.magnetRadius, true, true) as Phaser.Physics.Arcade.Body[];
        coinsInCircle.forEach((body : any) => {
            const bodySprite : Phaser.Physics.Arcade.Sprite = body.gameObject;
            if (bodySprite.texture.key == 'coin') {
                this.physics.moveToObject(bodySprite, this.player, 500);
            }
        })

        // move enemies towards player
        this.enemyGroup.getMatching('visible', true).forEach((enemy : any) => {
            this.physics.moveToObject(enemy, this.player, GameOptions.enemySpeed);
        });
    }
}