//var character = document.getElementById("character");
//document.addEventListener("click",jump);
/*function jump(){
    if(character.classList == "animate"){return;}
    character.classList.add("animate");
    setTimeout(removeJump,300); //300ms = length of animation
}*/
/*function removeJump(){
    character.classList.remove("animate");
}*/
/*var block = document.getElementById("block");
function checkDead(){
    let characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
    let blockLeft = parseInt(window.getComputedStyle(block).getPropertyValue("left"));
    if(blockLeft<20 && blockLeft>-20 && characterTop>=130){
        alert("Game over");
    }
}

setInterval(checkDead, 10);*/
// get canvas 2D context object
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// object for storing globally accessable states
const GLOBALS = {}


// Array where all props will be stored
const PROPS = [];

// Array where all characters will be stored
const CHARS = [];

// function for applying any initial settings
function init() {

}

// function for rendering background elements
function renderBackground() {

}

// function for rendering prop objects in PROPS
function renderProps() {

}

// function for rendering character objects in CHARS
function renderCharacters() {

}

// function for rendering onscreen controls 
function renderControls() {

}

// main function to be run for rendering frames
function startFrames() {
// erase entire canvas
ctx.clearRect(0,0,canvas.width,canvas.height);

// render each type of entity in order, relative to layers
renderBackground();
renderProps();
renderCharacters();
renderControls();

// rerun function (call next frame)
window.requestAnimationFrame(startFrames);
}

init(); // initialize game settings
startFrames(); // start running frames
