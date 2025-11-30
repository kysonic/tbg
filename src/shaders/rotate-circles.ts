const fragmentShader = `
float channel(vec2 uv, float t) {
    float r = 0.2 - t*0.1;
    float edge = (2.0 - t)*0.025;
    return smoothstep(r + edge, r, length(uv - t*0.25));
}

void main(){
    vec2 uv = gl_FragCoord.xy/resolution - 0.5;
    uv.x *= resolution.x/resolution.y;
    gl_FragColor.a = 1.0;
    
    float t = fract(time*0.3);
    
    float rot = t*3.1415/2.;
    float cs = cos(rot);
    float sn = sin(rot);
    uv *= mat2(cs, sn, -sn, cs);
    
    uv = uv * (2.0 - t) * 5.0;
    //float cell = length(floor(uv));
    uv = abs(fract(uv) - 0.5);



  //  t = pow(t, 0.7);
    
    float dUv = sin(t*3.1415);

    // Красные круги
    float circle = channel(uv, t);
    
    // Желтый фон (1.0, 1.0, 0.0) + красные круги (1.0, 0.0, 0.0)
    gl_FragColor.r = 1.0; // Всегда максимальная красная составляющая
    gl_FragColor.g = 1.0 - circle; // Желтый фон становится менее желтым там, где есть круги
    gl_FragColor.b = 0.0; // Синяя составляющая всегда 0
 
}
`;

export default fragmentShader;
