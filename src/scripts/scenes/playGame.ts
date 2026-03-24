// PLAY GAME SCENE

import { GameOptions } from '../gameOptions';

export class PlayGame extends Phaser.Scene {

    constructor() {
        super({
            key : 'PlayGame'
        });
    }

    controlKeys     : any;
    player          : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    enemyGroup      : Phaser.Physics.Arcade.Group;
    coinGroup       : Phaser.Physics.Arcade.Group;
    bulletGroup     : Phaser.Physics.Arcade.Group | null = null;
    score           : number = 0;
    scoreText       : Phaser.GameObjects.Text | null = null;
    level           : number = 1;
    levelText       : Phaser.GameObjects.Text | null = null;
    expBarBg        : Phaser.GameObjects.Graphics | null = null;
    expBarFill      : Phaser.GameObjects.Graphics | null = null;
    bulletTimer       : Phaser.Time.TimerEvent | null = null;
    hasSpreadShot     : boolean = false;
    hasDoubleFireRate : boolean = false;
    levelUpOverlay  : Phaser.GameObjects.Container | null = null;
    scenePaused     : boolean = false;
    bossSpawned        : boolean = false;
    boss2Spawned       : boolean = false;
    boss3Spawned       : boolean = false;
    allBossesSpawned   : boolean = false;
    lastSpawnRateTier  : number = 0;
    enemySpawnTimer    : Phaser.Time.TimerEvent | null = null;
    enemy3SpawnTimer   : Phaser.Time.TimerEvent | null = null;
    level3OfferShown   : boolean = false;
    level4OfferShown       : boolean = false;
    level5OfferShown       : boolean = false;
    hasFullStackVisibility : boolean = false;  // level 4: pierce 1 enemy + shield
    fireRateMultiplier     : number = 1;      // level 5: 10% faster fire rate
    shieldActive           : boolean = false;
    boss1FirstCoinCollectedShown : boolean = false;
    playerSpeedMultiplier        : number = 1;
    boss2FirstCoinCollectedShown  : boolean = false;
    magnetRadiusMultiplier       : number = 1;
    boss3FirstCoinCollectedShown  : boolean = false;
    bulletSpeedMultiplier        : number = 1;
    private _levelUpKeyHandler    : ((e: KeyboardEvent) => void) | null = null;
    private _bossOverlayKeyHandler: ((e: KeyboardEvent) => void) | null = null;
    private _activeBossOverlay    : Phaser.GameObjects.Container | null = null;
    private _userPaused           : boolean = false;
    private _pauseOverlay         : Phaser.GameObjects.Container | null = null;
    private _pauseKey             : Phaser.Input.Keyboard.Key | null = null;
    private _shieldBubble         : Phaser.GameObjects.Graphics | null = null;

    create() : void {

        this.score = 0;
        this.level = 1;
        this.hasSpreadShot = false;
        this.hasDoubleFireRate = false;
        this.scenePaused = false;
        this.bossSpawned = false;
        this.boss2Spawned = false;
        this.boss3Spawned = false;
        this.allBossesSpawned = false;
        this.lastSpawnRateTier = 0;
        this.level3OfferShown = false;
        this.level4OfferShown = false;
        this.level5OfferShown = false;
        this.hasFullStackVisibility = false;
        this.fireRateMultiplier = 1;
        this.shieldActive = false;
        this.boss1FirstCoinCollectedShown = false;
        this.playerSpeedMultiplier = 1;
        this.boss2FirstCoinCollectedShown = false;
        this.magnetRadiusMultiplier = 1;
        this.boss3FirstCoinCollectedShown = false;
        this.bulletSpeedMultiplier = 1;
        if (this._activeBossOverlay) {
            this._activeBossOverlay.destroy();
            this._activeBossOverlay = null;
        }
        this._userPaused = false;
        if (this._pauseOverlay) {
            this._pauseOverlay.destroy();
            this._pauseOverlay = null;
        }
        if (this._shieldBubble) {
            this._shieldBubble.destroy();
            this._shieldBubble = null;
        }

        // Office playfield: tiled perimeter, solid center (no gameplay impact)
        this.drawOfficePlayfield();

        // world bounds so player and projectiles stay on screen
        this.physics.world.setBounds(0, 0, GameOptions.gameSize.width, GameOptions.gameSize.height);

        // add player, enemies group, coins group and bullets group
        this.player = this.physics.add.sprite(GameOptions.gameSize.width / 2, GameOptions.gameSize.height / 2, 'player');
        this.player.setCollideWorldBounds(true);
        this.enemyGroup = this.physics.add.group();
        this.coinGroup = this.physics.add.group();
        this.bulletGroup = this.physics.add.group();

        // set keyboard controls
        const keyboard : Phaser.Input.Keyboard.KeyboardPlugin = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
        this.controlKeys = keyboard.addKeys({
            'up'    : Phaser.Input.Keyboard.KeyCodes.W,
            'left'  : Phaser.Input.Keyboard.KeyCodes.A,
            'down'  : Phaser.Input.Keyboard.KeyCodes.S,
            'right' : Phaser.Input.Keyboard.KeyCodes.D
        });
        this._pauseKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);

