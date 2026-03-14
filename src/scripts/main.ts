// MAIN GAME FILE

import Phaser from 'phaser';
import { PreloadAssets } from './scenes/preloadAssets';
import { StartScene } from './scenes/startScene';
import { PlayGame } from './scenes/playGame';
import { GameOverScene } from './scenes/gameOverScene';
import { GameOptions } from './gameOptions';

const scaleObject : Phaser.Types.Core.ScaleConfig = {
    mode        : Phaser.Scale.FIT,                     // adjust size to automatically fit in the window
    autoCenter  : Phaser.Scale.CENTER_BOTH,             // center the game horizontally and vertically
    parent      : 'thegame',
    width       : GameOptions.gameSize.width,
    height      : GameOptions.gameSize.height
}

const configObject : Phaser.Types.Core.GameConfig = {
    type            : Phaser.WEBGL,
    backgroundColor : GameOptions.gameBackgroundColor,
    scale           : scaleObject,
    scene           : [ PreloadAssets, StartScene, PlayGame, GameOverScene ],
    physics         : { default : 'arcade' }
};

new Phaser.Game(configObject);