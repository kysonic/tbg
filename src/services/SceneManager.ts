import { Application, Container } from 'pixi.js';
import { Transition } from './Transitions';

export interface Scene {
    name: string;
    container: Container;
    initialize?: () => Promise<void>;
    onStart?: () => void;
    onStop?: () => void;
    onResize?: (width: number, height: number) => void;
}

export interface SceneManagerConfig {
    backgroundColor?: number;
}

export class SceneManager {
    private app: Application;
    private config: SceneManagerConfig;
    private scenes: Map<string, Scene> = new Map();
    private currentScene: Scene | null = null;
    private previousScene: Scene | null = null;
    private isTransitioning: boolean = false;

    constructor(config: SceneManagerConfig) {
        this.app = new Application();
        this.config = config;

        this.init();
    }

    async init() {
        await this.app.init({
            background: this.config.backgroundColor,
            resizeTo: window,
        });

        document.getElementById('pixi-container')!.appendChild(this.app.canvas);
    }

    public get application(): Application {
        return this.app;
    }

    public addScene(scene: Scene): void {
        this.scenes.set(scene.name, scene);
        scene.container.visible = false;
        this.app.stage.addChild(scene.container);
    }

    public async changeTo(
        sceneName: string,
        transition?: Transition,
    ): Promise<void> {
        if (this.isTransitioning) return;

        const targetScene = this.scenes.get(sceneName);
        if (!targetScene || targetScene === this.currentScene) {
            return;
        }

        this.isTransitioning = true;
        this.previousScene = this.currentScene;

        if (targetScene.initialize && !targetScene.container.visible) {
            await targetScene.initialize();
        }

        if (this.currentScene?.onStop) {
            this.currentScene.onStop();
        }

        if (transition && this.currentScene) {
            await transition.start(
                this.currentScene.container,
                targetScene.container,
            );
        } else {
            if (this.currentScene) {
                this.currentScene.container.visible = false;
            }
            targetScene.container.visible = true;
        }

        this.currentScene = targetScene;

        if (targetScene.onStart) {
            targetScene.onStart();
        }

        this.isTransitioning = false;
    }

    public getCurrentScene(): Scene | null {
        return this.currentScene;
    }

    public resize(width: number, height: number): void {
        this.app.renderer.resize(width, height);

        if (this.currentScene?.onResize) {
            this.currentScene.onResize(width, height);
        }
    }

    public destroy(): void {
        this.app.destroy(true, true);
    }
}
