"use strict";

var canvas;
var gl;

var numPositions  = 36;

var positions = [];
var colors = [];
var eyeX = 0, eyeY = 0, eyeZ = 0;
var atX = 0, atY = 0, atZ = 0;
var upX = 0, upY = 0, upZ = 0;

var modelViewMatrixLoc;
var lookAtMat;



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

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    eyeX = document.getElementById("eyeX");
    eyeY = document.getElementById("eyeY");
    eyeZ = document.getElementById("eyeZ");

    atX = document.getElementById("atX");
    atY = document.getElementById("atY");
    atZ = document.getElementById("atZ");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(.75, .75, .75, 1.0);

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

	
	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

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


    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
         colors.push(vertexColors[a]);
    }
}

function render()
{
	var transfMat;
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//default orthographic projection
	//lookAtMat = lookAt(vec3(0, 0, 0), vec3(0, 0, -1), vec3(0, 1, 0));
    lookAtMat = lookAt(vec3(eyeX.value, eyeY.value, eyeZ.value), vec3(atX.value, atY.value, atZ.value), vec3(0, 1, 0));
    //Eye, At, Up
	
	//make a small cube on the left
	transfMat = scale(.5, .5, .5)
	transfMat = mult(translate(-.5, 0, 0), transfMat);
	
	//combines camera with world (note that cube is moved first)
	transfMat = mult(lookAtMat, transfMat);
	
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat)  );

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
	
	//make a rotated small cube on the right
	transfMat = scale(.5, .5, .5)
	transfMat = mult(rotate(90, vec3(0, 1, 0)), transfMat);
	transfMat = mult(translate(.5, 0, 0), transfMat);
	
	transfMat = mult(lookAtMat, transfMat);
	
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat)  );

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
	
    requestAnimationFrame(render);
}
