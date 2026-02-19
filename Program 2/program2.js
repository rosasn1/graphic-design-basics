"use strict";

var canvas;
var gl;

var numPositions  = 36;
var texSize = 64;
var positions = [];
var texCoordsArray = [];
var texture =[];
var colors = [];
var colorsRed = [];
var colorsGreen = [];
var colorsGrey = [];
var colorsBlack = [];
var colorsPurple = [];
var colorsBrown = [];
var colorsBlue = [];
var colorsTan = [];

var modelViewMatrixLoc;
var projMatrixLoc;
var lookAtMat;
var projMat;
var eyeX = 0;
var eyeY = 0;
var eyeZ = 7;  
var atX = 0;
var atY = 0;
var atZ = -1;
var direction = 0;
var directionFacing; // 1 for forward, 2 right, 3 behind, 4, left

var fovy = 90; 
var cBuffer;
var useTextureLoc;
var jumping = false;
var jumpPeak = 0.5;
var jumpSpeed = 0.02;

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

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

var walls = [
    {minX: -4.5, maxX: -0.5, minY: -3, maxY: 3, minZ: -2.6, maxZ: -2.4},
    {minX: -0.5, maxX: 4.5, minY: -3, maxY: 3, minZ: -7.6, maxZ: -7.4},
    {minX: 5.5, maxX: 8.5, minY: -3, maxY: 3, minZ: -7.6, maxZ: -7.4},
    {minX: 4.45, maxX: 4.55, minY: -3, maxY: 3, minZ: -2.5, maxZ: 4.5},
    {minX: 9.45, maxX: 9.55, minY: -3, maxY: 3, minZ: 0.5, maxZ: 7.5},
    {minX: 14.45, maxX: 14.55, minY: -3, maxY: 3, minZ: -7.5, maxZ: 3.5},
    {minX: -5.5, maxX: -4.5, minY: -3, maxY: 3, minZ: -4, maxZ: 8},
    {minX: -6, maxX: 6, minY: -3, maxY: 3, minZ: 7.45, maxZ: 7.55},
    {minX: -2.5, maxX: 9.5, minY: -3, maxY: 3, minZ: 7.45, maxZ: 7.55},
    {minX: 9.5, maxX: 14.5, minY: -3, maxY: 3, minZ: 2.45, maxZ: 2.55},
    {minX: 9.5, maxX: 14.5, minY: -3, maxY: 3, minZ: -7.55, maxZ: -7.45},
    {minX: -4.5, maxX: -2.5, minY: -3, maxY: 3, minZ: 4.45, maxZ: 4.55},
    {minX: -0.75, maxX: 4.75, minY: -3, maxY: 3, minZ: 4.45, maxZ: 4.55},
    {minX: -5.5, maxX: -1.5, minY: -3, maxY: 3, minZ: 1.95, maxZ: 2.05},
    {minX: -0.55, maxX: -0.45, minY: -3, maxY: 3, minZ: -1.5, maxZ: 2},
    {minX: -0.55, maxX: -0.45, minY: -3, maxY: 3, minZ: -6.5, maxZ: 0},
    {minX: 5.5, maxX: 8.5, minY: -3, maxY: 3, minZ: -2.6, maxZ: -2.4}
];

function isInsideBounds(cameraX, cameraY, cameraZ, walls) {
    for (let wall of walls) {
        if (
            cameraX > wall.minX && cameraX < wall.maxX &&
            cameraY > wall.minY && cameraY < wall.maxY &&
            cameraZ > wall.minZ && cameraZ < wall.maxZ
        ) {
            return false; 
        }
    }
    return true; 
}

