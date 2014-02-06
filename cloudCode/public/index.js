var conn;

var screen;

var gameID;

function init() {
	screen = UI.Screen({});
	React.renderComponent(screen,document.getElementById('main'));
	conn = new Connector();
	Util.facebookLogin(function (data) {conn.connect(data.authResponse.userID, onConnected, function(e){console.log(e)});});
}

function onConnected() {
	console.log("connected!");
	
	if (Util.getSearchParameters().invite){
		console.log("invite is there");
		conn.call(
			"join", 
			{invite:Util.getSearchParameters().invite}, 
			function(data){}, 
			function(){}
		);
		conn.setMessageCallback(onInitMessage);
	} else {
		screen.gotoState("create", {callback:onStart});
	}
}

function onStart() {
	conn.call(
		"start", 
		{}, 
		function(data){
			var link = "tictactoe.parseapp.com/?invite=" + data.id;
			screen.gotoState("wait", {link:link});
		}, 
		function(){}
	);
	conn.setMessageCallback(onInitMessage);
}

function onInitMessage(m) {
	var data = Util.decodePubNub(m);
	gameID = data.id;
	data.myID = conn.getID();
	conn.setMessageCallback(onMoveMessage);
	data.callback = onPlayerMove;
	screen.gotoState("game", {data:data, blocked:false});
}

function onMoveMessage(m) {
	var data = Util.decodePubNub(m);
	data.myID = conn.getID();
	data.callback = onPlayerMove;
	screen.setOptions({data:data, blocked:false});
}

function onPlayerMove(i,j) {
	screen.setOptions({blocked:true});
	conn.call(
		"turn", 
		{
			game:gameID,
			i:i,
			j:j
		}, 
		function(data){}, 
		function(){}
	);
}


