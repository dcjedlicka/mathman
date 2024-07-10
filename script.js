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

let mathmanImage = new Image(30, 30);
mathmanImage.src = "MathmanGlitchAvatar.png";
let MATHMAN_POS = {x: 0, y: 0};

// function for applying any initial settings
function init() {

}

const Dir = Object.freeze({
    Up: 0x1,
    Down: 0x2,
    Left: 0x4,
    Right: 0x8
});

const wallWidth = 6;
const mmSize = 30;
const spotSize = wallWidth+mmSize;

const Board = [
 [ Dir.Down|Dir.Right, Dir.Left|Dir.Down|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Down|Dir.Right, Dir.Left|Dir.Down|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Down|Dir.Right, Dir.Left|Dir.Down],
 [ Dir.Down|Dir.Up, Dir.Up|Dir.Down, Dir.Down|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Down, Dir.Up|Dir.Down, Dir.Up|Dir.Down],
 [ Dir.Down|Dir.Up, Dir.Up|Dir.Down, Dir.Up|Dir.Down, Dir.Right, Dir.Left, Dir.Up|Dir.Down, Dir.Up|Dir.Down, Dir.Up|Dir.Down],
 [ Dir.Down|Dir.Up, Dir.Up|Dir.Right, Dir.Left|Dir.Up|Dir.Right, Dir.Left|Dir.Down|Dir.Right,Dir.Left|Dir.Down|Dir.Right, Dir.Left|Dir.Up|Dir.Right, Dir.Left|Dir.Up, Dir.Up|Dir.Down, Dir.Up|Dir.Down],
 [ Dir.Down|Dir.Up|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Up, Dir.Up|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Down|Dir.Up],
 [ Dir.Up|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Up],
];

function getCoordinatesFromPosition(x, y, skipWall) {
    return [x*spotSize + 12 + (skipWall ? wallWidth : 0), y*spotSize + 12 + (skipWall ? wallWidth : 0)];
}

function drawBoard() {
    ctx.fillStyle = "green";
    ctx.lineWidth = 2;
    for(let i = 0; i < Board.length; i++) {
        for (let j = 0; j < Board[0].length; j++) {
            let spot = Board[i][j];
            let [positionL, positionU] = getCoordinatesFromPosition(j, i, false);
            if ((spot & Dir.Left) === 0) {
                ctx.fillRect(positionL, positionU, wallWidth, spotSize);
            }
            if ((spot & Dir.Right) === 0) {
                ctx.fillRect(positionL+spotSize, positionU, wallWidth, spotSize);
            }
            if ((spot & Dir.Up) === 0) {
                ctx.fillRect(positionL, positionU, spotSize+wallWidth, wallWidth);
            }
            if ((spot & Dir.Down) === 0) {
                ctx.fillRect(positionL, positionU+spotSize, spotSize+wallWidth, wallWidth);
            }
        }
    }
}
  
// function for rendering background elements
function renderBackground() {
    // place sprite onto background wherever you please..
    drawBoard();
  }

// function for rendering prop objects in PROPS
function renderProps() {

}

// function for rendering character objects in CHARS
function renderCharacters() {
    let [x, y] = getCoordinatesFromPosition(MATHMAN_POS.x, MATHMAN_POS.y, true);
    ctx.drawImage(mathmanImage, x, y, mathmanImage.width, mathmanImage.height);
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
