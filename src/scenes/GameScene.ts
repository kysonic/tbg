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
import { Transitions } from '../shared/Transitions';
import { CircleButton } from '../shared/CircleButton';

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

const TUTORIAL_COMBINATION = 'TACO BURRITO TACO BURRITO';

const DEFAULT_TIME_LEFT = 30;

export class GameScene {
    public name = 'Game';
    public container = new Container();
    private sceneManager: SceneManager;
    private ragdoll: Ragdoll | null = null;
    private greenScreen: Graphics | null = null;
    private countdownText: AnimatedText | null = null;
    private karaokeText: KaraokeText | null = null;
    private scoreText: Text | null = null;
    private timeText: Text | null = null;
    private scoreValue: AnimatedText | null = null;
    private tutorialText: AnimatedText | null = null;
    private progressBar: ProgressBar | null = null;
    private confetti: SpriteConfetti | null = null;
    public score: number = 0;
    private timeLeft: number = DEFAULT_TIME_LEFT;
    private deadline: number = 0;
    private timer: number = 0;
    private isPlaying = false;
    private isTutorial = false;
    private tacoButton: CircleButton | null = null;
    private burritoButton: CircleButton | null = null;

    private keyboardHandler: () => void = () => {};

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

        this.prepareSounds();
        this.prepareGreenScreen();
        this.prepareCountdownText();
        this.prepareKaraokeText();
        this.prepareText();
        this.prepareTutorialText();
        this.prepareProgressBar();
        this.prepareConfetti();
        if (Utils.isMobile()) {
            this.prepareControls();
        }

