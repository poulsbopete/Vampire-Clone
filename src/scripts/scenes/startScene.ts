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
        logo.setTint(0x2d3e50); // subtle blue-gray tint so it blends with tech theme

        // Title (above logo)
        this.add.text(centerX, height * 0.14, 'O11Y SURVIVORS', {
            fontSize: '44px',
            color: '#5dade2'
        }).setOrigin(0.5).setDepth(1);

        // Game purpose (from README)
        const purposeWrap = Math.min(width - 60, 680);
        const lineSpacing = 1.2;
        this.add.text(centerX, height * 0.32, 'You represent an observability team under pressure from competitors. By collecting coins you unlock upgrades. Taking out large installations (bosses) grants special rewards. The more you collect, the more rivals appear—keep upgrading to stay ahead.', {
            fontSize: '14px',
            color: '#95a5a6',
            align: 'center',
            wordWrap: { width: purposeWrap },
            lineSpacing
        }).setOrigin(0.5).setDepth(1);

        // Instructions
        this.add.text(centerX, height * 0.54, 'WASD to move • Auto-aim • Collect coins', {
            fontSize: '16px',
            color: '#7f8c8d'
        }).setOrigin(0.5).setDepth(1);

        // High score
        const highScore = this.getHighScore();
        this.add.text(centerX, height * 0.62, `High Score: ${highScore}`, {
            fontSize: '22px',
            color: '#f1c40f'
        }).setOrigin(0.5).setDepth(1);

        // Start prompt
        this.add.text(centerX, height * 0.70, 'Click or press SPACE to start', {
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
