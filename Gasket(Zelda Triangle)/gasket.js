"use strict";

const delay = ms => new Promise(res => setTimeout(res, ms));

var canvas;
var gl;
var uColor;
var colorLoc;

var positions = [];

var numTimesToSubdivide = 1;

const yourFunction = async () => {
    //Color change one
  await delay(5000);
  console.log("Waited 5s");
  uColor = vec4(1.0, 0.0, 0.0, 1.0);
  gl.uniform4fv(colorLoc, uColor);
  gl.clear( gl.COLOR_BUFFER_BIT );
  gl.drawArrays( gl.TRIANGLES, 0, positions.length );

  //Color change two
  await delay(5000);
  console.log("Waited an additional 5s");
  uColor = vec4(0.0, 0.0, 0.0, 1.0);
  gl.uniform4fv(colorLoc, uColor);
  gl.clear( gl.COLOR_BUFFER_BIT );
  gl.drawArrays( gl.TRIANGLES, 0, positions.length );
  
};


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three positions.

    var vertices = [
        vec2( -.5, -.5 ),
        vec2(  0,  .5 ),
        vec2(  .5, -.5 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2], numTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    uColor = vec4(0.0, 1.0, 1.0, 1.0);
    colorLoc = gl.getUniformLocation( program, "uColor" );
    gl.uniform4fv(colorLoc, uColor);

    render();
};

function triangle(a, b, c)
{
    positions.push(a, b, c);
}

function divideTriangle(a, b, c, count)
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle(a, b, c);
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );

    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, positions.length );
yourFunction();
}
