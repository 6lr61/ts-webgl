precision mediump float;

// Passed in from the vertex shader.
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

uniform vec4 u_color;

void main() {
  // because v_normal is a varying it's interpolated
  // so it will not be a unit vector. Normalizing it
  // will make it a unit vector again
  vec3 normal = normalize(v_normal);

  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

  float light = dot(normal, surfaceToLightDirection);
  float specular = dot(normal, halfVector);

  // gl_FragColor = u_color;
  gl_FragColor = vec4(0.5 * normal + 0.5, 1);

  // Lets multiply just the color portion (not the alpha)
  // by the light
  gl_FragColor.rgb *= light;

  // Just add in the specular
  gl_FragColor.rgb += specular;
}
