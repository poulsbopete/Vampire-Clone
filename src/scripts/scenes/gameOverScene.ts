// GAME OVER SCREEN

import { GameOptions } from '../gameOptions';

export class GameOverScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'GameOverScene'
        });
    }

    create(data: { score?: number }): void {
        const { width, height } = GameOptions.gameSize;
        const centerX = width / 2;
        const score = data.score ?? 0;
        const highScore = this.getHighScore();

        // Tech background
        this.add.image(0, 0, 'techBg').setOrigin(0).setDepth(-1);

        // Game Over title
        this.add.text(centerX, height * 0.22, 'GAME OVER', {
            fontSize: '52px',
            color: '#e74c3c'
        }).setOrigin(0.5);

        const quips = [
            'Postmortem: root cause = you were outnumbered.',
            'Status page: "Degraded experience" (understatement).',
            'PagerDuty sends regards. So does gravity.',
            'You did not pass the load test called "life".',
            'Incident closed: won\'t fix (this timeline).',
            'SLO: you. Error budget: exhausted.',
        ];
        const quip = quips[Math.floor(Math.random() * quips.length)];
        this.add.text(centerX, height * 0.33, quip, {
            fontSize: '16px',
            color: '#95a5a6',
            fontStyle: 'italic',
            align: 'center',
            wordWrap: { width: width - 80 }
        }).setOrigin(0.5);

        // Score
        this.add.text(centerX, height * 0.46, `Score: ${score}`, {
            fontSize: '32px',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        // High score (highlight if new record)
        const highScoreLabel =
            score >= highScore && score > 0 ? 'New high score — add it to your LinkedIn!' : `High score to beat: ${highScore}`;
        const highScoreColor = score >= highScore && score > 0 ? '#f1c40f' : '#bdc3c7';
        this.add.text(centerX, height * 0.55, highScoreLabel, {
            fontSize: '24px',
            color: highScoreColor
        }).setOrigin(0.5);

        // Play Again button (text that acts as button)
        const playAgain = this.add.text(centerX, height * 0.72, 'Retry deploy (Play Again)', {
            fontSize: '32px',
            color: '#2ecc71'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        playAgain.on('pointerover', () => playAgain.setStyle({ color: '#27ae60' }));
        playAgain.on('pointerout', () => playAgain.setStyle({ color: '#2ecc71' }));
        playAgain.on('pointerdown', () => this.playAgain());

        this.input.keyboard?.once('keydown-SPACE', () => this.playAgain());
    }

    private getHighScore(): number {
        const stored = localStorage.getItem(GameOptions.highScoreKey);
        return stored ? parseInt(stored, 10) : 0;
    }

    private playAgain(): void {
        this.scene.start('PlayGame');
    }
}
