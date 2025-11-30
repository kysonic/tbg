import { TextStyle, Container, Text, Graphics } from 'pixi.js';
import { gsap } from 'gsap';

interface KaraokeTextOptions {
    text: string;
    fontSize?: number;
    fontFamily?: string;
    baseColor?: number | string;
    fillColor?: number | string;
    position?: { x: number; y: number };
    animationDuration?: number;
    scale?: number;
    stroke?: number;
    strokeColor?: number;
    align?: 'left' | 'center' | 'right';
}

export class KaraokeText {
    private container: Container;
    private baseText: Text;
    private fillText: Text;
    private mask: Graphics;
    private options: Required<KaraokeTextOptions>;
    private isAnimating = false;
    private currentProgress = 0;
    private currentAnimation: gsap.core.Tween | null = null;
    private words: string[] = [];
    private wordWidths: number[] = [];
    private totalWidth = 0;
    private currentWordIndex = -1;

    constructor(options: KaraokeTextOptions) {
        this.options = {
            fontSize: 36,
            fontFamily: 'Arial',
            baseColor: 0x0066ff,
            fillColor: 0x00ff66,
            position: { x: 0, y: 0 },
            animationDuration: 3,
            scale: 1,
            stroke: 0,
            strokeColor: 0x000000,
            align: 'center',
            ...options,
        };

        this.container = new Container();
        this.container.position.set(
            this.options.position.x,
            this.options.position.y,
        );

        this.words = this.options.text.split(' ');
        this.calculateWordWidths();

        this.createTextElements();
        this.createMask();
    }

    private calculateWordWidths(): void {
        this.wordWidths = [];
        this.totalWidth = 0;

        this.words.forEach((word) => {
            const tempText = new Text(
                word,
                this.baseText?.style ||
                    new TextStyle({
                        fontFamily: this.options.fontFamily,
                        fontSize: this.options.fontSize,
                        fontWeight: 'bold',
                    }),
            );
            this.wordWidths.push(tempText.width);
            this.totalWidth += tempText.width;
            tempText.destroy();
        });
    }

    private createTextElements(): void {
        const {
            text,
            fontSize,
            fontFamily,
            baseColor,
            fillColor,
            stroke,
            strokeColor,
            scale,
        } = this.options;

        // Base text style (the background color)
        const baseTextStyle = new TextStyle({
            fontFamily,
            fontSize,
            fill: baseColor,
            fontWeight: 'bold',
            align: 'center',
            stroke: strokeColor,
            strokeThickness: stroke,
        });

        // Fill text style (the progressing color)
        const fillTextStyle = new TextStyle({
            fontFamily,
            fontSize,
            fill: fillColor,
            fontWeight: 'bold',
            align: 'center',
            stroke: strokeColor,
            strokeThickness: stroke,
        });

        // Create base text
        this.baseText = new Text(text, baseTextStyle);
        this.baseText.anchor.set(0.5);
        this.baseText.scale.set(scale);

        // Create fill text (will be masked)
        this.fillText = new Text(text, fillTextStyle);
        this.fillText.anchor.set(0.5);
        this.fillText.scale.set(scale);

        this.container.addChild(this.baseText);
        this.container.addChild(this.fillText);
    }

    private createMask(): void {
        this.mask = new Graphics();
        this.container.addChild(this.mask);
        this.fillText.mask = this.mask;

        // Initialize mask at 0 progress
        this.updateMask(0);
    }

    private updateMask(progress: number): void {
        const width = this.baseText.width;
        const height = this.baseText.height;

        this.mask.clear();
        this.mask.beginFill(0xffffff);
        this.mask.drawRect(
            -width / 2,
            -height / 2,
            (width * progress) / 100,
            height,
        );
        this.mask.endFill();
    }

    public async revealNextWord(duration: number = 0.3): Promise<void> {
        if (this.isAnimating) {
            this.currentAnimation?.kill();
        }

        // Move to next word
        this.currentWordIndex++;

        // If we've passed the last word, do nothing
        if (this.currentWordIndex >= this.words.length) {
            return;
        }

        this.isAnimating = true;

        // Calculate target progress
        let targetProgress = 0;
        for (let i = 0; i <= this.currentWordIndex; i++) {
            targetProgress += (this.wordWidths[i] / this.totalWidth) * 100;
        }

        await new Promise<void>((resolve) => {
            this.currentAnimation = gsap.to(this, {
                duration,
                currentProgress: targetProgress,
                ease: 'power2.out',
                onUpdate: () => {
                    this.updateMask(this.currentProgress);
                },
                onComplete: () => {
                    this.isAnimating = false;
                    this.currentAnimation = null;
                    resolve();
                },
            });
        });
    }

    public async revealPreviousWord(duration: number = 0.3): Promise<void> {
        if (this.isAnimating) {
            this.currentAnimation?.kill();
        }

        // Move to previous word
        this.currentWordIndex--;

        // If we're before the first word, reset to beginning
        if (this.currentWordIndex < -1) {
            this.currentWordIndex = -1;
        }

        this.isAnimating = true;

        // Calculate target progress
        let targetProgress = 0;
        for (let i = 0; i <= this.currentWordIndex; i++) {
            targetProgress += (this.wordWidths[i] / this.totalWidth) * 100;
        }

        await new Promise<void>((resolve) => {
            this.currentAnimation = gsap.to(this, {
                duration,
                currentProgress: targetProgress,
                ease: 'power2.out',
                onUpdate: () => {
                    this.updateMask(this.currentProgress);
                },
                onComplete: () => {
                    this.isAnimating = false;
                    this.currentAnimation = null;
                    resolve();
                },
            });
        });
    }

