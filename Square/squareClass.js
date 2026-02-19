var myMenu;
var sliderRed;
var sliderBlue;
var sliderGreen;
var sliderPointSize;  // New slider for point size
var canvas;
var gl;
var uRed;
var redLoc;
var uBlue;
var blueLoc;
var uGreen;
var greenLoc;
var pointSizeLoc;  // New uniform location for point size
var pointSize;  // Point size value

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    myMenu = document.getElementById("mymenu");
    myMenu.addEventListener("change", changeBackground);
    canvas.addEventListener("click", function(e) {
        var xPos = e.clientX;
        var yPos = e.clientY;

        // Adjust based on HTML
        xPos = xPos - canvas.offsetLeft + window.scrollX;
        yPos = yPos - canvas.offsetTop + window.scrollY;

        // Convert to world coordinates
        xPos = (2 * xPos) / canvas.width - 1;
        yPos = (2 * (canvas.width - yPos)) / canvas.width - 1;

        gl.bufferSubData(gl.ARRAY_BUFFER, 2 * 4 * 4, flatten(vec2(xPos, yPos)));
        render();
    });

    sliderRed = document.getElementById("sliderRed");
    sliderRed.addEventListener("change", changeSliderRed);

    sliderGreen = document.getElementById("sliderGreen");
    sliderGreen.addEventListener("change", changeSliderGreen);

    sliderBlue = document.getElementById("sliderBlue");
    sliderBlue.addEventListener("change", changeSliderBlue);

    sliderPointSize = document.getElementById("sliderPointSize");  // Get point size slider
    sliderPointSize.addEventListener("input", changePointSize);  // Add event listener for point size

    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("WebGL 2.0 isn't available");
    }

    // Four Vertices
    var vertices = [
        vec2(-0.5, -0.5),
        vec2(-0.5, 0.5),
        vec2(0.5, 0.5),
        vec2(0.5, -0.5),
        vec2(0.75, 0.75)
    ];

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 0.0, 0.0, 1.0); // Initial color

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate our shader variable with our data buffer
    var aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    // Get uniform locations for colors
    redLoc = gl.getUniformLocation(program, "uRed");
    uRed = 1;
    gl.uniform1f(redLoc, uRed);

    blueLoc = gl.getUniformLocation(program, "uBlue");
    uBlue = 1;
    gl.uniform1f(blueLoc, uBlue);

    greenLoc = gl.getUniformLocation(program, "uGreen");
    uGreen = 1;
    gl.uniform1f(greenLoc, uGreen);

    // Get uniform location for point size
    pointSizeLoc = gl.getUniformLocation(program, "uPointSize");

    // Set initial point size from slider
    pointSize = parseFloat(sliderPointSize.value);
    gl.uniform1f(pointSizeLoc, pointSize);

    render();
};

function changeBackground() {
    if (myMenu.value == 0) // red
        gl.clearColor(1, 0, 0, 1);
    else if (myMenu.value == 1) // green
        gl.clearColor(0, 1, 0, 1);
    else if (myMenu.value == 2) // blue
        gl.clearColor(0, 0, 1, 1);
    else if (myMenu.value == 3) // lavender
        gl.clearColor(0.5, 0.5, 1, 1);
    else if (myMenu.value == 4) // black
        gl.clearColor(0, 0, 0, 1);
    else if (myMenu.value == 5) // white
        gl.clearColor(1, 1, 1, 1);
    else
        alert("Wrong color!");

    render();
}

function changeSliderRed() {
    uRed = sliderRed.value / 255;
    gl.uniform1f(redLoc, uRed);
    render();
}

function changeSliderBlue() {
    uBlue = sliderBlue.value / 255;
    gl.uniform1f(blueLoc, uBlue);
    render();
}

function changeSliderGreen() {
    uGreen = sliderGreen.value / 255;
    gl.uniform1f(greenLoc, uGreen);
    render();
}

function changePointSize() {
    pointSize = parseFloat(sliderPointSize.value);  // Update point size from slider
    gl.uniform1f(pointSizeLoc, pointSize);
    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.drawArrays(gl.POINTS, 4, 1);
}
