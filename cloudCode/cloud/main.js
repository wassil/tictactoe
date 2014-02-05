Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
  send_to_pubnub("parse_channel", "sending from parse!");
});


function send_to_pubnub(channel, message) {
	var pubnub = require("cloud/pubnub.js").init({
		publish_key   : "pub-c-48cd8141-7cf1-4c6b-956f-2a801f9b2857",
	});
    pubnub.publish({
        channel : channel,
        message : message
    });
};

/*
var pubnub = require("pubnub").init({
		publish_key   : "pub-c-48cd8141-7cf1-4c6b-956f-2a801f9b2857",
		subscribe_key : "sub-c-bdbb77ee-8e2f-11e3-abcc-02ee2ddab7fe"
	});
*/
