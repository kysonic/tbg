const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;

float sdOrientedBox( in vec2 p, in vec2 a, in vec2 b, float th )
{
    float l = length(b-a);
    vec2  d = (b-a)/l;
    vec2  q = (p-(a+b)*0.5);
          q = mat2(d.x,-d.y,d.y,d.x)*q;
          q = abs(q)-vec2(l,th)*0.5;
    return length(max(q,0.0)) + min(max(q.x,q.y),0.0);    
}

vec3 palette( float t ) {
    vec3 a = vec3(0.8, 0.5, 0.4);
    vec3 b = vec3(1.0, 1.0, 0.2);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.00, 0.25, 0.25);

    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
  // Используем ТОЛЬКО gl_FragCoord - никаких varying!
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  uv.y *= uResolution.y / uResolution.x;
  
  float t = sin(uTime * 0.5) * 0.5 + 0.5;
  
  // Секторное преобразование
  float PI = 3.14159;
  float sectors = 4.0;
  float halfSector = sectors * 0.5;
  float angle = atan(uv.y, uv.x);
  angle = abs(mod(angle, PI / halfSector) - PI / sectors); 
  uv = vec2(cos(angle), sin(angle)) * length(uv);
  
  // Модульное преобразование
  uv = mod(uv + t, 0.7);
  
  float d = 1.0;
  
  d = min(d, mod((uv.x + uv.y) * 7.0, 0.75));
  d = min(d, 1.0 - (uv.x + uv.y));
  
  vec2 cv = uv - vec2(0.55, 0.1);
  
  float r0 = sdOrientedBox(cv, vec2(0.1, 0.1), vec2(-0.1, -0.1), 0.01);
  d = max(d, 1.0 - smoothstep(0.0, 0.01, r0));
  
  float r1 = sdOrientedBox(cv, vec2(-0.1, 0.3), vec2(0.1, 0.1), 0.01);
  d = max(d, 1.0 - smoothstep(0.0, 0.01, r1));
  
  float r2 = sdOrientedBox(cv, vec2(-0.1, 0.3), vec2(-0.23, 0.165), 0.01);
  d = max(d, 1.0 - smoothstep(0.0, 0.01, r2));
  
  float r3 = sdOrientedBox(cv, vec2(-0.23, 0.165), vec2(-0.07, 0.01), 0.01);
  d = max(d, 1.0 - smoothstep(0.0, 0.01, r3));
  
  float r4 = sdOrientedBox(cv, vec2(0.02, 0.1), vec2(-0.07, 0.01), 0.01);
  d = max(d, 1.0 - smoothstep(0.0, 0.01, r4));
  
  float r5 = sdOrientedBox(cv, vec2(0.02, 0.1), vec2(-0.1, 0.22), 0.01);
  d = max(d, 1.0 - smoothstep(0.0, 0.01, r5));
  
  float r6 = sdOrientedBox(cv, vec2(-0.145, 0.17), vec2(-0.1, 0.22), 0.01);
  d = max(d, 1.0 - smoothstep(0.0, 0.01, r6));
  
  float r7 = sdOrientedBox(cv, vec2(-0.145, 0.17), vec2(-0.07, 0.1), 0.01);
  d = max(d, 1.0 - smoothstep(0.0, 0.01, r7));
  
  d = smoothstep(0.5, 0.51, d);
  
  vec3 fgColor = palette(mod(uv.x + uv.y, 0.3)) * 0.5;
  vec3 bgColor = palette(0.7 + (uv.x + uv.y) * 0.2);

  vec3 color = mix(fgColor, bgColor, d);

  gl_FragColor = vec4(color, 1.0);
}
`;

export default fragmentShader;
