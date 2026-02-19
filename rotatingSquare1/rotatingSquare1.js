"use strict";

var canvas;
var gl;

var theta = 0.0;
var thetaLoc;
var uRad = 1;
var radLoc;
var uDir = -1;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );


    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vertices = [
        vec2(0, 1),
        vec2(-1, 0),
        vec2(1, 0),
        vec2(0, -1)
    ];



    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data bufferData

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

	//link program with uniform variable in shader
    thetaLoc = gl.getUniformLocation(program, "uTheta");
    radLoc = gl.getUniformLocation(program, "uRad");
	
    render();
};


function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);

    theta += 0.01; //Controls the speed of the shape
	
    if(uRad > 1)
        uDir = -1;
    if(uRad < .2)
        uDir = 1;

    uRad += uDir*.001;


	//sends to value of theta to vertex shader
    gl.uniform1f(thetaLoc, theta);
    gl.uniform1f(radLoc, uRad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	//will call render again when the browser is ready for it
    requestAnimationFrame(render);
}
