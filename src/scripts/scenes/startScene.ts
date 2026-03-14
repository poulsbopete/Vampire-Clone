// START GAME SCREEN

import { GameOptions } from '../gameOptions';

export class StartScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'StartScene'
        });
    }

    create(): void {
        const { width, height } = GameOptions.gameSize;
        const centerX = width / 2;

        // Tech background
        this.add.image(0, 0, 'techBg').setOrigin(0).setDepth(-1);

        // Large muted player logo in background (same sprite as player)
        const logoScale = 25;
        const logo = this.add.image(centerX, height / 2, 'player').setDepth(0);
        logo.setScale(logoScale);
        logo.setAlpha(0.70);
        logo.setTint(0x2d3e50);

        // Title — larger and prominent
        this.add.text(centerX, height * 0.12, 'O11Y SURVIVORS', {
            fontSize: '64px',
            color: '#5dade2',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1);

        // Game purpose — full text, easier to read (larger font, more line spacing, panel)
        const purposeWrap = Math.min(width - 80, 620);
        const purposeY = height * 0.28;
        const panelPad = 20;
        const panelW = purposeWrap + panelPad * 2;
        const panelH = 140;
        const panel = this.add.rectangle(centerX, purposeY, panelW, panelH, 0x1a2230, 0.85).setDepth(1);
        panel.setStrokeStyle(1, 0x2d3e50, 0.6);

        const purposeText = 'You represent an observability team under pressure from competitors. By collecting OpenTelemetry knowledge (coins), you unlock upgrades that make you stronger. Taking out large installations (bosses) grants special rewards. The more you collect, the more rivals appear—so you must keep upgrading to stay ahead.';
        this.add.text(centerX, purposeY, purposeText, {
            fontSize: '17px',
            color: '#bdc3c7',
            align: 'center',
            wordWrap: { width: purposeWrap },
            lineSpacing: 8
        }).setOrigin(0.5).setDepth(1);

        // Instructions
        this.add.text(centerX, height * 0.56, 'WASD to move • Auto-aim • Collect coins • F to Pause', {
            fontSize: '16px',
            color: '#7f8c8d'
        }).setOrigin(0.5).setDepth(1);

        // High score
        const highScore = this.getHighScore();
        this.add.text(centerX, height * 0.64, `High Score: ${highScore}`, {
            fontSize: '22px',
            color: '#f1c40f'
        }).setOrigin(0.5).setDepth(1);

        // Start prompt
        this.add.text(centerX, height * 0.72, 'Click or press SPACE to start', {
            fontSize: '26px',
            color: '#2ecc71'
        }).setOrigin(0.5).setDepth(1);

        // Input: click or space
        this.input.once('pointerdown', () => this.startGame());
        this.input.keyboard?.once('keydown-SPACE', () => this.startGame());
    }

    private getHighScore(): number {
        const stored = localStorage.getItem(GameOptions.highScoreKey);
        return stored ? parseInt(stored, 10) : 0;
    }

    private startGame(): void {
        this.scene.start('PlayGame');
    }
}
