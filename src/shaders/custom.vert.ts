const vertexShader = `
attribute vec2 aPosition;

void main(void) { 
    gl_Position = vec4(aPosition * 2.0 - 1.0, 0.0, 1.0);
}
`;

export default vertexShader;