        this.setGreenScreen();
    }

    onStart() {
        console.log('Game started');

        this.isPlaying = true;
        sound.stop('minus');

        this.keyboardHandler = this.handleKeyboardControls.bind(this);

        this.countdown();
        this.setGreenScreen();
        this.updateScore();
        this.updateTimeLeft();
    }

    onStop() {
        console.log('Game stopped');
    }

    onResize() {
        console.log('Resized');
    }

    onTick() {
        if (this.isPlaying) {
            this.ragdoll?.onTick();
        }
    }

    handleKeyboardControls(e: KeyboardEvent) {
        if (e.key === 't') {
            this.pressedTaco();
        }
        if (e.key === 'b') {
            this.pressedBurrito();
        }
    }

    pressedTaco() {
        if (this.ragdoll.isSinging) return;

        if (!this.isTutorial) {
            this.pressedUsualTaco();
        } else {
            this.pressedTutorialTaco();
        }
    }

    pressedUsualTaco() {
        if (this.karaokeText.getNextWord() === 'TACO') {
            this.correct();
        } else {
            this.incorrect();
        }

        this.ragdoll?.signTaco();
        this.karaokeText.revealNextWord();
    }

    pressedTutorialTaco() {
        if (this.karaokeText.getNextWord() === 'TACO') {
            this.ragdoll?.signTaco();
            this.karaokeText.revealNextWord();
            this.tutorialNext();
        }
    }

    pressedBurrito() {
        if (this.ragdoll.isSinging) return;

        if (!this.isTutorial) {
            this.pressedUsualBurrito();
        } else {
            this.pressedTutorialBurrito();
        }
    }

    pressedUsualBurrito() {
        if (this.karaokeText.getNextWord() === 'BURRITO') {
            this.correct();
        } else {
            this.incorrect();
        }

        this.ragdoll?.singBurrito();
        this.karaokeText.revealNextWord();
    }

    pressedTutorialBurrito() {
        if (this.karaokeText.getNextWord() === 'BURRITO') {
            this.ragdoll?.singBurrito();
            this.karaokeText.revealNextWord();
            this.tutorialNext();
        }
    }

    prepareSounds() {
        sound.add('minus', '/assets/game/sounds/minus.mp3');
        sound.add('correct', '/assets/game/sounds/correct.mp3');
        sound.add('incorrect', '/assets/game/sounds/incorrect.mp3');
        sound.add('spicier', '/assets/game/sounds/spicy.mp3');
        sound.add('whatkinda', '/assets/game/sounds/what-kinda-song.mp3');
        sound.add('go', '/assets/game/sounds/go.mp3');
        sound.add('countdown', '/assets/game/sounds/countdown.mp3');
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
        this.greenScreen.endFill();
        this.container.addChild(this.greenScreen);
        this.greenScreen.zIndex = 1;
    }

    setGreenScreen() {
        this.clearRgba();
        this.greenScreen.alpha = 1;
    }

    removeGreenScreen() {
        this.greenScreen.alpha = 0;
    }

    rgba() {
        this.removeGreenScreen();

        const canvas = document.getElementById(
            'rgba-canvas',
        ) as HTMLCanvasElement;
        canvas.style.display = 'block';
        RGBA(fragmentShader, {
            target: canvas,
            fullscreen: true,
        });
    }

    clearRgba() {
        const canvas = document.getElementById(
            'rgba-canvas',
        ) as HTMLCanvasElement;
        canvas.style.display = 'none';
    }

    prepareCountdownText() {
        this.countdownText = new AnimatedText({
            text: 'TRES',
            fontSize: 56,
            fontFamily: 'SPFont',
            fill: 0xffff00,
            position: {
                x: this.sceneManager.application.view.width / 2,
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
            fontSize: this.sceneManager.application.view.width > 900 ? 48 : 20,
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

    prepareText() {
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
                y: 32,
            },
            animationSpeed: 0.1,
            delayBetweenLetters: 50,
            scale: 1,
            centered: false,
        });
        this.container.addChild(this.scoreValue.getContainer());
        // Time Left

        this.timeText = new Text(`TIME LEFT: ${this.timeLeft}`, {
            fontFamily: 'SPFont',
            fontSize: 24,
            fill: 0x0066ff,
            align: 'center',
        });

        this.timeText.x = this.sceneManager.application.view.width - 200;
        this.timeText.y = 20;
        this.timeText.zIndex = 20;

        this.container.addChild(this.timeText);
    }

    prepareTutorialText() {
        this.tutorialText = new AnimatedText({
            text: 'PRESS T KEY',
            fontSize: this.sceneManager.application.view.width > 900 ? 50 : 35,
            fontFamily: 'SPFont',
            fill: 0x0066ff,
            position: {
                x: this.sceneManager.application.view.width / 2,
                y: this.sceneManager.application.view.height / 2,
            },
            animationSpeed: 0.3,
            delayBetweenLetters: 20,
            scale: 1,
            withShadow: true,
        });

        this.tutorialText.getContainer().zIndex = 20;
        this.container.addChild(this.tutorialText.getContainer());
    }

    prepareProgressBar() {
        const barWidth =
            this.sceneManager.application.view.width > 900 ? 500 : 200;

        this.progressBar = new ProgressBar({
            width: barWidth,
            height: 10,
            backgroundColor: 0x3498db,
            fillColor: 0xffcc00,
            borderColor: 0x2980b9,
            borderRadius: 10,
            position: {
                x: this.sceneManager.application.view.width / 2 - barWidth / 2,
                y: this.sceneManager.application.view.height - 50,
            },
        });
        this.progressBar.getContainer().zIndex = 20;
        this.container.addChild(this.progressBar.getContainer());
        this.progressBar.hide();
    }

    prepareConfetti() {
        this.confetti = new SpriteConfetti({
            minPieces: 6,
            maxPieces: 12,
            pieceSize: 80,
            downwardForce: 0.05,
            horizontalForce: 0.07,
            gravityScale: 0.05,
            spread: 500,
        });

        this.container.addChild(this.confetti.getContainer());
    }

    async prepareControls() {
        // Taco
        const tacoTexture = await Assets.load('/assets/game/img/taco.png');
        this.tacoButton = new CircleButton(40, tacoTexture, {
            backgroundColor: 0x3498db,
            hoverColor: 0x2980b9,
        });

        this.tacoButton.getContainer().x = 45;
        this.tacoButton.getContainer().y =
            this.sceneManager.application.view.height - 45;
        this.tacoButton.getContainer().zIndex = 25;
        this.tacoButton.getContainer().alpha = 0.8;

        this.container.addChild(this.tacoButton.getContainer());

        this.tacoButton.onClick(this.pressedTaco.bind(this));
        // Burrito
        const burritoTexture = await Assets.load(
            '/assets/game/img/burrito.png',
        );
        this.burritoButton = new CircleButton(40, burritoTexture, {
            backgroundColor: 0x3498db,
            hoverColor: 0x2980b9,
        });

        this.burritoButton.getContainer().x =
            this.sceneManager.application.view.width - 45;
        this.burritoButton.getContainer().y =
            this.sceneManager.application.view.height - 45;
        this.burritoButton.getContainer().zIndex = 25;
        this.burritoButton.getContainer().alpha = 0.8;

        this.container.addChild(this.burritoButton.getContainer());

        this.burritoButton.onClick(this.pressedBurrito.bind(this));
    }

    async countdown() {
        sound.play('whatkinda');
        sound.play('countdown', { volume: 0.3 });
        this.container.addChild(this.countdownText!.getContainer());
        this.countdownText?.setText('TRES');
        await this.countdownText?.animateIn();
        await Utils.delay(1000);
        sound.play('spicier');
        sound.play('countdown', { volume: 0.3 });
        this.ragdoll.singBurrito(true);
        this.countdownText?.setText('DOS');
        await this.countdownText?.animateIn();
        await Utils.delay(500);
        this.ragdoll.singBurrito(true);
        await Utils.delay(500);
        this.ragdoll.singBurrito(true);
        sound.play('countdown', { volume: 0.3 });
        this.countdownText?.setText('UNO');
        await this.countdownText?.animateIn();
        await Utils.delay(1000);
        this.container.removeChild(this.countdownText!.getContainer());
        this.start();
    }

    start() {
        sound.play('minus', {
            loop: true,
        });

        document.addEventListener('keydown', this.keyboardHandler);

        this.ragdoll?.dance();

        this.rgba();

        const tutorialPassed = localStorage.getItem('tbg:tutorial');

        if (tutorialPassed) {
            this.startMainGame();
        } else {
            this.startTutorialGame();
        }
    }

    startMainGame() {
        this.startKaraoke();
        this.timer = setInterval(this.handleTimer.bind(this), 1000);
    }

    async startTutorialGame() {
        this.isTutorial = true;
        this.progressBar.hide();
        this.karaokeText.setText(TUTORIAL_COMBINATION);
        await this.karaokeText.fadeIn(0.5);
        this.tutorialText.setText(
            Utils.isMobile() ? 'PRESS TACO' : 'PRESS T KEY',
        );
        this.tutorialText.animateIn();
    }

    async tutorialNext() {
        const dish = this.karaokeText.getNextWord();
        if (dish) {
            this.tutorialText.setText(
                Utils.isMobile()
                    ? `PRESS ${dish}`
                    : `PRESS ${dish.charAt(0)} KEY`,
            );
            this.tutorialText.animateIn();
        } else {
            this.tutorialText.setText(`GO!!!!`);
            this.tutorialText.animateIn();
            await this.karaokeText.fadeOut(0.1);
            await Utils.delay(500);
            sound.play('go');
            await Utils.delay(500);
            this.tutorialText.getContainer().alpha = 0;
            this.isTutorial = false;
            localStorage.setItem('tbg:tutorial', 'true');
            this.startMainGame();
        }
    }

    async startKaraoke() {
        if (!this.isPlaying) return;

        this.karaokeText.resetWords();
        this.progressBar.reset();
        clearTimeout(this.deadline);

        const text =
            KARAOKE_COMBINATIONS[
                Math.floor(Math.random() * KARAOKE_COMBINATIONS.length)
            ];

        this.karaokeText.setText(text);
        await this.karaokeText.fadeIn(0.5);
        this.progressBar.show();
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

        this.confettiRun(this.karaokeText.getCurrentWord());

        this.checkNext();
    }

    async confettiRun(dish: string) {
        const texture = await Assets.load(
            dish === 'TACO'
                ? '/assets/game/img/taco.png'
                : '/assets/game/img/burrito.png',
        );
        const mySprite = new Sprite(texture);
        this.confetti.run(mySprite, {
            x: this.sceneManager.application.view.width / 2,
            y: this.sceneManager.application.view.height / 2,
        });
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

    handleTimer() {
        this.timeLeft -= 1;
        this.updateTimeLeft();

        if (this.timeLeft <= 0) {
            this.stopGame();
        }
    }

    updateTimeLeft() {
        this.timeText.text = `TIME LEFT: ${this.timeLeft}`;
    }

    stopGameInteractions() {
        this.timeLeft = DEFAULT_TIME_LEFT;
        this.karaokeText.fadeOut();
        this.progressBar.reset();
        this.progressBar.hide();
        this.score = 0;
        this.ragdoll.stopDance();
        clearInterval(this.timer);
        clearTimeout(this.deadline);
        // Remove event listener
        document.removeEventListener('keydown', this.keyboardHandler);
    }

    async stopGame() {
        this.sceneManager.scenes.get('Scores').setScore(this.score);
        this.stopGameInteractions();
        await this.confettiRun('TACO');
        sound.play('spicier', {
            start: 1.3,
        });
        await this.ragdoll.singBurrito(true);
        await Utils.delay(500);
        this.sceneManager.changeTo('Scores', Transitions.fade(2000));
        await Utils.delay(2000);
        this.setGreenScreen();
        this.isPlaying = false;
        this.confetti.cleanupPieces();
        // sound.stop('minus');
    }
}
