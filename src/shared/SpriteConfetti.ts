import { Sprite, Container } from 'pixi.js';
import Matter from 'matter-js';

interface ConfettiPiece {
    sprite: Sprite;
    body: Matter.Body;
    initialX: number;
    initialY: number;
}

interface SpriteConfettiOptions {
    minPieces?: number;
    maxPieces?: number;
    pieceSize?: number;
    gravityScale?: number;
    spread?: number;
    rotationSpeed?: number;
    downwardForce?: number;
    horizontalForce?: number;
}

export class SpriteConfetti {
    private container: Container;
    private pieces: ConfettiPiece[] = [];
    private engine: Matter.Engine;
    private isRunning = false;
    private options: Required<SpriteConfettiOptions>;

    constructor(options: SpriteConfettiOptions = {}) {
        this.options = {
            minPieces: 4,
            maxPieces: 10,
            pieceSize: 100,
            gravityScale: 0.01, // Гравитация вниз
            spread: 300,
            rotationSpeed: 0.1,
            downwardForce: 0.02, // Дополнительная сила вниз
            horizontalForce: 0.03, // Сила в стороны
            ...options,
        };

        this.container = new Container();
        this.engine = Matter.Engine.create({
            gravity: { x: 0, y: this.options.gravityScale, scale: 0.001 },
        });

        // Запускаем обновление физики
        this.updatePhysics();
    }

    public run(sprite: Sprite, position: { x: number; y: number }): void {
        // if (this.isRunning) return;

        this.isRunning = true;
        this.createConfettiPieces(sprite, position);
    }

    private createConfettiPieces(
        baseSprite: Sprite,
        position: { x: number; y: number },
    ): void {
        const pieceCount = Math.floor(
            Math.random() *
                (this.options.maxPieces - this.options.minPieces + 1) +
                this.options.minPieces,
        );

        for (let i = 0; i < pieceCount; i++) {
            this.createConfettiPiece(baseSprite, position, i);
        }
    }

