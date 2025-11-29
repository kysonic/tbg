import { SceneManager } from '../shared/SceneManager';
import { MenuScene } from '../scenes/MenuScene';
import { GameScene } from '../scenes/GameScene';

export class Game {
    private sceneManager: SceneManager;

    constructor() {
        this.sceneManager = new SceneManager({
            backgroundColor: 0x2c3e50,
        });

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

        this.sceneManager.addScene(menuScene);
        this.sceneManager.addScene(gameScene);

        this.sceneManager.changeTo('Menu');
    }

    // Global events
    private setupEventListeners(): void {
        window.addEventListener('resize', () => {
            this.sceneManager.resize(window.innerWidth, window.innerHeight);
        });

        this.sceneManager.application.ticker.add(() => {
            this.sceneManager.onTick();
        });
    }
}
