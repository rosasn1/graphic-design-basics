var canvas;
var gl;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    // Four Vertices

    var vertices = [
        // Head 
        vec2(-0.7, -0.7), 
        vec2(-0.7, 0.7),   
        vec2(0.7, 0.7),  
        vec2(0.7, -0.7),  
        
        // Left Eye
        vec2(-0.4, 0.2),  
        vec2(-0.4, 0.4),
        vec2(-0.2, 0.4),  
        vec2(-0.2, 0.2),   

        // Right Eye 
        vec2(0.2, 0.2),  
        vec2(0.2, 0.4), 
        vec2(0.4, 0.4),   
        vec2(0.4, 0.2),   

        // Mouth 
        vec2(-0.3, -0.3),  
        vec2(-0.3, -0.1), 
        vec2(0.3, -0.1),  
        vec2(0.3, -0.3),   

        // Nose
        vec2(-0.2, 0.0),  
        vec2(0.1, 0.0),   
        vec2(0.0, 0.2),
    ];

    var colors = [
        // Face color 
        vec4(1.0, 1.0, 0.1, 1.0), 
        vec4(1.0, 1.0, 0.1, 1.0),
        vec4(1.0, 1.0, 0.1, 1.0), 
        vec4(1.0, 1.0, 0.1, 1.0),

        // Left Eye Color
        vec4(0.0, 0.0, 0.0, 1.0), 
        vec4(0.0, 0.0, 0.0, 1.0),
        vec4(0.0, 0.0, 0.0, 1.0), 
        vec4(0.0, 0.0, 0.0, 1.0),

        // Right Eye Color
        vec4(0.0, 0.0, 0.0, 1.0),
        vec4(0.0, 0.0, 0.0, 1.0),
        vec4(0.0, 0.0, 0.0, 1.0),
        vec4(0.0, 0.0, 0.0, 1.0),

        // Mouth Color
        vec4(1.0, 0.0, 0.0, 1.0),
        vec4(1.0, 0.0, 0.0, 1.0),
        vec4(1.0, 0.0, 0.0, 1.0),
        vec4(1.0, 0.0, 0.0, 1.0),

        // Nose Color
        vec4(1.0, 0.1, 0.5, 1.0),
        vec4(1.0, 0.1, 0.5, 1.0),
        vec4(1.0, 0.1, 0.5, 1.0),
        vec4(1.0, 0.1, 0.5, 1.0)


    ];
     //  Configure WebGL

 gl.viewport( 0, 0, canvas.width, canvas.height );
 gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

  //  Load shaders and initialize attribute buffers

 var program = initShaders( gl, "vertex-shader", "fragment-shader" );
 gl.useProgram( program );

  // Load the data into the GPU

 var bufferId = gl.createBuffer();
 gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
 gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

  // Associate our shader variable with our data buffer

 var aPosition = gl.getAttribLocation( program, "aPosition" );
 gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
 gl.enableVertexAttribArray(aPosition);

 var bufferId = gl.createBuffer();
 gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
 gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

  // Associate our shader variable with our data buffer

 var aCol = gl.getAttribLocation( program, "aColor" );
 gl.vertexAttribPointer( aCol, 4, gl.FLOAT, false, 0, 0 );
 gl.enableVertexAttribArray(aCol);

     render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Head
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // left eye
    gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);

    // right eye
    gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);

    // mouth
    gl.drawArrays(gl.TRIANGLE_STRIP, 12, 4);

    gl.drawArrays(gl.TRIANGLES, 13, 11);



}