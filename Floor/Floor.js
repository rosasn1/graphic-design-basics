"use strict";

var canvas;
var gl;

var positionsArray = [];
var normalsArray = [];
var colorsArray = [];

var mySphere;
var sphereStart;
var sphereVert;

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


var lightPosition = vec4(-1.0, 0.5, 4.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);


var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 10;

var diffuseProduct = [];


var ambientColor, diffuseColor, specularColor;
var modelMatrix, projectionMatrix, viewMatrix;
var viewerPos;
var program;

var at = vec3(0.0, 0.0, 0.0); //the point the camera is facing toward
var up = vec3(0.0, 1.0, 0.0); //up direction
var eye = vec3(-3, 0.0, 10.0); //where camera is positioned

var fovy = 90.0; //field of view
var aspect = 1.0;
var near = 0.1;
var far = 100;

var count = 0; //counter for floor array




window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(135/255, 206/255, 235/255, 1.0);

    gl.enable(gl.DEPTH_TEST);

 
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


	
	//----for floor - moving up in the z direction----
	for (var z = -20; z < 20; z+= .1) {
		positionsArray.push(vec4(0.0, -0.5, z, 1.0));
		normalsArray.push(vec3(0.0, 1.0, 0.0));
    colorsArray.push(vec4(0,1,0,1));
    
		positionsArray.push(vec4(0.1, -0.5, z, 1.0));
		normalsArray.push(vec3(0.0, 1.0, 0.0));
    colorsArray.push(vec4(0,1,0,1));
    
    positionsArray.push(vec4(0.0, -0.5, z + .1, 1.0));
		normalsArray.push(vec3(0.0, 1.0, 0.0));
    colorsArray.push(vec4(0,1,0,1));
    
    positionsArray.push(vec4(0.1, -0.5, z + .1, 1.0));
		normalsArray.push(vec3(0.0, 1.0, 0.0));
    colorsArray.push(vec4(0,1,0,1));
    
		count += 4;
	}
  //----for floor - moving up in the z direction----

    mySphere = sphere(4);  //number of subdivisions
	  sphereStart = count;
	
	  mySphere.scale(1, 1, 1);
	  mySphere.translate(1,.5,0);
	
	  positionsArray = positionsArray.concat(mySphere.TriangleVertices) ;
	  colorsArray = colorsArray.concat(mySphere.TriangleVertexColors);
	  normalsArray = normalsArray.concat(mySphere.TriangleNormals);
    sphereVert = mySphere.TriangleVertices.length;

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
    

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

	  projectionMatrix = perspective(fovy, aspect, near, far);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), ambientProduct);
	  gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), diffuseProduct );
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), specularProduct );
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), lightPosition );
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "uProjectionMatrix"), false, flatten(projectionMatrix));
	   
	   
	document.getElementById( "redDif" ).onchange = function () {
        materialDiffuse[0] = (document.getElementById( "redDif" ).value);
		diffuseProduct = mult(lightDiffuse, materialDiffuse);
		gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), 
			diffuseProduct );
    };

	document.getElementById( "greenDif" ).onchange = function () {
        materialDiffuse[1] = (document.getElementById( "greenDif" ).value);
		diffuseProduct = mult(lightDiffuse, materialDiffuse);
		gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), 
			diffuseProduct );
      console.log(diffuseProduct);
    };

	document.getElementById( "blueDif" ).onchange = function () {
        materialDiffuse[2] = (document.getElementById( "blueDif" ).value);
		diffuseProduct = mult(lightDiffuse, materialDiffuse);
		gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), 
			diffuseProduct );
    };
  
  
    
    render();
}

var render = function(){

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


   
  
  var lookAtMat = lookAt(eye, at, up); 



  gl.uniformMatrix4fv(gl.getUniformLocation(program,
    "uViewMatrix"), false, flatten(lookAtMat));
	
  //The Ground is created with this
	for (var x = -20; x < 20; x+= .1) {
		var modelMatrix = translate(x, 0.0, 0.0);
		gl.uniformMatrix4fv(gl.getUniformLocation(program,
          "uModelMatrix"), false, flatten(modelMatrix));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, count);
	}
  //The Ground is created with this
  
  //This creates the sphere
  gl.uniformMatrix4fv(gl.getUniformLocation(program,
    "uModelMatrix"), false, flatten(mat4()));
  gl.drawArrays(gl.TRIANGLES, sphereStart, sphereVert);
  //This creates the sphere
  


  


    requestAnimationFrame(render);
}

