var Config = require("cloud/config.js").Config;
var CryptoJS = require("cloud/lib/crypto.js").Crypto;

var Util = {};


Util.getTokenForUser = function (id) {
	return CryptoJS.HmacSHA256(id, Config.APP_SECRET).toString();
}

Util.checkToken = function (token, id) {
	return Util.getTokenForUser(id) == token;
}

Util.getChannel = function (id) {
	return Util.getTokenForUser(id);
}


Util.sendToPubnub = function (channel, message) {
	var publish_key = Config.PUBNUB_PUBLISH_KEY;
	var subscribe_key = Config.PUBNUB_SUBSCRIBE_KEY;
	var url = "http://ps5.pubnub.com/publish/"+publish_key+"/"+subscribe_key+"/0/"+channel+"/0/%22"+message+"%22";
	Parse.Cloud.httpRequest({
		url: url,
		success: function(httpResponse) {
		},
		error: function(httpResponse) {
			console.log('Request failed with response code ' + httpResponse.status);
		}
	});
};


exports.Util = Util;

