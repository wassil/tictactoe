var express = require('express');
var CryptoJS = require("cloud/lib/crypto.js").Crypto;
var Config = require("cloud/config.js").Config;
var Util = require("cloud/utils.js").Util;

var app = express();


var indexPage = '/canvas.html'; // This can not be index.html because that one would be catched by the '/' rule below

app.use(express.bodyParser());

app.all('/', function(req, res) {
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
			var redirect = indexPage + '?id='+srJSON.user_id+"&token="+Util.getTokenForUser(srJSON.user_id);
			if (req.query.invite) {
				redirect += "&invite="+req.query.invite;
			}
			res.redirect(redirect);
		} else {
			var redirect_url = Config.APP_URI;
			if (req.query.invite) {
				redirect_url += "?invite=" + req.query.invite;
			}
			var login_url = 'https://www.facebook.com/dialog/oauth?client_id='+Config.APP_ID+'&redirect_uri='+escape(redirect_url)+'';
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
