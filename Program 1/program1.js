"use strict";
var canvas;
var gl;
var maxNumPositions = 200;
var index = 0;
var cindex = 0;
var vertexShape = 0;
var polygonShapes = []; 
var polygonPointSizes = []; 
var sliderPointSize;
var pointSizeLoc;
var pointSize;
var colorPickerBackground;

var colors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];

var t, tt;
var numPolygons = 0;
var numPositions = [];
numPositions[0] = 0;
var start = [0];

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    var clearButton = document.getElementById("clearCanvasButton");
    clearButton.addEventListener("click", clearCanvas);

    var colorPickerBackground = document.getElementById("colorPickerBackground");
    colorPickerBackground.addEventListener("input", changeBackground);

    var colorRadios = document.getElementsByName("vertexColor");
    colorRadios.forEach(function (radio) {
        radio.addEventListener("change", function () {
            cindex = this.value;
        });
    });

    //------------------------------Stores Shapes----------------------------------
    var vPoint = document.getElementById("endPolygonButtonPoint");
    vPoint.addEventListener("click", function () {
        polygonShapes[numPolygons] = 1;
        polygonPointSizes[numPolygons] = pointSize;
        numPolygons++;
        numPositions[numPolygons] = 0;
        start[numPolygons] = index;
        render();
    });

    var vLine = document.getElementById("endPolygonButtonLine");
    vLine.addEventListener("click", function () {
        polygonShapes[numPolygons] = 2;
        polygonPointSizes[numPolygons] = pointSize;
        numPolygons++;
        numPositions[numPolygons] = 0;
        start[numPolygons] = index;
        render();
    });

    var vTriFan = document.getElementById("endPolygonButtonTriangleFan");
    vTriFan.addEventListener("click", function () {
        polygonShapes[numPolygons] = 3;
        polygonPointSizes[numPolygons] = pointSize;
        numPolygons++;
        numPositions[numPolygons] = 0;
        start[numPolygons] = index;
        render();
    });

    var vLineStrip = document.getElementById("endPolygonButtonLineStrip");
    vLineStrip.addEventListener("click", function () {
        polygonShapes[numPolygons] = 4;
        polygonPointSizes[numPolygons] = pointSize;
        numPolygons++;
        numPositions[numPolygons] = 0;
        start[numPolygons] = index;
        render();
    });

    var vTriStrip = document.getElementById("endPolygonButtonTriangleStrip");
    vTriStrip.addEventListener("click", function () {
        polygonShapes[numPolygons] = 5;
        polygonPointSizes[numPolygons] = pointSize;
        numPolygons++;
        numPositions[numPolygons] = 0;
        start[numPolygons] = index;
        render();
    });
    //------------------------------Stores Shapes----------------------------------

    //-----------------------Function for clicking on Canvas-----------------------
    canvas.addEventListener("mousedown", function (event) {
        if (index >= maxNumPositions) {  
            alert("Maximum number of vertices (200) reached.");
            return;
        }

        var worldX = 2 * (event.clientX - canvas.offsetLeft + window.scrollX) / canvas.width - 1;
        var worldY = 2 * (canvas.height - (event.clientY - canvas.offsetTop + scrollY)) / canvas.height - 1;

        t = vec2(worldX, worldY);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));

        tt = vec4(colors[cindex]);

        gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(tt));

        numPositions[numPolygons]++;
        index++;
        render();
    });
    //-----------------------Function for clicking on Canvas-----------------------
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumPositions, gl.STATIC_DRAW);

    var postionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(postionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(postionLoc);

    var cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumPositions, gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    sliderPointSize = document.getElementById("sliderPointSize");
    sliderPointSize.addEventListener("input", changePointSize);
    pointSizeLoc = gl.getUniformLocation(program, "uPointSize");
    pointSize = parseFloat(sliderPointSize.value);
    gl.uniform1f(pointSizeLoc, pointSize);
};

function changePointSize() {
    pointSize = parseFloat(sliderPointSize.value); 
    gl.uniform1f(pointSizeLoc, pointSize);
    render();
}

function changeBackground(event) {
    var color = event.target.value; 
    var rgb = hexToRgb(color); 
    gl.clearColor(rgb.r / 255, rgb.g / 255, rgb.b / 255, 1.0);  
    render();
}

function clearCanvas() {
    numPolygons = 0;
    numPositions = [];
    numPositions[0] = 0;
    start = [0];
    index = 0;

    polygonShapes = [];
    polygonPointSizes = [];
    gl.clear(gl.COLOR_BUFFER_BIT);
    render();
}

function hexToRgb(hex) {
    var bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (var i = 0; i < numPolygons; i++) {
        gl.uniform1f(pointSizeLoc, polygonPointSizes[i]);  
        if (polygonShapes[i] == 1) {  
            gl.drawArrays(gl.POINTS, start[i], numPositions[i]);
        } else if (polygonShapes[i] == 2) {
            gl.drawArrays(gl.LINES, start[i], numPositions[i]);
        } else if (polygonShapes[i] == 3) {
            gl.drawArrays(gl.TRIANGLE_FAN, start[i], numPositions[i]);
        } else if (polygonShapes[i] == 4) {
            gl.drawArrays(gl.LINE_STRIP, start[i], numPositions[i]);
        } else if (polygonShapes[i] == 5) {
            gl.drawArrays(gl.TRIANGLE_STRIP, start[i], numPositions[i]);
        }
    }
    gl.uniform1f(pointSizeLoc, pointSize);
    gl.drawArrays(gl.POINTS, start[numPolygons], numPositions[numPolygons]);
}
