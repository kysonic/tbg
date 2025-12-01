import {
    Sprite,
    Container,
    Application,
    Rectangle,
    Assets,
    Texture,
} from 'pixi.js';
import {
    Bodies,
    Composite,
    Engine,
    World,
    Mouse,
    MouseConstraint,
    Constraint,
    Body,
} from 'matter-js';
import { RagdollFactory } from './Factory';
import { Utils } from '../shared/Utils';
import { sound } from '@pixi/sound';

const DANCING_PARTS = [
    'left-arm-lower',
    'right-arm-lower',
    'left-leg-lower',
    'right-leg-lower',
];

const SPRITES = {
    head: {
        texture: '/assets/game/img/head.png',
        zIndex: 5,
        scale: 1,
    },
    chest: {
        texture: '/assets/game/img/body.png',
        zIndex: 2,
        scale: 1,
    },
    'left-arm': {
        texture: '/assets/game/img/upper_arm.png',
        zIndex: 2,
        scale: 1,
    },
    'right-arm': {
        texture: '/assets/game/img/upper_arm.png',
        zIndex: 2,
        scale: -1,
    },
    'left-arm-lower': {
        texture: '/assets/game/img/lower_arm.png',
        zIndex: 3,
        scale: 1,
    },
    'right-arm-lower': {
        texture: '/assets/game/img/lower_arm.png',
        zIndex: 3,
        scale: -1,
    },
    'left-leg': {
        texture: '/assets/game/img/upper_leg.png',
        zIndex: 1,
        scale: 1,
    },
    'right-leg': {
        texture: '/assets/game/img/upper_leg.png',
        zIndex: 1,
        scale: -1,
    },
    'left-leg-lower': {
        texture: '/assets/game/img/lower_leg.png',
        zIndex: 1,
        scale: 1,
    },
    'right-leg-lower': {
        texture: '/assets/game/img/lower_leg.png',
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
    private headTextures: { opened: Texture | null; closed: Texture | null } = {
        opened: null,
        closed: null,
    };
    private danceTimer: number = 0;

    public isSinging = false;
    public danceDirection = 1;

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
        this.setupSounds();
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
        // Preload head textures
        this.headTextures.opened = await Assets.load(
            '/assets/game/img/head.png',
        );
        this.headTextures.closed = await Assets.load(
            '/assets/game/img/head_closed.png',
        );

        for (const body of this.ragdoll.bodies) {
            if (SPRITES[body.label as keyof typeof SPRITES]) {
                const spriteConfig =
                    SPRITES[body.label as keyof typeof SPRITES];
                const texture = await Assets.load(spriteConfig.texture);
                const sprite = new Sprite(texture);

                sprite.scale.x *= spriteConfig.scale;
                sprite.anchor.set(0.5, 0.5);
                sprite.zIndex = spriteConfig.zIndex;
                this.container.addChild(sprite);
                this.sprites.push(sprite);
            }
        }
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

    async signTaco(mute?: boolean) {
        if (this.isSinging) {
            return;
        }
        this.isSinging = true;
        if (!mute) {
            sound.play('taco');
        }
        this.mouthClose();
        await Utils.delay(80);
        this.mouthOpen();
        await Utils.delay(70);
        this.mouthClose();
        await Utils.delay(50);
        this.mouthOpen();
        this.isSinging = false;
    }

    async singBurrito(mute?: boolean) {
        if (this.isSinging) {
            return;
        }
        this.isSinging = true;
        if (!mute) {
            sound.play('burrito');
        }
        this.mouthClose();
        await Utils.delay(50);
        this.mouthOpen();
        await Utils.delay(80);
        this.mouthClose();
        await Utils.delay(80);
        this.mouthOpen();
        await Utils.delay(50);
        this.mouthClose();
        await Utils.delay(100);
        this.mouthOpen();
        this.isSinging = false;
    }

    mouthClose() {
        this.sprites[1].texture = this.headTextures.closed as Texture;
    }

    mouthOpen() {
        this.sprites[1].texture = this.headTextures.opened as Texture;
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

    setupSounds() {
        sound.add('taco', '/assets/game/sounds/taco.mp3');
        sound.add('burrito', '/assets/game/sounds/burrito.mp3');
    }

    dance() {
        this.danceTimer = setTimeout(
            () => {
                const chest = this.ragdoll.bodies[0];
                Body.applyForce(chest, chest.position, {
                    x: this.danceDirection * 0.5,
                    y: 0,
                });
                this.danceDirection *= -1;

                const randomPart =
                    DANCING_PARTS[
                        Math.floor(Math.random() * DANCING_PARTS.length - 1)
                    ];

                const part = this.ragdoll.bodies.find(
                    (body) => body.label === randomPart,
                );

                if (part) {
                    Body.applyForce(part, part?.position, {
                        x: -this.danceDirection * 0.3,
                        y: 0.1,
                    });
                }

                this.dance();
            },
            Math.random() * (1000 - 800) + 800,
        );
    }

    stopDance() {
        clearTimeout(this.danceTimer);
    }
}
