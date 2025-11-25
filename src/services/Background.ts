import { Sprite, Texture } from 'pixi.js';

export class Background {
    private _sprite: Sprite;
    private _texture: Texture;

    constructor(texture: Texture) {
        this._sprite = new Sprite(texture);
        this._texture = texture;
    }

    get sprite() {
        return this._sprite;
    }

    get texture() {
        return this._texture;
    }

    cover(screenWidth: number, screenHeight: number) {
        const scale = Math.max(
            screenWidth / this._texture.width,
            screenHeight / this._texture.height,
        );

        this._sprite.width = this._texture.width * scale;
        this._sprite.height = this._texture.height * scale;
        this._sprite.x = (screenWidth - this._sprite.width) / 2;
        this._sprite.y = (screenHeight - this._sprite.height) / 2;
    }

    contain(screenWidth: number, screenHeight: number) {
        const scale = Math.min(
            screenWidth / this._texture.width,
            screenHeight / this._texture.height,
        );

        this._sprite.width = this._texture.width * scale;
        this._sprite.height = this._texture.height * scale;
        this._sprite.x = (screenWidth - this._sprite.width) / 2;
        this._sprite.y = (screenHeight - this._sprite.height) / 2;
    }

    fill(screenWidth: number, screenHeight: number) {
        this._sprite.width = screenWidth;
        this._sprite.height = screenHeight;
        this._sprite.x = 0;
        this._sprite.y = 0;
    }

    setAlpha(alpha: number): void {
        if (this._sprite) {
            this._sprite.alpha = alpha;
        }
    }

    setTint(tint: number): void {
        if (this._sprite) {
            this._sprite.tint = tint;
        }
    }

    destroy(): void {
        if (this._sprite) {
            this._sprite.destroy();
        }
    }
}