function configureTexture( image, index ) {
    texture[index] = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture[index]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

}


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    document.addEventListener("keydown", function (e) {
        var keyPressed = e.keyCode; 
    
        let newEyeX = eyeX;
        let newEyeY = eyeY;
        let newEyeZ = eyeZ;
    
        const buffer = 0.2;
    
        if (keyPressed == 65) {
            // Letter A for "left"
            if (directionFacing == 1) {
                newEyeX -= 0.1;
            } else if (directionFacing == 2) {
                newEyeZ -= 0.1;
            } else if (directionFacing == 3) {
                newEyeX += 0.1;
            } else if (directionFacing == 4) {
                newEyeZ += 0.1;
            }
        } else if (keyPressed == 68) {
            // Letter D for "right"
            if (directionFacing == 1) {
                newEyeX += 0.1;
            } else if (directionFacing == 2) {
                newEyeZ += 0.1;
            } else if (directionFacing == 3) {
                newEyeX -= 0.1;
            } else if (directionFacing == 4) {
                newEyeZ -= 0.1;
            }
        } else if (keyPressed == 87) {
            // Letter W for "forward"
            if (directionFacing == 1) {
                newEyeZ -= 0.1;
            } else if (directionFacing == 2) {
                newEyeX += 0.1;
            } else if (directionFacing == 3) {
                newEyeZ += 0.1;
            } else if (directionFacing == 4) {
                newEyeX -= 0.1;
            }
        } else if (keyPressed == 83) {
            // Letter S for "backward"
            if (directionFacing == 1) {
                newEyeZ += 0.1;
            } else if (directionFacing == 2) {
                newEyeX -= 0.1;
            } else if (directionFacing == 3) {
                newEyeZ -= 0.1;
            } else if (directionFacing == 4) {
                newEyeX += 0.1;
            }
        } else if (keyPressed == 82) {
            newEyeX = 0;
            eyeY = 0;
            newEyeZ = 7;
            atX = 0;
            atY = 0;
            atZ = -1;
            direction = 0;
            fovy = 90;
        } else if (keyPressed == 187) {
            // Increase field of view
            fovy = Math.min(fovy + 5.0, 110.0);
        } else if (keyPressed == 189) {
            // Decrease field of view
            fovy = Math.max(fovy - 5.0, 70.0);
        } else if (keyPressed == 32) {
            // Space for jump
            jumping = true;
            jump();
        } else if (keyPressed == 37) {
            // Turn left
            direction = (direction + 270) % 360;
        } else if (keyPressed == 39) {
            // Turn right
            direction = (direction + 90) % 360;
        }
    
        if (
            isInsideBounds(newEyeX - buffer, newEyeY, newEyeZ, walls) &&
            isInsideBounds(newEyeX + buffer, newEyeY, newEyeZ, walls) && 
            isInsideBounds(newEyeX, newEyeY, newEyeZ - buffer, walls) && 
            isInsideBounds(newEyeX, newEyeY, newEyeZ + buffer, walls)
        ) {
            eyeX = newEyeX;
            eyeY = newEyeY;
            eyeZ = newEyeZ;
        }
    
        switch (direction) {
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
    
    });     

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.53, 0.81, 0.92, 1.0);

    gl.enable(gl.DEPTH_TEST);

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

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	projMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

	projMat = perspective(fovy, 1, .2, 100);
	gl.uniformMatrix4fv(projMatrixLoc,  false, flatten(projMat));
    
    useTextureLoc = gl.getUniformLocation(program, "useTexture");

    //---------Images---------
    var image1 = document.getElementById("image1");
    configureTexture(image1, 1); 
    var image3 = document.getElementById("image3");
    configureTexture(image3, 3);
    var image4 = document.getElementById("image4");
    configureTexture(image4, 4);
    var image5 = document.getElementById("image5");
    configureTexture(image5, 5);
    var image6 = document.getElementById("image6");
    configureTexture(image6, 6);
    var image7 = document.getElementById("image7");
    configureTexture(image7, 7);
    //---------Images---------


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
   
         colors.push(vertexColors[a]);
         colorsRed.push(vec4(1,0,0,1));
         colorsGreen.push(vec4(0, 0.7, 0, 1));
         colorsGrey.push(vec4(0.3, 0.3, 0.3, 1.0));
         colorsBlack.push(vec4(0, 0, 0, 1));
         colorsPurple.push(vec4(0.5, 0, 0.5, 1));
         colorsBrown.push(vec4(0.6, 0.3, 0.1, 1.0));
         colorsTan.push(vec4(0.6, 0.3, 0.1, .7))
         colorsBlue.push(vec4(0.0, .4, 1.0, 1.0));
    }
    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray.push(texCoord[3]);
}

function jump() {
    var jumpUp = true;
    var initialY = eyeY;

    function animateJump() {
        if (jumpUp) {
            eyeY += jumpSpeed;
            atY += jumpSpeed;
            if (eyeY >= initialY + jumpPeak) jumpUp = false;
        } else {
            eyeY -= jumpSpeed;
            atY -= jumpSpeed;
            if (eyeY <= initialY) {
                eyeY = initialY;
                jumping = false;
                return;
            }
        }
        requestAnimationFrame(animateJump); 
    }
    requestAnimationFrame(animateJump);
}


