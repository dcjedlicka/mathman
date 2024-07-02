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

function Pot(x, y) {
    // stem
    ctx.rect(x + 14, y + 20, 4, 60);
    ctx.stroke();
    ctx.fill();
    // flower head
    ctx.fillStyle = "white";
    ctx.lineWidth = 2;
    ctx.rect(x, y, 10, 10);
    ctx.rect(x + 22, y + 22, 10, 10);
    ctx.rect(x + 22, y, 10, 10);
    ctx.rect(x, y + 22, 10, 10);
    ctx.stroke();
    ctx.fill();
    ctx.beginPath();
    ctx.rect(x + 11, y - 4, 10, 10);
    ctx.rect(x - 4, y + 11, 10, 10);
    ctx.rect(x + 26, y + 11, 10, 10);
    ctx.rect(x + 11, y + 25, 10, 10);
    ctx.stroke();
    ctx.fill();
    ctx.beginPath();
    ctx.rect(x + 6, y + 6, 20, 20);
    ctx.stroke();
  
    // pot
    ctx.beginPath();
    ctx.rect(x - 4, y + 90, 39, 22);
    ctx.stroke();
    ctx.strokeRect(x - 7, y + 80, 45, 9);
    ctx.rect(x - 7, y + 80, 45, 9);
  }
  
  // function for rendering background elements
  function renderBackground() {
    // place sprite onto background wherever you please..
    Pot(50, 10);
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
