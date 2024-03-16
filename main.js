
const PLAYFIELD_ROWS = 20;
const PLAYFIELD_COLUMNS = 10;

const TETROMINO_NAMES = [
    "O",
    "L",
    "I",
    "T",
    "Z",
    // "X",
    "D",
    "B"
];

const TETROMINOES = {
    "O": [
        [1, 1],
        [1, 1]
    ],
    "L": [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
    ],
    "I": [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
    ],
    "T": [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
    ],
    "Z": [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0]
    ],
    // "X": [
    //     [0, 1, 0],
    //     [1, 1, 1],
    //     [0, 1, 0]
    // ],
    "D": [
        [1]
    ],
    "B": [
        [1, 0],
        [1, 0]
    ]
}

let tetrisContainer = document.querySelector(".tetris");
let playfield;
let tetromino;
let randomName;
let timeoutId;
let requestId;
let score = 0;
let scoreOutput = document.querySelector("#output");
scoreOutput.innerHTML = score;
let speedDown = 700;
let isPaused = false;
let isGameOver = false;
let cells;
const restartButton = document.querySelector(".restartBtn");
const playPauseBtn = document.querySelector("#play-pauseBtn");
const restartBtnHeader = document.querySelector("#restartBtnHeader");
const gameOverBlock = document.querySelector(".game-over");
let totalScoreOutput = document.querySelector("#totalScoreOutput");
let bestOutput = document.querySelector("#bestOutput");

let best = localStorage.getItem("best");
bestOutput.innerHTML = best;

function generatePlayfield(rows, columns){
    document.querySelector(".tetris").innerHTML = "";
    for (let i = 0; i < rows * columns; i++){
        const div = document.createElement("div");
        tetrisContainer.append(div);
    }
    playfield = new Array(PLAYFIELD_ROWS).fill()
        .map(()=> new Array(PLAYFIELD_COLUMNS).fill(0))

    // console.log(playfield);
}

function convertPositionToIndex(row, column){
    return row * PLAYFIELD_COLUMNS + column;
}

function getRandomTetromino(arr){
    const indexName = Math.floor(Math.random() * (arr.length));
    randomName = arr[indexName];
    return randomName;
}

function generateTetromino(){
    const nameTetro = getRandomTetromino(TETROMINO_NAMES);
    console.log(nameTetro)
    const matrixTetro = TETROMINOES[nameTetro];

    const columnTetro = Math.floor(PLAYFIELD_COLUMNS / 2 - (matrixTetro.length / 2));
    const rowTetro = -matrixTetro.length +1;
    
    tetromino = {
        name: nameTetro,
        matrix: matrixTetro,
        row: rowTetro,
        column: columnTetro,
    }
}