function render()
{
	var transfMat;
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	lookAtMat = lookAt(vec3(eyeX, eyeY, eyeZ), vec3(atX, atY, atZ), vec3(0, 1, 0)); //eye, at, up
    projMat = perspective(fovy, 1, .2, 100);
    gl.uniformMatrix4fv(projMatrixLoc,  false, flatten(projMat));

    //------Ground-------
    gl.uniform1i(useTextureLoc, false);
    transfMat = scale(200, .01, 300)
	transfMat = mult(rotate(270, vec3(0, 1, 0)), transfMat);
	transfMat = mult(translate(0, -1, 0), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsGreen));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //------Ground-------

    //-------Front wall-------------
	gl.uniform1i(useTextureLoc, true); 
    gl.bindTexture(gl.TEXTURE_2D, texture[1]);

    transfMat = scale(4, 6, .2);
    transfMat = mult(translate(-2.5, 0, -2.5), transfMat);
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(5, 6, .2);
    transfMat = mult(translate(2, 0, -7.5), transfMat);
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(5, 6, .2);
    transfMat = mult(translate(7, 0, -7.5), transfMat);
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //-------Front wall-------------

    //-------Right wall-------------
	transfMat = scale(.1, 6, 7)
	transfMat = mult(translate(4.5, 0, 1), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.1, 6, 7)
	transfMat = mult(translate(9.5, 0, 4), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.1, 6, 11)
	transfMat = mult(translate(14.5, 0, -2), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    //-------Right wall-------------
    
    //-------Left wall-------------
	transfMat = scale(1, 6, 12)
	transfMat = mult(translate(-5, 0, 2), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //-------Left wall-------------

    //-------Backwall-------------
	transfMat = scale(12, 6, .1)
	transfMat = mult(translate(0, 0, 7.5), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(12, 6, .1)
	transfMat = mult(translate(3.5, 0, 7.5), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(5, 6, .1)
	transfMat = mult(translate(12, 0, 2.5), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(5, 6, .1)
	transfMat = mult(translate(12, 0, -7.5), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //-------Backwall-------------

    //------Textured Floor--------
    gl.uniform1i(useTextureLoc, true);  
    gl.bindTexture(gl.TEXTURE_2D, texture[3]); 

    for (let i = 0; i < 3; i++) { 
        for (let j = 0; j < 4; j++) { 
            let transfMat = scale(5, 0.011, 5); 
            transfMat = mult(translate(-2 + j * 5, -1, -5 + i * 5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        }
    }
    //------Textured Floor--------

    //------Textured Ceiling--------
    gl.uniform1i(useTextureLoc, true);  
    gl.bindTexture(gl.TEXTURE_2D, texture[4]); 

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 5; j++) { 
            let transfMat = scale(5, 0.011, 5); 
            transfMat = mult(translate(-5 + j * 5, 3, -10 + i * 5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        }
    }
    
    //------Textured Ceiling--------

    //-------Walls-------------
    gl.uniform1i(useTextureLoc, true); 
    gl.bindTexture(gl.TEXTURE_2D, texture[1]);
	
    transfMat = scale(2, 6, .1)
	transfMat = mult(translate(-3.5, 0, 4.5), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(5.5, 6, .1)
	transfMat = mult(translate(2, 0, 4.5), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(4, 6, .1)
	transfMat = mult(translate(-3.5, 0, 2), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.1, 6, 3)
	transfMat = mult(translate(-.5, 0, -1), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.1, 6, 5)
	transfMat = mult(translate(-.5, 0, -5), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(5, 6, .2);
    transfMat = mult(translate(7, 0, -2.5), transfMat);
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    //-------Walls-------------

    //-------Cabinet-----------
    gl.uniform1i(useTextureLoc, true); 
    gl.bindTexture(gl.TEXTURE_2D, texture[5]);
    transfMat = scale(2, 1, .5)
	transfMat = mult(translate(-2.5, -.5, -2), transfMat);
	transfMat = mult(lookAtMat, transfMat);
	gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions / 6);
    gl.bindTexture(gl.TEXTURE_2D, texture[6]);
    gl.drawArrays(gl.TRIANGLES, numPositions / 6, numPositions - (numPositions / 6)); 
    //-------Cabinet-----------

    //--------Character--------
    gl.uniform1i(useTextureLoc, false);
    transfMat = scale(1, 1.2, 0.3);
    transfMat = mult(translate(12, 0, 2), transfMat);
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsBlue));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.3, .3, .3);
    transfMat = mult(translate(11.3, .45, 2), transfMat);
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsBlack));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.3, .5, .3);
    transfMat = mult(translate(11.3, .1, 2), transfMat);
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsTan));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.3, .3, .3);
    transfMat = mult(translate(12.7, .45, 2), transfMat);
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsBlack));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.3, .5, .3);
    transfMat = mult(translate(12.7, .1, 2), transfMat);
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsTan));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.8, 1.2, 0.3);
    transfMat = mult(translate(12, -.5, 2), transfMat);
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsBlack));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.uniform1i(useTextureLoc, true);
    gl.bindTexture(gl.TEXTURE_2D, texture[7]);
    transfMat = scale(.8, .8, -0.4);
    transfMat = mult(translate(12, .9, 2), transfMat);
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions / 6);
    gl.uniform1i(useTextureLoc, false);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsBrown));
    gl.drawArrays(gl.TRIANGLES, numPositions / 6, numPositions - (numPositions / 6)); 
    //--------Character-------- 

    requestAnimationFrame(render);
}