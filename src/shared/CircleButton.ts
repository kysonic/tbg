import * as PIXI from 'pixi.js';

export interface CircleButtonOptions {
    backgroundColor?: number;
    hoverColor?: number;
    activeColor?: number;
    borderColor?: number;
    borderWidth?: number;
}

export class CircleButton {
    private container: PIXI.Container;
    private radius: number;
    private background: PIXI.Graphics;
    private sprite: PIXI.Sprite;
    private options: Required<
        Pick<
            CircleButtonOptions,
            | 'backgroundColor'
            | 'hoverColor'
            | 'activeColor'
            | 'borderColor'
            | 'borderWidth'
        >
    > &
        Record<string, unknown>;

    constructor(
        radius: number,
        spriteTexture: PIXI.Texture,
        options: CircleButtonOptions = {},
    ) {
        this.container = new PIXI.Container();
        this.radius = radius;

        // Set default options with proper typing
        this.options = {
            backgroundColor: options.backgroundColor ?? 0x3498db,
            hoverColor: options.hoverColor ?? 0x2980b9,
            activeColor: options.activeColor ?? 0x1c5980,
            borderWidth: options.borderWidth ?? 2,
            ...options,
        };

        // Create the circle background
        this.background = new PIXI.Graphics();
        this.drawCircle();

        // Create the sprite
        this.sprite = new PIXI.Sprite(spriteTexture);
        this.centerSprite();

        // Add interactive properties
        this.container.interactive = true;
        // this.container.buttonMode = true;

        // Add to container
        this.container.addChild(this.background);
        this.container.addChild(this.sprite);

        // Setup event listeners
        this.setupEvents();
    }

    private drawCircle(color: number = this.options.backgroundColor): void {
        this.background.clear();

        // Draw circle with border
        // this.background.lineStyle(
        //     this.options.borderWidth,
        //     this.options.borderColor,
        // );
        this.background.beginFill(color);
        this.background.drawCircle(0, 0, this.radius);
        this.background.endFill();
    }

    private centerSprite(): void {
        // Center the sprite
        this.sprite.anchor.set(0.5);
        this.sprite.x = 0;
        this.sprite.y = 0;

        // Scale sprite to fit within the circle (optional)
        const maxSize = this.radius * 1.6; // Leave some padding
        const scale = Math.min(
            maxSize / this.sprite.width,
            maxSize / this.sprite.height,
        );
        this.sprite.scale.set(Math.min(scale, 1));
    }

    private setupEvents(): void {
        // Mouse over
        this.container.on('pointerover', () => {
            this.drawCircle(this.options.hoverColor);
        });

        // Mouse out
        this.container.on('pointerout', () => {
            this.drawCircle(this.options.backgroundColor);
        });

        // Mouse down
        this.container.on('pointerdown', () => {
            this.drawCircle(this.options.activeColor);
        });

        // Mouse up
        this.container.on('pointerup', () => {
            this.drawCircle(this.options.hoverColor);
        });

        // Mouse up outside
        this.container.on('pointerupoutside', () => {
            this.drawCircle(this.options.backgroundColor);
        });
    }

    // Public methods

    /**
     * Add click event listener
     * @param callback Function to call when button is clicked
     */
    public onClick(callback: () => void): void {
        this.container.on('pointertap', callback);
    }

    /**
     * Remove click event listener
     * @param callback Optional callback to remove, removes all if not specified
     */
    public offClick(callback?: () => void): void {
        this.container.off('pointertap', callback);
    }

    /**
     * Set button position
     * @param x X coordinate
     * @param y Y coordinate
     */
    public setPosition(x: number, y: number): void {
        this.container.position.set(x, y);
    }

    /**
     * Get button position
     * @returns Current position as PIXI.Point
     */
    public getPosition(): PIXI.Point {
        return this.container.position.clone();
    }

    /**
     * Set button scale
     * @param scale Scale factor (single number for uniform scaling)
     */
    public setScale(scale: number): void;

    /**
     * Set button scale
     * @param x X scale factor
     * @param y Y scale factor
     */
    public setScale(x: number, y: number): void;

    public setScale(x: number, y?: number): void {
        if (y !== undefined) {
            this.container.scale.set(x, y);
        } else {
            this.container.scale.set(x);
        }
    }

    /**
     * Get button scale
     * @returns Current scale as PIXI.ObservablePoint
     */
    public getScale(): PIXI.ObservablePoint {
        return this.container.scale.clone();
    }

    /**
     * Get the container for adding to PIXI stage
     * @returns The PIXI.Container
     */
    public getContainer(): PIXI.Container {
        return this.container;
    }

    /**
     * Update the sprite texture
     * @param texture New texture to use
     */
    public setSpriteTexture(texture: PIXI.Texture): void {
        this.sprite.texture = texture;
        this.centerSprite(); // Recenter and rescale
    }

    /**
     * Update button options
     * @param options Partial options to update
     */
    public updateOptions(options: Partial<CircleButtonOptions>): void {
        this.options = {
            ...this.options,
            ...options,
        };
        // Redraw with current color (need to track current state)
        this.drawCircle(this.options.backgroundColor);
    }

    /**
     * Enable or disable button interaction
     * @param enabled Whether button should be interactive
     */
    public setEnabled(enabled: boolean): void {
        this.container.interactive = enabled;
        // this.container.buttonMode = enabled;
        this.container.alpha = enabled ? 1 : 0.5;
    }

    /**
     * Get button radius
     * @returns Current radius
     */
    public getRadius(): number {
        return this.radius;
    }

    /**
     * Set button radius
     * @param radius New radius
     */
    public setRadius(radius: number): void {
        this.radius = radius;
        this.drawCircle(this.options.backgroundColor);
        this.centerSprite();
    }

    /**
     * Show or hide the button
     * @param visible Whether button should be visible
     */
    public setVisible(visible: boolean): void {
        this.container.visible = visible;
    }

    /**
     * Destroy button and clean up resources
     * @param options Destroy options
     */
    public destroy(): void {
        this.container.destroy();
    }
}
