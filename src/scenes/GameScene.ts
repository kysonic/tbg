import { Assets, Container, Sprite } from 'pixi.js';
import { SceneManager } from '../shared/SceneManager';
import { Ragdoll } from '../entities/Ragdoll';

export class GameScene {
    public name = 'Game';
    public container = new Container();
    private sceneManager: SceneManager;
    private ragdoll: Ragdoll;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;

        this.init();
    }

    async init() {
        // await this.cartman();

        this.ragdoll = new Ragdoll(
            this.sceneManager.application,
            this.container,
        );
    }

    async cartman() {
        const texture = await Assets.load('/assets/game/arm.png');
        const sprite = new Sprite(texture);
        sprite.angle = 10;
        sprite.x = -400;
        sprite.y = -200;
        this.container.addChild(sprite);
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

    onTick() {
        this.ragdoll?.onTick();
    }
}
