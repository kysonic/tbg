// import { Game } from './entities/Game';
// new Game();

import * as PIXI from 'pixi.js';
import Matter, {
    Bodies,
    Body,
    Composite,
    Constraint,
    Engine,
    Mouse,
    MouseConstraint,
    Render,
    World,
} from 'matter-js';

class RagdollGame {
    private app: PIXI.Application;
    private engine: Engine;
    private ragdollBodies: Body[] = [];
    private ragdollSprites: PIXI.Sprite[] = [];
    private constraints: Constraint[] = [];

    // Конфигурация ragdoll
    private readonly config = {
        head: { radius: 20 },
        body: { width: 40, height: 60 },
        arm: { width: 15, height: 40 },
        leg: { width: 15, height: 50 },
        hand: { radius: 10 },
        foot: { width: 20, height: 10 },
    };

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        this.app = new PIXI.Application();
        // Инициализация PixiJS
        await this.app.init({
            background: '0x1099bb',
            resizeTo: window,
        });

        document.getElementById('pixi-container')!.appendChild(this.app.canvas);

        // Инициализация Matter.js
        this.engine = Engine.create({
            gravity: { x: 0, y: 1 },
        });

        this.createRagdoll();
        this.createArm();
        // this.createBounds();
        this.setupMouseInteraction();
        this.startGameLoop();
    }

    private createRagdoll(): void {
        const startX = 600;
        const startY = 200;

        // Создание частей тела
        const head = Bodies.circle(startX, startY, this.config.head.radius, {
            label: 'head',
            friction: 0.1,
            restitution: 0.3,
        });

        const body = Bodies.rectangle(
            startX,
            startY + 60,
            this.config.body.width,
            this.config.body.height,
            {
                label: 'body',
                friction: 0.1,
                restitution: 0.1,
            },
        );

        // Руки
        const leftArm = Bodies.rectangle(
            startX - 30,
            startY + 40,
            this.config.arm.width,
            this.config.arm.height,
            {
                label: 'leftArm',
                friction: 0.1,
                restitution: 0.2,
            },
        );

        const rightArm = Bodies.rectangle(
            startX + 30,
            startY + 40,
            this.config.arm.width,
            this.config.arm.height,
            {
                label: 'rightArm',
                friction: 0.1,
                restitution: 0.2,
            },
        );

        // Кисти
        const leftHand = Bodies.circle(
            startX - 30,
            startY + 80,
            this.config.hand.radius,
            {
                label: 'leftHand',
                friction: 0.1,
                restitution: 0.3,
            },
        );

        const rightHand = Bodies.circle(
            startX + 30,
            startY + 80,
            this.config.hand.radius,
            {
                label: 'rightHand',
                friction: 0.1,
                restitution: 0.3,
            },
        );

        // Ноги
        const leftLeg = Bodies.rectangle(
            startX - 15,
            startY + 110,
            this.config.leg.width,
            this.config.leg.height,
            {
                label: 'leftLeg',
                friction: 0.1,
                restitution: 0.1,
            },
        );

        const rightLeg = Bodies.rectangle(
            startX + 15,
            startY + 110,
            this.config.leg.width,
            this.config.leg.height,
            {
                label: 'rightLeg',
                friction: 0.1,
                restitution: 0.1,
            },
        );

        // Стопы
        const leftFoot = Bodies.rectangle(
            startX - 15,
            startY + 160,
            this.config.foot.width,
            this.config.foot.height,
            {
                label: 'leftFoot',
                friction: 1.0,
                restitution: 0.1,
            },
        );

        const rightFoot = Bodies.rectangle(
            startX + 15,
            startY + 160,
            this.config.foot.width,
            this.config.foot.height,
            {
                label: 'rightFoot',
                friction: 1.0,
                restitution: 0.1,
            },
        );

        // Сбор всех частей тела
        this.ragdollBodies = [
            head,
            body,
            leftArm,
            rightArm,
            leftHand,
            rightHand,
            leftLeg,
            rightLeg,
            leftFoot,
            rightFoot,
        ];

        // Создание спрайтов
        this.createSprites();

        // Создание соединений (constraints)
        this.createConstraints(startX, startY);

        // Добавление в мир
        World.add(this.engine.world, this.ragdollBodies);
        World.add(this.engine.world, this.constraints);
    }

    private createSprites(): void {
        const colors: { [key: string]: number } = {
            head: 0xff6b6b,
            body: 0x4ecdc4,
            leftArm: 0x45b7d1,
            rightArm: 0x45b7d1,
            leftHand: 0x96ceb4,
            rightHand: 0x96ceb4,
            leftLeg: 0xfeca57,
            rightLeg: 0xfeca57,
            leftFoot: 0xff9ff3,
            rightFoot: 0xff9ff3,
        };

        this.ragdollBodies.forEach((body, index) => {
            let sprite: PIXI.Sprite;
            const label = body.label || '';

            if (label.includes('head') || label.includes('hand')) {
                const graphics = new PIXI.Graphics();
                const radius = body.circleRadius || 20;
                graphics.beginFill(colors[label] || 0xffffff);
                graphics.drawCircle(0, 0, radius);
                graphics.endFill();

                const texture = this.app.renderer.generateTexture(graphics);
                sprite = new PIXI.Sprite(texture);
            } else {
                const graphics = new PIXI.Graphics();
                const width = body.bounds.max.x - body.bounds.min.x;
                const height = body.bounds.max.y - body.bounds.min.y;
                graphics.beginFill(colors[label] || 0xffffff);
                graphics.drawRoundedRect(
                    -width / 2,
                    -height / 2,
                    width,
                    height,
                    5,
                );
                graphics.endFill();

                const texture = this.app.renderer.generateTexture(graphics);
                sprite = new PIXI.Sprite(texture);
            }

            sprite.anchor.set(0.5);
            this.app.stage.addChild(sprite);
            this.ragdollSprites.push(sprite);
        });
    }

    private createConstraints(startX: number, startY: number): void {
        const [
            head,
            body,
            leftArm,
            rightArm,
            leftHand,
            rightHand,
            leftLeg,
            rightLeg,
            leftFoot,
            rightFoot,
        ] = this.ragdollBodies;

        // Голова к телу
        this.constraints.push(
            Constraint.create({
                bodyA: head,
                bodyB: body,
                pointA: { x: 0, y: this.config.head.radius },
                pointB: { x: 0, y: -this.config.body.height / 2 },
                stiffness: 0.7,
                length: 0,
            }),
        );

        // Руки к телу
        this.constraints.push(
            Constraint.create({
                bodyA: body,
                bodyB: leftArm,
                pointA: {
                    x: -this.config.body.width / 2,
                    y: -this.config.body.height / 4,
                },
                pointB: { x: 0, y: -this.config.arm.height / 2 },
                stiffness: 0.6,
                length: 0,
            }),
        );

        this.constraints.push(
            Constraint.create({
                bodyA: body,
                bodyB: rightArm,
                pointA: {
                    x: this.config.body.width / 2,
                    y: -this.config.body.height / 4,
                },
                pointB: { x: 0, y: -this.config.arm.height / 2 },
                stiffness: 0.6,
                length: 0,
            }),
        );

        // Кисти к рукам
        this.constraints.push(
            Constraint.create({
                bodyA: leftArm,
                bodyB: leftHand,
                pointA: { x: 0, y: this.config.arm.height / 2 },
                pointB: { x: 0, y: 0 },
                stiffness: 0.8,
                length: 0,
            }),
        );

        this.constraints.push(
            Constraint.create({
                bodyA: rightArm,
                bodyB: rightHand,
                pointA: { x: 0, y: this.config.arm.height / 2 },
                pointB: { x: 0, y: 0 },
                stiffness: 0.8,
                length: 0,
            }),
        );

        // Ноги к телу
        this.constraints.push(
            Constraint.create({
                bodyA: body,
                bodyB: leftLeg,
                pointA: {
                    x: -this.config.body.width / 4,
                    y: this.config.body.height / 2,
                },
                pointB: { x: 0, y: -this.config.leg.height / 2 },
                stiffness: 0.7,
                length: 0,
            }),
        );

        this.constraints.push(
            Constraint.create({
                bodyA: body,
                bodyB: rightLeg,
                pointA: {
                    x: this.config.body.width / 4,
                    y: this.config.body.height / 2,
                },
                pointB: { x: 0, y: -this.config.leg.height / 2 },
                stiffness: 0.7,
                length: 0,
            }),
        );

        // Стопы к ногам
        this.constraints.push(
            Constraint.create({
                bodyA: leftLeg,
                bodyB: leftFoot,
                pointA: { x: 0, y: this.config.leg.height / 2 },
                pointB: { x: 0, y: -this.config.foot.height / 2 },
                stiffness: 0.8,
                length: 0,
            }),
        );

        this.constraints.push(
            Constraint.create({
                bodyA: rightLeg,
                bodyB: rightFoot,
                pointA: { x: 0, y: this.config.leg.height / 2 },
                pointB: { x: 0, y: -this.config.foot.height / 2 },
                stiffness: 0.8,
                length: 0,
            }),
        );
    }

    private createArm(): void {
        // Большая рука, которая держит ragdoll
        const arm = Bodies.rectangle(600, 50, 400, 20, {
            isStatic: true,
            angle: Math.PI / 4,
            render: { fillStyle: '#8B4513' },
        });

        // Соединение руки с головой ragdoll
        const head = this.ragdollBodies[0];
        const armConstraint = Constraint.create({
            bodyA: arm,
            bodyB: head,
            pointA: { x: 150, y: 0 },
            pointB: { x: 0, y: -this.config.head.radius },
            stiffness: 0.1,
            length: 0,
        });

        World.add(this.engine.world, [arm, armConstraint]);
        this.constraints.push(armConstraint);
    }

    private createBounds(): void {
        const width = this.app.screen.width;
        const height = this.app.screen.height;
        const thickness = 50;

        const walls = [
            // Левая стена
            Bodies.rectangle(-thickness / 2, height / 2, thickness, height, {
                isStatic: true,
            }),
            // Правая стена
            Bodies.rectangle(
                width + thickness / 2,
                height / 2,
                thickness,
                height,
                { isStatic: true },
            ),
            // Пол
            Bodies.rectangle(
                width / 2,
                height + thickness / 2,
                width,
                thickness,
                { isStatic: true },
            ),
            // Потолок
            Bodies.rectangle(width / 2, -thickness / 2, width, thickness, {
                isStatic: true,
            }),
        ];

        World.add(this.engine.world, walls);
    }

    private setupMouseInteraction(): void {
        // Создание мышиного взаимодействия
        const mouse = Mouse.create(this.app.view);
        const mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false },
            },
        });

        // Ограничение перемещения за пределы экрана
        mouseConstraint.constraint!.maxForce = 0.7;

        World.add(this.engine.world, mouseConstraint);

        // Визуализация точки захвата
        const grabPoint = new PIXI.Graphics();
        grabPoint.beginFill(0xff0000);
        grabPoint.drawCircle(0, 0, 5);
        grabPoint.endFill();
        grabPoint.visible = false;
        this.app.stage.addChild(grabPoint);

        // Обработчики событий мыши
        this.app.stage.interactive = true;
        this.app.stage.hitArea = new PIXI.Rectangle(
            0,
            0,
            this.app.screen.width,
            this.app.screen.height,
        );

        let isDragging = false;
        let draggedBody: Body | null = null;

        this.app.stage.on('mousedown', (event: PIXI.FederatedPointerEvent) => {
            const point = { x: event.global.x, y: event.global.y };

            // Проверяем, кликнули ли на какую-либо часть ragdoll
            const body = Matter.Query.point(this.ragdollBodies, point)[0];

            if (body) {
                isDragging = true;
                draggedBody = body;

                // Показываем точку захвата
                grabPoint.position.set(event.global.x, event.global.y);
                grabPoint.visible = true;

                // Временно увеличиваем массу для более стабильного перетаскивания
                Body.setMass(body, body.mass * 10);
            }
        });

        this.app.stage.on('mousemove', (event: PIXI.FederatedPointerEvent) => {
            if (isDragging && draggedBody) {
                grabPoint.position.set(event.global.x, event.global.y);

                // Ограничение перемещения в пределах экрана
                const x = Math.max(
                    50,
                    Math.min(this.app.screen.width - 50, event.global.x),
                );
                const y = Math.max(
                    50,
                    Math.min(this.app.screen.height - 50, event.global.y),
                );

                Body.setPosition(draggedBody, { x, y });
            }
        });

        this.app.stage.on('mouseup', () => {
            if (isDragging && draggedBody) {
                isDragging = false;
                grabPoint.visible = false;

                // Восстанавливаем массу
                Body.setMass(draggedBody, draggedBody.mass / 10);
                draggedBody = null;
            }
        });

        this.app.stage.on('mouseupoutside', () => {
            if (isDragging && draggedBody) {
                isDragging = false;
                grabPoint.visible = false;

                // Восстанавливаем массу
                Body.setMass(draggedBody, draggedBody.mass / 10);
                draggedBody = null;
            }
        });
    }

    private startGameLoop(): void {
        // Игровой цикл
        this.app.ticker.add(() => {
            // Обновляем физику
            Engine.update(this.engine, 1000 / 60);

            // Синхронизируем спрайты с физическими телами
            this.ragdollBodies.forEach((body, index) => {
                const sprite = this.ragdollSprites[index];
                if (sprite) {
                    sprite.position.set(body.position.x, body.position.y);
                    sprite.rotation = body.angle;
                }
            });
        });
    }
}

// Запуск приложения
new RagdollGame();
