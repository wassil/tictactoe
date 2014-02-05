
//TODO anybody can cheat server by sending userID, I should check if they really are connected to facebook
Parse.Cloud.define("connect", function(request, response) {
	var channelID = get_channel(request.params.id);
	response.success({channelID:channelID});
});

Parse.Cloud.define("ping", function(request, response) {
	send_to_pubnub(get_channel(request.params.id), "pong");
	response.success("ok");
});

function get_channel(id) {
	var secret = "wow much secret so such secure";	
	//return require("cloud/sha1.js").hash(id + secret);
	return id;
}

function send_to_pubnub(channel, message) {
	var publish_key = "pub-c-48cd8141-7cf1-4c6b-956f-2a801f9b2857";
	var subscribe_key = "sub-c-bdbb77ee-8e2f-11e3-abcc-02ee2ddab7fe";
	var url = "http://ps5.pubnub.com/publish/"+publish_key+"/"+subscribe_key+"/0/"+channel+"/0/%22"+message+"%22";
	Parse.Cloud.httpRequest({
		url: url,
		success: function(httpResponse) {
		},
		error: function(httpResponse) {
			console.error('Request failed with response code ' + httpResponse.status);
		}
	});
};

/*
var pubnub = require("cloud/pubnub.js").init({
		publish_key   : "pub-c-48cd8141-7cf1-4c6b-956f-2a801f9b2857",
		subscribe_key : "sub-c-bdbb77ee-8e2f-11e3-abcc-02ee2ddab7fe"
	});
*/
