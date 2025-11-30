import { Assets, Container, Filter, GlProgram, Sprite, Texture } from 'pixi.js';
import { sound } from '@pixi/sound';
import { SceneManager } from '../shared/SceneManager';
import { Ragdoll } from '../entities/Ragdoll';
import fragment from '../shaders/custom.frag';
import vertex from '../shaders/custom.vert';
import fragmentShader from '../shaders/rotate-circles';

export class GameScene {
    public name = 'Game';
    public container = new Container();
    private sceneManager: SceneManager;
    private ragdoll: Ragdoll | null = null;
    private filter: Filter | null = null;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;

        this.init();
    }

    async init() {
        // await this.cartman();

        this.ragdoll = new Ragdoll(
            this.sceneManager.application,
            this.container,
        );

        // this.setBackground();

        this.rgba();
    }

    async cartman() {
        const texture = await Assets.load('/assets/game/img/arm.png');
        const sprite = new Sprite(texture);
        sprite.angle = 10;
        sprite.x = -400;
        sprite.y = -200;
        this.container.addChild(sprite);
    }

    onStart() {
        console.log('Game started');

        sound.add('minus', '/assets/game/sounds/minus.mp3');

        sound.play('minus', {
            loop: true,
        });

        // this.ragdoll?.dance();

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            console.log(e.key);
            if (e.key === 't') {
                this.ragdoll?.signTaco();
            }
            if (e.key === 'b') {
                this.ragdoll?.singBurrito();
            }
        });
    }

    onStop() {
        console.log('Game stopped');
    }

    onResize() {
        console.log('Resized');
    }

    onTick() {
        this.ragdoll?.onTick();
    }

    async setBackground() {
        const background = Sprite.from(Texture.WHITE);
        background.width = window.innerWidth;
        background.height = window.innerHeight;
        this.container.addChild(background);

        const filter = new Filter({
            glProgram: new GlProgram({
                fragment,
                vertex,
            }),
            resources: {
                timeUniforms: {
                    uTime: { value: 0.0, type: 'f32' },
                    uResolution: {
                        value: [
                            this.sceneManager.application.screen.width,
                            this.sceneManager.application.screen.height,
                        ],
                        type: 'vec2<f32>',
                    },
                },
            },
        });

        background.filters = [filter];

        this.sceneManager.application.ticker.add((ticker) => {
            filter.resources.timeUniforms.uniforms.uTime +=
                0.02 * ticker.deltaTime;
        });
    }

    rgba() {
        RGBA(fragmentShader, {
            target: document.getElementById('rgba-canvas')!,
            fullscreen: true,
        });
    }
}