    public async revealAllWords(duration?: number): Promise<void> {
        if (this.isAnimating) {
            this.currentAnimation?.kill();
        }

        this.isAnimating = true;
        this.currentWordIndex = this.words.length - 1;

        await this.animateProgress(100, duration);
    }

    public async resetWords(duration?: number): Promise<void> {
        if (this.isAnimating) {
            this.currentAnimation?.kill();
        }

        this.isAnimating = true;
        this.currentWordIndex = -1;

        await this.animateProgress(0, duration);
    }

    private async animateProgress(
        targetProgress: number,
        duration?: number,
    ): Promise<void> {
        const animDuration = duration || this.options.animationDuration;

        await new Promise<void>((resolve) => {
            this.currentAnimation = gsap.to(this, {
                duration: animDuration,
                currentProgress: targetProgress,
                ease: 'power2.out',
                onUpdate: () => {
                    this.updateMask(this.currentProgress);
                },
                onComplete: () => {
                    this.isAnimating = false;
                    this.currentAnimation = null;
                    resolve();
                },
            });
        });
    }

    // Progress tracking methods
    public getProgress(): number {
        return this.currentProgress;
    }

    public isAnimationRunning(): boolean {
        return this.isAnimating;
    }

    public getCurrentWord(): string | null {
        if (
            this.currentWordIndex >= 0 &&
            this.currentWordIndex < this.words.length
        ) {
            return this.words[this.currentWordIndex];
        }
        return null;
    }

    public getNextWord(): string | null {
        return this.words[this.currentWordIndex + 1];
    }

    public getCurrentWordIndex(): number {
        return this.currentWordIndex;
    }

    public getTotalWords(): number {
        return this.words.length;
    }

    public hasNextWord(): boolean {
        return this.currentWordIndex < this.words.length - 1;
    }

    public hasPreviousWord(): boolean {
        return this.currentWordIndex > 0;
    }

    public stopAnimation(): void {
        if (this.currentAnimation) {
            this.currentAnimation.kill();
            this.isAnimating = false;
            this.currentAnimation = null;
        }
    }

    public setProgress(progress: number): void {
        this.stopAnimation();
        this.currentProgress = Math.max(0, Math.min(100, progress));

        // Update current word index based on progress
        this.updateCurrentWordIndexFromProgress();
        this.updateMask(this.currentProgress);
    }

    private updateCurrentWordIndexFromProgress(): void {
        let accumulatedProgress = 0;
        this.currentWordIndex = -1;

        for (let i = 0; i < this.words.length; i++) {
            const wordProgress = (this.wordWidths[i] / this.totalWidth) * 100;
            accumulatedProgress += wordProgress;

            if (
                this.currentProgress >=
                accumulatedProgress - wordProgress / 2
            ) {
                this.currentWordIndex = i;
            }
        }
    }

    public setText(newText: string): void {
        this.stopAnimation();
        this.options.text = newText;
        this.words = newText.split(' ');
        this.currentWordIndex = -1;
        this.currentProgress = 0;

        this.calculateWordWidths();
        this.baseText.text = newText;
        this.fillText.text = newText;

        this.updateMask(this.currentProgress);
    }

    public setColors(
        baseColor: number | string,
        fillColor: number | string,
    ): void {
        this.options.baseColor = baseColor;
        this.options.fillColor = fillColor;

        this.baseText.style.fill = baseColor;
        this.fillText.style.fill = fillColor;
    }

    public getContainer(): Container {
        return this.container;
    }

    public setPosition(x: number, y: number): void {
        this.container.position.set(x, y);
    }

    public setScale(scale: number): void {
        this.options.scale = scale;
        this.baseText.scale.set(scale);
        this.fillText.scale.set(scale);
        this.updateMask(this.currentProgress);
    }

    public async fadeIn(duration: number = 0.5): Promise<void> {
        if (this.isAnimating) {
            this.currentAnimation?.kill();
        }

        this.isAnimating = true;

        // Set initial alpha to 0
        this.baseText.alpha = 0;
        this.fillText.alpha = 0;

        await new Promise<void>((resolve) => {
            this.currentAnimation = gsap.to([this.baseText, this.fillText], {
                duration,
                alpha: 1,
                ease: 'power2.out',
                onComplete: () => {
                    this.isAnimating = false;
                    this.currentAnimation = null;
                    resolve();
                },
            });
        });
    }

    public async fadeOut(duration: number = 0.5): Promise<void> {
        if (this.isAnimating) {
            this.currentAnimation?.kill();
        }

        this.isAnimating = true;

        await new Promise<void>((resolve) => {
            this.currentAnimation = gsap.to([this.baseText, this.fillText], {
                duration,
                alpha: 0,
                ease: 'power2.in',
                onComplete: () => {
                    this.isAnimating = false;
                    this.currentAnimation = null;
                    resolve();
                },
            });
        });
    }

    public destroy(): void {
        this.stopAnimation();
        this.baseText.destroy();
        this.fillText.destroy();
        this.mask.destroy();
        this.container.destroy();
    }
}
