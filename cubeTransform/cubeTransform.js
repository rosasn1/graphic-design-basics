"use strict";

var canvas;
var gl;

var numPositions  = 36;

var positions = [];
var colors = [];


var modelViewMatrixLoc;



window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

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
    var transfMat2;
    var transfMat3;
    var transfMat4;

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	transfMat = mat4();
    transfMat = translate(-.5,.5,0);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat)  );
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat2 = mat4();
    transfMat2 = mult(translate(.5,-.5,0), rotate(180, vec3(0,0,1)));
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat2)  );
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat3 = mat4();
    transfMat3 = mult(translate(.5,.5,0), rotate(90, vec3(0,0,1)));
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat3)  );
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat4 = mat4();
    transfMat4 = mult(translate(-.5,-.5,0), rotate(270, vec3(0,0,1)));
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat4)  );
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    
    
	
	
}
