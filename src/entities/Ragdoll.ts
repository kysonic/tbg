import {
    Sprite,
    Graphics,
    Container,
    Application,
    Rectangle,
    Assets,
} from 'pixi.js';
import {
    Bodies,
    Composite,
    Engine,
    World,
    Body,
    Mouse,
    MouseConstraint,
    Constraint,
} from 'matter-js';
import { RagdollFactory } from './Factory';

const SPRITES = {
    head: {
        texture: '/assets/game/head.png',
        zIndex: 5,
        scale: 1,
    },
    chest: {
        texture: '/assets/game/body.png',
        zIndex: 2,
        scale: 1,
    },
    'left-arm': {
        texture: '/assets/game/upper_arm.png',
        zIndex: 2,
        scale: 1,
    },
    'right-arm': {
        texture: '/assets/game/upper_arm.png',
        zIndex: 2,
        scale: -1,
    },
    'left-arm-lower': {
        texture: '/assets/game/lower_arm.png',
        zIndex: 3,
        scale: 1,
    },
    'right-arm-lower': {
        texture: '/assets/game/lower_arm.png',
        zIndex: 3,
        scale: -1,
    },
    'left-leg': {
        texture: '/assets/game/upper_leg.png',
        zIndex: 1,
        scale: 1,
    },
    'right-leg': {
        texture: '/assets/game/upper_leg.png',
        zIndex: 1,
        scale: -1,
    },
    'left-leg-lower': {
        texture: '/assets/game/lower_leg.png',
        zIndex: 1,
        scale: 1,
    },
    'right-leg-lower': {
        texture: '/assets/game/lower_leg.png',
        zIndex: 1,
        scale: -1,
    },
};

export class Ragdoll {
    private app: Application;
    private engine: Engine;
    private container: Container;
    private ragdoll: Composite;
    private arm: Composite;
    private sprites: Sprite[] = [];

    constructor(application: Application, container: Container) {
        this.app = application;
        this.container = container;
        this.engine = Engine.create({
            gravity: { x: 0, y: 1 },
        });

        this.createRagdoll();
        this.createArm();
        this.createSprites();
        // this.createBounds();
        this.setupMouseInteraction();
    }

    private createRagdoll(): void {
        this.ragdoll = RagdollFactory.makeRagdoll(
            this.app.view.width / 2,
            this.app.view.height / 2,
            2.5,
        );

        World.add(this.engine.world, this.ragdoll);
    }

    async createSprites() {
        for (const body of this.ragdoll.bodies) {
            console.log(body.label);
            if (SPRITES[body.label as keyof typeof SPRITES]) {
                const spriteConfig =
                    SPRITES[body.label as keyof typeof SPRITES];
                const texture = await Assets.load(spriteConfig.texture);
                const sprite = new Sprite(texture);

                const width = body.bounds.max.x - body.bounds.min.x;
                const height = body.bounds.max.y - body.bounds.min.y;
                console.log(body.label, width, height);

                sprite.scale.x *= spriteConfig.scale;
                sprite.anchor.set(0.5, 0.5);
                sprite.zIndex = spriteConfig.zIndex;
                this.container.addChild(sprite);
                this.sprites.push(sprite);
            } else {
                const graphics = new Graphics();
                const width = body.bounds.max.x - body.bounds.min.x;
                const height = body.bounds.max.y - body.bounds.min.y;
                console.log(body.label, width, height);
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
                const sprite = new Sprite(texture);

                sprite.anchor.set(0.5);
                sprite.zIndex = 1;
                this.container.addChild(sprite);
                this.sprites.push(sprite);
            }
        }
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

    private async createArm(): Promise<void> {
        const arm = Bodies.rectangle(this.app.view.width / 2, 20, 50, 50, {
            isStatic: true,
        });
        // const arm = Bodies.rectangle(
        //     this.app.view.width / 2 - 500,
        //     200,
        //     573,
        //     298,
        //     {
        //         isStatic: true,
        //     },
        // );

        const head = this.ragdoll?.bodies?.[1];
        const armConstraint = Constraint.create({
            bodyA: arm,
            bodyB: head,
            pointA: { x: 0, y: 50 },
            pointB: { x: 0, y: -100 },
            stiffness: 0.3,
            length: 0,
        });

        this.arm = Composite.create({
            bodies: [arm],
            constraints: [armConstraint],
        });

        World.add(this.engine.world, this.arm);

        // const texture = await Assets.load('/assets/game/arm.png');
        // // const graphics = new Graphics();
        // // const width = arm.bounds.max.x - arm.bounds.min.x;
        // // const height = arm.bounds.max.y - arm.bounds.min.y;
        // // graphics.beginFill(0xffffff);
        // // graphics.drawRoundedRect(-width / 2, -height / 2, width, height, 5);
        // // graphics.endFill();
        // // const texture = this.app.renderer.generateTexture(graphics);

        // const sprite = new Sprite(texture);

        // sprite.anchor.set(0.5);
        // this.container.addChild(sprite);
        // this.armSprite = sprite;
    }

    private setupMouseInteraction(): void {
        const mouse = Mouse.create(this.app.view);
        const mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.02,
                render: { visible: false },
            },
        });

        mouseConstraint.constraint!.maxForce = 0.1;

        World.add(this.engine.world, mouseConstraint);

        this.app.stage.interactive = true;
        this.app.stage.hitArea = new Rectangle(
            0,
            0,
            this.app.screen.width,
            this.app.screen.height,
        );
    }

    onTick() {
        Engine.update(this.engine, 1000 / 60);

        this.ragdoll?.bodies?.forEach((body, index) => {
            const sprite = this.sprites[index];

            if (sprite) {
                sprite.position.set(body.position.x, body.position.y);
                sprite.rotation = body.angle;
            }
        });

        // if (this.arm.bodies[0]) {
        //     const body = this.arm.bodies[0];
        //     const sprite = this.armSprite;

        //     if (sprite) {
        //         sprite.position.set(body.position.x, body.position.y);
        //         sprite.rotation = body.angle;
        //     }
        // }
    }
}
