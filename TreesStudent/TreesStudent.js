"use strict";

//var shadedCube = function() {

var canvas;
var gl;

var numPositions = 36;
var trunkStartPosition;
var branchStartPosition;
var stickStartPosition;


var positionsArray = [];
var colors = [];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

var trunk = [
        vec4(-0.08, 0.0,  0.08, 1.0),
        vec4(-0.08,  1.0,  0.08, 1.0),
        vec4(0.08,  1.0,  0.08, 1.0),
        vec4(0.08, 0.0,  0.08, 1.0),
        vec4(-0.08, 0.0, -0.08, 1.0),
        vec4(-0.08,  1.0, -0.08, 1.0),
        vec4(0.08,  1.0, -0.08, 1.0),
        vec4(0.08, 0.0, -0.08, 1.0)
  ];
  
var branch = [
        vec4(-0.04, 0.0,  0.04, 1.0),
        vec4(-0.04,  0.5,  0.04, 1.0),
        vec4(0.04,  0.5,  0.04, 1.0),
        vec4(0.04, 0.0,  0.04, 1.0),
        vec4(-0.04, 0.0, -0.04, 1.0),
        vec4(-0.04,  0.5, -0.04, 1.0),
        vec4(0.04,  0.5, -0.04, 1.0),
        vec4(0.04, 0.0, -0.04, 1.0)
  ];
  
var stick = [
        vec4(-0.01, 0.0,  0.01, 1.0),
        vec4(-0.01,  0.25,  0.01, 1.0),
        vec4(0.01,  0.25,  0.01, 1.0),
        vec4(0.01, 0.0,  0.01, 1.0),
        vec4(-0.01, 0.0, -0.01, 1.0),
        vec4(-0.01,  0.25, -0.01, 1.0),
        vec4(0.01,  0.25, -0.01, 1.0),
        vec4(0.01, 0.0, -0.01, 1.0)

  ];
  
var ctm;
var modelViewMatrix, projectionMatrix;
var program;
var cBuffer;

var at = vec3(0.0, 0.0, 0.0); //the point the camera is facing toward
var up = vec3(0.0, 1.0, 0.0); //up direction
var eye = vec3(0.0, 0.0, 5.0); //where camera is positioned

var fovy = 90.0; //field of view
var aspect = 1.0;
var near = 0.1;
var far = 20;


var modelViewStack = [];
var instanceMatrix = [];
var instanceStack = [];


//pass in what array we are using so we can draw all of our shapes
function quadTree(a, b, c, d, arr_name) {


     positionsArray.push(arr_name[a]);
     colors.push(vertexColors[a]);
     
     positionsArray.push(arr_name[b]);
     colors.push(vertexColors[a]);
	 
     positionsArray.push(arr_name[c]);
	   colors.push(vertexColors[a]);
     
     positionsArray.push(arr_name[a]);
	   colors.push(vertexColors[a]);     
     
	   positionsArray.push(arr_name[c]);
	   colors.push(vertexColors[a]);     
	
     positionsArray.push(arr_name[d]);
     colors.push(vertexColors[a]);
}

//pass the name of array
function colorCubeTree(arr_name)
{
    quadTree(1, 0, 3, 2, arr_name);
    quadTree(2, 3, 7, 6, arr_name);
    quadTree(3, 0, 4, 7, arr_name);
    quadTree(6, 5, 1, 2, arr_name);
    quadTree(4, 5, 6, 7, arr_name);
    quadTree(5, 4, 0, 1, arr_name);
}

