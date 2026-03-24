// CONFIGURABLE GAME OPTIONS
// changing these values will affect gameplay

export const GameOptions : any = {

    gameSize : {
        width               : 800,      // width of the game, in pixels
        height              : 800       // height of the game, in pixels
    },
    gameBackgroundColor     : 0x1a2230, // game background color (muted tech dark)
    techBgBaseColor         : 0x1a2230, // tech background fill
    techGridColor           : 0x2d3e50, // grid lines (muted blue-gray)
    techGridAlpha           : 0.12,     // grid line opacity
    techGridSpacing         : 36,       // pixels between grid lines

    playerSpeed             : 100,      // player speed, in pixels per second

    // Pointer / touch: move toward cursor (hover on desktop) or finger (touch). WASD when not steering.
    pointerSteerHover     : true,       // if true, mouse over the playfield steers without holding click
    pointerDeadZone       : 14,         // min distance (px) from player before pointer steering applies
    enemySpeed              : 50,       // enemy speed, in pixels per second
    bulletSpeed             : 200,      // bullet speed, in pixels per second
    bulletRate              : 1000,     // bullet rate, in milliseconds per bullet
    enemyRate               : 800,      // enemy rate, in milliseconds per enemy
    magnetRadius            : 100,      // radius of the circle within which the coins are being attracted

    expPerLevel              : 15,      // coins needed for level 2 upgrade
    level3ScoreThreshold      : 100,     // coins needed for level 3 (other level-2 reward)
    level4ScoreThreshold      : 250,     // coins needed for level 4 (Full Stack Visibility)
    level5ScoreThreshold      : 500,     // coins needed for level 5 (10% move, bullet, fire rate, magnet)
    levelUpTitleWrapWidth    : 680,     // max width for level-up title text (keeps on screen)
    levelBarHeight           : 12,      // experience bar height in pixels
    levelBarWidth            : 200,     // experience bar width

    // enemy sizes (original enemy = 32x36)
    enemy1Width               : 32,
    enemy1Height               : 36,
    bossSizeScale             : 1.75,   // boss is 75% larger than enemy1
    bossHealth                : 5,

    // coin sizes and values
    coinSize                  : 15,     // normal coin display size
    bossCoinSize              : 30,     // boss drop = 100% bigger (2x)
    bossCoinWorth             : 5,

    bossSpawnAtScore          : 50,     // spawn boss 1 (enemy-style) when player reaches this score

    boss2SpawnAtScore         : 200,    // spawn boss 2 (enemy2-style, 75% larger, 10 health)
    boss2Health               : 10,
    boss2CoinWorth            : 10,

    boss3SpawnAtScore         : 300,    // spawn boss 3 (enemy3-style, 75% larger, 10 health, 10 coins)
    boss3Health               : 10,
    boss3CoinWorth            : 10,

    allBossesSpawnAtScore     : 400,    // spawn all 3 bosses (one of each)

    spawnRateIncreaseAtScore  : 350,    // at 350 coins spawn rates +25%
    spawnRateIncreaseStep     : 50,     // every 50 coins after that, another +25%
    spawnRateMultiplier       : 1.25,

    enemy3SpawnAtScore        : 150,    // enemy3 (faster) joins when player reaches this score
    enemy3SpeedMultiplier     : 1.5,   // enemy3 moves 50% faster

    highScoreKey             : 'o11ySurvivorsHighScore'  // localStorage key for high score
}