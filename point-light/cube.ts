import { mat4, vec3 } from "gl-matrix";
import { compileProgram, resizeCanvasToDisplaySize } from "../src/webgl.ts";
import vertexSharderSource from "./shader.vert";
import fragmentSharderSource from "./shader.frag";
import { cube } from "../src/cube-model.ts";

/*
  Canvas Setup
 */

const canvas = document.getElementsByTagName("canvas")[0];

if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
  throw Error("Couldn't find canvas");
}

resizeCanvasToDisplaySize(canvas);

const gl = canvas.getContext("webgl2");

if (!gl) {
  throw Error("Failed to open WebGL 2 context");
} else if (gl instanceof WebGL2RenderingContext) {
  console.log("WebGL 2 Rendering Context");
}

// Setup the viewport and clear screen
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
gl.clearColor(0.0, 0.1, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

const program = compileProgram(gl, vertexSharderSource, fragmentSharderSource);
gl.useProgram(program);

// --- Vertex Attributes Buffer
// look up where the vertex data needs to go.
const positionLocation = gl.getAttribLocation(program, "a_position");

// Create a buffer to put positions in
const positionBuffer = gl.createBuffer();

// Turn on the attribute
gl.enableVertexAttribArray(positionLocation);

// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// A front facing triangle, centered around the origin
gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);

{
  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 3; // 3 components per iteration
  const type = gl.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );
}

// --- Normals Attributes Buffer
const normalLocation = gl.getAttribLocation(program, "a_normal");
const normalBuffer = gl.createBuffer();

gl.enableVertexAttribArray(normalLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cube.normals, gl.STATIC_DRAW);

{
  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 3; // 3 components per iteration
  const type = gl.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);
}

// lookup uniforms
const worldViewProjectionLocation = gl.getUniformLocation(
  program,
  "u_worldViewProjection"
);
const worldInverseTransposeLocation = gl.getUniformLocation(
  program,
  "u_worldInverseTranspose"
);
const colorLocation = gl.getUniformLocation(program, "u_color");
const shininessLocation = gl.getUniformLocation(program, "u_shininess");

const lightWorldPositionLocation = gl.getUniformLocation(
  program,
  "u_lightWorldPosition"
);
const viewWorldPositionLocation = gl.getUniformLocation(
  program,
  "u_viewWorldPosition"
);
const worldLocation = gl.getUniformLocation(program, "u_world");

let rotateX = 0;
let rotateY = 0;
let shininess = 5;

drawScene(gl);

function drawScene(gl: WebGL2RenderingContext) {
  const viewProjectionMatrix = mat4.create();
  mat4.ortho(
    viewProjectionMatrix,
    -gl.drawingBufferWidth / 2,
    gl.drawingBufferWidth / 2,
    -gl.drawingBufferHeight / 2,
    gl.drawingBufferHeight / 2,
    -1000,
    1000
  );

  // set the light position
  gl.uniform3fv(lightWorldPositionLocation, [-400, 400, 400]);

  // set the camera/view position
  gl.uniform3fv(viewWorldPositionLocation, [0, 0, 1000]);

  // Set the color to use
  gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]); // green

  // The larger cube
  {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // --- Transformation Matrix Uniform Buffer
    const worldMatrix = mat4.create();
    mat4.translate(worldMatrix, worldMatrix, vec3.fromValues(0, 0, -200));
    mat4.scale(worldMatrix, worldMatrix, vec3.fromValues(300, 300, 300));
    mat4.rotateY(worldMatrix, worldMatrix, rotateY);
    mat4.rotateX(worldMatrix, worldMatrix, rotateX);

    const worldViewMatrix = mat4.create();
    mat4.multiply(worldViewMatrix, viewProjectionMatrix, worldMatrix);

    const worldInverseTransposeMatrix = mat4.create();
    mat4.copy(worldInverseTransposeMatrix, worldMatrix);
    mat4.invert(worldInverseTransposeMatrix, worldInverseTransposeMatrix);
    mat4.transpose(worldInverseTransposeMatrix, worldInverseTransposeMatrix);

    // Set the matrix.
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewMatrix);
    gl.uniformMatrix4fv(
      worldInverseTransposeLocation,
      false,
      worldInverseTransposeMatrix
    );
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

    // set the shininess
    gl.uniform1f(shininessLocation, shininess);
  }

  {
    // Draw the Cube
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 36;
    // TODO: Look into using drawElements instead
    // to make use of transform caching
    gl.drawArrays(primitiveType, offset, count);
  }
}

canvas.addEventListener("mousemove", (event: MouseEvent) => {
  const target = event.target;

  if (event.buttons && target instanceof HTMLCanvasElement) {
    const x = event.clientX / (target.clientWidth - target.clientLeft);
    const y = event.clientY / (target.clientHeight - target.clientTop);
    console.log("X:", x, "Y:", y);

    // The movement should be between -Math.PI and Math.PI
    // and X and Y are normalized coordinates
    rotateY = Math.PI * (x * 2 - 1);
    rotateX = Math.PI * (y * 2 - 1);

    console.log("Rotate X:", rotateX, "Rotate Y:", rotateY);
    drawScene(gl);
  }
});

const slider = document.querySelector("#shine");
if (slider && slider instanceof HTMLInputElement) {
  slider.value = shininess.toString();
  slider.addEventListener("input", (event: Event) => {
    if (event.target instanceof HTMLInputElement) {
      shininess = Number(event.target.value);
      drawScene(gl);
    }
  });
}