    private createConfettiPiece(
        baseSprite: Sprite,
        position: { x: number; y: number },
        index: number,
    ): void {
        // Создаем спрайт из текстуры базового спрайта
        const pieceSprite = new Sprite(baseSprite.texture);
        pieceSprite.width = this.options.pieceSize;
        pieceSprite.height = this.options.pieceSize;
        pieceSprite.anchor.set(0.5);

        // Случайное смещение от начальной позиции
        const spreadX = (Math.random() - 0.5) * this.options.spread;
        const startX = position.x + spreadX;
        const startY = position.y;

        pieceSprite.position.set(startX, startY);

        // Создаем физическое тело
        const body = Matter.Bodies.rectangle(
            startX,
            startY,
            this.options.pieceSize,
            this.options.pieceSize,
            {
                restitution: 0.2,
                friction: 0.001,
                frictionAir: 0.002,
                angle: Math.random() * Math.PI * 2,
                angularVelocity:
                    (Math.random() - 0.5) * this.options.rotationSpeed,
                density: 0.001,
            },
        );

        // Случайные силы - в стороны и немного вниз
        const forceX = (Math.random() - 0.5) * this.options.horizontalForce;
        const forceY = Math.random() * this.options.downwardForce * 0.5; // Небольшая дополнительная сила вниз

        Matter.Body.applyForce(body, body.position, {
            x: forceX,
            y: forceY,
        });

        // Начальная скорость - вниз и в стороны
        Matter.Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 6, // В стороны
            y: Math.random() * 3 + 2, // Вниз
        });

        // Добавляем в мир Matter.js
        Matter.Composite.add(this.engine.world, body);

        // Сохраняем конфити
        const piece: ConfettiPiece = {
            sprite: pieceSprite,
            body: body,
            initialX: startX,
            initialY: startY,
        };

        this.pieces.push(piece);
        this.container.addChild(pieceSprite);
    }

    private updatePhysics(): void {
        const update = () => {
            if (this.pieces.length > 0) {
                Matter.Engine.update(this.engine, 16); // ~60 FPS

                // Обновляем позиции и вращение спрайтов
                this.pieces.forEach((piece, index) => {
                    piece.sprite.position.set(
                        piece.body.position.x,
                        piece.body.position.y,
                    );
                    piece.sprite.rotation = piece.body.angle;

                    // Проверяем, вышло ли конфити за пределы экрана
                    this.checkBounds(piece, index);
                });

                // Удаляем конфити, которые вышли за пределы
                this.cleanupPieces();
            }

            requestAnimationFrame(update);
        };

        update();
    }

    private checkBounds(piece: ConfettiPiece, index: number): void {
        const sprite = piece.sprite;

        // Проверяем, вышло ли конфити за нижнюю границу экрана
        if (sprite.y > window.innerHeight + this.options.pieceSize * 2) {
            this.removePiece(index);
            return;
        }

        // Проверяем, вышло ли за боковые границы
        if (
            sprite.x < -this.options.pieceSize * 2 ||
            sprite.x > window.innerWidth + this.options.pieceSize * 2
        ) {
            this.removePiece(index);
            return;
        }

        // Дополнительная проверка: если конфити улетело слишком далеко от начальной позиции
        const distanceFromStart = Math.sqrt(
            Math.pow(sprite.x - piece.initialX, 2) +
                Math.pow(sprite.y - piece.initialY, 2),
        );

        if (
            distanceFromStart >
            Math.max(window.innerWidth, window.innerHeight) * 1.5
        ) {
            this.removePiece(index);
        }
    }

    private removePiece(index: number): void {
        const piece = this.pieces[index];

        if (piece) {
            // Удаляем из Matter.js мира
            Matter.Composite.remove(this.engine.world, piece.body);

            // Удаляем со сцены
            this.container.removeChild(piece.sprite);

            // Уничтожаем спрайт
            piece.sprite.destroy();

            // Удаляем из массива
            this.pieces.splice(index, 1);
        }
    }

    public cleanupPieces(): void {
        // Удаляем все помеченные для удаления конфити
        for (let i = this.pieces.length - 1; i >= 0; i--) {
            const piece = this.pieces[i];
            const sprite = piece.sprite;

            if (
                sprite.y > window.innerHeight + this.options.pieceSize * 2 ||
                sprite.x < -this.options.pieceSize * 2 ||
                sprite.x > window.innerWidth + this.options.pieceSize * 2
            ) {
                this.removePiece(i);
            }
        }

        // Если все конфити исчезли, останавливаем анимацию
        if (this.pieces.length === 0) {
            this.isRunning = false;
        }
    }

    public getContainer(): Container {
        return this.container;
    }

    public stop(): void {
        // Немедленно удаляем все конфити
        for (let i = this.pieces.length - 1; i >= 0; i--) {
            this.removePiece(i);
        }
        this.isRunning = false;
    }

    public isActive(): boolean {
        return this.isRunning && this.pieces.length > 0;
    }

    public destroy(): void {
        this.stop();
        Matter.Engine.clear(this.engine);
        this.container.destroy({ children: true });
    }
}

// Вариант с быстрым падением и небольшим разлетом
export class FastFallConfetti extends SpriteConfetti {
    constructor(options: SpriteConfettiOptions = {}) {
        super({
            gravityScale: 0.02, // Сильная гравитация
            downwardForce: 0.03, // Дополнительная сила вниз
            horizontalForce: 0.01, // Небольшой разлет в стороны
            spread: 150,
            ...options,
        });
    }
}

// Вариант с медленным падением и большим разлетом
export class SlowSpreadConfetti extends SpriteConfetti {
    constructor(options: SpriteConfettiOptions = {}) {
        super({
            gravityScale: 0.005, // Слабая гравитация
            downwardForce: 0.01, // Маленькая сила вниз
            horizontalForce: 0.04, // Большой разлет в стороны
            spread: 400,
            ...options,
        });
    }
}

// Пример использования:
/*
const confetti = new SpriteConfetti({
    minPieces: 6,
    maxPieces: 12,
    pieceSize: 80,
    downwardForce: 0.02, // Сила вниз
    horizontalForce: 0.025, // Сила в стороны
    gravityScale: 0.01, // Гравитация вниз
    spread: 250
});

// Запускаем - теперь конфити сразу полетят вниз с разлетом в стороны
confetti.run(sprite, { x: 400, y: 100 }); // Старт сверху
*/
