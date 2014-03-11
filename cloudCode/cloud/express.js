var express = require('express');
var CryptoJS = require("cloud/lib/crypto.js").Crypto;
var Config = require("cloud/config.js").Config;
var Util = require("cloud/utils.js").Util;

var app = express();


var indexPage = '/canvas.html';

app.use(express.bodyParser());

app.all('/fb', function(req, res) {
	console.log("my endpoint");
	if (req.body && req.body['signed_request']) {
		if (!verifySignedRequest(req.body['signed_request'])){
			res.send("unauthorized");
			return;
		}
		var srJSON = parseSignedRequest(req.body['signed_request']);
		console.log(srJSON);
		if (srJSON.user_id) {
			//we have user at this point, we can create a token for him - that is what he is supposed to use for communication
			//TODO use one time tokens
			var redirect = indexPage + '?id='+srJSON.user_id+"&token="+Util.getTokenForUser(srJSON.user_id)+"&fb_object="+req.body['signed_request'].split(".")[1];
			if (req.query.fb_source == "gameinvite") {
				redirect += "&fb_source=gameinvite&invite_id=" + req.query.invite_id;
			}
			res.redirect(redirect);
		} else {
			var login_url = 'https://www.facebook.com/dialog/oauth?client_id='+Config.APP_ID+'&redirect_uri='+escape(Config.APP_URI+"?invite_id="+req.query.invite_id)+'';
			res.send("<script>top.location.href='"+login_url+"'</script>");
		}
	}
	else {
		res.send("unauthorized");
	}
});

app.listen();

//returns json object
function parseSignedRequest(sr) {
	var parts = sr.split(".");
	return JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse( parts[1] )));
}

function verifySignedRequest(sr) {
	var parts = sr.split(".");
	var hash = CryptoJS.HmacSHA256(parts[1], Config.APP_SECRET);
	var calc = CryptoJS.enc.Base64.stringify(hash).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/,'');
	console.log("calculated: "+ calc);	
	console.log("server: "+ parts[0]);
	return calc==parts[0];
}
