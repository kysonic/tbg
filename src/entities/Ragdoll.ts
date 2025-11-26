import {
    Sprite,
    Graphics,
    Container,
    Application,
    Rectangle,
    FederatedPointerEvent,
} from 'pixi.js';
import {
    Bodies,
    Composite,
    Engine,
    World,
    Body,
    Mouse,
    MouseConstraint,
    Query,
} from 'matter-js';
import { RagdollFactory } from './Factory';

export class Ragdoll {
    private app: Application;
    private engine: Engine;
    private container: Container;
    private ragdoll: Composite;
    private sprites: Sprite[] = [];

    private readonly config = {
        head: { radius: 100 },
        body: { width: 40, height: 80 },
        arm: { width: 15, height: 70 },
        leg: { width: 15, height: 50 },
        hand: { radius: 10 },
        foot: { width: 20, height: 10 },
    };

    constructor(application: Application, container: Container) {
        this.app = application;
        this.container = container;
        this.engine = Engine.create({
            gravity: { x: 0, y: 1 },
        });

        this.createRagdoll();
        this.createSprites();
        this.createBounds();
        this.setupMouseInteraction();
    }

    private createRagdoll(): void {
        this.ragdoll = RagdollFactory.makeRagdoll(
            this.app.view.width / 2,
            this.app.view.height / 2,
            2,
        );

        World.add(this.engine.world, this.ragdoll);
    }

    createSprites() {
        this.ragdoll.bodies.forEach((body) => {
            let sprite: Sprite;
            const label = body.label || '';

            if (label.includes('head')) {
                const graphics = new Graphics();
                const radius = body.circleRadius || 40;
                graphics.beginFill(0xffffff);
                graphics.drawCircle(0, 0, radius);
                graphics.endFill();

                const texture = this.app.renderer.generateTexture(graphics);
                sprite = new Sprite(texture);
            } else {
                const graphics = new Graphics();
                const width = body.bounds.max.x - body.bounds.min.x;
                const height = body.bounds.max.y - body.bounds.min.y;
                graphics.beginFill(0xffffff);
                graphics.drawRoundedRect(
                    -width / 2,
                    -height / 2,
                    width,
                    height,
                    5,
                );
                graphics.endFill();

                const texture = this.app.renderer.generateTexture(graphics);
                sprite = new Sprite(texture);
            }

            sprite.anchor.set(0.5);
            this.container.addChild(sprite);
            this.sprites.push(sprite);
        });
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
        const mouse = Mouse.create(this.app.view);
        const mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false },
            },
        });

        mouseConstraint.constraint!.maxForce = 0.2;

        World.add(this.engine.world, mouseConstraint);

        this.app.stage.interactive = true;
        this.app.stage.hitArea = new Rectangle(
            0,
            0,
            this.app.screen.width,
            this.app.screen.height,
        );

        let isDragging = false;
        let draggedBody: Body | null = null;

        this.app.stage.on('mousedown', (event: FederatedPointerEvent) => {
            const point = { x: event.global.x, y: event.global.y };

            const body = Query.point(this.ragdoll.bodies, point)[0];

            if (body) {
                isDragging = true;
                draggedBody = body;

                Body.setMass(body, body.mass * 10);
            }
        });

        this.app.stage.on('mousemove', (event: FederatedPointerEvent) => {
            if (isDragging && draggedBody) {
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

                Body.setMass(draggedBody, draggedBody.mass / 10);
                draggedBody = null;
            }
        });

        this.app.stage.on('mouseupoutside', () => {
            if (isDragging && draggedBody) {
                isDragging = false;

                Body.setMass(draggedBody, draggedBody.mass / 10);
                draggedBody = null;
            }
        });
    }

    onTick() {
        Engine.update(this.engine, 1000 / 60);

        this.ragdoll.bodies.forEach((body, index) => {
            const sprite = this.sprites[index];

            if (sprite) {
                sprite.position.set(body.position.x, body.position.y);
                sprite.rotation = body.angle;
            }
        });
    }
}
