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
    private gameTitleSprite: Nullable<Sprite> = null;
    private text: Nullable<Text> = null;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;

        this.init();
    }

    async init() {
        await this.createBackground();
        this.createGameTitle();
        this.createStartText();
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

    async createGameTitle() {
        const scaleDelta = Math.min(
            this.sceneManager.application.view.width / 1000,
            this.sceneManager.application.view.height / 1000,
        );

        const gameTitleTexture = await Assets.load(
            '/assets/menu/img/game_title.png',
        );
        this.gameTitleSprite = new Sprite(gameTitleTexture);
        this.gameTitleSprite.x = this.sceneManager.application.screen.width / 2;
        this.gameTitleSprite.y =
            this.sceneManager.application.screen.height / 2 - scaleDelta * 100;

        this.gameTitleSprite.scale = Math.min(scaleDelta - 0.05, 0.8);
        this.gameTitleSprite.anchor.set(0.5);
        this.container.addChild(this.gameTitleSprite);
    }

    createStartText() {
        const scaleDelta = Math.min(
            this.sceneManager.application.view.width / 500,
            this.sceneManager.application.view.height / 500,
        );

        this.text = new Text('PRESS TO START', {
            fontFamily: 'SPFont',
            fontSize: 50,
            fill: 0xffff00,
            align: 'center',
        });

        this.text.x = this.sceneManager.application.screen.width / 2;
        this.text.y =
            this.sceneManager.application.screen.height - scaleDelta * 100;
        this.text.anchor.set(0.5);
        this.text.interactive = true;
        this.text.cursor = 'pointer';
        this.text.scale = Math.min(scaleDelta, 0.8);

        this.text.on('pointerover', () => {
            this.text.style.fill = 0x00ff00;
        });

        this.text.on('pointerout', () => {
            this.text.style.fill = 0xffff00;
        });

        this.container.addChild(this.text);

        this.text.on('pointerdown', () => {
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
