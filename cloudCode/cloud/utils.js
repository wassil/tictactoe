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


exports.Util = Util;

