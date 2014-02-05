var conn;
function init() {
	conn = new Connector();
	facebook_login(function (id) {conn.connect(id, onMessage, onConnected, function(e){console.log(e)});});
}

function onConnected() {
	console.log("connected!");
	UI.renderButton("ping", function(){conn.call("ping", {}, function(){}, function(){})}, "main");
}

function onMessage(m) {
	console.log(m);
}

// my fb id 100000878348460 
function facebook_login(callback) {
	FB.init({
		appId      : '275850555903618',
		status     : true,
		xfbml      : true
	});
	FB.login(function(data){onFBLogin(data, callback);}, {scope: ''});
}

function onFBLogin(data, callback) {
	callback(data.authResponse.userID);
}