import { Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import { sound } from '@pixi/sound';
import { SceneManager } from '../shared/SceneManager';
import { Ragdoll } from '../entities/Ragdoll';
import fragmentShader from '../shaders/yellow-red';
import { AnimatedText } from '../shared/AnimatedText';
import { Utils } from '../shared/Utils';
import { KaraokeText } from '../shared/KaraokeText';
import { ProgressBar } from '../shared/ProgressBar';
import { SpriteConfetti } from '../shared/SpriteConfetti';

const KARAOKE_COMBINATIONS = [
    'TACO TACO BURRITO BURRITO',
    'TACO TACO TACO',
    'BURRITO BURRITO',
    'TACO BURRITO TACO BURRITO',
    'BURRITO BURRITO TACO',
    'TACO BURRITO BURRITO',
    'BURRITO TACO BURRITO TACO',
    'TACO TACO',
];

export class GameScene {
    public name = 'Game';
    public container = new Container();
    private sceneManager: SceneManager;
    private ragdoll: Ragdoll | null = null;
    private greenScreen: Graphics | null = null;
    private countdownText: AnimatedText | null = null;
    private karaokeText: KaraokeText | null = null;
    private scoreText: Text | null = null;
    private scoreValue: AnimatedText | null = null;
    private progressBar: ProgressBar | null = null;
    private confetti: SpriteConfetti | null = null;
    private score: number = 0;
    private timeLeft: number = 30;
    private deadline: number = 0;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;

        this.init();
    }

    async init() {
        // Prefetch ragdoll

        this.ragdoll = new Ragdoll(
            this.sceneManager.application,
            this.container,
        );

        this.prepareGreenScreen();
        this.setGreenScreen();
        this.prepareCountdownText();
        this.prepareKaraokeText();
        this.prepareScoreText();
        this.prepareProgressBar();
        this.prepareConfetti();
    }

    onStart() {
        console.log('Game started');

        sound.add('minus', '/assets/game/sounds/minus.mp3');
        sound.add('correct', '/assets/game/sounds/correct.mp3');
        sound.add('incorrect', '/assets/game/sounds/incorrect.mp3');
        sound.add('spicier', '/assets/game/sounds/spicy.mp3');
        sound.add('whatkinda', '/assets/game/sounds/what-kinda-song.mp3');
        sound.add('go', '/assets/game/sounds/go.mp3');
        sound.add('countdown', '/assets/game/sounds/countdown.mp3');

        document.addEventListener(
            'keydown',
            this.handleKeyboardControls.bind(this),
        );

        this.countdown();
        // Scores
        this.updateScore();
    }

    onStop() {
        console.log('Game stopped');
        document.removeEventListener(
            'keydown',
            this.handleKeyboardControls.bind(this),
        );
    }

    onResize() {
        console.log('Resized');
    }

    onTick() {
        this.ragdoll?.onTick();
    }

    handleKeyboardControls(e: KeyboardEvent) {
        if (e.key === 't') {
            if (this.karaokeText.getNextWord() === 'TACO') {
                this.correct();
            } else {
                this.incorrect();
            }

            this.ragdoll?.signTaco();
            this.karaokeText.revealNextWord();
        }
        if (e.key === 'b') {
            if (this.karaokeText.getNextWord() === 'BURRITO') {
                this.correct();
            } else {
                this.incorrect();
            }

            this.ragdoll?.singBurrito();
            this.karaokeText.revealNextWord();
        }
    }

    prepareGreenScreen() {
        this.greenScreen = new Graphics();
        this.greenScreen.beginFill(0x006400);
        this.greenScreen.drawRect(
            0,
            0,
            this.sceneManager.application.screen.width,
            this.sceneManager.application.screen.height,
        );
        this.greenScreen.zIndex = 1;
        this.greenScreen.endFill();
    }

    setGreenScreen() {
        this.container.addChild(this.greenScreen!);
    }

    removeGreenScreen() {
        this.container.removeChild(this.greenScreen!);
    }

    rgba() {
        this.removeGreenScreen();
        RGBA(fragmentShader, {
            target: document.getElementById('rgba-canvas')!,
            fullscreen: true,
        });
    }

    prepareCountdownText() {
        this.countdownText = new AnimatedText({
            text: 'TRES',
            fontSize: 56,
            fontFamily: 'SPFont',
            fill: 0xffff00,
            position: {
                x: this.sceneManager.application.view.width / 2 - 70,
                y: this.sceneManager.application.view.height / 2,
            },
            animationSpeed: 0.3,
            delayBetweenLetters: 100,
            scale: 1.2,
            withShadow: true,
        });

        this.countdownText.getContainer().zIndex = 20;
        this.container.addChild(this.countdownText.getContainer());
    }

    prepareKaraokeText() {
        this.karaokeText = new KaraokeText({
            text: '',
            fontSize: 48,
            fontFamily: 'SPFont',
            baseColor: 0x0066ff, // Blue
            fillColor: 0x00ff66, // Green
            position: {
                x: this.sceneManager.application.view.width / 2,
                y: this.sceneManager.application.view.height - 100,
            },
            animationDuration: 3,
            stroke: 2,
            strokeColor: 0x000000,
        });

        this.karaokeText.getContainer().zIndex = 20;
        this.container.addChild(this.karaokeText.getContainer());
    }

    prepareScoreText() {
        this.scoreText = new Text('SCORE:', {
            fontFamily: 'SPFont',
            fontSize: 24,
            fill: 0x0066ff,
            align: 'center',
        });

        this.scoreText.x = 20;
        this.scoreText.y = 20;
        this.scoreText.zIndex = 20;

        this.container.addChild(this.scoreText);

        this.scoreValue = new AnimatedText({
            text: '0',
            fontSize: 24,
            fontFamily: 'SPFont',
            fill: 0x0066ff,
            position: {
                x: 120,
                y: 30,
            },
            animationSpeed: 0.1,
            delayBetweenLetters: 50,
            scale: 1,
        });
        this.container.addChild(this.scoreValue.getContainer());
        // JLO TEXT

        const nameText = new Text('TIME LEFT: 30', {
            fontFamily: 'SPFont',
            fontSize: 24,
            fill: 0x0066ff,
            align: 'center',
        });

        nameText.x = this.sceneManager.application.view.width - 200;
        nameText.y = 20;
        nameText.zIndex = 20;

        this.container.addChild(nameText);
    }

    prepareProgressBar() {
        this.progressBar = new ProgressBar({
            width: 500,
            height: 10,
            backgroundColor: 0x3498db,
            fillColor: 0xffcc00,
            borderColor: 0x2980b9,
            borderRadius: 10,
            position: {
                x: this.sceneManager.application.view.width / 2 - 250,
                y: this.sceneManager.application.view.height - 50,
            },
        });
        this.container.addChild(this.progressBar.getContainer());
    }

    prepareConfetti() {
        this.confetti = new SpriteConfetti({
            minPieces: 6,
            maxPieces: 12,
            pieceSize: 80,
            downwardForce: 0.03,
            horizontalForce: 0.05,
            gravityScale: 0.01,
            spread: 350,
        });

        this.container.addChild(this.confetti.getContainer());
    }

    async countdown() {
        sound.play('whatkinda');
        sound.play('countdown', { volume: 0.4 });
        this.countdownText?.setText('TRES');
        await this.countdownText?.animateIn();
        await Utils.delay(1000);
        sound.play('spicier');
        sound.play('countdown', { volume: 0.4 });
        this.ragdoll.singBurrito(true);
        this.countdownText?.setText('DOS');
        await this.countdownText?.animateIn();
        await Utils.delay(500);
        this.ragdoll.singBurrito(true);
        await Utils.delay(500);
        this.ragdoll.singBurrito(true);
        sound.play('countdown', { volume: 0.4 });
        this.countdownText?.setText('UNO');
        await this.countdownText?.animateIn();
        await Utils.delay(500);
        sound.play('go');
        await Utils.delay(500);
        this.container.removeChild(this.countdownText!.getContainer());
        this.start();
    }

    start() {
        sound.play('minus', {
            loop: true,
        });

        this.ragdoll?.dance();

        this.rgba();

        this.startKaraoke();
    }

    async startKaraoke() {
        this.karaokeText.resetWords();
        this.progressBar.reset();
        clearTimeout(this.deadline);

        const text =
            KARAOKE_COMBINATIONS[
                Math.floor(Math.random() * KARAOKE_COMBINATIONS.length)
            ];

        this.karaokeText.setText(text);
        await this.karaokeText.fadeIn(0.5);

        const deadLineTime = text.split(' ').length * 500 + 2000;
        this.progressBar.setProgress(deadLineTime);
        this.deadline = setTimeout(() => {
            this.incorrect();
            this.startKaraoke();
        }, deadLineTime);
    }

    async correct() {
        this.score += 100;
        this.karaokeText.setColors(0x0066ff, 0x00ff66);
        this.updateScore();
        await Utils.delay(200);

        const texture = await Assets.load(
            this.karaokeText.getCurrentWord() === 'TACO'
                ? '/assets/game/img/taco.png'
                : '/assets/game/img/burrito.png',
        );
        const mySprite = new Sprite(texture);
        this.confetti.run(mySprite, {
            x: this.sceneManager.application.view.width / 2,
            y: this.sceneManager.application.view.height / 2,
        });

        this.checkNext();
    }

    async incorrect() {
        this.score -= 100;
        this.karaokeText.setColors(0x0066ff, 0xaa0000);
        this.updateScore();
        await Utils.delay(200);
        sound.play('incorrect', {
            volume: 1.5,
        });
        this.checkNext();
    }

    async checkNext() {
        if (!this.karaokeText.hasNextWord()) {
            await Utils.delay(200);
            this.startKaraoke();
        }
    }

    updateScore() {
        this.scoreValue.setText(this.score.toString());
        this.scoreValue.animateIn();
    }
}
