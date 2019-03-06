'use strict'
var canvas = document.querySelector('canvas');
canvas.width = 640;
canvas.height = 640;

var context = canvas.getContext('2d');

//Creating variables for directions
var right = { x: 1, y: 0 };
var down = { x: 0, y: 1 };
var left = { x: -1, y: 0 };

var EMPTY = -1;
var BORDER = -2;

var fallingTetromino;
var nextTetromino;

var dim = 640;
var nRows = 18;
var nCols = 12;

//Size of the single mino in the shapes
var minoSize = 30;

var topMargin = 50;
var leftMargin = 20;

//Coordinates for the elements
var scoreX = 400;
var scoreY = 330;

var titleX = 130;
var titleY = 160;

var clickX = 120;
var clickY = 400;

var previewCenterX = 467;
var previewCenterY = 97;

//Colors for the shapes
var colors = {'green','red','blue','purple','orange','blueviolet','magenta'};

//Fonts used for the game (could be set from CSS?)
var mainFont = 'bold 48px monospace';
var smallFont = 'bold 18px monospace';

//Determining the size and location of each element space
var gridRect = {x: 46, y: 47, w: 308, h: 517};
var previewRect = {x: 387, y: 47, w: 200, h: 200};
var titleRect = { x: 100, y: 95, w: 252, h: 100 };
var clickRect = { x: 50, y: 375, w: 252, h: 40 };
var outerRect = { x: 5, y: 5, w: 630, h: 630 };

var squareBorder = 'white';
var titlebgColor = 'white';
var textColor = 'black';
var bgColor = '#DDEEFF';
var gridColor = '#BECFEA';
var gridBorderColor = '#7788AA';

var largeStroke = 5;
var smallStroke = 2;

//Position variables for the falling shapes
var fallingTetrominoRow;
var fallingTetrominoCol;

var keyDown = false;
var fastDown = false;

var grid =  [];
var scoreboard = new Scoreboard();

addEventListener('keydown',function(event){
	
	if(!keyDown){
		keyDown = true;
		
		
	}
}

//Movement functionalities
function canRotate(s){
	if(s === Tetrominos.Square)
		return false;
	
	var pos = new Array(4);
	
	for(var i = 0; i < pos.length; i++){
		pos[i] = s.pos[i].slice();
	}
	
	pos.forEach(function(row){
		var tmp = row[0];
		row[0] = row[1];
		row[1] = -tmp;
	});
	
	return pos.every(function(p){
		var newCol = fallingTetrominoCol + p[0];
		var newRow = fallingTetrominoRow + p[1];
		
		return grid[newRow][newCol] === EMPTY;
	});
}

function rotate(s) {
	if(s === Tetrominos.Square)
		return;
	
	s.pos.forEach(function(row) {
		var tmp = row[0];
		row[0] = row[1];
		row[1] = -tmp;
	});
}

function move(dir){
	fallingTetrominoRow += dir.y;
	fallingTetrominoCol += dir.x;
}

function canMove(s, dir){
	return s.pos.every(function(p){
		var newCol = fallingTetrominoCol + dir.x + p[0];
		var newRow = fallingTetrominoRow + dir.y + p[1];
		
		return grid[newRow][newCol] === EMPTY;
	});
}

function tetrominoHasLanded(){
	addTetromino(fallingTetromino);
	
	if(fallingTetrominoRow < 2){
		scoreboard.setGameOver();
		scoreboard.setTopScore();
	}else {
		scoreboard.addLines(removeLines());
	}
	
	selectTetromino();
}

function removeLines() {
	var count = 0;
	
	for(var r=0; r < nRows -1; r++){
		for(var c=1; c < nCols - 1; c++){
			if(grid[r][c] === EMPTY)
				break;
			if(c === nCols - 2){
				count++;
				removeLine(r);
			}
		}
	}
	
	return count;
}

function removeLine(line){
	
	for(var c = 0; c < nCols; c++){
		grid[line][c] = EMPTY;
	}
	
	for(var c = 0; c < nCols; c++){
		for(var r = line; r > 0; r--)
			grid[r][c] = grid[r-1][c];
	}
}

//Tetromino functionalities
function addTetromino(s){
	s.pos.forEach(function (p){
		grid[fallingTetrominoRow + p[1]][fallingTetrominoCol + p[0]] = s.ordinal;
	});
}

function Tetromino(tetromino, o){
	this.tetromino = tetromino;
	this.pos = this.reset();
	this.ordinal = o;
}

var Tetrominos = {
	ZTetromino: [[0,-1],[0,0],[-1,0],[-1,1]],
	STetromino: [[0,-1],[0,0],[1,0],[1,1]],
	ITetromino: [[0,-1],[0,0],[0,1],[0,2]],
	TTetromino: [[-1,0],[0,0],[1,0],[0,1]],
	Square: [[0,0],[1,0],[0,1],[1,1]],
	LTetromino: [[-1,-1],[0,-1],[0,0],[0,1]],
	JTetromino: [[1,-1],[0,-1],[0,0],[0,1]]
};

function getRandomTetromino(){
	var keys = Object.keys(Tetrominos);
	var ord = Math.floor(Math.random() * keys.length);
	var tetromino = Tetrominos[keys[ord]];
	
	return new Tetromino(tetromino, ord);
}

Tetromino.prototype.reset = function(){
	this.pos = new Array(4);
	
	for(var i=0; i < this.pos.length; i++){
		this.pos[i] = this.tetromino[i].slice();
	}
	
	return this.pos;
}

function selectTetromino(){
	fallingTetrominoRow = 1;
	fallingTetrominoCol = 5;
	
	fallingTetromino = nextTetromino;
	
	nextTetromino = getRandomTetromino();
	
	if(fallingTetromino != null){
		fallingTetromino.reset();
	}
}

//Score functionalities
function Scoreboard(){
	this.MAXLEVEL = 9;
	
	var level = 0;
	var lines = 0;
	var score = 0;
	var topscore = 0;
	var gameOver = true;
	
	this.reset = function(){
		this.setTopScore();
		level = lines = score = 0;
		gameOver = false;
	}
	
	this.setGameOver = function(){
		gameOver = true;
	}
	
	this.isGameOver = function(){
		return gameOver;
	}
	
	this.setTopScore = function(){
		if(score > topscore){
			topscore = score;
		}
	}
	
	this.getTopScore = function(){
		return topscore;
	}
	
	this.getSpeed = function(){
		switch(level){
			case 0: return 700;
            case 1: return 600;
            case 2: return 500;
            case 3: return 400;
            case 4: return 350;
            case 5: return 300;
            case 6: return 250;
            case 7: return 200;
            case 8: return 150;
            case 9: return 100;
            default: return 100;
		}
	}
	
	this.addScore = function(sc){
		score += sc;
	}
	
	this.addLines = function(line){
		
		switch(line){
			case 1:
                this.addScore(10);
                break;
            case 2:
                this.addScore(20);
                break;
            case 3:
                this.addScore(30);
                break;
            case 4:
                this.addScore(40);
                break;
            default:
                return;
		}
		
		lines += line;
		
		if(lines > 10){
			this.addLevel();
		}
	}
	
	this.addLevel = function(){
		
		lines %= 10;
		
		if(level < this.MAXLEVEL){
			level++;
		}
	}
	
	this.getLevel = function(){
		return level;
	}
	
	this.getLines = function(){
		return lines;
	}
	
	this.getScore = function(){
		return score;
	}
}