/*
Issues:
finish checking answer to questions
remove answer after answering
Handle losing
Check for winning
Handle winning
clean up
more questions
*/


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

// Array where all characters will be stored
const CHARS = [];

const MathmanMode = Object.freeze({
    Moving: 1,
    Question: 2,
    Dead: 3,
});

const Dir = Object.freeze({
    Up: 0x1,
    Down: 0x2,
    Left: 0x4,
    Right: 0x8
});


let mathmanImage = new Image(30, 30);
mathmanImage.src = "MathmanGlitchAvatar.png";
let MATHMAN_POS = {x: 0, y: 0};
let MATHMAN_DISPLAY_POS = {x: 0, y: 0};
let currentQuestion = undefined;
let currentMathmanMode = MathmanMode.Moving;
// Set this to 1 to turn off smooth moves
const MOVE_INCREMENT = 1;
let currentMathmanDir = Dir.Right;
// Set if mathman is between spaces (with smooth moves)
let currentMathmanMovingDir = undefined;


const wallWidth = 6;
const mmSize = 40;
const spotSize = wallWidth+mmSize;

const Board = [
 [ Dir.Down|Dir.Right, Dir.Left|Dir.Down|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Down|Dir.Right, Dir.Left|Dir.Down],
 [ Dir.Down|Dir.Up, Dir.Up|Dir.Down, Dir.Down|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right|Dir.Down, Dir.Left|Dir.Down, Dir.Up|Dir.Down, Dir.Up|Dir.Down],
 [ Dir.Down|Dir.Up, Dir.Up|Dir.Down, Dir.Up|Dir.Down, Dir.Right|Dir.Down, Dir.Left|Dir.Up, Dir.Up|Dir.Down, Dir.Up|Dir.Down, Dir.Up|Dir.Down],
 [ Dir.Down|Dir.Up, Dir.Up|Dir.Right, Dir.Left|Dir.Up|Dir.Right, Dir.Left|Dir.Down|Dir.Right|Dir.Up,Dir.Left|Dir.Down|Dir.Right, Dir.Left|Dir.Up|Dir.Right, Dir.Left|Dir.Up, Dir.Up|Dir.Down, Dir.Up|Dir.Down],
 [ Dir.Down|Dir.Up|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Up, Dir.Up|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Down|Dir.Up],
 [ Dir.Up|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Right, Dir.Left|Dir.Up],
];

boardElements = [];

function isValidPosition(pos) {
    return pos.x >= 0 && pos.x < Board[0].length && pos.y >= 0 && pos.y < Board.length;
}

function tryMove(newPosFn) {
    let oldPos = {x: MATHMAN_POS.x, y: MATHMAN_POS.y};
    let newPos = {x: MATHMAN_POS.x, y: MATHMAN_POS.y};
    newPosFn(newPos);
    if (!isValidPosition(newPos)) { return false; }
    // This assumes only one coordinate moves
    if (oldPos.x != newPos.x) {
        const minX = Math.min(oldPos.x, newPos.x);
        const maxX = Math.max(oldPos.x, newPos.x);
        let x = minX;
        while (x < maxX) {
            if ((Board[oldPos.y][x] & Dir.Right) === 0) {
                // can't move
                return false;
            }
            x++;
        }
    }
    if (oldPos.y != newPos.y) {
        const minY = Math.min(oldPos.y, newPos.y);
        const maxY = Math.max(oldPos.y, newPos.y);
        let y = minY;
        while (y < maxY) {
            if ((Board[y][oldPos.x] & Dir.Down) === 0) {
                // can't move
                return false;
            }
            y++;
        }
    }
    // move allowed!
    Object.assign(MATHMAN_POS, newPos);
    return true;
}

// function for applying any initial settings
function init() {
    boardElements = new Array(Board.length);
    for (let i = 0; i < Board.length; i++) {
       boardElements[i] = new Array(Board[0].length).fill(1);
    }
    boardElements[MATHMAN_POS.y][MATHMAN_POS.x] = 0;
    currentQuestion = new question();
    for(let x of currentQuestion.answers) {
        boardElements[x.ypos][x.xpos] = x;
    }
    document.addEventListener("keydown", ev => {
        switch (currentMathmanMode) {
            case MathmanMode.Moving:
                handleMove(ev);
                break;
            case MathmanMode.Question:
                handleQuestion(ev);
                break;
            case MathmanMode.Dead:
                break;
        }
    });
}

function keyToDirection(key) {
    switch (key) {
        case "ArrowLeft": {
            return Dir.Left;
        }
        case "ArrowRight": {
            return Dir.Right;
        }
        case "ArrowUp": {
            return Dir.Up;
        }
        case "ArrowDown": {
            return Dir.Down;
        }
    }
    return undefined;
}

