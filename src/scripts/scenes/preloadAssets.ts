// CLASS TO PRELOAD ASSETS

import { GameOptions } from '../gameOptions';

// PreloadAssets class extends Phaser.Scene class
export class PreloadAssets extends Phaser.Scene {
  
    // constructor    
    constructor() {
        super({
            key : 'PreloadAssets'
        });
    }
  
    // method to be called during class preloading
    preload() : void {
 
        // load images
        this.load.image('enemy', 'assets/sprites/dd.png');
        this.load.image('enemy2', 'assets/sprites/enemy2.png');
        this.load.image('enemy3', 'assets/sprites/enemy3.png');
        this.load.image('player', 'assets/sprites/Elastic.png');
        this.load.image('bullet', 'assets/sprites/bullet.png');
        this.load.image('coin', 'assets/sprites/otel-logo.png');
    }
  
    // method to be executed when the scene is created
    create() : void {

        // tech background texture (grid + nodes)
        const w = GameOptions.gameSize.width;
        const h = GameOptions.gameSize.height;
        const g = this.add.graphics();
        g.fillStyle(GameOptions.techBgBaseColor, 1);
        g.fillRect(0, 0, w, h);
        g.lineStyle(1, GameOptions.techGridColor, GameOptions.techGridAlpha);
        const spacing = GameOptions.techGridSpacing;
        for (let x = 0; x <= w; x += spacing) {
            g.lineBetween(x, 0, x, h);
        }
        for (let y = 0; y <= h; y += spacing) {
            g.lineBetween(0, y, w, y);
        }
        g.fillStyle(GameOptions.techGridColor, GameOptions.techGridAlpha * 1.2);
        for (let x = spacing; x < w; x += spacing) {
            for (let y = spacing; y < h; y += spacing) {
                g.fillCircle(x, y, 1);
            }
        }
        g.generateTexture('techBg', w, h);
        g.destroy();

        // start StartScene (menu)
        this.scene.start('StartScene');
    }
}