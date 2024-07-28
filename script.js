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
    ["Eat all numbers greater than 6", "9", "12", "55", "7", "5", "6", "1", "3"],
    ["Eat all numbers greater than 0", "9", "12", "55", "1", "-5", "-42", "-1", "-13"],
    ["Eat all numbers greater than 37", "49", "42", "55", "93", "5", "-40", "36", "29"],
    ["Eat all numbers less than 8", "7", "1", "0", "-20", "20", "9", "8", "42"],
    ["Eat all numbers less than 27", "0", "1", "19", "26", "99", "31", "28", "42"],
    ["Eat all sums that add to 15", "7+8", "12+3", "11+4", "10+5", "10+4", "8+8", "2+3", "13+3"],
    ["Eat all sums that add to 12", "11+1", "3+9", "6+6", "8+4", "8+3", "5+10", "1+2", "6+7"],
    ["Eat all sums that add to 10", "5+5", "8+2", "10+0", "3+7", "5+4", "4+7", "8+1", "8+3"],
    ["Eat all differences equal to 7", "9-2", "10-3", "11-4", "17-10", "10-2", "9-3", "8-2", "7-1"],
    ["Eat all differences equal to 4", "9-5", "6-2", "7-3", "14-10", "5-2", "6-3", "9-7", "8-5"],
    ["Eat all differences equal to 3", "9-6", "7-4", "5-2", "13-10", "5-1", "4-2", "11-6", "3-3"],
    ["Eat all even numbers", "4", "12", "8", "20", "5", "9", "1", "13"],
    ["Eat all odd numbers", "13", "1", "5", "9", "20", "8", "12", "4"],
    ["Eat all multiples of 2", "4", "6", "10", "20", "5", "9", "11", "15"],
    ["Eat all multiples of 3", "6", "9", "15", "18", "5", "8", "13", "10"],
    ["Eat all multiples of 5", "10", "15", "25", "30", "4", "9", "11", "17"],
    ["Eat all multiples of 10", "10", "20", "50", "100", "5", "19", "11", "33"],
    ["Eat all factors of 6", "1", "2", "3", "6", "5", "4", "11", "9"],
    ["Eat all factors of 12", "2", "3", "4", "6", "5", "7", "9", "11"],
    ["Eat all factors of 15", "1", "3", "5", "15", "2", "4", "6", "9"],
];

// object for storing globally accessable states
const GLOBALS = {}

// Array where all characters will be stored
const CHARS = [];

const MathmanMode = Object.freeze({
    Moving: "Moving",
    Question: "Question",
    GlitchChasing: "GlitchChasing",
    Dead: "Dead",
    Won: "Won",
});

const Dir = Object.freeze({
    Up: 0x1,
    Down: 0x2,
    Left: 0x4,
    Right: 0x8
});


let mathmanImage = new Image(30, 30);
mathmanImage.src = "MathmanGlitchAvatar.png";
let glitchImage = new Image(30, 30);
glitchImage.src = "Glitch.png";
let MATHMAN_POS = {x: 0, y: 0};
let MATHMAN_DISPLAY_POS = {x: 0, y: 0};
let GLITCH_DISPLAY_POS = {x: 0, y: 0};
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
        // TODO add validation that there's an even number
        let numberOfEachKind = (questionData.length - 1) / 2;
        // shuffle
        {
            for (let i = 1; i < numberOfEachKind; i++)  {
                let j = Math.floor(Math.random() * (numberOfEachKind - (i - 1))) + i;
                let temp = questionData[j];
                if (temp === undefined) {
                    debugger;
                }
                questionData[j] = questionData[i];
                questionData[i] = temp;
            }
            this.answers.push(new answerPosition(new answer(questionData[1], true), 7, 1));
            this.answers.push(new answerPosition(new answer(questionData[2], true), 4, 1));
            this.answers.push(new answerPosition(new answer(questionData[3], true), 3, 2));
            this.answers.push(new answerPosition(new answer(questionData[4], true), 0, 4));
        }
        {
            for (let i = numberOfEachKind + 1; i < (2 * numberOfEachKind + 1); i++)  {
                let j = Math.floor(Math.random() * (numberOfEachKind - (i - (numberOfEachKind + 1)))) + i;
                let temp = questionData[j];
                if (temp === undefined) {
                    debugger;
                }
                questionData[j] = questionData[i];
                questionData[i] = temp;
            }
            this.answers.push(new answerPosition(new answer(questionData[numberOfEachKind + 1], false), 6, 4));
            this.answers.push(new answerPosition(new answer(questionData[numberOfEachKind + 2], false), 1, 3));
            this.answers.push(new answerPosition(new answer(questionData[numberOfEachKind + 3], false), 5, 5));
            this.answers.push(new answerPosition(new answer(questionData[numberOfEachKind + 4], false), 2, 0));
        }
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
    for (let i = 0; i < questionData.length; ++i) {
        if (questionData[i].length <= 1 || (questionData[i].length % 2 !== 1)) {
            throw new Error(`Invalid number of answers (${questionData[i].length - 1}) for question ${questionData[i][0]}`);
        }
    }
    let index = Math.floor(Math.random() * questionData.length);
    let chosenData = questionData[index];
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
            case MathmanMode.GlitchChasing:
                handleMove(ev);
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
        if (currentMathmanMode === MathmanMode.GlitchChasing) {
            boardElements[MATHMAN_POS.y][MATHMAN_POS.x] = 0;
        } else {
            activateQuestionMode();
        }
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
            currentMathmanMode = MathmanMode.GlitchChasing;
            // TODO music
            GLITCH_DISPLAY_POS.x = (MATHMAN_POS.x > (Board[0].length / 2)) ? 0 : (Board[0].length - 1);
            GLITCH_DISPLAY_POS.y = (MATHMAN_POS.y > (Board.length / 2)) ? 0 : (Board.length - 1);
        }
    }
}

