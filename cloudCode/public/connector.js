function Connector() {
	Parse.initialize("b9JzrHEkEQ4Gf1Q95vPzJR4nwPkejKyZ7fZEqTqA", "mDou2tcnM5zWlYJa3xBdwi3CxYLbKjb7pMyAg8Zc");
	this._pubnub = PUBNUB.init({
		publish_key: 'pub-c-48cd8141-7cf1-4c6b-956f-2a801f9b2857',
		subscribe_key: 'sub-c-bdbb77ee-8e2f-11e3-abcc-02ee2ddab7fe'
	});
};

/**
 * Connects to parse, which returns channel id that is used to connect to pubnub
 **/
Connector.prototype.connect = function (id, token, successCallback, errorCallback) {
	console.log("connecting using id "+id);
	console.log("connecting using token "+token);
	this._id = id;
	this._token = token;
	this._connectParse(
		id, 
		function(result){
			this._connectPubNub(
				result.channelID, 
				successCallback,
				errorCallback
			);
		}.bind(this),
		errorCallback
	);
}

Connector.prototype._connectParse = function(id, successCallback, errorCallback) {
	this.call(
		'connect', 
		{id:id},
		function(result) {
			successCallback(result);
		},
		function(error) {
			errorCallback("cannot connect to parse: "+error);
		}
	);
}

Connector.prototype._connectPubNub = function(channel, successCallback, errorCallback) {
	this._pubnub.subscribe({
		channel : channel,
		message : this._onMessage.bind(this)
	});
	successCallback();
}

Connector.prototype.call = function(method, params, success, error) {
	console.log("calling parse method: "+method);
	params.id = this._id;
	params.token = this._token;
	Parse.Cloud.run(
		method, 
		params, 
		{
			success: success,
			error: error
		}
	);
}

Connector.prototype.setMessageCallback = function(callback) {
	this._messageHandler = callback;
}

Connector.prototype._onMessage = function(m){
	if (this._messageHandler) {
		this._messageHandler(m);
	}
}

Connector.prototype.getID = function() {
	return this._id;
}
