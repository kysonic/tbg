const fragmentShader = `
 float PHI = 1.61803398874989484820459; 

        float gold_noise(vec2 xy, float seed){
            return fract(tan(distance(xy*PHI, xy)*seed)*xy.x);
        }

        float noised(vec2 p, float i) {
            return mix( 
                mix(gold_noise(p + vec2(0.0, 0.0), i), gold_noise(p + vec2(0.0, 1.0), i), p.y),
                mix(gold_noise(p + vec2(1.0, 0.0), i), gold_noise(p + vec2(1.0, 1.0), i), p.y),
            p.x);
        }

        vec2 mirror(vec2 uv){
             const float count = 3.;
             float a = 3.1415/count/2.;
             float cs = cos(a), sn = sin(a);
             mat2 rot = mat2(cs, -sn, sn, cs); 
             for (float i = 0.0; i<count; i++ )
                 uv = abs(uv*rot);  
             return uv;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy/resolution-0.5;
            uv.x *= resolution.x/resolution.y;
            float t = time *0.1;
            for(float i=0.; i<9.; i++) {
                uv = mirror(uv);
                uv -= noised(fract(uv), 1.)*0.2;
                uv *= mat2(cos(t), sin(t), -sin(t), cos(t));
            } 
            uv *= 15.;
            vec3 c = vec3(
                smoothstep(0.1, 0.0, abs(fract(uv.x + uv.y)-0.11)),
                smoothstep(0.1, 0.0, abs(fract(uv.x + uv.y)-0.13)),
                smoothstep(0.1, 0.0, abs(fract(uv.x + uv.y)-0.14))
            );
            gl_FragColor = vec4(vec3(c), 1.0);
        }
`;

export default fragmentShader;
