import { TextStyle, Container, Text } from 'pixi.js';
import { gsap } from 'gsap';
import { DropShadowFilter } from 'pixi-filters';

interface AnimatedTextOptions {
    text: string;
    fontSize?: number;
    fontFamily?: string;
    fill?: number | string;
    position?: { x: number; y: number };
    animationSpeed?: number;
    delayBetweenLetters?: number;
    scale?: number;
    withShadow?: boolean;
}

export class AnimatedText {
    private container: Container;
    private letters: Text[] = [];
    private options: Required<AnimatedTextOptions>;
    private isAnimating = false;

    constructor(options: AnimatedTextOptions) {
        this.options = {
            fontSize: 36,
            fontFamily: 'SPFont',
            fill: 0xffffff,
            position: { x: 0, y: 0 },
            animationSpeed: 0.05,
            delayBetweenLetters: 100,
            scale: 1,
            withShadow: false,
            ...options,
        };

        this.container = new Container();
        this.container.position.set(
            this.options.position.x,
            this.options.position.y,
        );

        this.createLetters();
    }

    private createLetters(): void {
        const { text, fontSize, fontFamily, fill, scale, withShadow } =
            this.options;

        const shadowFilter = new DropShadowFilter({
            blur: 0,
            alpha: 0.6,
            color: 0x000000,
        });

        let currentX = 0;

        for (let i = 0; i < text.length; i++) {
            const letter = text[i];

            // Пропускаем пробелы
            if (letter === ' ') {
                currentX += fontSize * 0.3;
                continue;
            }

            const textStyle = new TextStyle({
                fontFamily: fontFamily,
                fontSize: fontSize,
                fill: fill,
                fontWeight: 'bold',
                align: 'center',
            });

            const letterText = new Text(letter, textStyle);
            letterText.anchor.set(0, 0.5);
            letterText.position.set(currentX, 0);
            letterText.scale.set(scale);
            letterText.filters = withShadow ? [shadowFilter] : [];

            // Начальное состояние для анимации
            letterText.alpha = 0;
            letterText.y -= 20;

            this.letters.push(letterText);
            this.container.addChild(letterText);

            // Обновляем позицию для следующей буквы
            currentX += letterText.width + 2;
        }
    }

    public async animateIn(): Promise<void> {
        if (this.isAnimating) return;

        this.isAnimating = true;

        for (let i = 0; i < this.letters.length; i++) {
            const letter = this.letters[i];

            // Анимация появления
            gsap.to(letter, {
                duration: this.options.animationSpeed * 10,
                alpha: 1,
                y: 0,
                ease: 'back.out(1.7)',
                delay: i * (this.options.delayBetweenLetters / 1000),
            });

            // Ждем перед следующей буквой
            await this.delay(this.options.delayBetweenLetters);
        }

        this.isAnimating = false;
    }

    public async animateOut(): Promise<void> {
        if (this.isAnimating) return;

        this.isAnimating = true;

        for (let i = this.letters.length - 1; i >= 0; i--) {
            const letter = this.letters[i];

            gsap.to(letter, {
                duration: this.options.animationSpeed * 8,
                alpha: 0,
                y: -20,
                ease: 'back.in(1.7)',
                delay:
                    (this.letters.length - 1 - i) *
                    (this.options.delayBetweenLetters / 1000),
            });

            await this.delay(this.options.delayBetweenLetters);
        }

        this.isAnimating = false;
    }

    public async typewriterEffect(): Promise<void> {
        if (this.isAnimating) return;

        this.isAnimating = true;

        // Сначала скрываем все буквы
        this.letters.forEach((letter) => {
            letter.alpha = 0;
        });

        for (let i = 0; i < this.letters.length; i++) {
            const letter = this.letters[i];

            gsap.to(letter, {
                duration: this.options.animationSpeed * 5,
                alpha: 1,
                ease: 'power2.out',
                delay: i * (this.options.delayBetweenLetters / 1000),
            });

            await this.delay(this.options.delayBetweenLetters);
        }

        this.isAnimating = false;
    }

    public async bounceAnimation(): Promise<void> {
        if (this.isAnimating) return;

        this.isAnimating = true;

        for (let i = 0; i < this.letters.length; i++) {
            const letter = this.letters[i];

            letter.y = 0;

            gsap.to(letter, {
                duration: this.options.animationSpeed * 3,
                y: -30,
                ease: 'power2.out',
                yoyo: true,
                repeat: 1,
                delay: i * (this.options.delayBetweenLetters / 500),
            });

            await this.delay(this.options.delayBetweenLetters / 2);
        }

        this.isAnimating = false;
    }

    public setText(newText: string): void {
        this.letters.forEach((letter) => this.container.removeChild(letter));
        this.letters = [];

        this.options.text = newText;

        this.createLetters();
    }

    public getContainer(): Container {
        return this.container;
    }

    public setPosition(x: number, y: number): void {
        this.container.position.set(x, y);
    }

    public setAlpha(alpha: number): void {
        this.letters.forEach((letter) => {
            letter.alpha = alpha;
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    public destroy(): void {
        this.letters.forEach((letter) => letter.destroy());
        this.container.destroy();
    }
}