function drawPlayField(){

    for(let row = 0; row < PLAYFIELD_ROWS; row++){
        for(let column = 0; column < PLAYFIELD_COLUMNS; column++){
            const name = playfield[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            cells[cellIndex].classList.add(name);
        }
    }

}

function drawTetromino(){
    const name = tetromino.name;
    const tetrominoMatrixSize = tetromino.matrix.length;

    for(let row = 0; row < tetrominoMatrixSize; row++){
        for(let column = 0; column < tetrominoMatrixSize; column++){
            
            if(isOutsideTopBoard(row)){continue}
            if(tetromino.matrix[row][column] == 0){continue}

            const cellIndex = convertPositionToIndex(tetromino.row + row, tetromino.column + column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function isOutsideTopBoard(row){
    return tetromino.row + row < 0;
}
init();

function init(){
    gameOverBlock.style.display = "none";
    isGameOver = false;
    generatePlayfield(PLAYFIELD_ROWS, PLAYFIELD_COLUMNS);
    generateTetromino();
    startLoop();
    cells = document.querySelectorAll(".tetris div");
    score = 0;
    calculateScore(null);
}

function draw(){
    cells.forEach((cell) => cell.removeAttribute("class"));
    drawPlayField();
    drawTetromino();
    // console.table(playfield);
}


function togglePauseGame(){
    isPaused = !isPaused;
// --------ternsrniy-------
    if(isPaused){
        stopLoop();
    }else{
        startLoop();
    }
}

function dropTetrominoDown(){
    while(!isValid()){
        tetromino.row++;
    }
    tetromino.row--;
}

document.addEventListener("keydown", onKeyDown);

function onKeyDown(event){
    if(event.key == " "){
        togglePauseGame();
    }
    if(isPaused){
        return;
    }
    switch(event.key){
        case "ArrowUp":
            rotateTetromino();
            break;
        case "ArrowDown":
            dropTetrominoDown();
            break;
         case "ArrowLeft":
            moveTetrominoLeft();
            break;
        case "ArrowRight":
            moveTetrominoRight();
            break;
    }
    
    draw();
}


// ---------------Click event---------------

let leftBtn = document.querySelector("#btn-left");
let rightBtn = document.querySelector("#btn-right");
let downBtn = document.querySelector("#btn-down");
let upBtn = document.querySelector("#btn-up");

leftBtn.addEventListener("click", leftButtonTouch);
rightBtn.addEventListener("click", rightButtonTouch);
downBtn.addEventListener("click", downButtonTouch);
upBtn.addEventListener("click", upButtonTouch);

function leftButtonTouch(){
    if(isPaused){
        return;
    }
    moveTetrominoLeft();
    draw();
}

function rightButtonTouch(){
    if(isPaused){
        return;
    }
    moveTetrominoRight();
    draw();
}

function downButtonTouch(){
    if(isPaused){
        return;
    }
    dropTetrominoDown();
    draw();
}

function upButtonTouch(){
    if(isPaused){
        return;
    }
    rotateTetromino();
    draw();
}

// ---------------click event end -------------------

function moveTetrominoDown(){
    tetromino.row += 1;
    if(isValid()){
        tetromino.row -= 1;
        placeTetromino();
    }
}

function moveTetrominoLeft(){
    tetromino.column -= 1;
    if(isValid()){
        tetromino.column += 1;
    }
}

function moveTetrominoRight(){
    tetromino.column += 1;
    if(isValid()){
        tetromino.column -= 1;
    }
}

function isValid(){
    const matrixSize = tetromino.matrix.length;
    for(let row = 0; row < matrixSize; row++){
        for(let column = 0; column < matrixSize; column++){
            if(!tetromino.matrix[row][column]){continue;}
            // if(tetromino.matrix[row][column] == 0){continue;}
            if(isOutsideOfGameBoard(row, column)){return true}
            if(hasCollisions(row, column)){return true}
        }
    }
    return false;
}

function isOutsideOfGameBoard(row, column){
    return tetromino.column + column < 0 || 
           tetromino.column +column >= PLAYFIELD_COLUMNS ||
           tetromino.row + row >= PLAYFIELD_ROWS
}

function hasCollisions(row, column){
    return playfield[tetromino.row + row]?.[tetromino.column + column]
}
// ------------Timer-----------


function moveDown(){
    moveTetrominoDown();
    draw();
    if(score >= 50){
        speedDown = 600;
    }
    if(score >= 100){
        speedDown = 500;
    }
    if(score >= 250){
        speedDown = 400;
    }
    if(score >= 350){
        speedDown = 300;
    }
    if(score >= 500){
        speedDown = 200;
    }
    if(score >= 700){
        speedDown = 100;
    }
    stopLoop();
    startLoop();

    if(isGameOver){
        gameOver();
    }
}

function gameOver(){
    stopLoop();
    gameOverBlock.style.display = "flex";
}

restartButton.addEventListener('click', init);
restartBtnHeader.addEventListener('click', init);
playPauseBtn.addEventListener('click', togglePauseGame)



function startLoop(){
    timeoutId = setTimeout(
        ()=>(requestId = requestAnimationFrame(moveDown)), speedDown
    );
}

function stopLoop(){
    cancelAnimationFrame(requestId);
    timeoutId = clearTimeout(timeoutId);
}

startLoop();

// ---------------Timer-end-------------

// ------------Score-----------------

function calculateScore(destroyRows){
    switch(destroyRows){
        case 1:
            score += 10;
            break;
        case 2:
            score += 30;
            break;
        case 3:
            score += 60;
            break;
        case 4:
            score += 100;
            break;
        default:
            score += 0;
    }
    scoreOutput.innerHTML = score;
    totalScoreOutput.innerHTML = score;
    best = localStorage.getItem("best");
    bestOutput.innerHTML = best;
    if(best < score){
        localStorage.setItem("best", score);
    }
    
}

// ----------------score-end----------------

function placeTetromino(){
    const matrixSize = tetromino.matrix.length;
    for(let row = 0; row < matrixSize; row++){
        for(let column = 0; column < matrixSize; column++){
            if(!tetromino.matrix[row][column]) continue;
            if(isOutsideTopBoard(row)){
                isGameOver = true;
                return;
            }
            playfield[tetromino.row + row][tetromino.column + column] = randomName;
        }
    }
    const filledRows = findFilledRows();
    calculateScore(filledRows);
    removeFilledRows(filledRows);
    generateTetromino();
}



function removeFilledRows(filledRows){
    filledRows.forEach(row => {
        dropRowsAbove(row);
    })
    calculateScore(filledRows.length);
}

function dropRowsAbove(rowDelete){
    for(let row = rowDelete; row > 0; row--){
        playfield[row] = playfield[row - 1];
    }

    playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

function findFilledRows(){
    const filledRows = [];
    for(let row = 0; row < PLAYFIELD_ROWS; row++){
        let filledColumns = 0;
        for(let column = 0; column < PLAYFIELD_COLUMNS; column++){
            if(playfield[row][column] != 0){
                filledColumns++;
            }
        }
        if(PLAYFIELD_COLUMNS == filledColumns){
            filledRows.push(row);
            console.log(row)
        }
    }
    
    return filledRows;
}




function rotateMatrix(matrixTetromino){
    const N = matrixTetromino.length;
    const rotateMatrix = [];
    for(let i = 0; i < N; i++){
        rotateMatrix[i] = [];
        for(let j = 0; j < N; j++){
            rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
        }
    }
    return rotateMatrix;
}

function rotateTetromino(){
    const oldMatrix = tetromino.matrix;
    tetromino.matrix = rotateMatrix(oldMatrix);
    if(isValid()){
        return tetromino.matrix = oldMatrix;
    }
}