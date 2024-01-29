attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_matrix;
uniform mat4 u_inverse;
varying vec3 v_normal;

void main() {
  v_normal = (u_inverse * vec4(a_normal, 0)).xyz;
  gl_Position = u_matrix * vec4(a_position, 1);
}
