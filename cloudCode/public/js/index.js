var conn;
var screen;
var gameID;
var requestID;

function init() {
	if (!Util.getSearchParameters().id || !Util.getSearchParameters().token) {
		console.log("hack the planet!");
		return;
	}
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
}

function onConnected() {
	if (Util.getSearchParameters().request_id){
		conn.setMessageCallback(onInitMessage);
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
			screen.setProps({friendsOnline:data});
		}
	);
	FB.Event.subscribe(
		'canvas.syncRequestUpdated',
		function(data) {
			console.log("canvas.syncRequestUpdated");
			console.log(data);
			if (requestID == data.id) {
				screen.setProps({syncRequestStatus:data.status});
			}
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
			timeout: Config.REQUEST_TIMEOUT
		},
		onRequestSent
	);
	conn.setMessageCallback(onInitMessage);
}

function onRequestSent(data) {
	if (!data || !data.request_id) {
		return;
	}
	requestID = data.request_id;
	conn.call(
		"start", 
		{
			request_id:String(data.request_id)
		}, 
		function(data){
			var link = Util.getCanvasGameURL() + "?request=" + data.id;
			screen.gotoState(
				"wait", 
				{
					syncRequestStatus: Config.RequestStates.PENDING, 
					timeout: Config.REQUEST_TIMEOUT, 
					callback: cancelRequest
				}
			);
		}, 
		function(error){
			console.log("cannot start: " + error.message);
		}
	);
}

function cancelRequest() {
	FB.api(
		'/'+requestID,
		'post',
		{status: Config.RequestStates.CANCELED},
		function (response) {
		  if (response && !response.error) {
			console.log(response);
			gotoCreate();
		  }
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
