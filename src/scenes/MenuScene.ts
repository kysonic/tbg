import { Assets, Container } from 'pixi.js';
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
        const texture = await Assets.load('/assets/menu/background.jpg');
        this.background = new Background(texture);
        this.background.cover(
            this.sceneManager.application.screen.width,
            this.sceneManager.application.screen.height,
        );
        this.container.addChild(this.background.sprite);

        this.background.sprite.interactive = true;

        this.background.sprite.on('pointerdown', () => {
            this.sceneManager.changeTo('Game', Transitions.fade(800));
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
