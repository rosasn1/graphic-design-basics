"use strict";

var canvas;
var gl;

var positions = [];
var colors = [];

var cube1;
var cube1Start;
var cube1Vert;

var cube2;
var cube2Start;
var cube2Vert;

var cube3;
var cube3Start;
var cube3Vert;

var cube4;
var cube4Start;
var cube4Vert;

var mySphere;
var sphereStart;
var sphereVert;

	

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

	//first cube
    cube1 = cube();
	cube1Start = 0;
	
	cube1.rotate(0, vec3(1, 1, 0));
	cube1.scale(.5,.7,.5);
	cube1.translate(0, .15, 0);
	
	positions = positions.concat(cube1.TriangleVertices);
	colors = colors.concat(cube1.TriangleVertexColors);
	cube1Vert = cube1.TriangleVertices.length;

	//second cube
    cube2 = cube(.25);
	cube2Start = cube1Start + cube1Vert;
	
	cube2.rotate(0, vec3(1, 1, 0));
	cube2.scale(2,.5,.5);
	cube2.translate(.5, .4, 0);
	
	positions = positions.concat(cube2.TriangleVertices) ;
	colors = colors.concat(cube2.TriangleFaceColors);
	cube2Vert = cube2.TriangleVertices.length;
	
	//sphere
	mySphere = sphere(4);  //number of subdivisions
	sphereStart = cube2Start + cube2Vert;
	
	mySphere.scale(.25, .25, .25);
	mySphere.translate(0,.7,0);
	
	positions = positions.concat(mySphere.TriangleVertices) ;
	colors = colors.concat(mySphere.TriangleVertexColors);
	sphereVert = mySphere.TriangleVertices.length;
	
	//third cube - all purple
    cube3 = cube(.25);
	cube3Start = sphereStart + sphereVert;
	
	cube3.rotate(0, vec3(1, 1, 0));
	cube3.scale(2,.5,.5);
	cube3.translate(-.5, .4, 0);
	
	positions = positions.concat(cube3.TriangleVertices) ;
	cube3Vert = cube3.TriangleVertices.length;
	
	//make purple for all vertices of this cube
	for(var i = 0; i < cube3Vert; i++)
	{
		colors.push(vec4(1, 0, 1, 1));
	}

	//fourth cube	
	cube4 = cube(.25);
	cube4Start = cube3Start + cube3Vert;
	
	cube4.rotate(0, vec3(1, 1, 0));
	cube4.scale(4,.8,.5);
	cube4.translate(-.4, .7, 0);
	
	positions = positions.concat(cube4.TriangleVertices) ;
	cube4Vert = cube4.TriangleVertices.length;
	
	//make purple for all vertices of this cube
	for(var i = 0; i < cube4Vert; i++)
	{
		colors.push(vec4(1, 0, 1, 1));
	}

	

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(.75, .75, .75, 1);

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

	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);

    render();
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, cube1Start, cube1Vert);
	
	gl.drawArrays(gl.TRIANGLES, cube2Start, cube2Vert);
	
	gl.drawArrays(gl.TRIANGLES, cube3Start, cube3Vert);
	
	gl.drawArrays(gl.TRIANGLES, sphereStart, sphereVert);

}
