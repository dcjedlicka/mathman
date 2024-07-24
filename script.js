/*var block = document.getElementById("block");
function checkDead(){
    let characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
    let blockLeft = parseInt(window.getComputedStyle(block).getPropertyValue("left"));
    if(blockLeft<20 && blockLeft>-20 && characterTop>=130){
        alert("Game over");
    }
}

setInterval(checkDead, 10);*/
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const questionData = [
    ["Eat all numbers greater than 6", "9", "12", "55", "7", "5", "4", "1", "3"]
];

// object for storing globally accessable states
const GLOBALS = {}

// Array where all characters will be stored
const CHARS = [];

const MathmanMode = Object.freeze({
    Moving: 1,
    Question: 2,
    Dead: 3,
    Won: 4,
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
const MOVE_INCREMENT = 0.07;
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

class answer {
    constructor(text, correct) {
        this.text = text;
        this.correct = correct;
    }
}

class answerPosition {
    constructor(answer, xpos, ypos) {
        this.answer = answer;
        this.xpos = xpos;
        this.ypos = ypos;
    }
}

class question {
    constructor(questionData) {
        this.text = questionData[0];
        this.answers = [];
        this.answers.push(new answerPosition(new answer(questionData[1], true), 7, 1));
        this.answers.push(new answerPosition(new answer(questionData[2], true), 4, 1));
        this.answers.push(new answerPosition(new answer(questionData[3], true), 3, 2));
        this.answers.push(new answerPosition(new answer(questionData[4], true), 0, 4));
        this.answers.push(new answerPosition(new answer(questionData[5], false), 6, 4));
        this.answers.push(new answerPosition(new answer(questionData[6], false), 1, 3));
        this.answers.push(new answerPosition(new answer(questionData[7], false), 5, 5));
        this.answers.push(new answerPosition(new answer(questionData[8], false), 2, 0));
    }
}

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

function getQuestion() {
    let chosenData = questionData[0];
    let theQuestion = new question(chosenData);
    return theQuestion;
}

// function for applying any initial settings
function init() {
    boardElements = new Array(Board.length);
    for (let i = 0; i < Board.length; i++) {
       boardElements[i] = new Array(Board[0].length).fill(1);
    }
    boardElements[MATHMAN_POS.y][MATHMAN_POS.x] = 0;
    currentQuestion = getQuestion();
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
            case MathmanMode.Won:
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

function onMoveToNewSquare() {
    let element = boardElements[MATHMAN_POS.y][MATHMAN_POS.x]; 
    if (element === 1) {
        boardElements[MATHMAN_POS.y][MATHMAN_POS.x] = 0;
    }
    else if (element !== 0) {
        activateQuestionMode();
    }
    if (checkIfWon()) {
        currentMathmanMode = MathmanMode.Won;
    }
}

function handleMove(ev) {
    let didMove = false;
    let direction = keyToDirection(ev.key);
    if (direction) {
        switch (direction) {
            case Dir.Left: {
                if (currentMathmanMovingDir === undefined || currentMathmanMovingDir === Dir.Right) {
                    // If we're moving right already always allow backing up
                    if (currentMathmanMovingDir === Dir.Right) {
                        didMove = true;
                    } else {
                        didMove = tryMove(p => p.x--);
                        if (didMove && MOVE_INCREMENT !== 1) {
                            MATHMAN_POS.x += 1;
                        }
                    }
                }
                break;
            }
            case Dir.Right: {
                if (currentMathmanMovingDir === undefined || currentMathmanMovingDir === Dir.Left) {
                    // If we're moving left already always allow backing up
                    if (currentMathmanMovingDir === Dir.Left) {
                        didMove = true;
                    } else {
                        didMove = tryMove(p => p.x++);
                        if (didMove && MOVE_INCREMENT !== 1) {
                            MATHMAN_POS.x -= 1;
                        }
                    }
                }
                break;
            }
            case Dir.Up: {
                if (currentMathmanMovingDir === undefined || currentMathmanMovingDir === Dir.Down) {
                    // If we're moving down already always allow backing up
                    if (currentMathmanMovingDir === Dir.Down) {
                        didMove = true;
                    } else {
                        didMove = tryMove(p => p.y--);
                        if (didMove && MOVE_INCREMENT !== 1) {
                            MATHMAN_POS.y += 1;
                        }
                    }
                }
                break;
            }
            case Dir.Down: {
                if (currentMathmanMovingDir === undefined || currentMathmanMovingDir === Dir.Up) {
                    // If we're moving up already always allow backing up
                    if (currentMathmanMovingDir === Dir.Up) {
                        didMove = true;
                    } else {
                        didMove = tryMove(p => p.y++);
                        if (didMove && MOVE_INCREMENT !== 1) {
                            MATHMAN_POS.y -= 1;
                        }
                    }
                }
                break;
            }
        }
        if (didMove) {
            currentMathmanDir = direction;
            if (MOVE_INCREMENT !== 1) {
                currentMathmanMovingDir = direction;
            }
        }
    }
    if (didMove) {
        onMoveToNewSquare();
    }
}

function activateQuestionMode() {
    currentMathmanMode = MathmanMode.Question;
}

function handleQuestion(ev) {
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
        if (question.answer.correct === answer) {
            // TODO play a happy sound
            currentMathmanMode = MathmanMode.Moving;
            boardElements[MATHMAN_POS.y][MATHMAN_POS.x] = 0;
            if (checkIfWon()) {
                currentMathmanMode = MathmanMode.Won;
            }
        } else {
            currentMathmanMode = MathmanMode.Dead;
            // TODO go into glitch mode with chase and music
        }
    }
}

function checkIfWon() {
    let won = !(boardElements.some(row => row.some(elem => elem !== 0)));
    return won;
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
    ctx.fillText(currentQuestion.text, 20, 10);
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
    switch (currentMathmanMode) {
        case MathmanMode.Moving:
            break;
        case MathmanMode.Question:
            // Draw current question
            let questionToDisplay = boardElements[MATHMAN_POS.y][MATHMAN_POS.x];
            ctx.fillText("Eat " + questionToDisplay.answer.text + "?   Y or N ?", 30, 350);
            break;
        case MathmanMode.Dead:
            ctx.fillStyle = "black";
            ctx.fillText("Sorry, the glitch wins!", 30, 350);
            ctx.fillStyle = "green";
            break;
        case MathmanMode.Won:
            ctx.fillStyle = "black";
            ctx.fillText("Mathman wins! Free game!", 30, 350);
            ctx.fillStyle = "green";
            break;
    }
}


// function for rendering elements
function renderElements() {
}

function smoothMoveCharacters() {
    const tolerance = MOVE_INCREMENT / 2;
    function coerceToX() {
        // boo floating point
        let floor = MATHMAN_DISPLAY_POS.x - Math.floor(MATHMAN_DISPLAY_POS.x);
        if (floor <= tolerance || (1 - floor) <= tolerance) {
            // snap to square and stop moving
            // ugh, avoid -0
            MATHMAN_POS.x = Math.abs(Math.round(MATHMAN_DISPLAY_POS.x));
            MATHMAN_DISPLAY_POS.x = MATHMAN_POS.x;
            currentMathmanMovingDir = undefined;
            onMoveToNewSquare();
        }
    }
    function coerceToY() {
        // boo floating point
        let floor = MATHMAN_DISPLAY_POS.y - Math.floor(MATHMAN_DISPLAY_POS.y);
        if (floor <= tolerance || (1 - floor) <= tolerance) {
            // snap to square and stop moving
            // ugh, avoid -0
            MATHMAN_POS.y = Math.abs(Math.round(MATHMAN_DISPLAY_POS.y));
            MATHMAN_DISPLAY_POS.y = MATHMAN_POS.y;
            currentMathmanMovingDir = undefined;
            onMoveToNewSquare();
        }
    }

    if (MOVE_INCREMENT !== 1 && currentMathmanMovingDir !== undefined) {
        switch (currentMathmanMovingDir) {
            case Dir.Left: {
                MATHMAN_DISPLAY_POS.x -= MOVE_INCREMENT;
                coerceToX();
                break;
            }
            case Dir.Right: {
                MATHMAN_DISPLAY_POS.x += MOVE_INCREMENT;
                coerceToX();
                break;
            }
            case Dir.Up: {
                MATHMAN_DISPLAY_POS.y -= MOVE_INCREMENT;
                coerceToY();
                break;
            }
            case Dir.Down: {
                MATHMAN_DISPLAY_POS.y += MOVE_INCREMENT;
                coerceToY();
                break;
            }
        }
    }
}

function getRotationAngleFromDirection(dir) {
    switch(dir) {
        case Dir.Right:
            return 0;
        case Dir.Left:
            return Math.PI;
        case Dir.Up:
            return -Math.PI/2;
        case Dir.Down:
            return Math.PI/2;
    }
    throw new Error(`unexpected direction: ${dir}`);
    return 0;
}

// function for rendering character objects in CHARS
function renderCharacters() {
    let [x, y] = getCoordinatesFromPosition(MATHMAN_DISPLAY_POS.x, MATHMAN_DISPLAY_POS.y, true);
    ctx.save();
    ctx.translate(x + (mathmanImage.width / 2), y + (mathmanImage.height / 2));
    if (currentMathmanDir === Dir.Left) {
        // just mirror it - rotating it makes it look upside-down
        ctx.scale(-1, 1);
    } else {
        let angle = getRotationAngleFromDirection(currentMathmanDir);
        ctx.rotate(angle);
    }
    ctx.translate(-(x + (mathmanImage.width / 2)), -(y + (mathmanImage.height / 2)));
    ctx.drawImage(mathmanImage, x, y, mathmanImage.width, mathmanImage.height);
    ctx.restore();
}

// main function to be run for rendering frames
function startFrames() {
    // erase entire canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // render each type of entity in order, relative to layers
    renderBackground();
    renderElements();
    smoothMoveCharacters();
    renderCharacters();

    // rerun function (call next frame)
    window.requestAnimationFrame(startFrames);
}

init(); // initialize game settings
startFrames(); // start running frames
