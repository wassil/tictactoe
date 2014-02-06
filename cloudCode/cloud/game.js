var Board = Parse.Object.extend("Board", {
	getWidth: function () {
		return this.get("width");
	},	
	
	getHeight: function () {
		return this.get("width");
	},
	
	getSquare: function(i,j) {
		return this.get("squares")[i*this.getWidth()+j];
	},
	
	getSquares: function() {
		return this.get("squares");
	},
	
	//-1=empty, 0=creator, 1=joiner
	setSquare: function(i,j,v) {
		var squares = this.get("squares");
		squares[i*this.getWidth()+j] = v;
		this.set("squares", squares);
	}
}, {
	create: function (width, height){
		var board = new Board();
		board.set("width", width);
		board.set("height", height);
		var squares = [];
		for (var i=0;i<width;i++) for (var j=0;j<height;j++) squares.push(-1);
		board.set("squares", squares);
		return board;
	}
});

var Game = Parse.Object.extend("Game", {
	canJoin: function() {
		return !this.get("joiner");
	},
	
	join: function(joiner) {
		this.set("joiner", joiner);
	},
	
	getBoard: function() {
		return this.get("board");
	},
	
	//0=creator, 1=joiner
	getWhoseTurn: function() {
		return this.get("turn");
	},
	
	nextTurn: function() {
		this.set("turn", (this.getWhoseTurn() + 1) % 2);
	},
	
	getPlayers: function() {
		return [this.get("creator"), this.get("joiner")];
	}
}, {
	create: function(creatorID) {
		var game = new Game();
		game.get("full", false);
		game.set("turn", 0);
		game.set("creator",creatorID);
		game.set("joiner","");
		game.set("board", Board.create(10,10));
		return game;
	}
});

exports.Board = Board;
exports.Game = Game;
