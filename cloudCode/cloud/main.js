require('cloud/express.js');
var Util = require("cloud/utils.js").Util;
	
//TODO anybody can cheat server by sending userID, I should check if they really are connected to facebook
Parse.Cloud.define("connect", function(request, response) {
	if (!Util.checkToken(request.params.token, request.params.id)){
		response.error("token doesn't match");
		return;
	}
	var channelID = Util.getChannel(request.params.id);
	response.success({channelID:channelID});
});

Parse.Cloud.define("start", function(request, response) {
	if (!Util.checkToken(request.params.token, request.params.id)){
		response.error("token doesn't match");
		return;
	}
	var game = require("cloud/game.js").Game.create(request.params.id);
	game.save(null, {
		success: function(game) {
			response.success({id:game.id});
		},
		error: function(game, error){
			console.log("error saving game: "+error.description);
			response.error("error saving game: "+error.description);
		}
	});
});

Parse.Cloud.define("join", function(request, response) {
	if (!Util.checkToken(request.params.token, request.params.id)){
		response.error("token doesn't match");
		return;
	}
	if (!request.params.invite){
		response.error("you have to provide invite id");	
		return;
	}
	var query = new Parse.Query(require("cloud/game.js").Game);
	query.include("board");
	query.get(request.params.invite, {
		success: function(game) {
			if (!game.canJoin()){
				response.error("cannot join game with invite id " + request.params.invite);
			}
			game.join(request.params.id);
			game.save(null, {
				success: function (game) {
					sendGameDataToPlayers(game);
					response.success("ok, game data will come shortly");
				}
			}
			);
		},
		error: function(game, error) {
			response.error("error loading game with invite id " + request.params.invite);
		}
	});
});

Parse.Cloud.define("turn", function(request, response) {
	if (!Util.checkToken(request.params.token, request.params.id)){
		response.error("token doesn't match");
		return;
	}
	if (!request.params.game){
		response.error("you have to provide game id");	
		return;
	}
	var query = new Parse.Query(require("cloud/game.js").Game);
	query.include("board");
	query.get(request.params.game, {
		success: function(game) {
			var board = game.getBoard();
			if (game.getPlayers().indexOf(request.params.id) != game.getWhoseTurn()){
				response.error("not your turn in game id " + request.params.invite);
				return;
			}
			if (board.getSquare(request.params.i,request.params.j)!=-1){
				response.error("square not empty");
				return;
			}
			board.setSquare(request.params.i,request.params.j,game.getPlayers().indexOf(request.params.id));
			game.nextTurn();
			var winner = board.checkForWinner();
			if (winner!=-1){
				game.setWinner(winner);
			}
			game.save(null, {
				success: function (game) {
					sendGameDataToPlayers(game);
					response.success("ok, game data will come shortly");
				},
				error:  function(game, error) {
					response.error("error saving game " + error.description);
				}
			});			
		},
		error: function(game, error) {
			response.error("error loading game with invite id " + request.params.invite);
		}
	});
});

function sendGameDataToPlayers(game) {
	var data = {};
	var board = game.getBoard();
	data.id = game.id;
	data.players = game.getPlayers();
	data.turn = game.getWhoseTurn();
	data.boardWidth = board.getWidth();
	data.boardHeight = board.getHeight();
	data.squares = board.getSquares();
	data.winner = game.getWinner();
	
	var msg = JSON.stringify(data);
	msg = msg.replace(new RegExp('"', 'g'), "'");
	msg = escape(msg);
	
	Util.sendToPubnub(Util.getChannel(game.getPlayers()[0]),msg);
	Util.sendToPubnub(Util.getChannel(game.getPlayers()[1]),msg);
}
