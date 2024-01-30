precision mediump float;

varying vec3 v_normal;

vec3 lightDirection = normalize(vec3(-1, 1, -1));

void main() {
   vec4 color = vec4(1, 0, 0, 1);
   vec3 normal = normalize(v_normal);
   gl_FragColor = color * dot(lightDirection, normal);
}
