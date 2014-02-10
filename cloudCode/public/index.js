var conn;
var screen;
var gameID;

function init() {
	if (!Util.getSearchParameters().id || !Util.getSearchParameters().token) {
		console.log("hack the planet!");
		return;
	}
	screen = UI.Screen({});
	React.renderComponent(screen, document.getElementById('main'));
	conn = new Connector();
	conn.connect(Util.getSearchParameters().id, Util.getSearchParameters().token, onConnected, function(e){console.log(e)});
}

function onConnected() {
	console.log("connected!");
	if (Util.getSearchParameters().invite){
		conn.call(
			"join", 
			{invite:Util.getSearchParameters().invite}, 
			function(data){}, 
			function(error){
				console.log("cannot join: "+error.message);
				gotoCreate();
			}
		);
		conn.setMessageCallback(onInitMessage);
	} else {
		gotoCreate();
	}
}

function gotoCreate(){
	screen.gotoState("create", {callback:onStart});
}

function onStart() {
	conn.call(
		"start", 
		{}, 
		function(data){
			var link = Util.getCanvasGameURL()+"?invite=" + data.id;
			screen.gotoState("wait", {link:link, callback:gotoCreate});
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
	screen.gotoState("game", {data:data, blocked:false, callback:gotoCreate});
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


