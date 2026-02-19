"use strict";


var colorPick;


window.onload = function init() {


	colorPick = document.getElementById("myColor");
	
	colorPick.addEventListener("change", function()
	{
		var rgb = hexToRgb(colorPick.value);
		
		document.getElementById("res").innerHTML = "Red: " + rgb.r + " Green: " + rgb.g + " Blue: " + rgb.b;
		
	});
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}