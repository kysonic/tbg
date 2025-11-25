import { SceneManager } from './SceneManager';
import { HomeScreen } from '../screens/HomeScreen';
import { GameScreen } from '../screens/GameScreen';

export class Game {
    private sceneManager: SceneManager;

    constructor() {
        this.sceneManager = new SceneManager({
            backgroundColor: 0x2c3e50,
        });

        this.createScenes();
        this.setupEventListeners();
    }

    private createScenes(): void {
        const homeScreen = new HomeScreen(this.sceneManager);
        const gameScreen = new GameScreen(this.sceneManager);

        this.sceneManager.addScene(homeScreen);
        this.sceneManager.addScene(gameScreen);

        this.sceneManager.changeTo('Home');
    }

    private setupEventListeners(): void {
        window.addEventListener('resize', () => {
            this.sceneManager.resize(window.innerWidth, window.innerHeight);
        });
    }
}
