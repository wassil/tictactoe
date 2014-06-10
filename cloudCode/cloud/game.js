var Board = Parse.Object.extend("Board", {
	getWidth: function () {
		return this.get("width");
	},	
	
	getHeight: function () {
		return this.get("width");
	},
	
	getSquare: function(i,j) {
		if (i<0 || j<0 || i>=this.getHeight() || j>=this.getWidth()) return null;
		return this.get("squares")[i*this.getWidth()+j];
	},
	
	getSquares: function() {
		return this.get("squares");
	},
	
	getToWin: function() {
		return this.get("toWin");
	},
	
	//-1=no one, 0=creator, 1=joiner
	checkForWinner: function() {
		//directions I check
		var dirs = [[0,-1],[-1,-1],[-1,0],[-1,1]];
		var w = this.getWidth();
		var h = this.getHeight();
		var a = new Array();
		for (var i=0; i<h; i++) {
			a.push(new Array());
			for (var j=0; j<w; j++) {
				a[i][j] = new Array();
				for (var k=0; k<dirs.length; k++){
					a[i][j].push(0);
					if(this.getSquare(i,j) != -1){
						a[i][j][k]++;
						if (this.getSquare(i+dirs[k][0], j+dirs[k][1]) == this.getSquare(i,j)) {
							a[i][j][k] += a[i+dirs[k][0]][j+dirs[k][1]][k];
						}
					}
					if (a[i][j][k] == this.getToWin()) {
						return this.getSquare(i,j);
					}
				}
			}
		}
		return -1;
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
		board.set("toWin", 5);
		var squares = [];
		for (var i=0;i<height;i++) for (var j=0;j<width;j++) squares.push(-1);
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
	},
	
	getWinner: function() {
		return this.get("winner");
	},
	
	setWinner: function(w) {
		this.set("winner", w);
	},
	
	getRequestID: function() {
		return this.get("request_id");
	}

	
}, {
	create: function(requestID, creatorID) {
		var game = new Game();
		game.get("full", false);
		game.set("turn", 0);
		game.set("request_id", requestID);
		game.set("creator", creatorID);
		game.set("joiner","");
		game.set("winner",-1);
		game.set("board", Board.create(10,10));
		return game;
	}
});

exports.Board = Board;
exports.Game = Game;
