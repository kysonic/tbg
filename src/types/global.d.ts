interface RGBAOptions {
    target?: HTMLElement;
    fullscreen?: boolean;
    width?: number;
    height?: number;
    attributes?: WebGLContextAttributes;
    // Add other options you might use
}

interface RGBANode {
    update?: () => void;
    destroy: () => void;
    // Add other methods you encounter
}

function RGBA(fragmentShader: string, options: RGBAOptions): RGBANode;
