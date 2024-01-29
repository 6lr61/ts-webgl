export function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  multiplier = 1
): boolean {
  const width = Math.trunc(canvas.clientWidth * multiplier);
  const height = Math.trunc(canvas.clientHeight * multiplier);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }

  return false;
}

export function compileProgram(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  if (!vertexShader) {
    throw Error("Failed to initialize new vertex shader");
  }

  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fragmentShader) {
    throw Error("Failed to initialize new fragment shader");
  }

  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  if (!program) {
    throw Error("Failed to initialize program");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  // Cleanup
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.useProgram(null);

    if (program) {
      gl.deleteProgram(program);
    }
  }

  return program;
}
