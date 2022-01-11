// https://glmatrix.net/docs/
// https://www.youtube.com/watch?v=kB0ZVUrI4Aw
// https://www.youtube.com/watch?v=3yLL9ADo-ko

// I'm putting variables here that are used in the separate functions
let cubeCanvas;
let cubeGl;
let cubeProgram;
let matWorldUniformLocation;
let worldMatrix;
let cubeVerices;
let cubeIndices;

function setupCubeCanvasAndContext() {
    cubeCanvas = document.getElementById('cubeCanvas');

    // get webgl context, include fallback option and double fallback alert
    cubeGl = canvas.getContext('webgl');
    if (!cubeGl) cubeGl = canvas.getContext('experimental-webgl');
    if (!cubeGl) return alert('your browser sucks');
}

function clearCubeCanvas() {
    // setup clear function
    cubeGl.clearColor(0.75, 0.85, 0.8, 1.0);
    cubeGl.clear(cubeGl.COLOR_BUFFER_BIT | cubeGl.DEPTH_BUFFER_BIT);
}

function setupDepthAndBackfaceCulling() {
    // this prevents webgl from drawing things that are behind other things
    cubeGl.enable(cubeGl.DEPTH_TEST);
    // this prevents webgl from doing a bunch of math/work on things that are not currently showing
    cubeGl.enable(cubeGl.CULL_FACE);
    // cull the faces that aren't actively showing
    cubeGl.frontFace(cubeGl.CCW);
    cubeGl.cullFace(cubeGl.BACK);
}

