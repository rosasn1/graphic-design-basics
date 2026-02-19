"use strict";

var canvas;
var gl;

var numPositions  = 36;
var positions = [];
var colors = [];
var colorsRed = [];
var colorsGreen = [];
var colorsGrey = [];
var colorsBlack = [];
var colorsPurple = [];
var colorsBrown = [];

var modelViewMatrixLoc;
var projMatrixLoc;
var lookAtMat;
var projMat;
var eyeX = 0;
var eyeY = 0;
var eyeZ =4;
var atX = 0;
var atY = 0;
var atZ = -1;
var direction = 0;
var directionFacing; // 1 for forward, 2 right, 3 behind, 4, left
var cBuffer;

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

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    document.addEventListener("keydown", function (e){
        var keyPressed = e.keyCode;
        if(keyPressed == 65){
            //letter A for "left"
            
            if(directionFacing == 1){//"forward"
                eyeX -= .1
                atX -= .1
            }
            else if(directionFacing == 2){//"right"
                eyeZ -= .1
            }
            else if(directionFacing == 3){//"back"
                eyeX += .1
                atX += .1
            }
            else if(directionFacing == 4){//left
                eyeZ += .1
            }
        }
        else if(keyPressed == 68){
            //letter D for "right"
            if(directionFacing == 1){//"forward"
                eyeX += .1
                atX += .1
            }
            else if(directionFacing == 2){//"right"
                eyeZ += .1
            }
            else if(directionFacing == 3){//"back"
                eyeX -= .1
                atX -= .1
            }
            else if(directionFacing == 4){//left
                eyeZ -= .1
            }
        }
        else if(keyPressed == 87){
            //letter W for "forward"
            if(directionFacing == 1){
                eyeZ -= .1
            }
            else if(directionFacing == 2){
                eyeX += .1
            }
            else if(directionFacing == 3){
                eyeZ += .1
            }
            else if(directionFacing == 4){
                eyeX -= .1
            }
        }
        else if(keyPressed == 83){
            //letter S for "backward"
            if(directionFacing == 1){
                eyeZ += .1
            }
            else if(directionFacing == 2){
                eyeX -= .1
            }
            else if(directionFacing == 3){
                eyeZ -= .1
            }
            else if(directionFacing == 4){
                eyeX += .1
            }
        }
        if(keyPressed == 37){ // Left arrow for turning left
            direction = (direction + 270) % 360; // 90 degrees counterclockwise
        }
        else if(keyPressed == 39){ // Right arrow for turning right
            direction = (direction + 90) % 360; // 90 degrees clockwise
        }
        switch(direction) {
            case 0: // forward
                atX = eyeX;
                atZ = eyeZ - 1;
                directionFacing = 1;
                break;
            case 90: // right
                atX = eyeX + 1;
                atZ = eyeZ;
                directionFacing = 2;
                break;
            case 180: // backward
                atX = eyeX;
                atZ = eyeZ + 1;
                directionFacing = 3;
                break;
            case 270: // left
                atX = eyeX - 1;
                atZ = eyeZ;
                directionFacing = 4;
                break;
        }
        
    })

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.53, 0.81, 0.92, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    cBuffer = gl.createBuffer();
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
	projMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

	projMat = perspective(90, 1, .2, 100);
	gl.uniformMatrix4fv(projMatrixLoc,  false, flatten(projMat));
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
    var indices = [a, b, c, a, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push( vertices[indices[i]] );
         //colors.push(vertexColors[a]);

         colors.push(vertexColors[a]);
         colorsRed.push(vec4(1,0,0,1));
         colorsGreen.push(vec4(0, 0.7, 0, 1));
         colorsGrey.push(vec4(0.3, 0.3, 0.3, 1.0));
         colorsBlack.push(vec4(0, 0, 0, 1));
         colorsPurple.push(vec4(0.5, 0, 0.5, 1));
         colorsBrown.push(vec4(0.6, 0.3, 0.1, 1.0));
    }
}

