import { Container } from 'pixi.js';
import { SceneManager } from '../shared/SceneManager';
import { Ragdoll } from '../entities/Ragdoll';

export class GameScene {
    public name = 'Game';
    public container = new Container();
    private sceneManager: SceneManager;
    private ragdoll: Ragdoll;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.ragdoll = new Ragdoll(
            this.sceneManager.application,
            this.container,
        );
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
        this.ragdoll.onTick();
    }
}
