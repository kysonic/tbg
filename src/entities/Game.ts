import { SceneManager } from '../shared/SceneManager';
import { MenuScene } from '../scenes/MenuScene';
import { GameScene } from '../scenes/GameScene';
import { ScoresScene } from '../scenes/ScoresScene';

export class Game {
    private sceneManager: SceneManager;

    constructor() {
        this.sceneManager = new SceneManager({});

        this.init();
    }

    async init() {
        await this.sceneManager.init();

        this.createScenes();
        this.setupEventListeners();
    }

    private async createScenes(): Promise<void> {
        const menuScene = new MenuScene(this.sceneManager);
        const gameScene = new GameScene(this.sceneManager);
        const scoresScene = new ScoresScene(this.sceneManager);

        this.sceneManager.addScene(menuScene);
        this.sceneManager.addScene(gameScene);
        this.sceneManager.addScene(scoresScene);

        this.sceneManager.changeTo('Menu');
    }

    // Global events
    private setupEventListeners(): void {
        window.addEventListener('resize', () => {
            this.sceneManager.resize(window.innerWidth, window.innerHeight);
            const rgba = document.getElementById(
                'rgba-canvas',
            ) as HTMLCanvasElement;

            if (rgba) {
                console.log(rgba, window.innerWidth, window.innerHeight);
                rgba.width = window.innerWidth;
                rgba.height = window.innerHeight;
            }
        });

        this.sceneManager.application.ticker.add(() => {
            this.sceneManager.onTick();
        });
    }
}
