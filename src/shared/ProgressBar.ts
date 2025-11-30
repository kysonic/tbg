import { Container, Graphics } from 'pixi.js';
import { gsap } from 'gsap';

interface ProgressBarOptions {
    width?: number;
    height?: number;
    backgroundColor?: number;
    fillColor?: number;
    borderColor?: number;
    borderWidth?: number;
    borderRadius?: number;
    position?: { x: number; y: number };
}

export class ProgressBar {
    private container: Container;
    private background: Graphics;
    private fill: Graphics;
    private options: Required<ProgressBarOptions>;
    private currentProgress: number = 0;
    private isAnimating: boolean = false;
    private currentTween: gsap.core.Tween | null = null;

    constructor(options: ProgressBarOptions = {}) {
        this.options = {
            width: 300,
            height: 30,
            backgroundColor: 0x2c3e50,
            fillColor: 0x27ae60,
            borderColor: 0x34495e,
            borderWidth: 2,
            borderRadius: 8,
            position: { x: 0, y: 0 },
            ...options,
        };

        this.container = new Container();
        this.container.position.set(
            this.options.position.x,
            this.options.position.y,
        );

        this.background = new Graphics();
        this.fill = new Graphics();

        this.container.addChild(this.background);
        this.container.addChild(this.fill);

        this.draw();
    }

    private draw(): void {
        const {
            width,
            height,
            backgroundColor,
            fillColor,
            borderColor,
            borderWidth,
            borderRadius,
        } = this.options;

        // Очищаем графику
        this.background.clear();
        this.fill.clear();

        // Рисуем фон
        this.background.beginFill(backgroundColor);
        this.background.lineStyle(borderWidth, borderColor);
        this.background.drawRoundedRect(0, 0, width, height, borderRadius);
        this.background.endFill();

        // Рисуем заполнение
        const fillWidth =
            (width - borderWidth * 2) * (this.currentProgress / 100);
        if (fillWidth > 0) {
            this.fill.beginFill(fillColor);
            this.fill.drawRoundedRect(
                borderWidth,
                borderWidth,
                fillWidth,
                height - borderWidth * 2,
                borderRadius,
            );
            this.fill.endFill();
        }
    }

    public async setProgress(
        duration: number,
        targetProgress: number = 100,
    ): Promise<void> {
        if (this.isAnimating) {
            this.stopAnimation();
        }

        this.isAnimating = true;

        return new Promise((resolve) => {
            this.currentTween = gsap.to(this, {
                duration: duration / 1000,
                currentProgress: targetProgress,
                ease: 'power1.none',
                onUpdate: () => {
                    this.draw();
                },
                onComplete: () => {
                    this.isAnimating = false;
                    this.currentTween = null;
                    resolve();
                },
            });
        });
    }

    public setProgressImmediate(progress: number): void {
        this.stopAnimation();
        this.currentProgress = Math.max(0, Math.min(100, progress));
        this.draw();
    }

    public async animateFromTo(
        startProgress: number,
        endProgress: number,
        duration: number,
    ): Promise<void> {
        if (this.isAnimating) {
            this.stopAnimation();
        }

        this.isAnimating = true;
        this.currentProgress = startProgress;
        this.draw();

        return new Promise((resolve) => {
            this.currentTween = gsap.to(this, {
                duration: duration / 1000,
                currentProgress: endProgress,
                ease: 'power1.none',
                onUpdate: () => {
                    this.draw();
                },
                onComplete: () => {
                    this.isAnimating = false;
                    this.currentTween = null;
                    resolve();
                },
            });
        });
    }

    public reset(): void {
        this.stopAnimation();
        this.currentProgress = 0;
        this.draw();
    }

    public stopAnimation(): void {
        if (this.currentTween) {
            this.currentTween.kill();
            this.currentTween = null;
        }
        this.isAnimating = false;
    }

    public getContainer(): Container {
        return this.container;
    }

    public setPosition(x: number, y: number): void {
        this.container.position.set(x, y);
    }

    public getProgress(): number {
        return this.currentProgress;
    }

    public setSize(width: number, height: number): void {
        this.options.width = width;
        this.options.height = height;
        this.draw();
    }

    public setColors(
        backgroundColor?: number,
        fillColor?: number,
        borderColor?: number,
    ): void {
        if (backgroundColor) this.options.backgroundColor = backgroundColor;
        if (fillColor) this.options.fillColor = fillColor;
        if (borderColor) this.options.borderColor = borderColor;
        this.draw();
    }

    public destroy(): void {
        this.stopAnimation();
        this.background.destroy();
        this.fill.destroy();
        this.container.destroy();
    }
}
