import { Assets, Container, Sprite, Text } from 'pixi.js';
import { Background } from '../shared/Background';
import { Nullable } from '../types/common';
import { Transitions } from '../shared/Transitions';
import { SceneManager } from '../shared/SceneManager';

export class MenuScene {
    public name = 'Menu';
    public container = new Container();
    private sceneManager: SceneManager;
    private background: Nullable<Background> = null;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;

        this.init();
    }

    async init() {
        // Background
        const texture = await Assets.load('/assets/menu/img/background.jpg');
        this.background = new Background(texture);
        this.background.cover(
            this.sceneManager.application.screen.width,
            this.sceneManager.application.screen.height,
        );
        this.container.addChild(this.background.sprite);

        // Game Title
        const gameTitleTexture = await Assets.load(
            '/assets/menu/img/game_title.png',
        );
        const gameTitleSprite = new Sprite(gameTitleTexture);
        gameTitleSprite.x = this.sceneManager.application.screen.width / 2;
        gameTitleSprite.y =
            this.sceneManager.application.screen.height / 2 - 100;
        gameTitleSprite.scale = 0.8;
        gameTitleSprite.anchor.set(0.5);
        this.container.addChild(gameTitleSprite);
        // Text
        const text = new Text('PRESS TO START', {
            fontFamily: 'SPFont',
            fontSize: 50,
            fill: 0xffff00,
            align: 'center',
        });

        text.x = this.sceneManager.application.screen.width / 2;
        text.y = this.sceneManager.application.screen.height - 200;
        text.anchor.set(0.5);
        text.interactive = true;
        text.cursor = 'pointer';

        text.on('pointerover', () => {
            text.style.fill = 0x00ff00;
            text.scale.set(1.1);
        });

        text.on('pointerout', () => {
            text.style.fill = 0xffff00;
            text.scale.set(1);
        });

        this.container.addChild(text);

        text.on('pointerdown', () => {
            this.sceneManager.changeTo('Game', Transitions.fade(1000));
        });
    }

    onStart() {
        console.log('Home started');
    }

    onStop() {
        console.log('Home stopped');
    }

    onResize() {
        this.background?.cover(
            this.sceneManager.application.screen.width,
            this.sceneManager.application.screen.height,
        );
    }
}
