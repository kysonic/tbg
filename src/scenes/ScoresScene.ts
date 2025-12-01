import { Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import { Background } from '../shared/Background';
import { Nullable } from '../types/common';
import { Transitions } from '../shared/Transitions';
import { SceneManager } from '../shared/SceneManager';
import { AnimatedText } from '../shared/AnimatedText';

export class ScoresScene {
    public name = 'Scores';
    public container = new Container();
    private sceneManager: SceneManager;
    private background: Nullable<Background> = null;
    private scoreBoardSprite: Nullable<Sprite> = null;
    private boardBackground: Nullable<Graphics> = null;
    private scoreText: Nullable<AnimatedText> = null;
    private restartText: Nullable<Text> = null;

    public score: number = 0;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;

        this.init();
    }

    async init() {
        this.createBackground();
        await this.createBoard();
        this.createBoardBackground();
        this.createScoreText();
        this.createRestartText();
    }

    async createBackground() {
        const texture = await Assets.load('/assets/menu/img/background.jpg');
        this.background = new Background(texture);
        this.background.cover(
            this.sceneManager.application.screen.width,
            this.sceneManager.application.screen.height,
        );
        this.container.addChild(this.background.sprite);
    }

    async createBoard() {
        const scoreBoardTexture = await Assets.load(
            '/assets/scores/img/score_board.png',
        );
        this.scoreBoardSprite = new Sprite(scoreBoardTexture);
        this.scoreBoardSprite.x =
            this.sceneManager.application.screen.width / 2;
        this.scoreBoardSprite.y =
            this.sceneManager.application.screen.height / 2 - 50;
        this.scoreBoardSprite.scale = 0.8;
        this.scoreBoardSprite.zIndex = 2;
        this.scoreBoardSprite.anchor.set(0.5);
        this.container.addChild(this.scoreBoardSprite);
    }

    createBoardBackground() {
        this.boardBackground = new Graphics();
        this.boardBackground.beginFill(0xffffff);
        this.boardBackground.drawRect(
            this.scoreBoardSprite.x - this.scoreBoardSprite.width / 2 + 5,
            this.scoreBoardSprite.y - this.scoreBoardSprite.height / 2 + 5,
            this.scoreBoardSprite.width - 10,
            this.scoreBoardSprite.height - 10,
        );
        this.boardBackground.endFill();
        this.boardBackground.zIndex = 1;
        this.boardBackground.alpha = 0.5;

        this.container.addChild(this.boardBackground);
    }

    createScoreText() {
        this.scoreText = new AnimatedText({
            text: `YOU SCORED ${this.score} POINTS!`,
            fontSize: 50,
            fontFamily: 'SPFont',
            fill: 0xffff00,
            position: {
                x: this.sceneManager.application.view.width / 2,
                y: this.sceneManager.application.view.height / 2 - 20,
            },
            animationSpeed: 0.02,
            delayBetweenLetters: 100,
            scale: 1.2,
            withShadow: true,
        });

        this.scoreText.getContainer().zIndex = 20;
        this.container.addChild(this.scoreText.getContainer());
        this.scoreText.animateIn();
    }

    createRestartText() {
        this.restartText = new Text('PRESS TO RESTART', {
            fontFamily: 'SPFont',
            fontSize: 50,
            fill: 0xffff00,
            align: 'center',
        });

        this.restartText.x = this.sceneManager.application.screen.width / 2;
        this.restartText.y = this.sceneManager.application.screen.height - 100;
        this.restartText.anchor.set(0.5);
        this.restartText.interactive = true;
        this.restartText.zIndex = 20;
        this.restartText.cursor = 'pointer';

        this.restartText.on('pointerover', () => {
            this.restartText.style.fill = 0x00ff00;
            this.restartText.scale.set(1.1);
        });

        this.restartText.on('pointerout', () => {
            this.restartText.style.fill = 0xffff00;
            this.restartText.scale.set(1);
        });

        this.restartText.on('pointerdown', () => {
            this.sceneManager.changeTo('Game', Transitions.fade(1000));
        });

        this.container.addChild(this.restartText);
    }

    setScore(score: number) {
        this.score = score;
        this.scoreText.setText(`YOU SCORED ${this.score} POINTS!`);
        this.scoreText.animateIn();
    }

    onStart() {
        console.log('Scores started');
    }

    onStop() {
        console.log('Scores stopped');
    }

    onResize() {
        this.background?.cover(
            this.sceneManager.application.screen.width,
            this.sceneManager.application.screen.height,
        );
    }
}
