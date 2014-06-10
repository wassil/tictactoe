var conn;
var screen;
var gameID;

function init() {
	if (!Util.getSearchParameters().id || !Util.getSearchParameters().token) {
		console.log("hack the planet!");
		return;
	}
	console.log(Util.parseFBObject(Util.getSearchParameters().fb_object));
	FB.init({
		appId      : Config.APP_ID,
		status     : true,
		xfbml      : true,
		authResponse: Util.parseFBObject(Util.getSearchParameters().fb_object)
    });

	screen = UI.Screen({});
	React.renderComponent(screen, document.getElementById('main'));
	conn = new Connector();
	conn.connect(Util.getSearchParameters().id, Util.getSearchParameters().token, onConnected, function(e){console.log(e)});
	console.log('access token: ' + Util.getSearchParameters().token);
}

function onConnected() {
	console.log("connected!");
	if (Util.getSearchParameters().request_id){
		conn.setMessageCallback(onInitMessage);
		console.log("calling join");
		conn.call(
			"join", 
			{request_id:Util.getSearchParameters().request_id}, 
			function(data){}, 
			function(error){
				console.log("cannot join: "+error.message);
				gotoCreate();
			}
		);
	} else {
		gotoCreate();
	}
	FB.Event.subscribe(
		'canvas.friendsOnlineUpdated',
		function(data) {
			console.log("canvas.friendsOnlineUpdated");
			console.log(data);
			screen.setProps({friendsOnline:data});
		}
	);
	FB.Event.subscribe(
		'canvas.syncRequestUpdated',
		function(data) {
			console.log("canvas.syncRequestUpdated");
			console.log(data);
		}
	);
	
}

function gotoCreate() {
	screen.gotoState("create", {callback:onStart, friendsOnline:false});
}

function onStart() {
	FB.ui(
		{
			method: 'sync_request',
			timeout: 30
		},
		onRequestSent
	);
	conn.setMessageCallback(onInitMessage);
}

function onRequestSent(data) {
	console.log('Request sent.');
	console.log(data);
	if (!data || !data.request_id) {
		return;
	}
	conn.call(
		"start", 
		{
			request_id:String(data.request_id)
		}, 
		function(data){
			var link = Util.getCanvasGameURL()+"?request=" + data.id;
			//TODO timeout isn't used
			screen.gotoState("wait", {timeout:120, callback:gotoCreate});
		}, 
		function(error){
			console.log("cannot start: "+error.message);
		}
	);
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
	screen.setProps({data:data, blocked:false});
}

function onPlayerMove(i,j) {
	screen.setProps({blocked:true});
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


