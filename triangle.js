// https://glmatrix.net/docs/
// https://www.youtube.com/watch?v=kB0ZVUrI4Aw
// https://www.youtube.com/watch?v=3yLL9ADo-ko

let canvas;
let gl;
let program;

function setupCanvasAndContext() {
    canvas = document.getElementById('triangleCanvas');

    // get webgl context, include fallback option and double fallback alert
    gl = canvas.getContext('webgl');
    if (!gl) gl = canvas.getContext('experimental-webgl');
    if (!gl) return alert('your browser sucks');

    // setup clear function
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
}

function clearCanvas() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function setupAndCompileShaders() {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    // some things that are written in the glsl (gl shading language)
    const vertexShaderText = `
    precision mediump float;

    attribute vec2 vertPosition;
    void main() {
        gl_Position = vec4(vertPosition, 0.0, 1.0);
    }
    `
    const fragmentShaderText = `
    precision mediump float;

    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
    `

    // using those things to set up shader sources (a shader is a component of the graphics pipeline)
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    // compile the shaders and watch for errors
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertext shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader)
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    // set up full graphics pipeline that ties everything together and watch for errors
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }

    // validate the program (only do this in dev/testing because it's computationally expensive)
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }
}

function setupAttributeLocations() {
    // x, y for each point
    const triangleVertices = [
        0.0, 0.5,
        -0.5, -0.5,
        0.5, -0.5
    ];

    // GL uses buffers. A buffer is a chunk of memory that is allocated for some purpose. 
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    // setup position attributes
    const positionAttributeLocation = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(
        positionAttributeLocation,
        2, // number of elements per attribute
        gl.FLOAT, // data type of elements
        gl.FALSE, // whether data is normalized or not
        2 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex. Each of our vertices has 2 elements
        0 // Offset from the beginning of a single vertex to this attribute
    )
    gl.enableVertexAttribArray(positionAttributeLocation);
}

function drawTriangle() {
    // main render loop (or in this case, we are just going to draw the triangle)
    gl.useProgram(program);
    gl.drawArrays(
        gl.TRIANGLES, // what we should draw
        0, // how many vertices to skip
        3 // how many vertices to draw
    )
}

setupCanvasAndContext();
clearCanvas();
setupAndCompileShaders();
setupAttributeLocations();
drawTriangle();
