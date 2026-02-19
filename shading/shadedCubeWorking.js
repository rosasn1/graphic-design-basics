"use strict";

var shadedCube = function() {

var canvas;
var gl;

var numPositions = 36;
var eye = vec3(0, 1, 2);
var eyeLoc;

var positionsArray = [];
var normalsArray = [];

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

var lightPosition = vec4(.5, -.5, 1, 1.0);
//var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightAmbient = vec4(.4, 0, 0, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
//var lightDiffuse = vec4(0.0, 0.0, 0.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
//var lightSpecular = vec4(0.0, 0.0, 0.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.4, 1.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelMatrix, projectionMatrix, viewMatrix;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = vec3(0, 0, 0);
//var theta = vec3(45, 45, 45);

var thetaLoc;

var flag = false;

init();

function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);

	 
     normal = vec3(normal);


     positionsArray.push(vertices[a]);
     normalsArray.push(normal);
     positionsArray.push(vertices[b]);
     normalsArray.push(normal);
     positionsArray.push(vertices[c]);
     normalsArray.push(normal);
     positionsArray.push(vertices[a]);
     normalsArray.push(normal);
     positionsArray.push(vertices[c]);
     normalsArray.push(normal);
     positionsArray.push(vertices[d]);
     normalsArray.push(normal);
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

function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");

	var boxes = document.getElementsByClassName("box");
	for(var i = 0; i < boxes.length; i++)
	{
		
			boxes[i].onchange = compute;	
			
	}

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation(program, "theta");
	
	eyeLoc = gl.getUniformLocation(program, "eye");

	gl.enable(gl.CULL_FACE)
	gl.cullFace(gl.BACK)

    //viewerPos = vec3(0.0, 0.0, -20.0);

    //projectionMatrix = ortho(-1, 1, -1, 1, -100, 100);
	projectionMatrix = perspective(90, 1, .1, 20)
	

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"),
       ambientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"),
       diffuseProduct );
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"),
       specularProduct );
	   console.log(specularProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"),
       lightPosition );

    gl.uniform1f(gl.getUniformLocation(program,
       "uShininess"), materialShininess);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "uProjectionMatrix"),
       false, flatten(projectionMatrix));
    render();
}

function compute()
{
	lightPosition[0] = document.getElementById("lX").value;
	lightPosition[1] = document.getElementById("lY").value;
	lightPosition[2] = document.getElementById("lZ").value;
	
	eye[0] = document.getElementById("eyeX").value;
	eye[1] = document.getElementById("eyeY").value;
	eye[2] = document.getElementById("eyeZ").value;
	
	    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"),
       lightPosition );
	   
	   gl.uniform3fv(eyeLoc, eye);
	   
}

function render(){

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(flag) theta[axis] += 2.0;
	var lookAtMat = lookAt(eye, vec3(0, 1, -2), vec3(0, 1, 0));
	

    modelMatrix = mat4();
    modelMatrix = mult(modelMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
    modelMatrix = mult(modelMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
    modelMatrix = mult(modelMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));

	//modelViewMatrix = mult(lookAtMat, modelViewMatrix)

    //console.log(modelView);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelMatrix"), false, flatten(modelMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uViewMatrix"), false, flatten(lookAtMat));
	gl.uniform3fv(eyeLoc, eye);

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

//------------------------------------------------------------

    
    modelMatrix = mat4();
    modelMatrix = mult(modelMatrix, rotate(theta[xAxis] * 5, vec3(1, 0, 0)));
    modelMatrix = mult(modelMatrix, rotate(theta[yAxis] * 5, vec3(0, 1, 0)));
    modelMatrix = mult(modelMatrix, rotate(theta[zAxis] * 5, vec3(0, 0, 1)));
    modelMatrix = mult(translate(0, 1, -1), modelMatrix);
    //modelMatrix = mult(modelMatrix, translate(0,1,-1));
	//modelViewMatrix = mult(lookAtMat, modelViewMatrix)

    //console.log(modelView);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelMatrix"), false, flatten(modelMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uViewMatrix"), false, flatten(lookAtMat));
	gl.uniform3fv(eyeLoc, eye);

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    requestAnimationFrame(render);
}

}

shadedCube();
