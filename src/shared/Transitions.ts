import { Container } from 'pixi.js';

export interface Transition {
    start: (from: Container, to: Container) => Promise<void>;
    duration: number;
}

export class Transitions {
    public static fade(duration: number = 500): Transition {
        return {
            duration,
            start: async (from: Container, to: Container) => {
                to.visible = true;
                to.alpha = 0;

                return new Promise<void>((resolve) => {
                    const startTime = Date.now();

                    const animate = () => {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        to.alpha = progress;
                        from.alpha = 1 - progress;

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            from.visible = false;
                            from.alpha = 1;
                            resolve();
                        }
                    };

                    animate();
                });
            },
        };
    }
}