function setupAndCompileCubeShaders() {
    const vertexShader = cubeGl.createShader(cubeGl.VERTEX_SHADER);
    const fragmentShader = cubeGl.createShader(cubeGl.FRAGMENT_SHADER);

    // some things that are written in the glsl (gl shading language)
    const vertexShaderText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;
    varying vec3 fragColor;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main() {
        fragColor = vertColor;
        gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    }
    `
    const fragmentShaderText = `
    precision mediump float;

    varying vec3 fragColor;

    void main() {
        gl_FragColor = vec4(fragColor, 1.0);
    }
    `

    // using those things to set up shader sources (a shader is a component of the graphics pipeline)
    cubeGl.shaderSource(vertexShader, vertexShaderText);
    cubeGl.shaderSource(fragmentShader, fragmentShaderText);

    // compile the shaders and watch for errors
    cubeGl.compileShader(vertexShader);
    if (!cubeGl.getShaderParameter(vertexShader, cubeGl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertext shader!', cubeGl.getShaderInfoLog(vertexShader));
        return;
    }
    cubeGl.compileShader(fragmentShader)
    if (!cubeGl.getShaderParameter(fragmentShader, cubeGl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', cubeGl.getShaderInfoLog(fragmentShader));
        return;
    }

    // set up full graphics pipeline that ties everything together and watch for errors
    cubeProgram = cubeGl.createProgram();
    cubeGl.attachShader(cubeProgram, vertexShader);
    cubeGl.attachShader(cubeProgram, fragmentShader);
    cubeGl.linkProgram(cubeProgram);
    if (!cubeGl.getProgramParameter(cubeProgram, cubeGl.LINK_STATUS)) {
        console.error('ERROR linking cubeProgram!', cubeGl.getProgramInfoLog(cubeProgram));
        return;
    }

    // validate the cubeProgram (only do this in dev/testing because it's computationally expensive)
    cubeGl.validateProgram(cubeProgram);
    if (!cubeGl.getProgramParameter(cubeProgram, cubeGl.VALIDATE_STATUS)) {
        console.error('ERROR validating cubeProgram!', cubeGl.getProgramInfoLog(cubeProgram));
        return;
    }
}

function setupCubeAttributeLocations() {
    // First 3 per line: x, y, z for each point since we're drawing in 3D
    // Second 3 per line: RGB values
    cubeVertices = [
        // top
        -1.0, 1.0, -1.0,    0.5, 0.5, 0.5,
        -1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
        1.0, 1.0, 1.0,      0.5, 0.5, 0.5,
        1.0, 1.0, -1.0,     0.5, 0.5, 0.5,

        // left 
        -1.0, 1.0, 1.0,     0.75, 0.25, 0.5,
        -1.0, -1.0, 1.0,    0.75, 0.25, 0.5,
        1.0, -1.0, -1.0,    0.75, 0.25, 0.5,
        1.0, 1.0, -1.0,     0.75, 0.25, 0.5,

        // right
        1.0, 1.0, 1.0,      1.0, 0.0, 0.75,
        1.0, -1.0, 1.0,     1.0, 0.0, 0.75,
        1.0, -1.0, -1.0,    1.0, 0.0, 0.75,
        1.0, 1.0, -1.0,     1.0, 0.0, 0.75,

        // front
        1.0, 1.0, 1.0,      1.0, 0.0, 0.15,
        1.0, -1.0, 1.0,     1.0, 0.0, 0.15,
        -1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
        -1.0, 1.0, 1.0,     1.0, 0.0, 0.15,

        // back
        1.0, 1.0, -1.0,     0.0, 1.0, 0.15,
        1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
        -1.0, -1.0, -1.0,   0.0, 1.0, 0.15,
        -1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

        // bottom
        -1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
        -1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
        1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
        1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
    ];

    // this says which indexes in cubeVertices form the triangles that we're going to draw
    cubeIndices = [
        // top
        0, 1, 2,
        0, 2, 3,

        // left
        4, 5, 6, 
        4, 6, 7,

        // right
        8, 9, 10,
        8, 10, 11,

        // front
        12, 13, 14,
        12, 14, 15,

        // back
        16, 17, 18, 
        16, 18, 19, 

        // bottom
        20, 21, 22,
        20, 22, 23,
    ]

    // create buffer for vertices
    const cubeVertexBuffer = cubeGl.createBuffer();
    cubeGl.bindBuffer(cubeGl.ARRAY_BUFFER, cubeVertexBuffer);
    cubeGl.bufferData(cubeGl.ARRAY_BUFFER, new Float32Array(cubeVertices), cubeGl.STATIC_DRAW);

    // create buffer for vertex indices
    const cubeIndexBuffer = cubeGl.createBuffer();
    cubeGl.bindBuffer(cubeGl.ARRAY_BUFFER, cubeIndexBuffer);
    cubeGl.bufferData(cubeGl.ARRAY_BUFFER, new Uint16Array(cubeIndices), cubeGl.STATIC_DRAW);

    // get the attribute locations from our shaderText up above that is written in the gl shader language
    const positionAttributeLocation = cubeGl.getAttribLocation(cubeProgram, 'vertPosition');
    const colorAttributeLocation = cubeGl.getAttribLocation(cubeProgram, 'vertColor');

    // setup position and color attributes
    cubeGl.vertexAttribPointer(
        positionAttributeLocation,
        3, // number of elements per attribute
        cubeGl.FLOAT, // data type of elements
        cubeGl.FALSE, // whether data is normalized or not
        6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex. Each of our vertices has 2 elements
        0 // Offset from the beginning of a single vertex to this attribute
    )
    cubeGl.vertexAttribPointer(
        colorAttributeLocation,
        3,
        cubeGl.FLOAT,
        cubeGl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT // offset 3 since the RGB values are 3,4,5
    )

    // enable the vertex attributes
    cubeGl.enableVertexAttribArray(positionAttributeLocation);
    cubeGl.enableVertexAttribArray(colorAttributeLocation);
}

function setupCubeUniformLocations() {
    // tell webgl which program should be active
    cubeGl.useProgram(cubeProgram);

    // get uniform locations from the glsl up above
    matWorldUniformLocation = cubeGl.getUniformLocation(cubeProgram, 'mWorld');
    const matViewUniformLocation = cubeGl.getUniformLocation(cubeProgram, 'mView');
    const matProjUniformLocation = cubeGl.getUniformLocation(cubeProgram, 'mProj');

    // create matrices
    worldMatrix = new Float32Array(16);
    const viewMatrix = new Float32Array(16);
    const projectionMatrix = new Float32Array(16);

    // setup identity matrices for mat 4 (no idea what that is)
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projectionMatrix, glMatrix.toRadian(45), cubeCanvas.clientWidth / cubeCanvas.clientHeight, 0.1, 1000.0);

    // use the matrices 
    cubeGl.uniformMatrix4fv(
        matWorldUniformLocation, 
        cubeGl.FALSE, // transpose the matrix?
        worldMatrix // Float32Array of the data you want to set
    );
    cubeGl.uniformMatrix4fv(
        matViewUniformLocation, 
        cubeGl.FALSE, // transpose the matrix?
        viewMatrix // Float32Array of the data you want to set
    );
    cubeGl.uniformMatrix4fv(
        matProjUniformLocation, 
        cubeGl.FALSE, // transpose the matrix?
        projectionMatrix // Float32Array of the data you want to set
    );
}

function drawCube() {
    // I've heard that it's a good idea to declare variable outside the loop since memory allocation takes awhile
    let angle = 0;

    // set up identity matrix for use in the loop
    let identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);

    // setup cube rotation matrices
    let xRotationMatrix = new Float32Array(16);
	let yRotationMatrix = new Float32Array(16);

    // main render loop 
    function loop() {
        // this will rotate the cube twice every 6 seconds...
        angle = performance.now() / 1000 / 6 * 2 * Math.PI
        mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
        cubeGl.uniformMatrix4fv(matWorldUniformLocation, cubeGl.FALSE, worldMatrix);

        // clear the canvas
        clearCubeCanvas();

        // draw the cube
        cubeGl.drawElements(
            cubeGl.TRIANGLES, 
            cubeIndices.length,
            cubeGl.UNSIGNED_SHORT,
            0
        )

        // loop
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

setupCubeCanvasAndContext();
clearCubeCanvas();
setupDepthAndBackfaceCulling();
setupAndCompileCubeShaders();
setupCubeAttributeLocations();
setupCubeUniformLocations();
drawCube();