        // Pointer / touch: capture moves on the canvas (GitHub Pages, tablets)
        this.input.mouse?.disableContextMenu();
        this.input.addPointer(1);

        // set outer rectangle and inner rectangle; enemy spawn area is between these rectangles
        const outerRectangle : Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(-100, -100, GameOptions.gameSize.width + 200, GameOptions.gameSize.height + 200);
        const innerRectangle : Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(-50, -50, GameOptions.gameSize.width + 100, GameOptions.gameSize.height + 100);
        const baseEnemyRate = GameOptions.enemyRate;
        this.enemySpawnTimer = this.time.addEvent({
            delay: baseEnemyRate,
            loop: true,
            callback: () => {
                if (this.scenePaused) return;
                const spawnPoint : Phaser.Geom.Point = Phaser.Geom.Rectangle.RandomOutside(outerRectangle, innerRectangle);
                const useEnemy2 = this.score >= 20 && Math.random() < 0.5;
                const key = useEnemy2 ? 'enemy2' : 'enemy';
                const enemy : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, key);
                enemy.setDisplaySize(GameOptions.enemy1Width, GameOptions.enemy1Height);
                enemy.setData('health', useEnemy2 ? 2 : 1);
                enemy.setData('speedMultiplier', 1);
                enemy.setData('isBoss', false);
                enemy.setData('isBoss2', false);
                enemy.setData('isBoss3', false);
                this.enemyGroup.add(enemy);
            },
        });

        this.enemy3SpawnTimer = this.time.addEvent({
            delay: baseEnemyRate,
            loop: true,
            callback: () => {
                if (this.scenePaused) return;
                if (this.score < GameOptions.enemy3SpawnAtScore) return;
                const spawnPoint = Phaser.Geom.Rectangle.RandomOutside(outerRectangle, innerRectangle);
                const enemy = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'enemy3');
                enemy.setDisplaySize(GameOptions.enemy1Width, GameOptions.enemy1Height);
                enemy.setData('health', 1);
                enemy.setData('speedMultiplier', GameOptions.enemy3SpeedMultiplier);
                enemy.setData('isBoss', false);
                enemy.setData('isBoss2', false);
                enemy.setData('isBoss3', false);
                this.enemyGroup.add(enemy);
            },
        });

        const bulletDelay = GameOptions.bulletRate;
        this.bulletTimer = this.time.addEvent({
            delay: bulletDelay,
            loop: true,
            callback: () => this.fireBullets(),
        });

        // bullet Vs enemy overlap (overlap = no bounce; Full Stack Visibility: bullet pierces 1st enemy, expires on 2nd)
        this.physics.add.overlap(this.bulletGroup, this.enemyGroup, (bullet : any, enemy : any) => {
            const hitList: any[] = bullet.getData('enemiesHit') || [];
            if (hitList.indexOf(enemy) >= 0) return;
            hitList.push(enemy);
            bullet.setData('enemiesHit', hitList);

            const health = enemy.getData('health') ?? 1;
            enemy.setData('health', health - 1);
            if (enemy.getData('health') <= 0) {
                const isBoss3 = enemy.getData('isBoss3') === true;
                const isBoss2 = enemy.getData('isBoss2') === true;
                const isBoss = enemy.getData('isBoss') === true;
                const isAnyBoss = isBoss || isBoss2 || isBoss3;
                const coinSize = isAnyBoss ? GameOptions.bossCoinSize : GameOptions.coinSize;
                const worth = isBoss3 ? GameOptions.boss3CoinWorth : (isBoss2 ? GameOptions.boss2CoinWorth : (isBoss ? GameOptions.bossCoinWorth : 1));
                const coin = this.physics.add.sprite(enemy.x, enemy.y, 'coin');
                coin.setDisplaySize(coinSize, coinSize);
                coin.setData('worth', worth);
                coin.setData('fromBoss', isBoss);
                coin.setData('fromBoss2', isBoss2);
                coin.setData('fromBoss3', isBoss3);
                this.coinGroup.add(coin);
                this.enemyGroup.killAndHide(enemy);
                enemy.body.checkCollision.none = true;
            }

            const hitsLeft = bullet.getData('hitsLeft');
            if (this.hasFullStackVisibility && hitsLeft != null && hitsLeft > 1) {
                bullet.setData('hitsLeft', hitsLeft - 1);
                return;
            }
            this.bulletGroup!.killAndHide(bullet);
            bullet.body.checkCollision.none = true;
        });

        // player Vs enemy (shield absorbs one hit when Full Stack Visibility active; that enemy is destroyed)
        this.physics.add.collider(this.player, this.enemyGroup, (playerObj : any, enemy : any) => {
            if (this.shieldActive) {
                this.shieldActive = false;
                this.enemyGroup.killAndHide(enemy);
                enemy.body.checkCollision.none = true;
                return;
            }
            this.saveHighScore();
            this.scene.start('GameOverScene', { score: this.score });
        });  

        // player Vs coin collision (normal coin = 1, boss coin = 5)
        this.physics.add.collider(this.player, this.coinGroup, (player : any, coin : any) => {
            this.coinGroup.killAndHide(coin);
            coin.body.checkCollision.none = true;
            const worth = coin.getData('worth') ?? 1;
            this.score += worth;
            this.updateScoreDisplay();
            this.saveHighScore();
            this.updateLevelBar();
            // First time collecting Boss 1's large coin: overlay + 20% movement speed
            if (coin.getData('fromBoss') && !this.boss1FirstCoinCollectedShown) {
                this.boss1FirstCoinCollectedShown = true;
                this.playerSpeedMultiplier = 1.2;
                this.showBoss1CongratulationsOverlay();
            }
            // First time collecting Boss 2's coin: overlay + 15% magnet radius
            if (coin.getData('fromBoss2') && !this.boss2FirstCoinCollectedShown) {
                this.boss2FirstCoinCollectedShown = true;
                this.magnetRadiusMultiplier = 1.15;
                this.showBoss2CongratulationsOverlay();
            }
            // First time collecting Boss 3's coin: overlay + 10% bullet speed
            if (coin.getData('fromBoss3') && !this.boss3FirstCoinCollectedShown) {
                this.boss3FirstCoinCollectedShown = true;
                this.bulletSpeedMultiplier = 1.1;
                this.showBoss3CongratulationsOverlay();
            }
            if (this.score === GameOptions.expPerLevel && !this.hasSpreadShot && !this.hasDoubleFireRate) {
                this.levelUp();
            }
            if (this.score >= GameOptions.level3ScoreThreshold && this.level === 2 && !this.level3OfferShown) {
                this.level3OfferShown = true;
                this.levelUp3();
            }
            if (this.score >= GameOptions.level4ScoreThreshold && this.level === 3 && !this.level4OfferShown) {
                this.level4OfferShown = true;
                this.levelUp4();
            }
            if (this.score >= GameOptions.level5ScoreThreshold && this.level === 4 && !this.level5OfferShown) {
                this.level5OfferShown = true;
                this.levelUp5();
            }
            if (this.score >= GameOptions.bossSpawnAtScore && !this.bossSpawned) {
                this.bossSpawned = true;
                this.spawnBoss(outerRectangle, innerRectangle);
            }
            if (this.score >= GameOptions.boss2SpawnAtScore && !this.boss2Spawned) {
                this.boss2Spawned = true;
                this.spawnBoss2(outerRectangle, innerRectangle);
            }
            if (this.score >= GameOptions.boss3SpawnAtScore && !this.boss3Spawned) {
                this.boss3Spawned = true;
                this.spawnBoss3(outerRectangle, innerRectangle);
            }
            if (this.score >= GameOptions.allBossesSpawnAtScore && !this.allBossesSpawned) {
                this.allBossesSpawned = true;
                this.spawnAllBosses(outerRectangle, innerRectangle);
            }
            this.maybeUpdateSpawnRates(outerRectangle, innerRectangle);
        });

        // top UI: level + exp bar, then score
        const barX = GameOptions.gameSize.width / 2 - GameOptions.levelBarWidth / 2;
        const barY = 14;
        this.levelText = this.add.text(barX, 4, 'Level 1', {
            fontSize: '16px',
            color: '#bdc3c7'
        }).setScrollFactor(0);
        this.expBarBg = this.add.graphics().setScrollFactor(0);
        this.expBarFill = this.add.graphics().setScrollFactor(0);
        this.drawExpBar(0);
        this.scoreText = this.add.text(16, barY + GameOptions.levelBarHeight + 8, `Score: ${this.score}`, {
            fontSize: '24px',
            color: '#ecf0f1'
        }).setScrollFactor(0);
    }

    private drawOfficePlayfield(): void {
        const { width, height } = GameOptions.gameSize;
        const g = this.add.graphics().setDepth(-1);

        // --- 8-bit style: blue-grey floor (tile grid) ---
        const tileSize = 32;
        const floorDark = 0x252a32;   // dark blue-grey
        const floorMid = 0x2e3540;    // slightly lighter blue-grey for checker
        g.fillStyle(floorDark, 1);
        g.fillRect(0, 0, width, height);
        for (let ty = 0; ty < height; ty += tileSize) {
            for (let tx = 0; tx < width; tx += tileSize) {
                const checker = ((tx / tileSize) + (ty / tileSize)) % 2 === 0;
                g.fillStyle(checker ? floorMid : floorDark, 1);
                g.fillRect(tx, ty, tileSize, tileSize);
            }
        }

        // inner play area bounds (solid center drawn last so it covers perimeter lines)
        const margin = 80;
        const innerX = margin;
        const innerY = margin;
        const innerW = width - margin * 2;
        const innerH = height - margin * 2;

        // --- 8-bit cubicles: chunky walls + desks/chairs (blue-grey) ---
        const cellW = 80;
        const cellH = 76;
        const wallColor = 0x4a5460;
        const wallThick = 4;
        const deskColor = 0x3e4650;
        const chairColor = 0x343d48;
        for (let cx = 0; cx < width; cx += cellW) {
            for (let cy = 0; cy < height; cy += cellH) {
                const cellRight = cx + cellW;
                const cellBottom = cy + cellH;
                if (cellRight > innerX && cx < innerX + innerW && cellBottom > innerY && cy < innerY + innerH) {
                    continue;
                }
                const pad = 6;
                const left = cx + pad;
                const top = cy + pad;
                const cellInnerW = cellW - pad * 2;
                const cellInnerH = cellH - pad * 2;
                // desk (chunky rect)
                const deskW = Math.floor(cellInnerW * 0.7 / 8) * 8;
                const deskH = Math.floor(cellInnerH * 0.32 / 8) * 8;
                const deskX = left + Math.floor((cellInnerW - deskW) / 2 / 8) * 8;
                const deskY = top + 8;
                g.fillStyle(deskColor, 1);
                g.fillRect(deskX, deskY, deskW, deskH);
                g.lineStyle(1, 0x2d343e, 0.8);
                g.strokeRect(deskX, deskY, deskW, deskH);
                // chair (small rect)
                const chairW = Math.floor(cellInnerW * 0.3 / 8) * 8;
                const chairH = Math.floor(cellInnerH * 0.26 / 8) * 8;
                const chairX = left + Math.floor((cellInnerW - chairW) / 2 / 8) * 8;
                const chairY = top + cellInnerH - chairH - 8;
                g.fillStyle(chairColor, 1);
                g.fillRect(chairX, chairY, chairW, chairH);
                g.lineStyle(1, 0x252a32, 0.8);
                g.strokeRect(chairX, chairY, chairW, chairH);
            }
        }
        // cubicle divider lines (8-bit thick)
        g.lineStyle(wallThick, wallColor, 1);
        for (let x = 0; x <= width; x += cellW) {
            g.lineBetween(x, 0, x, height);
        }
        for (let y = 0; y <= height; y += cellH) {
            g.lineBetween(0, y, width, y);
        }

        // center: one large solid area (drawn last so no tiles or lines show through)
        const playFloor = 0x2d343e;
        g.fillStyle(playFloor, 1);
        g.fillRect(innerX, innerY, innerW, innerH);
        g.lineStyle(2, 0x424a54, 0.9);
        g.strokeRect(innerX, innerY, innerW, innerH);
    }

    private drawExpBar(ratio: number): void {
        const barX = GameOptions.gameSize.width / 2 - GameOptions.levelBarWidth / 2;
        const barY = 28;
        const w = GameOptions.levelBarWidth;
        const h = GameOptions.levelBarHeight;
        this.expBarBg!.clear();
        this.expBarBg!.fillStyle(0x2d3e50, 0.9);
        this.expBarBg!.fillRoundedRect(barX, barY, w, h, 2);
        this.expBarFill!.clear();
        this.expBarFill!.fillStyle(0x5dade2, 0.95);
        this.expBarFill!.fillRoundedRect(barX, barY, Math.max(0, w * ratio), h, 2);
    }

    private updateLevelBar(): void {
        let ratio: number;
        if (this.level === 1) {
            ratio = this.score < GameOptions.expPerLevel
                ? this.score / GameOptions.expPerLevel
                : 1;
        } else if (this.level === 2 && this.score < GameOptions.level3ScoreThreshold) {
            ratio = (this.score - GameOptions.expPerLevel) / (GameOptions.level3ScoreThreshold - GameOptions.expPerLevel);
        } else if (this.level === 3 && this.score < GameOptions.level4ScoreThreshold) {
            ratio = (this.score - GameOptions.level3ScoreThreshold) / (GameOptions.level4ScoreThreshold - GameOptions.level3ScoreThreshold);
        } else if (this.level === 4 && this.score < GameOptions.level5ScoreThreshold) {
            ratio = (this.score - GameOptions.level4ScoreThreshold) / (GameOptions.level5ScoreThreshold - GameOptions.level4ScoreThreshold);
        } else {
            ratio = 1;
        }
        this.drawExpBar(ratio);
        if (this.levelText) {
            this.levelText.setText(`Level ${this.level}`);
        }
    }

    private fireBullets(): void {
        if (!this.bulletGroup) return;
        const closestEnemy: any = this.physics.closest(this.player, this.enemyGroup.getMatching('visible', true));
        if (closestEnemy == null) return;
        const angleToEnemy = Phaser.Math.Angle.Between(this.player.x, this.player.y, closestEnemy.x, closestEnemy.y);
        const bulletSpeed = GameOptions.bulletSpeed * this.bulletSpeedMultiplier;
        const addBullet = (bx: number, by: number, vx: number, vy: number) => {
            const bullet = this.physics.add.sprite(bx, by, 'bullet');
            this.bulletGroup!.add(bullet);
            bullet.setVelocity(vx, vy);
            if (this.hasFullStackVisibility) {
                bullet.setData('hitsLeft', 2);
                bullet.setData('enemiesHit', []);
            }
        };
        if (this.hasSpreadShot) {
            const spreadAngle = Math.PI / 8;
            for (const offset of [-spreadAngle, 0, spreadAngle]) {
                const a = angleToEnemy + offset;
                const vx = Math.cos(a) * bulletSpeed;
                const vy = Math.sin(a) * bulletSpeed;
                addBullet(this.player.x, this.player.y, vx, vy);
            }
        } else {
            const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
            this.bulletGroup.add(bullet);
            this.physics.moveToObject(bullet, closestEnemy, bulletSpeed);
            if (this.hasFullStackVisibility) {
                bullet.setData('hitsLeft', 2);
                bullet.setData('enemiesHit', []);
            }
        }
    }

    private levelUp(): void {
        this.level = 2;
        this.updateLevelBar();
        this.showLevelUpOverlay(
            'Congratulations! You have collected enough OpenTelemetry knowledge to implement Metrics',
            [
                { label: '1 - Spread shot (3 bullets)', onPick: () => this.applyUpgrade('spread') },
                { label: '2 - Double fire rate', onPick: () => this.applyUpgrade('doubleRate') },
            ],
            'Choose one reward:',
            'Warning: New competitors are coming for your business'
        );
    }

    private levelUp3(): void {
        this.level = 3;
        this.updateLevelBar();
        const otherReward = this.hasSpreadShot
            ? { label: '1 - Double fire rate (you keep spread shot)', onPick: () => this.applyLevel3SecondUpgrade() }
            : { label: '1 - Spread shot (3 bullets) (you keep double rate)', onPick: () => this.applyLevel3SecondUpgrade() };
        this.showLevelUpOverlay(
            'Congratulations! You have collected enough OpenTelemetry knowledge to implement Metrics and Logs',
            [otherReward],
            'You get the second upgrade—you now have both:',
            'Warning: New competitors are coming for your business'
        );
    }

    private levelUp4(): void {
        this.level = 4;
        this.updateLevelBar();
        this.showLevelUpOverlay(
            'Congratulations! You have collected enough OpenTelemetry knowledge to implement Metrics, Logs, and Traces',
            [{ label: '1 - Full Stack Visibility (pierce + shield)', onPick: () => this.applyFullStackVisibility() }],
            'You get an upgrade:'
        );
    }

    private levelUp5(): void {
        this.level = 5;
        this.playerSpeedMultiplier *= 1.1;
        this.bulletSpeedMultiplier *= 1.1;
        this.fireRateMultiplier *= 1.1;
        this.magnetRadiusMultiplier *= 1.1;
        this.updateBulletTimer();
        this.updateLevelBar();
        this.showLevelUpOverlay(
            'Congratulations! You have reached Level 5 — Performance Tuning',
            [{ label: '1 - +10% move speed, bullet speed, fire rate, magnet range', onPick: () => this.closeLevelUpOverlay() }],
            'You receive a 10% boost to all core stats:'
        );
    }

    private applyFullStackVisibility(): void {
        this.hasFullStackVisibility = true;
        this.shieldActive = true;
        this.createShieldBubble();
        this.closeLevelUpOverlay();
    }

    private createShieldBubble(): void {
        if (this._shieldBubble) return;
        const radius = 36;
        this._shieldBubble = this.add.graphics().setDepth(-0.5);
        this._shieldBubble.lineStyle(3, 0x5dade2, 0.85);
        this._shieldBubble.strokeCircle(0, 0, radius);
        this._shieldBubble.setPosition(this.player.x, this.player.y);
    }

    private applyUpgrade(choice: 'spread' | 'doubleRate'): void {
        if (choice === 'spread') this.hasSpreadShot = true;
        else this.hasDoubleFireRate = true;
        this.updateBulletTimer();
        this.closeLevelUpOverlay();
    }

    private applyLevel3SecondUpgrade(): void {
        if (!this.hasSpreadShot) this.hasSpreadShot = true;
        else this.hasDoubleFireRate = true;
        this.updateBulletTimer();
        this.closeLevelUpOverlay();
    }

    private updateBulletTimer(): void {
        if (this.bulletTimer) this.bulletTimer.remove();
        const baseDelay = this.hasDoubleFireRate ? GameOptions.bulletRate / 2 : GameOptions.bulletRate;
        const delay = baseDelay / this.fireRateMultiplier;
        this.bulletTimer = this.time.addEvent({
            delay,
            loop: true,
            callback: () => this.fireBullets(),
        });
    }

    private showLevelUpOverlay(titleMessage: string, options: { label: string; onPick: () => void }[], subtitleText: string = 'Choose one reward:', warningMessage?: string): void {
        this.scenePaused = true;
        this.physics.pause();
        const { width, height } = GameOptions.gameSize;
        const wrap = GameOptions.levelUpTitleWrapWidth;
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75).setScrollFactor(0);
        const title = this.add.text(width / 2, height * 0.22, titleMessage, {
            fontSize: '20px',
            color: '#5dade2',
            align: 'center',
            wordWrap: { width: wrap }
        }).setOrigin(0.5).setScrollFactor(0);
        const elements: Phaser.GameObjects.GameObject[] = [overlay, title];
        let subtitleY = 0.38;
        if (warningMessage) {
            const warning = this.add.text(width / 2, height * 0.30, warningMessage, {
                fontSize: '16px',
                color: '#e74c3c',
                align: 'center',
                wordWrap: { width: wrap }
            }).setOrigin(0.5).setScrollFactor(0);
            elements.push(warning);
            subtitleY = 0.40;
        }
        const subtitle = this.add.text(width / 2, height * subtitleY, subtitleText, {
            fontSize: '20px',
            color: '#bdc3c7'
        }).setOrigin(0.5).setScrollFactor(0);
        elements.push(subtitle);
        const startY = options.length === 1 ? height * 0.52 : height * 0.5;
        const step = options.length === 1 ? 0 : 0.1;
        options.forEach((opt, i) => {
            const t = this.add.text(width / 2, startY + i * step * height, opt.label, {
                fontSize: '20px',
                color: '#ecf0f1'
            }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });
            t.on('pointerdown', opt.onPick);
            elements.push(t);
        });
        const hintText = this.add.text(width / 2, startY + options.length * step * height + height * 0.06, options.length === 1 ? 'Press 1 to continue' : 'Press 1 or 2 to choose', {
            fontSize: '14px',
            color: '#95a5a6'
        }).setOrigin(0.5).setScrollFactor(0);
        elements.push(hintText);
        this._levelUpKeyHandler = (e: KeyboardEvent) => {
            options.forEach((opt, i) => {
                if (e.key === String(i + 1)) opt.onPick();
            });
        };
        this.input.keyboard!.on('keydown', this._levelUpKeyHandler as any);
        this.levelUpOverlay = this.add.container(0, 0, elements);
    }

    private spawnBoss(outerRect: Phaser.Geom.Rectangle, innerRect: Phaser.Geom.Rectangle): void {
        const spawnPoint = Phaser.Geom.Rectangle.RandomOutside(outerRect, innerRect);
        const boss = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'enemy');
        const scale = GameOptions.bossSizeScale;
        boss.setDisplaySize(GameOptions.enemy1Width * scale, GameOptions.enemy1Height * scale);
        boss.setData('health', GameOptions.bossHealth);
        boss.setData('isBoss', true);
        boss.setData('isBoss2', false);
        boss.setData('isBoss3', false);
        this.enemyGroup.add(boss);
    }

    private spawnBoss2(outerRect: Phaser.Geom.Rectangle, innerRect: Phaser.Geom.Rectangle): void {
        const spawnPoint = Phaser.Geom.Rectangle.RandomOutside(outerRect, innerRect);
        const boss = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'enemy2');
        const scale = GameOptions.bossSizeScale;
        boss.setDisplaySize(GameOptions.enemy1Width * scale, GameOptions.enemy1Height * scale);
        boss.setData('health', GameOptions.boss2Health);
        boss.setData('isBoss', false);
        boss.setData('isBoss2', true);
        boss.setData('isBoss3', false);
        this.enemyGroup.add(boss);
    }

    private spawnBoss3(outerRect: Phaser.Geom.Rectangle, innerRect: Phaser.Geom.Rectangle): void {
        const spawnPoint = Phaser.Geom.Rectangle.RandomOutside(outerRect, innerRect);
        const boss = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'enemy3');
        const scale = GameOptions.bossSizeScale;
        boss.setDisplaySize(GameOptions.enemy1Width * scale, GameOptions.enemy1Height * scale);
        boss.setData('health', GameOptions.boss3Health);
        boss.setData('speedMultiplier', GameOptions.enemy3SpeedMultiplier);
        boss.setData('isBoss', false);
        boss.setData('isBoss2', false);
        boss.setData('isBoss3', true);
        this.enemyGroup.add(boss);
    }

    private spawnAllBosses(outerRect: Phaser.Geom.Rectangle, innerRect: Phaser.Geom.Rectangle): void {
        this.spawnBoss(outerRect, innerRect);
        this.spawnBoss2(outerRect, innerRect);
        this.spawnBoss3(outerRect, innerRect);
    }

    private maybeUpdateSpawnRates(outerRect: Phaser.Geom.Rectangle, innerRect: Phaser.Geom.Rectangle): void {
        if (this.score < GameOptions.spawnRateIncreaseAtScore) return;
        const tier = Math.floor((this.score - GameOptions.spawnRateIncreaseAtScore) / GameOptions.spawnRateIncreaseStep) + 1;
        if (tier <= this.lastSpawnRateTier) return;
        this.lastSpawnRateTier = tier;
        const delay = GameOptions.enemyRate / Math.pow(GameOptions.spawnRateMultiplier, tier);
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        if (this.enemy3SpawnTimer) this.enemy3SpawnTimer.remove();
        this.enemySpawnTimer = this.time.addEvent({
            delay,
            loop: true,
            callback: () => {
                if (this.scenePaused) return;
                const spawnPoint = Phaser.Geom.Rectangle.RandomOutside(outerRect, innerRect);
                const useEnemy2 = this.score >= 20 && Math.random() < 0.5;
                const key = useEnemy2 ? 'enemy2' : 'enemy';
                const enemy = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, key);
                enemy.setDisplaySize(GameOptions.enemy1Width, GameOptions.enemy1Height);
                enemy.setData('health', useEnemy2 ? 2 : 1);
                enemy.setData('speedMultiplier', 1);
                enemy.setData('isBoss', false);
                enemy.setData('isBoss2', false);
                enemy.setData('isBoss3', false);
                this.enemyGroup.add(enemy);
            },
        });
        this.enemy3SpawnTimer = this.time.addEvent({
            delay,
            loop: true,
            callback: () => {
                if (this.scenePaused) return;
                if (this.score < GameOptions.enemy3SpawnAtScore) return;
                const spawnPoint = Phaser.Geom.Rectangle.RandomOutside(outerRect, innerRect);
                const enemy = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'enemy3');
                enemy.setDisplaySize(GameOptions.enemy1Width, GameOptions.enemy1Height);
                enemy.setData('health', 1);
                enemy.setData('speedMultiplier', GameOptions.enemy3SpeedMultiplier);
                enemy.setData('isBoss', false);
                enemy.setData('isBoss2', false);
                enemy.setData('isBoss3', false);
                this.enemyGroup.add(enemy);
            },
        });
    }

    private closeLevelUpOverlay(): void {
        if (this._levelUpKeyHandler) {
            this.input.keyboard?.off('keydown', this._levelUpKeyHandler as any);
            this._levelUpKeyHandler = null;
        }
        if (this.levelUpOverlay) {
            this.levelUpOverlay.destroy();
            this.levelUpOverlay = null;
        }
        this.scenePaused = false;
        this.physics.resume();
    }

    private showPauseOverlay(): void {
        const { width, height } = GameOptions.gameSize;
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65).setScrollFactor(0);
        const title = this.add.text(width / 2, height / 2 - 24, 'Paused', {
            fontSize: '52px',
            color: '#5dade2',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);
        const hint = this.add.text(width / 2, height / 2 + 28, 'Press F to resume', {
            fontSize: '22px',
            color: '#bdc3c7'
        }).setOrigin(0.5).setScrollFactor(0);
        this._pauseOverlay = this.add.container(0, 0, [overlay, title, hint]);
    }

    private showBossCongratulationsOverlay(title: string, rewardText: string): void {
        this.scenePaused = true;
        this.physics.pause();
        const { width, height } = GameOptions.gameSize;
        const wrap = GameOptions.levelUpTitleWrapWidth;
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75).setScrollFactor(0);
        const titleEl = this.add.text(width / 2, height * 0.35, title, {
            fontSize: '20px',
            color: '#5dade2',
            align: 'center',
            wordWrap: { width: wrap }
        }).setOrigin(0.5).setScrollFactor(0);
        const reward = this.add.text(width / 2, height * 0.48, rewardText, {
            fontSize: '18px',
            color: '#bdc3c7',
            align: 'center',
            wordWrap: { width: wrap }
        }).setOrigin(0.5).setScrollFactor(0);
        const spaceHint = this.add.text(width / 2, height * 0.55, 'Press Space to continue', {
            fontSize: '14px',
            color: '#95a5a6'
        }).setOrigin(0.5).setScrollFactor(0);
        const continueBtn = this.add.text(width / 2, height * 0.62, 'Continue', {
            fontSize: '20px',
            color: '#ecf0f1'
        }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });
        continueBtn.on('pointerdown', () => this.closeBossOverlay());
        this._activeBossOverlay = this.add.container(0, 0, [overlay, titleEl, reward, spaceHint, continueBtn]);
        this._bossOverlayKeyHandler = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                this.closeBossOverlay();
            }
        };
        this.input.keyboard!.on('keydown', this._bossOverlayKeyHandler as any);
    }

    private closeBossOverlay(): void {
        if (this._bossOverlayKeyHandler) {
            this.input.keyboard?.off('keydown', this._bossOverlayKeyHandler as any);
            this._bossOverlayKeyHandler = null;
        }
        if (this._activeBossOverlay) {
            this._activeBossOverlay.destroy();
            this._activeBossOverlay = null;
        }
        this.scenePaused = false;
        this.physics.resume();
    }

    private showBoss1CongratulationsOverlay(): void {
        this.showBossCongratulationsOverlay(
            'Congratulations on Taking out a large installation of Data Dog',
            'Your reward: +20% movement speed'
        );
    }

    private showBoss2CongratulationsOverlay(): void {
        this.showBossCongratulationsOverlay(
            'Congratulations on Taking out a large installation of Splunk',
            'Your reward: +15% magnet pickup range'
        );
    }

    private showBoss3CongratulationsOverlay(): void {
        this.showBossCongratulationsOverlay(
            'Congratulations on Taking out a large installation of DynaTrace',
            'Your reward: +10% bullet speed'
        );
    }

    private updateScoreDisplay(): void {
        if (this.scoreText) {
            this.scoreText.setText(`Score: ${this.score}`);
        }
    }

    private saveHighScore(): void {
        const key = GameOptions.highScoreKey;
        const current = parseInt(localStorage.getItem(key) || '0', 10);
        if (this.score > current) {
            localStorage.setItem(key, String(this.score));
        }
    }

    update() {
        // Pause (F key): only when no level-up or boss overlay is showing
        if (this.scenePaused) {
            if (this._userPaused && Phaser.Input.Keyboard.JustDown(this._pauseKey!)) {
                this._userPaused = false;
                this.scenePaused = false;
                this.physics.resume();
                if (this._pauseOverlay) {
                    this._pauseOverlay.destroy();
                    this._pauseOverlay = null;
                }
            }
            return;
        }
        if (Phaser.Input.Keyboard.JustDown(this._pauseKey!)) {
            this._userPaused = true;
            this.scenePaused = true;
            this.physics.pause();
            this.showPauseOverlay();
            return;
        }

        // Level 4: player spins continuously (does not stop when shield is hit)
        if (this.hasFullStackVisibility) {
            this.player.angle += 1;
        }

        // Shield bubble: visible only while shield is active; position follows player
        if (this._shieldBubble) {
            this._shieldBubble.setVisible(this.shieldActive);
            if (this.shieldActive) {
                this._shieldBubble.setPosition(this.player.x, this.player.y);
            }
        }

        // Movement: pointer/touch steers toward cursor (hover or drag); otherwise WASD
        let movementDirection : Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
        const ptr = this.input.activePointer;
        const gw = GameOptions.gameSize.width;
        const gh = GameOptions.gameSize.height;
        const inWorld =
            ptr.worldX >= 0 &&
            ptr.worldX <= gw &&
            ptr.worldY >= 0 &&
            ptr.worldY <= gh;
        const steerHover = GameOptions.pointerSteerHover !== false;
        const usePointer = ptr.isDown || (steerHover && inWorld);
        let pointerSteering = false;

        if (usePointer) {
            const dx = ptr.worldX - this.player.x;
            const dy = ptr.worldY - this.player.y;
            const lenSq = dx * dx + dy * dy;
            const dz = GameOptions.pointerDeadZone ?? 10;
            if (lenSq > dz * dz) {
                const len = Math.sqrt(lenSq);
                movementDirection.set(dx / len, dy / len);
                pointerSteering = true;
            }
        }

        if (!pointerSteering) {
            if (this.controlKeys.right.isDown) {
                movementDirection.x++;
            }
            if (this.controlKeys.left.isDown) {
                movementDirection.x--;
            }
            if (this.controlKeys.up.isDown) {
                movementDirection.y--;
            }
            if (this.controlKeys.down.isDown) {
                movementDirection.y++;
            }
        }

        // set player velocity according to movement direction
        const speed = GameOptions.playerSpeed * this.playerSpeedMultiplier;
        this.player.setVelocity(0, 0);
        if (movementDirection.x == 0 || movementDirection.y == 0) {
            this.player.setVelocity(movementDirection.x * speed, movementDirection.y * speed);
        }
        else {
            this.player.setVelocity(movementDirection.x * speed / Math.sqrt(2), movementDirection.y * speed / Math.sqrt(2));
        } 

        // get coins inside magnet radius and move them towards player
        const magnetRadius = GameOptions.magnetRadius * this.magnetRadiusMultiplier;
        const coinsInCircle : Phaser.Physics.Arcade.Body[] = this.physics.overlapCirc(this.player.x, this.player.y, magnetRadius, true, true) as Phaser.Physics.Arcade.Body[];
        coinsInCircle.forEach((body : any) => {
            const bodySprite : Phaser.Physics.Arcade.Sprite = body.gameObject;
            if (bodySprite.texture.key === 'coin') {
                this.physics.moveToObject(bodySprite, this.player, 500);
            }
        })

        // move enemies towards player (enemy3 uses speedMultiplier 1.5)
        this.enemyGroup.getMatching('visible', true).forEach((enemy : any) => {
            const speed = GameOptions.enemySpeed * (enemy.getData('speedMultiplier') ?? 1);
            this.physics.moveToObject(enemy, this.player, speed);
        });
    }
}