"use strict";

var canvas;
var gl;
var program;
var keyPressed;

var numPositions  = 36;
var texSize = 64;
var positions = [];
var texCoordsArray = [];
var tombstoneCoordsArrayTL = []; //top left
var tombstoneCoordsArrayTM = []; //top mid
var tombstoneCoordsArrayTR = []; //top right
var tombstoneCoordsArrayCL = []; //center left
var tombstoneCoordsArrayCM = []; //center mid
var tombstoneCoordsArrayCR = []; //center right
var tombstoneCoordsArrayBL = []; //bottom left
var tombstoneCoordsArrayBM = []; //bottom mid
var tombstoneCoordsArrayBR = []; //bottom right
var tBuffer;

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
var transfMat;
var transfMatDoorway;
var transfMatTombstone;
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
var cameraAngle = 0;  // Camera facing direction (in degrees)
var speed = 0.1;

var lightPosition = vec4(1.5, 1.5, -8, 1.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var material1Ambient = vec4(1.0, 0.5, 0.5, 1.0);
var material1Diffuse = vec4(1.0, 0.5, 0.5, 1.0);
var material1Specular = vec4(1.0, 1.0, 1.0, 1.0);
var material1Shininess = 50.0;

var ambientColor, diffuseColor, specularColor;
var modelMatrix, projectionMatrix, viewMatrix;
var normalsArray = []; 

var mySphere1;
var sphereStart;
var sphereVert;
var count = 36;

var mySphere2;
var sphereStart2;
var sphereVert2;

var myCylinder;
var cylinderStart;
var cylinderVert;

var myCylinder2;
var cylinderStart2;
var cylinderVert2;

var myCylinder3;
var cylinderStart3;
var cylinderVert3;

var myCylinder4;
var cylinderStart4;
var cylinderVert4;

var isDragging = false;
var lastMouseX = null;
var lastMouseY = null;
var isDoorOpen;
isDoorOpen = false;

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];
var texCoordsTopLeft = [
    vec2(0.0, .66),  // Bottom-left corner of the top-left sub-image
    vec2(.33, .66),  // Bottom-right corner of the top-left sub-image
    vec2(.33, 1.0),  // Top-right corner of the top-left sub-image
    vec2(0.0, 1.0)   // Top-left corner of the top-left sub-image
];

var texCoordsTopMid = [
    vec2(1/3, 2/3),  
    vec2(2/3, 2/3),  
    vec2(2/3, 1.0),  
    vec2(1/3, 1.0)
];
var texCoordsTopRight = [
    vec2(2/3, 2/3), 
    vec2(1.0, 2/3),  
    vec2(1.0, 1.0), 
    vec2(2/3, 1.0)
];
var texCoordsCenterLeft = [
    vec2(0.0, 1/3),  
    vec2(1/3, 1/3),  
    vec2(1/3, 2/3),  
    vec2(0.0, 2/3)
];
var texCoordsCenterMid = [
    vec2(1/3, 1/3),  // bottom-left of the image
    vec2(2/3, 1/3),  // bottom-right of the image
    vec2(2/3, 2/3),  // top-right of the image
    vec2(1/3, 2/3)
];
var texCoordsCenterRight = [
    vec2(2/3, 1/3),  
    vec2(1.0, 1/3),  
    vec2(1.0, 2/3),  
    vec2(2/3, 2/3)
];
var texCoordsBottomLeft = [
    vec2(0.0, 0.0),  
    vec2(1/3, 0.0), 
    vec2(1/3, 1/3),  
    vec2(0.0, 1/3)
];
var texCoordsBottomMid = [
    vec2(1/3, 0.0), 
    vec2(2/3, 0.0),  
    vec2(2/3, 1/3),  
    vec2(1/3, 1/3)
];
var texCoordsBottomRight = [
    vec2(2/3, 0.0), 
    vec2(1.0, 0.0), 
    vec2(1.0, 1/3),  
    vec2(2/3, 1/3)
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
    //----House-----
    {minX: -22, maxX: 22, minY: -1, maxY: 2, minZ: -20.05, maxZ: -19.95},
    {minX: -22, maxX: 22, minY: -1, maxY: 2, minZ: 19.95, maxZ: 20.05}, 
    {minX: 19.95, maxX: 20.05, minY: -1, maxY: 2, minZ: -22, maxZ: 22},
    {minX: -20.05, maxX: -19.95, minY: -1, maxY: 2, minZ: -22, maxZ: 22},
    {minX: -5.75, maxX: -4.25, minY: -1, maxY: 1, minZ: -15.05, maxZ: -14.95},
    {minX: -7.15, maxX: -5.65, minY: -1, maxY: 1, minZ: -15.3, maxZ: -15.2}, 
    {minX: -4.35, maxX: -2.85, minY: -1, maxY: 1, minZ: -15.3, maxZ: -15.2},  
    {minX: 1, maxX: 7, minY: -1, maxY: 1, minZ: -15.55, maxZ: -15.45},        
    {minX: -7, maxX: -1, minY: -1, maxY: 1, minZ: -15.55, maxZ: -15.45},      
    //doorway
    {minX: 0, maxX: 1, minY: -1, maxY: 1, minZ: -15.55, maxZ: -15.25},        
    {minX: -1, maxX: 0, minY: -1, maxY: 1, minZ: -15.55, maxZ: -15.25},        
    //doorway
    {minX: -3, maxX: 3, minY: -1, maxY: 1, minZ: -19.55, maxZ: -19.45},        
    {minX: 1.1, maxX: 7.1, minY: -1, maxY: 1, minZ: -19.55, maxZ: -19.45},     
    {minX: -7.1, maxX: -1.1, minY: -1, maxY: 1, minZ: -19.55, maxZ: -19.45},  
    {minX: 4.25, maxX: 5.75, minY: -1, maxY: 1, minZ: -15.05, maxZ: -14.95},   
    {minX: 3.1, maxX: 4.1, minY: -1, maxY: 1, minZ: -15.3, maxZ: -15.2},       
    {minX: 5.65, maxX: 7.15, minY: -1, maxY: 1, minZ: -15.3, maxZ: -15.2},     
    {minX: -7.15, maxX: -7.05, minY: -1, maxY: 1, minZ: -20, maxZ: -15.25},    
    {minX: 7.05, maxX: 7.15, minY: -1, maxY: 1, minZ: -20, maxZ: -15.25},
    //----House-----
    //----Tombstones----
    {minX: 17.2, maxX: 17.8, minY: -1.2, maxY: 0.2, minZ: -8.5, maxZ: -7.5}, 
    {minX: 16.7, maxX: 17.3, minY: -1.2, maxY: 0.2, minZ: -11.5, maxZ: -10.5},
    {minX: 12.7, maxX: 13.3, minY: -1.2, maxY: 0.2, minZ: -12.5, maxZ: -11.5}, 
    {minX: 14.7, maxX: 15.3, minY: -1.2, maxY: 0.2, minZ: -10.5, maxZ: -9.5}, 
    {minX: 14.7, maxX: 15.3, minY: -1.2, maxY: 0.2, minZ: -7.5, maxZ: -6.5}, 
    {minX: 11.7, maxX: 12.3, minY: -1.2, maxY: 0.2, minZ: -8.5, maxZ: -7.5},  
    {minX: 10.7, maxX: 11.3, minY: -1.2, maxY: 0.2, minZ: -4.5, maxZ: -3.5},  
    {minX: 13.7, maxX: 14.3, minY: -1.2, maxY: 0.2, minZ: -5.5, maxZ: -4.5}, 
    {minX: 17.7, maxX: 18.3, minY: -1.2, maxY: 0.2, minZ: -1.5, maxZ: -0.5},  
    //----Tombstones----
    //----Pillars----
    {minX: 19.25, maxX: 19.75, minY: -1.5, maxY: 1.5, minZ: -13.25, maxZ: -12.75},
    {minX: 14.25, maxX: 14.75, minY: -1.5, maxY: 1.5, minZ: -13.25, maxZ: -12.75},
    {minX: 9.25, maxX: 9.75, minY: -1.5, maxY: 1.5, minZ: -13.25, maxZ: -12.75},
    //wall-left
    {minX: 9.25, maxX: 19.75, minY: -1.5, maxY: 1.5, minZ: -13.25, maxZ: -12.75},
    //wall-left
    {minX: 19.25, maxX: 19.75, minY: -1.5, maxY: 1.5, minZ: 2.75, maxZ: 3.25},
    {minX: 14.25, maxX: 14.75, minY: -1.5, maxY: 1.5, minZ: 2.75, maxZ: 3.25},
    {minX: 9.25, maxX: 9.75, minY: -1.5, maxY: 1.5, minZ: 2.75, maxZ: 3.25},
    //wall-right
    {minX: 9.25, maxX: 19.75, minY: -1.5, maxY: 1.5, minZ: 2.75, maxZ: 3.25},
    //wall-right
    {minX: 9.25, maxX: 9.75, minY: -1.5, maxY: 1.5, minZ: -2.10, maxZ: 2.90},
    {minX: 9.25, maxX: 9.75, minY: -1.5, maxY: 1.5, minZ: -13.0, maxZ: -8},
    //----Pillars----
    //----Lightpost-----
    { minX: -1.65, maxX: -1.35, minY: -2.0, maxY: 1.0, minZ: -3.15, maxZ: -2.85 },
    { minX: 1.35, maxX: 1.65, minY: -2.0, maxY: 1.0, minZ: -8.15, maxZ: -7.85 },
    //----Lightpost-----
    //----Sidehouses-----
    { minX: -17, maxX: -15, minY: -1, maxY: 1, minZ: -7.5, maxZ: -2.5 },
    // Wall at (-16, 0, 5), scaled to (2, 2, 5)
    { minX: -17, maxX: -15, minY: -1, maxY: 1, minZ: 2.5, maxZ: 7.5 },
    // Wall at (-16, 0, 15), scaled to (2, 2, 5)
    { minX: -17, maxX: -15, minY: -1, maxY: 1, minZ: 12.5, maxZ: 17.5 },
    // Wall at (16, 0, 15), scaled to (2, 2, 5)
    { minX: 15, maxX: 17, minY: -1, maxY: 1, minZ: 12.5, maxZ: 17.5 }
    //----Sidehouses-----
    
];

