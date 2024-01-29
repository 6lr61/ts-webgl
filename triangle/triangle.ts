import { vec2, mat3 } from "gl-matrix";
import { compileProgram, resizeCanvasToDisplaySize } from "../src/webgl.ts";
import vertexSharderSource from "./shader.vert";
import fragmentSharderSource from "./shader.frag";

/*
  Canvas Setup
 */

const canvas = document.getElementById("triangle-canvas");

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

// Face culling
gl.enable(gl.CULL_FACE);

gl.enableVertexAttribArray(0);
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0]), gl.STATIC_DRAW);
gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);

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
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([0, 1, -1, -1, 1, -1]),
  gl.STATIC_DRAW
);

{
  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 2; // 2 components per iteration
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

const matrixLocation = gl.getUniformLocation(program, "u_matrix");
const colorLocation = gl.getUniformLocation(program, "u_color");

requestAnimationFrame((time) => drawFrame(gl, time));

function drawFrame(gl: WebGL2RenderingContext, time: number) {
  for (const size of [1, 0.75, 0.5, 0.25]) {
    const angle = Math.PI * (Math.sin(time / 5000) + 1);
    // --- Transformation Matrix Uniform Buffer
    const matrix = mat3.create();
    mat3.rotate(matrix, matrix, angle * 4 * size);
    mat3.scale(matrix, matrix, vec2.fromValues(size, size));

    const color = new Float32Array([angle / Math.PI, size, 0, 1]);

    // Set the matrix.
    gl.uniformMatrix3fv(matrixLocation, false, matrix);
    gl.uniform4fv(colorLocation, color);

    {
      // Draw the rectangle.
      const primitiveType = gl.TRIANGLES;
      const offset = 0;
      const count = 3;
      gl.drawArrays(primitiveType, offset, count);
    }
  }

  requestAnimationFrame((time) => drawFrame(gl, time));
}
