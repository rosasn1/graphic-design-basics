window.onload = init;
var addList;

function init() {
    document.querySelector('input[name="colors"][value="Z"]').checked = true;
    randomizeColor();
    addList = document.getElementsByClassName("rgb");
    console.log(addList.length);

    for (var i = 0; i < addList.length; i++) {
        addList[i].addEventListener("change", updateColor);
    }

    document.getElementById("randomizeButton").addEventListener("click", randomizeColor);
    document.addEventListener("keydown", selectRadioButton);
}

function randomizeColor() {
    var red = Math.floor(Math.random() * 256);
    var green = Math.floor(Math.random() * 256);
    var blue = Math.floor(Math.random() * 256);

    document.getElementById("redInput").value = red;
    document.getElementById("greenInput").value = green;
    document.getElementById("blueInput").value = blue;

    updateColor();
}

function updateColor() {
    var red = document.getElementById("redInput").value;
    var green = document.getElementById("greenInput").value;
    var blue = document.getElementById("blueInput").value;

    document.getElementById("header").style.color = "rgb(" + red + "," + green + "," + blue + ")";
}

function selectRadioButton(event) {
    let key = event.key.toUpperCase();

    if (key === "X") {
        document.querySelector('input[name="colors"][value="X"]').checked = true;
    } else if (key === "Y") {
        document.querySelector('input[name="colors"][value="Y"]').checked = true;
    } else if (key === "Z") {
        document.querySelector('input[name="colors"][value="Z"]').checked = true;
    }
}