function colorCube(texCoords) {
    quad(1, 0, 3, 2, texCoords); 
    quad(2, 3, 7, 6, texCoords); 
    quad(3, 0, 4, 7, texCoords); 
    quad(6, 5, 1, 2, texCoords); 
    quad(4, 5, 6, 7, texCoords);   
    quad(5, 4, 0, 1, texCoords); 
}

function quad(a, b, c, d, texCoords)
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
    texCoordsArray.push(texCoords[0]);
    texCoordsArray.push(texCoords[1]);
    texCoordsArray.push(texCoords[2]);
    texCoordsArray.push(texCoords[0]);
    texCoordsArray.push(texCoords[2]);
    texCoordsArray.push(texCoords[3]);
    //----------Top Layer--------------
    
    tombstoneCoordsArrayTL.push(texCoordsTopLeft[0]);
    tombstoneCoordsArrayTL.push(texCoordsTopLeft[1]);
    tombstoneCoordsArrayTL.push(texCoordsTopLeft[2]);
    tombstoneCoordsArrayTL.push(texCoordsTopLeft[0]);
    tombstoneCoordsArrayTL.push(texCoordsTopLeft[2]);
    tombstoneCoordsArrayTL.push(texCoordsTopLeft[3]);

    tombstoneCoordsArrayTM.push(texCoordsTopMid[0]);
    tombstoneCoordsArrayTM.push(texCoordsTopMid[1]);
    tombstoneCoordsArrayTM.push(texCoordsTopMid[2]);
    tombstoneCoordsArrayTM.push(texCoordsTopMid[0]);
    tombstoneCoordsArrayTM.push(texCoordsTopMid[2]);
    tombstoneCoordsArrayTM.push(texCoordsTopMid[3]);

    tombstoneCoordsArrayTR.push(texCoordsTopRight[0]);
    tombstoneCoordsArrayTR.push(texCoordsTopRight[1]);
    tombstoneCoordsArrayTR.push(texCoordsTopRight[2]);
    tombstoneCoordsArrayTR.push(texCoordsTopRight[0]);
    tombstoneCoordsArrayTR.push(texCoordsTopRight[2]);
    tombstoneCoordsArrayTR.push(texCoordsTopRight[3]);
    
    tombstoneCoordsArrayCL.push(texCoordsCenterLeft[0]);
    tombstoneCoordsArrayCL.push(texCoordsCenterLeft[1]);
    tombstoneCoordsArrayCL.push(texCoordsCenterLeft[2]);
    tombstoneCoordsArrayCL.push(texCoordsCenterLeft[0]);
    tombstoneCoordsArrayCL.push(texCoordsCenterLeft[2]);
    tombstoneCoordsArrayCL.push(texCoordsCenterLeft[3]);

    tombstoneCoordsArrayCM.push(texCoordsCenterMid[0]);
    tombstoneCoordsArrayCM.push(texCoordsCenterMid[1]);
    tombstoneCoordsArrayCM.push(texCoordsCenterMid[2]);
    tombstoneCoordsArrayCM.push(texCoordsCenterMid[0]);
    tombstoneCoordsArrayCM.push(texCoordsCenterMid[2]);
    tombstoneCoordsArrayCM.push(texCoordsCenterMid[3]);

    tombstoneCoordsArrayCR.push(texCoordsCenterRight[0]);
    tombstoneCoordsArrayCR.push(texCoordsCenterRight[1]);
    tombstoneCoordsArrayCR.push(texCoordsCenterRight[2]);
    tombstoneCoordsArrayCR.push(texCoordsCenterRight[0]);
    tombstoneCoordsArrayCR.push(texCoordsCenterRight[2]);
    tombstoneCoordsArrayCR.push(texCoordsCenterRight[3]);

    tombstoneCoordsArrayBL.push(texCoordsBottomLeft[0]);
    tombstoneCoordsArrayBL.push(texCoordsBottomLeft[1]);
    tombstoneCoordsArrayBL.push(texCoordsBottomLeft[2]);
    tombstoneCoordsArrayBL.push(texCoordsBottomLeft[0]);
    tombstoneCoordsArrayBL.push(texCoordsBottomLeft[2]);
    tombstoneCoordsArrayBL.push(texCoordsBottomLeft[3]);

    tombstoneCoordsArrayBM.push(texCoordsBottomMid[0]);
    tombstoneCoordsArrayBM.push(texCoordsBottomMid[1]);
    tombstoneCoordsArrayBM.push(texCoordsBottomMid[2]);
    tombstoneCoordsArrayBM.push(texCoordsBottomMid[0]);
    tombstoneCoordsArrayBM.push(texCoordsBottomMid[2]);
    tombstoneCoordsArrayBM.push(texCoordsBottomMid[3]);

    tombstoneCoordsArrayBR.push(texCoordsBottomRight[0]);
    tombstoneCoordsArrayBR.push(texCoordsBottomRight[1]);
    tombstoneCoordsArrayBR.push(texCoordsBottomRight[2]);
    tombstoneCoordsArrayBR.push(texCoordsBottomRight[0]);
    tombstoneCoordsArrayBR.push(texCoordsBottomRight[2]);
    tombstoneCoordsArrayBR.push(texCoordsBottomRight[3]);
    
}

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

