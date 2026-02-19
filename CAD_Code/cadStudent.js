"use strict";

var canvas;
var gl;

var maxNumTriangles = 200;
var maxNumPositions  = 3*maxNumTriangles;
var index = 0;
var first = true;

var t = [];

var cIndex = 0;

var colors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumPositions, gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16*maxNumPositions, gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation( program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var m = document.getElementById("mymenu");

    m.addEventListener("click", function() {
	   cIndex = m.value;
      });


    canvas.addEventListener("mousedown", function(event){
		
		var worldX, worldY;
		
		worldX = 2*(event.clientX-canvas.offsetLeft+window.scrollX)/canvas.width-1;
		worldY = 2*(canvas.height-(event.clientY-canvas.offsetTop+scrollY))/canvas.height-1;
		
		document.getElementById("cx").innerHTML = "clientX: " + event.clientX;
		document.getElementById("cy").innerHTML = "clientY: " + event.clientY;
		document.getElementById("wx").innerHTML = "worldX: " + worldX;
		document.getElementById("wy").innerHTML = "worldY: " + worldY;
		
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
        if(first) {
          first = false;
          gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer)
          t[0] = vec2(worldX, worldY);
        }

        else {
          first = true;
          t[2] = vec2(worldX, worldY);
          t[1] = vec2(t[0][0], t[2][1]);
          t[3] = vec2(t[2][0], t[0][1]);
          for(var i=0; i<4; i++)
			  gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+i), flatten(t[i]));
          
          gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
          var tt = vec4(colors[cIndex]);
          for(var i=0; i<4; i++)
			  gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index+i), flatten(tt));
		  
		   index += 4;
        }
		
		render();
    });
    render();
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    for(var i = 0; i<index; i+=4)
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
}