function handleMove(ev) {
    let didMove = false;
    let direction = keyToDirection(ev.key);
    if (direction) {
        switch (direction) {
            case Dir.Left: {
                didMove = tryMove(p => p.x--);
                if (didMove && MOVE_INCREMENT !== 1) {
                    MATHMAN_POS.x += 1;
                    MATHMAN_DISPLAY_POS.x -= MOVE_INCREMENT;
                }
                break;
            }
            case Dir.Right: {
                didMove = tryMove(p => p.x++);
                if (didMove && MOVE_INCREMENT !== 1) {
                    MATHMAN_POS.x -= 1;
                    MATHMAN_DISPLAY_POS.x += MOVE_INCREMENT;
                }
                break;
            }
            case Dir.Up: {
                didMove = tryMove(p => p.y--);
                if (didMove && MOVE_INCREMENT !== 1) {
                    MATHMAN_POS.y += 1;
                    MATHMAN_DISPLAY_POS.y -= MOVE_INCREMENT;
                }
                break;
            }
            case Dir.Down: {
                didMove = tryMove(p => p.y++);
                if (didMove && MOVE_INCREMENT !== 1) {
                    MATHMAN_POS.y -= 1;
                    MATHMAN_DISPLAY_POS.y += MOVE_INCREMENT;
                }
                break;
            }
        }
        if (didMove) {
            currentMathmanDir = direction;
            currentMathmanMovingDir = direction;
        }
    }
    if (didMove) {
        let element = boardElements[MATHMAN_POS.y][MATHMAN_POS.x]; 
        if (element === 1) {
            boardElements[MATHMAN_POS.y][MATHMAN_POS.x] = 0;
        }
        else if (element !== 0) {
            activateQuestionMode();
        }
    }
}

function activateQuestionMode() {
    currentMathmanMode = MathmanMode.Question;
}

function handleQuestion(ev) {
    // TODO finish
    let answer = undefined;
    switch (ev.key.toLowerCase()) {
        case "y": {
            answer = true;
            break;
        }
        case "n": {
            answer = false;
            break;
        }
    }
    if (answer !== undefined) {
        const question = boardElements[MATHMAN_POS.y][MATHMAN_POS.x];
        // TODO - feedback either way
        if (question.answer.correct === answer) {
            currentMathmanMode = MathmanMode.Moving;
            boardElements[MATHMAN_POS.y][MATHMAN_POS.x] = 0;
        } else {
            currentMathmanMode = MathmanMode.Dead;
        }
    }
}

function getCoordinatesFromPosition(x, y, skipWall) {
    return [x*spotSize + 12 + (skipWall ? wallWidth + 4 : 0), y*spotSize + 50 + (skipWall ? wallWidth + 4 : 0)];
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
    ctx.font = "30px sans serif";
    ctx.textBaseline = "top";
    ctx.fillText(currentQuestion.text, 30, 10);
    for (let y = 0; y < boardElements.length; y++) {
        for (let x = 0; x < boardElements[0].length; x++) {
            if (boardElements[y][x] === 1) {
                let spot = getCoordinatesFromPosition(x, y);
                ctx.fillStyle = "lightBlue";
                ctx.fillText("+-", spot[0] + 10, spot[1] + 10);
            }
            else if (boardElements[y][x].answer !== undefined) {
                let spot = getCoordinatesFromPosition(x, y, true);
                ctx.fillStyle = "green";
                ctx.fillText(boardElements[y][x].answer.text, spot[0], spot[1]);
            }
        }
    }

    ctx.fillStyle = "green";
    if (currentMathmanMode === MathmanMode.Question) {
        // Draw current question
        let questionToDisplay = boardElements[MATHMAN_POS.y][MATHMAN_POS.x];
        ctx.fillText("Eat " + questionToDisplay.answer.text + "?   Y or N ?", 30, 350);
    }
}

class question {
    constructor() {
        this.text = "Eat all numbers greater than 6";
        this.answers = [];
        this.answers.push(new answerPosition(new answer("3", false), 2, 0));
        this.answers.push(new answerPosition(new answer("9", true), 7, 1));
        this.answers.push(new answerPosition(new answer("12", true), 4, 1));
        this.answers.push(new answerPosition(new answer("14", true), 1, 3));
        this.answers.push(new answerPosition(new answer("1", false), 5, 5));
        this.answers.push(new answerPosition(new answer("55", true), 3, 2));
        this.answers.push(new answerPosition(new answer("5", false), 6, 4));
        this.answers.push(new answerPosition(new answer("7", true), 0, 4));
    }
}

class answerPosition {
    constructor(answer, xpos, ypos) {
        this.answer = answer;
        this.xpos = xpos;
        this.ypos = ypos;
    }
}

class answer {
    constructor(text, correct) {
        this.text = text;
        this.correct = correct;
    }
}

// function for rendering elements
function renderElements() {
}

// function for rendering character objects in CHARS
function renderCharacters() {
    let [x, y] = getCoordinatesFromPosition(MATHMAN_POS.x, MATHMAN_POS.y, true);
    ctx.drawImage(mathmanImage, x, y, mathmanImage.width, mathmanImage.height);
}

// main function to be run for rendering frames
function startFrames() {
    // erase entire canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // render each type of entity in order, relative to layers
    renderBackground();
    renderElements();
    renderCharacters();

    // rerun function (call next frame)
    window.requestAnimationFrame(startFrames);
}

init(); // initialize game settings
startFrames(); // start running frames