function logCameraState() {
    const directions = {
        1: "Forward",
        2: "Right",
        3: "Behind",
        4: "Left"
    };

    console.log(`
    Camera State:
    EyeX: ${eyeX.toFixed(2)}
    EyeY: ${eyeY.toFixed(2)}
    EyeZ: ${eyeZ.toFixed(2)}
    AtX: ${atX.toFixed(2)}
    AtY: ${atY.toFixed(2)}
    AtZ: ${atZ.toFixed(2)}
    Angle: ${cameraAngle}
    Direction: ${direction}
    DirectionFacing: ${directions[directionFacing] || "Unknown"}`);
    console.log(keyPressed);

}
Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
}
window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    });
    
    canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const deltaX = event.clientX - lastMouseX;
            direction = (direction + deltaX * 0.4) % 360;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            updateAtCoordinates();
        }
    });
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });
    canvas.addEventListener('mouseleave', () => {
        isDragging = false; 
    });

    function updateAtCoordinates() {
        const rad = (Math.PI / 180) * direction;
        atX = eyeX + Math.sin(rad);
        atZ = eyeZ - Math.cos(rad);
    }

    document.addEventListener("keydown", function (e) {
        keyPressed = e.keyCode; 
    
        var newEyeX = eyeX;
        var newEyeY = eyeY;
        var newEyeZ = eyeZ;
    
        const buffer = 0.2;
    
        if (keyPressed == 65) { // A key for "left"
            newEyeX -= 0.1 * Math.cos((Math.PI / 180) * direction);
            newEyeZ -= 0.1 * Math.sin((Math.PI / 180) * direction);
        } else if (keyPressed == 68) { // D key for "right"
            newEyeX += 0.1 * Math.cos((Math.PI / 180) * direction);
            newEyeZ += 0.1 * Math.sin((Math.PI / 180) * direction);
        } else if (keyPressed == 87) { // W key for "forward"
            newEyeX += 0.1 * Math.sin((Math.PI / 180) * direction);
            newEyeZ -= 0.1 * Math.cos((Math.PI / 180) * direction);
        } else if (keyPressed == 83) { // S key for "backward"
            newEyeX -= 0.1 * Math.sin((Math.PI / 180) * direction);
            newEyeZ += 0.1 * Math.cos((Math.PI / 180) * direction);
        } else if (keyPressed == 82) {
            newEyeX = 0;
            eyeY = 0;
            newEyeZ = 7;
            atX = 0;
            atY = 0;
            atZ = -1;
            direction = 0;
            fovy = 90;
        } else if (keyPressed == 187) { // Increase field of view
            
            fovy = Math.min(fovy + 5.0, 110.0);
        } else if (keyPressed == 189) {// Decrease field of view
            fovy = Math.max(fovy - 5.0, 70.0);

        } else if (keyPressed == 32) {// Space for jump
            jumping = true;
            jump();
        } else if (keyPressed == 37) {// Turn left
            direction = (direction + 270) % 360;
        } else if (keyPressed == 39) {// Turn right
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
    
        updateAtCoordinates();
        logCameraState();
        
    
    });  
    updateAtCoordinates();
    colorCube(texCoord);
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.749, 0.604, 0.412, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
    mySphere1 = sphere(4);
	sphereStart = count;
	mySphere1.scale(.15, .15, .15);
    mySphere1.translate(.65,1.4,-8);
	positions = positions.concat(mySphere1.TriangleVertices);
    colors = colors.concat(mySphere1.TriangleVertexColors);
	normalsArray = normalsArray.concat(mySphere1.TriangleNormals);
    sphereVert = mySphere1.TriangleVertices.length;

    myCylinder = cylinder(36, 1, true);
    myCylinder.scale(.3,3,.3);
    myCylinder.translate(1.5,0,-8);
    positions = positions.concat(myCylinder.TriangleVertices);
    colors = colors.concat(myCylinder.TriangleVertexColors);
    normalsArray = normalsArray.concat(myCylinder.TriangleNormals);

    myCylinder2 = cylinder(36, 1, true);
    myCylinder2.scale(.3, 1, .3);
    myCylinder2.rotate(90, vec3(0,0,1));
    myCylinder2.translate(1,1.5,-8);
    positions = positions.concat(myCylinder2.TriangleVertices);
    colors = colors.concat(myCylinder2.TriangleVertexColors);
    normalsArray = normalsArray.concat(myCylinder2.TriangleNormals);

    mySphere2 = sphere(4);
	sphereStart2 = count;
	mySphere2.scale(.15, .15, .15);
    mySphere2.translate(-.65,1.4,-3);
	positions = positions.concat(mySphere2.TriangleVertices);
    colors = colors.concat(mySphere2.TriangleVertexColors);
	normalsArray = normalsArray.concat(mySphere2.TriangleNormals);
    sphereVert2 = mySphere2.TriangleVertices.length;

    myCylinder3 = cylinder(36, 1, true);
    myCylinder3.scale(.3,3,.3);
    myCylinder3.translate(-1.5,0,-3);
    positions = positions.concat(myCylinder3.TriangleVertices);
    colors = colors.concat(myCylinder3.TriangleVertexColors);
    normalsArray = normalsArray.concat(myCylinder3.TriangleNormals);
    
    myCylinder4 = cylinder(36, 1, true);
    myCylinder4.scale(.3, 1, .3);
    myCylinder4.rotate(90, vec3(0,0,1));
    myCylinder4.translate(-1,1.5,-3);
    positions = positions.concat(myCylinder4.TriangleVertices);
    colors = colors.concat(myCylinder4.TriangleVertexColors);
    normalsArray = normalsArray.concat(myCylinder4.TriangleNormals);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    tBuffer = gl.createBuffer();
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

    ambientColor = mult(lightAmbient, material1Ambient);
    diffuseColor = mult(lightDiffuse, material1Diffuse);
    specularColor = mult(lightSpecular, material1Specular);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), flatten(ambientColor));
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), flatten(diffuseColor));
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), flatten(specularColor));
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), material1Shininess);

    imageTextures();


    render();
}
function imageTextures(){
    var image1 = document.getElementById("image1");
    configureTexture(image1, 1);
    var image2 = document.getElementById("image2");
    configureTexture(image2, 2);
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
    var image8 = document.getElementById("image8");
    configureTexture(image8, 8);
    var image9 = document.getElementById("image9");
    configureTexture(image9, 9);
    var image10 = document.getElementById("image10");
    configureTexture(image10, 10);
    var image11 = document.getElementById("image11");
    configureTexture(image11, 11);
    var image12 = document.getElementById("image12");
    configureTexture(image12, 12);
    var image13 = document.getElementById("image13");
    configureTexture(image13, 13);
    var image14 = document.getElementById("image14");
    configureTexture(image14, 14);
    var image15 = document.getElementById("image15");
    configureTexture(image15, 15);
    var image16 = document.getElementById("image16");
    configureTexture(image16, 16);
    var image17 = document.getElementById("image17");
    configureTexture(image17, 17);
    var image18 = document.getElementById("image18");
    configureTexture(image18, 18);

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
function barrierCreation(){
    //front barrier
    var x = -20;
    for (let i = 0; i < 11; i++) {  
        transfMat = scale(4, 3, .1); 
        transfMat = mult(translate(x, 0.5, -20), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        x += 4;

    }
    //back barrier
    x = 20;
    for (let i = 0; i < 11; i++) {  
        transfMat = scale(4, 3, -.1); 
        transfMat = mult(translate(x, 0.5, 20), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        x -= 4;

    }
    //right barrier
    x = -20;
    for (let i = 0; i < 11; i++) {  
        transfMat = scale(.1, 3, 4); 
        transfMat = mult(translate(20, 0.5, x), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        x += 4;

    }
    //left barrier
    x = -20;
    for (let i = 0; i < 11; i++) {  
        transfMat = scale(.1, 3, 4); 
        transfMat = mult(translate(-20, 0.5, x), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        x += 4;

    }
}
function animate(){
    if(!isDoorOpen){ //if doorOpen = false
        transfMatDoorway = mult(translate(.5, 0, -15.5), scale(1, 2, .1)); 
        transfMatDoorway = mult(lookAtMat, transfMatDoorway);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatDoorway));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        transfMatDoorway = mult(translate(-.5, 0, -15.5), scale(-1, 2, .1)); 
        transfMatDoorway = mult(lookAtMat, transfMatDoorway);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatDoorway));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        
    } 
    else if(isDoorOpen){ //if doorOpen = true
        transfMatDoorway = mult(translate(1, 0, -16), scale(.1, 2, 1)); 
        transfMatDoorway = mult(lookAtMat, transfMatDoorway);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatDoorway));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        transfMatDoorway = mult(translate(-1, 0, -16), scale(.1, 2, -1)); 
        transfMatDoorway = mult(lookAtMat, transfMatDoorway);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatDoorway));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        walls = walls.filter(wall => {
            return !(
                (wall.minX === 0 && wall.maxX === 1 && wall.minZ === -15.55 && wall.maxZ === -15.25) || 
                (wall.minX === -1 && wall.maxX === 0 && wall.minZ === -15.55 && wall.maxZ === -15.25)
            );
        });
        
    }
    if (keyPressed == 79) {
        if (eyeX >= -0.30 && eyeX <= 0.30 && atX >= -0.30 && atX <= 0.30 && 
            eyeZ >= -15.25 && eyeZ <= -14.20 && atZ >= -16.25 && atZ <= -15.20) {
                isDoorOpen = true;
        }
        
        
    }
    
}
function createMainHouse(){
    //-----House 1-------
        //column1
            //bottom half
            gl.uniform1i(useTextureLoc, true);  
            gl.bindTexture(gl.TEXTURE_2D, texture[5]);
            
            transfMat = scale(1.5, 2, .1); 
            transfMat = mult(translate(-5, 0, -15), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            gl.uniform1i(useTextureLoc, true);  
            gl.bindTexture(gl.TEXTURE_2D, texture[4]);

            transfMat = scale(1.5, 2, .1);
            transfMat = mult(rotate(200, vec3(0, 1, 0)), transfMat);
            transfMat = mult(translate(-6.4, 0, -15.25), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(1.5, 2, .1);
            transfMat = mult(rotate(-200, vec3(0, 1, 0)), transfMat);
            transfMat = mult(translate(-3.6, 0, -15.25), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        //bottom half

        //sidewall-left
            gl.uniform1i(useTextureLoc, true);
            gl.bindTexture(gl.TEXTURE_2D, texture[4]);
            transfMat = scale(0.1, 2, 4.5);
            transfMat = mult(rotate(180, vec3(0, 1, 0)), transfMat);
            transfMat = mult(translate(-7.1, 0, -17.75), transfMat);
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions - (numPositions / 6));
            gl.bindTexture(gl.TEXTURE_2D, texture[13]);
            gl.drawArrays(gl.TRIANGLES, numPositions - (numPositions / 6), numPositions / 6); 

            gl.uniform1i(useTextureLoc, true);  
            gl.bindTexture(gl.TEXTURE_2D, texture[6]);
            transfMat = scale(.1, 2, 4.5);
            transfMat = mult(translate(-7.1, 2, -17.75), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        //sidewall-left
        
        //top half
            gl.uniform1i(useTextureLoc, true);  
            gl.bindTexture(gl.TEXTURE_2D, texture[7]);

            transfMat = scale(1.5, 2, .1); 
            transfMat = mult(translate(-5, 2, -15), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            gl.uniform1i(useTextureLoc, true);  
            gl.bindTexture(gl.TEXTURE_2D, texture[6]);

            transfMat = scale(1.5, 2, .1);
            transfMat = mult(rotate(200, vec3(0, 1, 0)), transfMat);
            transfMat = mult(translate(-6.4, 2, -15.25), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(1.5, 2, .1);
            transfMat = mult(rotate(-200, vec3(0, 1, 0)), transfMat);
            transfMat = mult(translate(-3.6, 2, -15.25), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        //top half
    //column1

    //center
        //front
            gl.uniform1i(useTextureLoc, true);  
            gl.bindTexture(gl.TEXTURE_2D, texture[4]);

            transfMat = scale(6, 2, .1); 
            transfMat = mult(translate(0, 2, -15.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(6, 2, .1); 
            transfMat = mult(translate(4, 0, -15.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(6, 2, .1); 
            transfMat = mult(translate(4, 2, -15.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(6, 2, .1); 
            transfMat = mult(translate(-4, 0, -15.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(6, 2, .1); 
            transfMat = mult(translate(-4, 2, -15.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            //doorway animation
                gl.uniform1i(useTextureLoc, true);  
                gl.bindTexture(gl.TEXTURE_2D, texture[10]);
                animate();
            //doorway animation

        //front

        //rear
            gl.uniform1i(useTextureLoc, true);  
            gl.bindTexture(gl.TEXTURE_2D, texture[4]);
            transfMat = scale(6, 2, .1); 
            transfMat = mult(translate(0, 0, -19.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(6, 2, .1); 
            transfMat = mult(translate(4.1, 0, -19.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(6, 2, .1); 
            transfMat = mult(translate(-4.1, 0, -19.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(6, 2, .1); 
            transfMat = mult(translate(0, 2, -19.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(6, 2, .1); 
            transfMat = mult(translate(4.1, 2, -19.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(6, 2, .1); 
            transfMat = mult(translate(-4.1, 2, -19.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        //rear
    //center

    //column2
        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[5]);

        transfMat = scale(1.5, 2, .1); 
        transfMat = mult(translate(5, 0, -15), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[4]);

        transfMat = scale(1.5, 2, .1);
        transfMat = mult(rotate(200, vec3(0, 1, 0)), transfMat);
        transfMat = mult(translate(3.6, 0, -15.25), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        transfMat = scale(1.5, 2, .1);
        transfMat = mult(rotate(-200, vec3(0, 1, 0)), transfMat);
        transfMat = mult(translate(6.4, 0, -15.25), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        //sidewall-right
            transfMat = scale(.1, 2, 4.5);
            transfMat = mult(translate(7.1, 0, -17.75), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            gl.uniform1i(useTextureLoc, true);  
            gl.bindTexture(gl.TEXTURE_2D, texture[6]);
            transfMat = scale(.1, 2, 4.5);
            transfMat = mult(translate(7.1, 2, -17.75), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        //sidewall-right

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[7]);

        transfMat = scale(1.5, 2, .1); 
        transfMat = mult(translate(5, 2, -15), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[6]);

        transfMat = scale(1.5, 2, .1);
        transfMat = mult(rotate(200, vec3(0, 1, 0)), transfMat);
        transfMat = mult(translate(3.6, 2, -15.25), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        transfMat = scale(1.5, 2, .1);
        transfMat = mult(rotate(-200, vec3(0, 1, 0)), transfMat);
        transfMat = mult(translate(6.4, 2, -15.25), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //column2

    //floor 
        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[8]);
        var y =- 6;
        for (let i = 0; i < 7; i++) {
            transfMat = scale(2, 0.021, 2); 
            transfMat = mult(translate(y, -1, -18.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
            y+=2;
        }

        y=-6
        for (let i = 0; i < 7; i++) {
            transfMat = scale(2, 0.021, 2); 
            transfMat = mult(translate(y, -1, -16.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
            y+=2;
        }
    //floor 

    //ceiling 
        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[9]);
        y=-6
        for (let i = 0; i < 7; i++) {
            transfMat = scale(2, 0.021, 2); 
            transfMat = mult(translate(y, 2.25, -18.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
            y+=2;
        }

        y=-6
        for (let i = 0; i < 7; i++) {
            transfMat = scale(2, 0.021, 2); 
            transfMat = mult(translate(y, 2.25, -16.5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
            y+=2;
        }
        //right-ceiling column
            transfMat = scale(1.5, 1.5, .1); 
            transfMat = mult(rotate(210, vec3(1, 0, 0)), transfMat);
            transfMat = mult(translate(5, 3, -15), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(1.5, 1.5, .1);
            transfMat = mult(rotate(-210, vec3(1, 0, 0)), transfMat);
            transfMat = mult(rotate(200, vec3(0, 1, 0)), transfMat);
            transfMat = mult(translate(3.6, 3, -15.25), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(1.5, 1.5, .1);
            transfMat = mult(rotate(-210, vec3(1, 0, 0)), transfMat);
            transfMat = mult(rotate(-200, vec3(0, 1, 0)), transfMat);
            transfMat = mult(translate(6.4, 3, -15.25), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        //right ceiling column

        //left ceiling column
            transfMat = scale(1.5, 1.5, .1); 
            transfMat = mult(rotate(210, vec3(1, 0, 0)), transfMat);
            transfMat = mult(translate(-5, 3, -15), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(1.5, 1.5, .1);
            transfMat = mult(rotate(-210, vec3(1, 0, 0)), transfMat);
            transfMat = mult(rotate(-200, vec3(0, 1, 0)), transfMat);
            transfMat = mult(translate(-3.6, 3, -15.25), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);

            transfMat = scale(1.5, 1.5, .1);
            transfMat = mult(rotate(-210, vec3(1, 0, 0)), transfMat);
            transfMat = mult(rotate(200, vec3(0, 1, 0)), transfMat);
            transfMat = mult(translate(-6.4, 3, -15.25), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        //left ceiling column

        //center ceiling
            gl.uniform1i(useTextureLoc, true);  
            gl.bindTexture(gl.TEXTURE_2D, texture[11]);
            y = -6.25
            for (let i = 0; i < 9; i++) {
                transfMat = scale(1.55, 3, 2); 
                transfMat = mult(rotate(210, vec3(1, 0, 0)), transfMat);
                transfMat = mult(translate(y, 4, -17), transfMat); 
                transfMat = mult(lookAtMat, transfMat);
                gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
                gl.drawArrays(gl.TRIANGLES, 0, numPositions);
                y+=1.55;
            }

            y = -6.25
            for (let i = 0; i < 9; i++) {
                transfMat = scale(1.55, 3, 2); 
                transfMat = mult(rotate(-210, vec3(1, 0, 0)), transfMat);
                transfMat = mult(translate(y, 4, -18.5), transfMat); 
                transfMat = mult(lookAtMat, transfMat);
                gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
                gl.drawArrays(gl.TRIANGLES, 0, numPositions);
                y+=1.55;
            }
        //center ceiling
        //left ceiling cover
            transfMat = scale(.05, 3.25, 3.25);
            transfMat = mult(rotate(45, vec3(1, 0, 0)), transfMat); 
            transfMat = mult(translate(-7.1, 3.25, -17.75), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        //left ceiling cover

        //right ceiling cover
            transfMat = scale(.05, 3.25, 3.25);
            transfMat = mult(rotate(45, vec3(1, 0, 0)), transfMat); 
            transfMat = mult(translate(7.1, 3.25, -17.75), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        //right ceiling cover


    //ceiling

    //indoor
        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[16]);
        transfMat = scale(.1, 2, .5); 
        transfMat = mult(translate(7, 0, -18), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[18]);
        transfMat = scale(.2, 2, .7); 
        transfMat = mult(translate(-7, 0, -16), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        
    //indoor

//-----House 1-------
}
function sideHouses(){
    var z = -5
    var z1 = -6.5
    var z2 = -3.5
    for (let i = 0; i < 3; i++) {
        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[6]);
        transfMat = scale(2, 2, 5); 
        transfMat = mult(translate(-16, 0, z), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions); 

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[6]);
        transfMat = scale(2, 2, 5); 
        transfMat = mult(translate(-16, 2, z), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions); 

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[7]);
        transfMat = scale(.2, 2, 2); 
        transfMat = mult(translate(-15.05, 2, z1), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[7]);
        transfMat = scale(.2, 2, 2); 
        transfMat = mult(translate(-15.05, 2, z2), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[11]);
        transfMat = scale(1.5, 1.5, 4.9); 
        transfMat = mult(rotate(45, vec3(0, 0, 1)), transfMat);
        transfMat = mult(translate(-16, 3, z), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[15]);
        transfMat = scale(.1, 1.7, 1);
        transfMat = mult(translate(-15, -.2, z),transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        z+=10;
        z1+=10;
        z2+=10;

    }

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[4]);
        transfMat = scale(2, 2, 5); 
        transfMat = mult(translate(16, 0, 15), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions); 

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[4]);
        transfMat = scale(2, 2, 5); 
        transfMat = mult(translate(16, 2, 15), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions); 

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[5]);
        transfMat = scale(.2, 2, 2); 
        transfMat = mult(translate(15.05, 2, 13.5), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[5]);
        transfMat = scale(.2, 2, 2); 
        transfMat = mult(translate(15.05, 2, 16.5), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[11]);
        transfMat = scale(1.5, 1.5, 4.9); 
        transfMat = mult(rotate(45, vec3(0, 0, 1)), transfMat);
        transfMat = mult(translate(16, 3, 15), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);

        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[10]);
        transfMat = scale(.1, 1.7, 1);
        transfMat = mult(translate(15, -.2, 15),transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
}
function creepyChair(){
    gl.uniform1i(useTextureLoc, true);  
    gl.bindTexture(gl.TEXTURE_2D, texture[9]);

    transfMat = scale(.1, .5, .1); 
    transfMat = mult(translate(-5, -.7, -18), transfMat); 
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.1, .5, .1); 
    transfMat = mult(translate(-5.5, -.7, -18), transfMat); 
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.1, 1, .1); 
    transfMat = mult(translate(-5.5, -.5, -18.5), transfMat); 
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    gl.uniform1i(useTextureLoc, true); 

    transfMat = scale(.1, 1, .1); 
    transfMat = mult(translate(-5, -.5, -18.5), transfMat); 
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    gl.uniform1i(useTextureLoc, true); 

    transfMat = scale(.5, .1, .1); 
    transfMat = mult(translate(-5.25, -.05, -18.5), transfMat); 
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    transfMat = scale(.5, .1, .5); 
    transfMat = mult(translate(-5.25, -.5, -18.25), transfMat); 
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);



}
function createCementary(){
    gl.uniform1i(useTextureLoc, true);  
    gl.bindTexture(gl.TEXTURE_2D, texture[6]);
    var num1 = 19.5
    var num2 = -13;
    //pillars
    for (let j = 0; j < 2; j++) { 
        for (let i = 0; i < 3; i++) { 
            transfMat = scale(.5, 2, .5); 
            transfMat = mult(translate(num1, -.5, num2), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
            num1 -= 5;
        }
        num1 = 19.5;
        num2 += 16;
    }
    //walls
    num1 = 17;
    num2 = -13
    for (let j = 0; j < 2; j++) { 
        for (let i = 0; i < 2; i++) { 
            transfMat = scale(5, 1, .1); 
            transfMat = mult(translate(num1, -.5, num2), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
            num1 -= 5;
        }
        num1 = 17
        num2 += 16;
    }
    
    num1 = 9.5;
    num2 = -10.5;
    //walls
    for (let i = 0; i < 2; i++) {
        transfMat = scale(.1, 1, 5); 
        transfMat = mult(translate(num1, -.5, num2), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        num2 += 11;
    }
    num2 = -8
    for (let i = 0; i < 2; i++) {
        transfMat = scale(.5, 2, .5); 
        transfMat = mult(translate(9.5, -.5, num2), transfMat); 
        transfMat = mult(lookAtMat, transfMat);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
        num2 += 6;
    }
    //-------Tombstones-----
    gl.uniform1i(useTextureLoc, true);  
    gl.bindTexture(gl.TEXTURE_2D, texture[14]); 

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayTL));
    transfMatTombstone = scale(.3, .7, 1);
    transfMatTombstone = mult(rotate(270, vec3(1, 0, 0)), transfMatTombstone); 
    transfMatTombstone = mult(rotate(10, vec3(0, 0, 1)), transfMatTombstone);
    transfMatTombstone = mult(translate(17.5, -.5, -8), transfMatTombstone); 
    transfMatTombstone = mult(lookAtMat, transfMatTombstone);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatTombstone));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayTM));
    transfMatTombstone = scale(.3, .7, 1);
    transfMatTombstone = mult(rotate(270, vec3(1, 0, 0)), transfMatTombstone); 
    transfMatTombstone = mult(rotate(10, vec3(0, 0, 1)), transfMatTombstone);
    transfMatTombstone = mult(translate(17, -.5, -11), transfMatTombstone); 
    transfMatTombstone = mult(lookAtMat, transfMatTombstone);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatTombstone));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayTR));
    transfMatTombstone = scale(.3, .7, 1);
    transfMatTombstone = mult(rotate(270, vec3(1, 0, 0)), transfMatTombstone); 
    transfMatTombstone = mult(rotate(10, vec3(0, 0, 1)), transfMatTombstone);
    transfMatTombstone = mult(translate(13, -.5, -12), transfMatTombstone); 
    transfMatTombstone = mult(lookAtMat, transfMatTombstone);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatTombstone));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayCL));
    transfMatTombstone = scale(.3, .7, 1);
    transfMatTombstone = mult(rotate(270, vec3(1, 0, 0)), transfMatTombstone); 
    transfMatTombstone = mult(rotate(10, vec3(1, 0, 0)), transfMatTombstone);
    transfMatTombstone = mult(translate(15, -.5, -10), transfMatTombstone); 
    transfMatTombstone = mult(lookAtMat, transfMatTombstone);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatTombstone));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayCM));
    transfMatTombstone = scale(.3, .7, 1);
    transfMatTombstone = mult(rotate(270, vec3(1, 0, 0)), transfMatTombstone); 
    transfMatTombstone = mult(rotate(-10, vec3(1, 0, 1)), transfMatTombstone);
    transfMatTombstone = mult(translate(15, -.5, -7), transfMatTombstone); 
    transfMatTombstone = mult(lookAtMat, transfMatTombstone);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatTombstone));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayCR));
    transfMatTombstone = scale(.3, .7, 1);
    transfMatTombstone = mult(rotate(270, vec3(1, 0, 0)), transfMatTombstone); 
    transfMatTombstone = mult(rotate(10, vec3(0, 0, 1)), transfMatTombstone);
    transfMatTombstone = mult(translate(12, -.5, -8), transfMatTombstone); 
    transfMatTombstone = mult(lookAtMat, transfMatTombstone);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatTombstone));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayBL));
    transfMatTombstone = scale(.3, .7, 1);
    transfMatTombstone = mult(rotate(270, vec3(1, 0, 0)), transfMatTombstone); 
    transfMatTombstone = mult(rotate(10, vec3(0, 0, 1)), transfMatTombstone);
    transfMatTombstone = mult(translate(11, -.5, -4), transfMatTombstone); 
    transfMatTombstone = mult(lookAtMat, transfMatTombstone);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatTombstone));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayBM));
    transfMatTombstone = scale(.3, .7, 1);
    transfMatTombstone = mult(rotate(270, vec3(1, 0, 0)), transfMatTombstone); 
    transfMatTombstone = mult(rotate(10, vec3(0, 0, 1)), transfMatTombstone);
    transfMatTombstone = mult(translate(14, -.5, -5), transfMatTombstone); 
    transfMatTombstone = mult(lookAtMat, transfMatTombstone);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatTombstone));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayBR));
    transfMatTombstone = scale(.3, .7, 1);
    transfMatTombstone = mult(rotate(270, vec3(1, 0, 0)), transfMatTombstone); 
    transfMatTombstone = mult(rotate(10, vec3(0, 0, 1)), transfMatTombstone);
    transfMatTombstone = mult(translate(18, -.5, -1), transfMatTombstone); 
    transfMatTombstone = mult(lookAtMat, transfMatTombstone);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatTombstone));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayCR));
    transfMatTombstone = scale(.3, .7, 1);
    transfMatTombstone = mult(rotate(270, vec3(1, 0, 0)), transfMatTombstone); 
    transfMatTombstone = mult(rotate(20, vec3(0, 1, 1)), transfMatTombstone);
    transfMatTombstone = mult(translate(15, -.5, -1), transfMatTombstone); 
    transfMatTombstone = mult(lookAtMat, transfMatTombstone);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatTombstone));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayCR));
    transfMatTombstone = scale(.3, .7, 1);
    transfMatTombstone = mult(rotate(270, vec3(1, 0, 0)), transfMatTombstone); 
    transfMatTombstone = mult(rotate(-10, vec3(1, 0, 1)), transfMatTombstone);
    transfMatTombstone = mult(translate(12, -.5, 0), transfMatTombstone); 
    transfMatTombstone = mult(lookAtMat, transfMatTombstone);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatTombstone));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayTL));
    transfMatTombstone = scale(.3, .7, 1);
    transfMatTombstone = mult(rotate(270, vec3(1, 0, 0)), transfMatTombstone); 
    transfMatTombstone = mult(rotate(-10, vec3(1, 0, 0)), transfMatTombstone);
    transfMatTombstone = mult(translate(16.5, -.5, 1), transfMatTombstone); 
    transfMatTombstone = mult(lookAtMat, transfMatTombstone);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatTombstone));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayTL));
    transfMatTombstone = scale(.3, .7, 1);
    transfMatTombstone = mult(rotate(270, vec3(1, 0, 0)), transfMatTombstone); 
    transfMatTombstone = mult(rotate(10, vec3(0, 0, 1)), transfMatTombstone);
    transfMatTombstone = mult(translate(16.5, -.5, -3.5), transfMatTombstone); 
    transfMatTombstone = mult(lookAtMat, transfMatTombstone);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMatTombstone));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);



    //-------Tombstones-----

}
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	lookAtMat = lookAt(vec3(eyeX, eyeY, eyeZ), vec3(atX, atY, atZ), vec3(0, 1, 0)); //eye, at, up
    projMat = perspective(fovy, 1, .2, 100);
    gl.uniformMatrix4fv(projMatrixLoc,  false, flatten(projMat));
    
    //sphere
    transfMat = lookAtMat;
    gl.uniform1i(useTextureLoc, true); 
    gl.bindTexture(gl.TEXTURE_2D, texture[12]); 
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, sphereStart, sphereVert);
    //sphere
    
    
    //cylinder
    transfMat = lookAtMat;
    gl.uniform1i(useTextureLoc, true); 
    gl.bindTexture(gl.TEXTURE_2D, texture[11]);  
    cylinderStart = sphereStart + sphereVert;
    cylinderVert = myCylinder.TriangleVertices.length;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, cylinderStart, cylinderVert);
    //cylinder

    //cylinder2
    transfMat = lookAtMat;
    gl.uniform1i(useTextureLoc, true); 
    gl.bindTexture(gl.TEXTURE_2D, texture[11]);  
    cylinderStart2 = cylinderStart + cylinderVert;
    cylinderVert2 = myCylinder2.TriangleVertices.length;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, cylinderStart2, cylinderVert2);
    //cylinder2

    transfMat = lookAtMat;
    gl.uniform1i(useTextureLoc, true); 
    gl.bindTexture(gl.TEXTURE_2D, texture[12]);
    sphereStart2 = cylinderStart2 + cylinderVert2;
    sphereVert2 = mySphere2.TriangleVertices.length; 
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, sphereStart2, sphereVert2);

    transfMat = lookAtMat;
    gl.uniform1i(useTextureLoc, true); 
    gl.bindTexture(gl.TEXTURE_2D, texture[11]);  
    cylinderStart3 = sphereStart2 + sphereVert2;
    cylinderVert3 = myCylinder3.TriangleVertices.length;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, cylinderStart3, cylinderVert3);
  
    transfMat = lookAtMat;
    gl.uniform1i(useTextureLoc, true); 
    gl.bindTexture(gl.TEXTURE_2D, texture[11]);  
    cylinderStart4 = cylinderStart3 + cylinderVert3;
    cylinderVert4 = myCylinder4.TriangleVertices.length;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, cylinderStart4, cylinderVert4);
    
    //------Barrier Wall--------
    gl.uniform1i(useTextureLoc, true);
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(texCoordsArray));
    gl.bindTexture(gl.TEXTURE_2D, texture[1]);
    barrierCreation();
    //------Barrier Wall--------

    //------Ground Texture------
        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[3]); 

        for (let i = 0; i < 9; i++) { 
            for (let j = 0; j < 9; j++) { 
                transfMat = scale(5, 0.011, 5); 
                transfMat = mult(translate(-20 + j * 5, -1, -20 + i * 5), transfMat); 
                transfMat = mult(lookAtMat, transfMat);
                gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
                gl.drawArrays(gl.TRIANGLES, 0, numPositions);
            }
        }
    //------Ground Texture------

    //------Gravel Path Texture------
        gl.uniform1i(useTextureLoc, true);  
        gl.bindTexture(gl.TEXTURE_2D, texture[2]);
        let z = 15
        for (let i = 0; i < 16; i++) { 
            transfMat = scale(2, 0.02, 2); 
            transfMat = mult(translate(0, -1, z), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
            z += -2
        }
        var j = 8;
        for (let i = 0; i < 12; i++) {
            transfMat = scale(2, 0.02, 2); 
            transfMat = mult(translate(j, -1, -5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
            j -= 2;
        }
        j = 0;
        for (let i = 0; i < 8; i++) {
            transfMat = scale(2, 0.02, 2); 
            transfMat = mult(translate(j, -1, 5), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
            j -= 2;
        }
        j = 15;
        for (let i = 0; i < 16; i++) {
            transfMat = scale(2, 0.02, 2); 
            transfMat = mult(translate(j, -1, 15), transfMat); 
            transfMat = mult(lookAtMat, transfMat);
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
            gl.drawArrays(gl.TRIANGLES, 0, numPositions);
            j -= 2;
        }
    //------Gravel Path Texture------
    createMainHouse();
    sideHouses();
    creepyChair();

    createCementary();
    //portraits
    gl.uniform1i(useTextureLoc, true);  
    gl.bindTexture(gl.TEXTURE_2D, texture[17]);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayCL));
    transfMat = scale(.4, .5, .1);
    transfMat = mult(rotate(90, vec3(0, 0, 1)), transfMat); 
    transfMat = mult(translate(2, 1.5, -19.45), transfMat); 
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayTL));
    transfMat = scale(.4, .5, .1);
    transfMat = mult(rotate(90, vec3(0, 0, 1)), transfMat); 
    transfMat = mult(translate(-2, 1.5, -19.45), transfMat); 
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayCM));
    transfMat = scale(.4, .5, .1);
    transfMat = mult(rotate(90, vec3(0, 0, 1)), transfMat); 
    transfMat = mult(translate(-1, 0, -19.45), transfMat); 
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayCR));
    transfMat = scale(.4, .5, .1);
    transfMat = mult(rotate(90, vec3(0, 0, 1)), transfMat); 
    transfMat = mult(translate(1, 1.2, -19.45), transfMat); 
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayBL));
    transfMat = scale(.4, .5, .1);
    transfMat = mult(rotate(90, vec3(0, 0, 1)), transfMat); 
    transfMat = mult(translate(3, .5, -19.45), transfMat); 
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayBM));
    transfMat = scale(.4, .5, .1);
    transfMat = mult(rotate(90, vec3(0, 0, 1)), transfMat); 
    transfMat = mult(translate(-3, .5, -19.45), transfMat); 
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(tombstoneCoordsArrayBR));
    transfMat = scale(.6, .6, .1);
    transfMat = mult(rotate(90, vec3(0, 0, 1)), transfMat); 
    transfMat = mult(translate(0, .5, -19.45), transfMat); 
    transfMat = mult(lookAtMat, transfMat);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(transfMat));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    requestAnimationFrame(render);
}