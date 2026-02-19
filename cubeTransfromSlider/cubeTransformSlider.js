"use strict";

var canvas;
var gl;

var numPositions  = 36;

var positions = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var sliderRotateX;
var sliderRotateY;
var sliderRotateZ;
var rotateX;
var rotateY;
var rotateZ;

var axis = 0;
var theta = [0, 0, 0];

var thetaLoc;
var modelViewMatrixLoc;
var flag = false;

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    sliderRotateX = document.getElementById("sliderRotateX");
    sliderRotateY = document.getElementById("sliderRotateY");
    sliderRotateZ = document.getElementById("sliderRotateZ");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(.8, .8, .8, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);


    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

	thetaLoc = gl.getUniformLocation(program, "uTheta");

    //event listeners for buttons


	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    render();
}

function RotateShapeSlider() {
    rotateX = parseFloat(sliderRotateX.value);
    rotateY = parseFloat(sliderRotateY.value);
    rotateZ = parseFloat(sliderRotateZ.value);
    render();
}

function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4(0.5,  0.5,  0.5, 1.0),
        vec4(0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(0.5,  0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        vec4(1.0, 1.0, 1.0, 1.0)   // white
    ];

    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push( vertices[indices[i]] );
        colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        // colors.push(vertexColors[a]);
    }
}


function render()
{
	var transfMat;
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//transfMat = mat4();

    transfMat = rotate(sliderRotateX.value, vec3(1,0,0));
	transfMat = mult(rotate(sliderRotateY.value, vec3(0,1,0)),transfMat);
	transfMat = mult(rotate(sliderRotateZ.value, vec3(0,0,1)),transfMat);

    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat)  );
    gl.drawArrays(gl.TRIANGLES, 0, numPositions); 
    requestAnimationFrame(render);   
	
	
}
