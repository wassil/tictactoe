function init() {
	//console.log("hello world!");
	//test_parse();
	test_pubnub();
}

function test_parse() {
	Parse.initialize("b9JzrHEkEQ4Gf1Q95vPzJR4nwPkejKyZ7fZEqTqA", "mDou2tcnM5zWlYJa3xBdwi3CxYLbKjb7pMyAg8Zc");
	Parse.Cloud.run('hello', {}, {
	  success: function(result) {
		console.log(result);
	  },
	  error: function(error) {
		console.log("parse error: "+error);
	  }
	});
}

function test_pubnub() {
	PUBNUB.subscribe({
        channel : "parse_channel",
        message : onMessage
    });
    // SEND TEXT MESSAGE
    PUBNUB.publish({
		channel : "parse_channel",
		message : "testing testing, can you hear me?",
	});
}

function onMessage(m) {
	console.log(m);
}