function tree() {
  drawTrunk();
  
  //draw first branch
  instanceStack.push(instanceMatrix);
  instanceMatrix = mult(instanceMatrix, translate(0.0, 0.5, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(45, vec3(0, 0, 1)));
  drawBranch();
  instanceMatrix = instanceStack.pop();
  

  
  //draw second branch
  instanceStack.push(instanceMatrix);
  instanceMatrix = mult(instanceMatrix, translate(0.0, 0.7, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(-90, vec3(0, 1, 0)));
  instanceMatrix = mult(instanceMatrix, rotate(45, vec3(1, 0, 0)));
  drawBranch();   
  instanceMatrix = instanceStack.pop();

  instanceStack.push(instanceMatrix);
  instanceMatrix = mult(instanceMatrix, translate(0.0, 0.3, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(180, vec3(0, 1, 0)));
  instanceMatrix = mult(instanceMatrix, rotate(45, vec3(1, 0, 0)));
  drawBranch();   
  instanceMatrix = instanceStack.pop();


}


function drawTrunk() {
  gl.uniformMatrix4fv(gl.getUniformLocation(program,
            "uModelViewMatrix"), false, flatten(modelViewMatrix));
	gl.drawArrays(gl.TRIANGLE_STRIP, trunkStartPosition, numPositions);
 
  instanceMatrix = mat4();
}

function drawBranch() {

  //draws the branch
  modelViewStack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, instanceMatrix);
  
  gl.uniformMatrix4fv(gl.getUniformLocation(program,
            "uModelViewMatrix"), false, flatten(modelViewMatrix));
	gl.drawArrays(gl.TRIANGLE_STRIP, branchStartPosition, numPositions);
 
  modelViewMatrix = modelViewStack.pop();
	

  //draw stick
  instanceStack.push(instanceMatrix);
  instanceMatrix = mult(instanceMatrix, translate(0.0, .25, 0.0));
  instanceMatrix = mult(instanceMatrix, rotate(30, vec3(0, 0, -1)));
  drawStick();
  instanceMatrix = instanceStack.pop();
	

    //draw stick
    instanceStack.push(instanceMatrix);
    instanceMatrix = mult(instanceMatrix, translate(0.0, .1, 0.0));
    instanceMatrix = mult(instanceMatrix, rotate(-30, vec3(0, 0, -1)));
    drawStick();
    instanceMatrix = instanceStack.pop();

	return;
  
  
}

function drawStick() {
  modelViewStack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, instanceMatrix);
  
  gl.uniformMatrix4fv(gl.getUniformLocation(program,
            "uModelViewMatrix"), false, flatten(modelViewMatrix));
	gl.drawArrays(gl.TRIANGLE_STRIP, stickStartPosition, numPositions);
 
  modelViewMatrix = modelViewStack.pop();
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(135/255, 206/255, 235/255, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

   //tree
   colorCubeTree(trunk);
   trunkStartPosition = 0; 
   colorCubeTree(branch);
   branchStartPosition = trunkStartPosition + numPositions;
   colorCubeTree(stick);
   stickStartPosition = branchStartPosition + numPositions;
   

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
	
	cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "uProjectionMatrix"),
       false, flatten(projectionMatrix));
	   
  
    render();
}

var render = function(){

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	modelViewMatrix = lookAt(eye, at, up); //setting up camera

    gl.uniformMatrix4fv(gl.getUniformLocation(program,
            "uModelViewMatrix"), false, flatten(modelViewMatrix));
    
    //draw trees
    modelViewStack.push(modelViewMatrix);	//save previous MV
	
	  //transform entire tree
    modelViewMatrix = mult(modelViewMatrix, translate(-0.50, -0.5, 3.0));
	  tree();
    modelViewMatrix = modelViewStack.pop(); 	//reload MV

       //transform second tree
    modelViewStack.push(modelViewMatrix);  //save
    modelViewMatrix = mult(modelViewMatrix, translate(2.0, -0.5, 0.0));
    modelViewMatrix = mult(modelViewMatrix, scale(2.0, 2.0, 2.0));
    
    tree();
    modelViewMatrix = modelViewStack.pop(); //reload


    modelViewStack.push(modelViewMatrix);  //save
    modelViewMatrix = mult(modelViewMatrix, translate(1.0, -0.5, 0.4));
    modelViewMatrix = mult(modelViewMatrix, scale(2.0, 2.0, 2.0));
    modelViewMatrix = mult(modelViewMatrix, rotateY(270, vec3(0, 1, 0)));


    tree();
    modelViewMatrix = modelViewStack.pop();
	
	
    requestAnimationFrame(render);
}



