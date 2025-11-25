import { Container, Graphics, Text } from 'pixi.js';
import { SceneManager } from '../services/SceneManager';

export class GameScreen {
    public name = 'Game';
    public container = new Container();
    private sceneManager: SceneManager;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;

        this.init();
    }

    async init() {
        const background = new Graphics();
        background.beginFill(0x34495e);
        background.drawRect(0, 0, 800, 600);
        this.container.addChild(background);

        const scoreText = new Text('Счет: 0', {
            fontSize: 24,
            fill: 0xffffff,
        });
        scoreText.position.set(20, 20);
        this.container.addChild(scoreText);
    }

    onStart() {
        console.log('Game started');
    }

    onStop() {
        console.log('Game stopped');
    }

    onResize() {
        console.log('Resized');
    }
}