function checkIfWon() {
    if (currentMathmanMode === MathmanMode.GlitchChasing || currentMathmanMode === MathmanMode.Dead) {
        return false;
    }
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
    ctx.font = "26px sans serif";
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
                ctx.fillText(boardElements[y][x].answer.text, spot[0]-2, spot[1]);
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
            ctx.font = "26px sans serif";
            ctx.fillText("Eat " + questionToDisplay.answer.text + "?   Y or N ?", 30, 350);
            break;
        case MathmanMode.GlitchChasing:
            ctx.font = "26px sans serif";
            ctx.fillStyle = "black";
            ctx.fillText("Run away, Mathman!", 30, 350);
            ctx.fillStyle = "green";
            break;
        case MathmanMode.Dead:
            ctx.font = "26px sans serif";
            ctx.fillStyle = "black";
            ctx.fillText("Sorry, the glitch wins!", 30, 350);
            ctx.fillStyle = "green";
            break;
        case MathmanMode.Won:
            ctx.font = "26px sans serif";
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
    if (currentMathmanMode == MathmanMode.GlitchChasing) {
        let moveRate = MOVE_INCREMENT === 1 ? 1 : MOVE_INCREMENT * 0.75;
        let xDiff = MATHMAN_DISPLAY_POS.x - GLITCH_DISPLAY_POS.x;
        let yDiff = MATHMAN_DISPLAY_POS.y - GLITCH_DISPLAY_POS.y;
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            GLITCH_DISPLAY_POS.x += (xDiff > 0) ? moveRate : -1 * moveRate;
        } else {
            GLITCH_DISPLAY_POS.y += (yDiff > 0) ? moveRate : -1 * moveRate;
        }
        if (Math.abs(MATHMAN_DISPLAY_POS.x - GLITCH_DISPLAY_POS.x) < 0.2 &&
            Math.abs(MATHMAN_DISPLAY_POS.y - GLITCH_DISPLAY_POS.y) < 0.2) {
            currentMathmanMode = MathmanMode.Dead;
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

function isSoundActive() {
    return document.getElementById("sound").checked === true;
}

// function for rendering character objects in CHARS
function renderCharacters() {
    if (currentMathmanMode !== MathmanMode.Dead) {
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
    if (currentMathmanMode === MathmanMode.GlitchChasing || currentMathmanMode === MathmanMode.Dead) {
        let [x, y] = getCoordinatesFromPosition(GLITCH_DISPLAY_POS.x, GLITCH_DISPLAY_POS.y, true);
        ctx.drawImage(glitchImage, x, y, glitchImage.width, glitchImage.height);
    }
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

addEventListener("DOMContentLoaded", e => {
    document.getElementById("sound").addEventListener("input", e => {
        if (!isSoundActive()) {
            window.speechSynthesis.cancel();
        }
    });

    init(); // initialize game settings
    if (isSoundActive()) {
        let utterance = new SpeechSynthesisUtterance("Math man, your mission is to " + currentQuestion.text);
        utterance.rate = 1.3;
        window.speechSynthesis.speak(utterance);
    }
    startFrames(); // start running frames
});