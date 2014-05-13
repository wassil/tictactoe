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
}

function onConnected() {
	console.log("connected!");
	
	if (Util.getSearchParameters().invite_id){
		conn.setMessageCallback(onInitMessage);
		conn.call(
			"join", 
			{invite_id:Util.getSearchParameters().invite_id}, 
			function(data){}, 
			function(error){
				console.log("cannot join: "+error.message);
				gotoCreate();
			}
		);
	} else {
		gotoCreate();
	}
}

function gotoCreate() {
	screen.gotoState("create", {callback:onStart, friendsOnline:false});

	FB.Event.subscribe(
		'canvas.presenceUpdated',
		function(data) {
			console.log("canvas.presenceUpdated");
			console.log(data);
			screen.setProps({friendsOnline:data});
		}
	);

	FB.Canvas.areFriendsOnline(
		function (result) {
			console.log("getOnlineFriendsCount");
			console.log(result);
			screen.setProps({friendsOnline:result});
		}
	);

}

function onStart() {
	FB.ui(
		{
			method: 'sync_app_invite',
			timeout: 120,
			display: 'dialog'
		},
		onInviteSent
	);
	conn.setMessageCallback(onInitMessage);
}

function onInviteSent(data) {
	if (!data.invite_id) {
		return;
	}
	conn.call(
		"start", 
		{
			invite_id:String(data.invite_id)
		}, 
		function(data){
			var link = Util.getCanvasGameURL()+"?invite=" + data.id;
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


