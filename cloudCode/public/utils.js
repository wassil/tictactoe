Util = {};

Util.getSearchParameters = function() {
	function transformToAssocArray( prmstr ) {
		var params = {};
		var prmarr = prmstr.split("&");
		for ( var i = 0; i < prmarr.length; i++) {
			var tmparr = prmarr[i].split("=");
			params[tmparr[0]] = tmparr[1];
		}
		return params;
	}
    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

//there probably isn't a reasonable way to do this becasue of security
Util.getCanvasGameURL = function() {
	return Config.APP_URI;
}


// my fb id 100000878348460 
Util.facebookLogin = function(callback) {
	FB.init({
		appId      : '275850555903618',
		status     : true,
		xfbml      : true
	});
	FB.login(function(data){callback(data)}, {scope: ''});
}

Util.decodePubNub = function (m) {
	var data = unescape(m);
	data = data.replace(new RegExp("'", 'g'), '"');	
	data = JSON.parse(data);
	return data;
}