function render()
{
	var transfMat;
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	lookAtMat = lookAt(vec3(eyeX, eyeY, eyeZ), vec3(atX, atY, atZ), vec3(0, 1, 0)); //eye, at, up
    


    
    //------Ground-------
    transfMat = scale(200, .01, 300)
	transfMat = mult(rotate(270, vec3(0, 1, 0)), transfMat);
	transfMat = mult(translate(0, -1, 0), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsGreen));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    //------Ground-------

    //-------Left Pillar-------------
	transfMat = scale(.5, 5, .5)
	transfMat = mult(translate(-1, -.7, -1), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsBlack));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //-------Left Pillar-------------

    //-------Right Pillar-------------
	transfMat = scale(.5, 5, .5)
	transfMat = mult(translate(1, -.7, -1), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsBlack));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //-------Right Pillar-------------

    //-------Bottom Row-------------
	transfMat = scale(2, .5, .5)
	transfMat = mult(translate(-.2, -.7, -.88), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsBlack));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //-------Bottom Row-------------

    //-------Top Row-------------
	transfMat = scale(2.2, .5, .5)
	transfMat = mult(translate(0, 1.5, -.88), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsBlack));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //-------Top Row-------------

    //-------Center-------------
	transfMat = scale(1.5, 2, .5)
	transfMat = mult(translate(0, 0.2, -.88), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsPurple));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //-------Center-------------
	transfMat = scale(.5, .5, .5)
	transfMat = mult(translate(1.5, -.7, -.8), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsGrey));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.5, .5, .5)
	transfMat = mult(translate(-1.5, -.7, -.8), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsGrey));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.5, 4, .5)
	transfMat = mult(translate(-3, -.7, .5), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsBrown));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(1.5, 1.5, 1)
	transfMat = mult(translate(-3, 2, .5), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsGreen));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    
    transfMat = scale(.5, 4, .5)
	transfMat = mult(translate(3, -.7, .5), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsBrown));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(1.5, 1.5, 1)
	transfMat = mult(translate(3, 2, .5), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsGreen));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.5, 4, .5)
	transfMat = mult(translate(3, -.7, -3), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsBrown));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(1.5, 1.5, 1)
	transfMat = mult(translate(3, 2, -3), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsGreen));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.5, 4, .5)
	transfMat = mult(translate(-3, -.7, -3), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsBrown));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(1.5, 1.5, 1)
	transfMat = mult(translate(-3, 2, -3), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsGreen));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    
    requestAnimationFrame(render);
}


/*

	
	//------make a rotated small cube on the right------
	transfMat = scale(.5, .5, .5)
	transfMat = mult(rotate(90, vec3(0, 1, 0)), transfMat);
	transfMat = mult(translate(.5, 0, 0), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat)  );
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //------make a rotated small cube on the right------
    //------Third Small Cube--------
    transfMat = scale(.5, .5, .5)
	transfMat = mult(rotate(180, vec3(0, 1, 0)), transfMat);
	transfMat = mult(translate(.5, 1, 0), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat)  );
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //------Third Small Cube--------
    //------Fourth Small Cube--------
    transfMat = scale(.5, .5, .5)
	transfMat = mult(rotate(270, vec3(0, 1, 0)), transfMat);
	transfMat = mult(translate(-.5, 1, 0), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat)  );
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //------Fourth Small Cube--------
    //------fifth Small Cube to the left--------
    transfMat = scale(.5, .5, .5)
	transfMat = mult(rotate(270, vec3(0, 1, 0)), transfMat);
	transfMat = mult(translate(-4, 0, 1), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat)  );
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //------fifth Small Cube to the left--------
    //------sixth Small Cube to the right--------
    transfMat = scale(.5, .5, .5)
    transfMat = mult(rotate(270, vec3(0, 1, 0)), transfMat);
    transfMat = mult(translate(4, 0, 1), transfMat);
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat)  );
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //------sixth Small Cube to the right--------
    //------seventh Small Cube behind--------
    transfMat = scale(.5, .5, .5)
    transfMat = mult(rotate(270, vec3(0, 1, 0)), transfMat);
    transfMat = mult(translate(0, 0, 5), transfMat);
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat)  );
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //------seventh Small Cube behind--------
*/