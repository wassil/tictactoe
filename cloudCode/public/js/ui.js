/** @jsx React.DOM */

UI = {};

UI.Screen = React.createClass({
	getInitialState: function() {
		//react state has to be object
		return {state:"preload"};
	},

	gotoState: function(state, props) {
		this.replaceProps(props);
		this.setState({state:state});
	},

	render: function() {
		var top;
		var contents;
		switch(this.state.state){
			case "preload":
				contents = <h1>Loading!</h1>;
				break;
			case "create":
				var onlineFriends = null;
				if (this.props.friendsOnline) {
					onlineFriends = <h3>You have friends who play this online</h3>;
				} else {
					onlineFriends = <h3>None of your friends who play this are online</h3>;
				}
				var callback = function(data) {};
				contents = 
					<div>
						<h1>Create new game!</h1>
						{onlineFriends}
						<button onClick={this.props.callback}>CREATE</button>
					</div>;	
				break;
			case "wait":
				top = <button onClick={this.props.callback}>{"<< "}BACK</button>;
				var status = "";
				switch (this.props.syncRequestStatus) {
					case Config.RequestStates.PENDING:
						status = 
							<div>
								<i>Please wait for your friend</i>
								<Timer timeout={this.props.timeout} />
							</div>;
						break;
					case Config.RequestStates.ACCEPTED:
						status = <div>Request was accepted.</div>;
						break;
					case Config.RequestStates.REJECTED:
						status = <div>Request was rejected.</div>;
						break;
					case Config.RequestStates.EXPIRED:
						status = <div>Request has expired.</div>;
						break;					
				}
				contents = 
					<div>
						<h1>Game created!</h1>
						<br/>
						{status}
					</div>;		
				break;
			case "game":
				top = <button onClick={this.props.callback}>{"<< "}BACK</button>;
				var data = this.props.data;
				var myID = data.myID;
				var myPlayerID = data.players.indexOf(data.myID);
				var opponentPlayerID = (myPlayerID + 1) % 2;
				var opponentID = data.players[opponentPlayerID];
				
				var blocked = false;
				if (this.props.blocked || data.winner!=-1) {
					blocked = true;
				}				
				contents = 
					<div className="game">
						<PlayerPanel playerID={opponentPlayerID} user_id={opponentID} turn={data.turn==opponentPlayerID && !blocked} winner={data.winner}/>
						<Board width={data.boardWidth} height={data.boardHeight} squares={data.squares} clickable={data.turn==myPlayerID && !blocked} callback={data.callback}/>
						<PlayerPanel playerID={myPlayerID} user_id={myID} turn={data.turn==myPlayerID && !blocked} winner={data.winner}/>
					</div>;
				break;
			
		}
		var debug = 
			<DebugData />;
		return (
		<div>
			{top}
			{contents}
			{debug}
		</div>
		);
	}
});

var PlayerPanel = React.createClass({
	componentWillMount: function(){
		FB.api(
			"/"+this.props.user_id,
			function (response) {
				if (response && !response.error) {
					this.setState({name:response.first_name});
				}
			}.bind(this)
		);
	},
	
	render: function() {
		var css = "playerPanel ";
		if (this.props.turn) {
			css += "turn ";
		}
		if (this.props.playerID==0) {
			css += "red ";
		} else {
			css += "blue ";
		}
		var name="";
		if (this.state && this.state.name) {
			name = this.state.name;
		}
		var result="";
		if (this.props.winner!="-1"){
			if  (this.props.winner==this.props.playerID){
				result=" WON!";
			} else {
				result=" LOST!";
			}
		}
		return (
		  <div className={css}>
			<img src={"http://graph.facebook.com/"+this.props.user_id+"/picture?height=50"}/>
			<div><h3>{name}{" "}{result}</h3></div>
		  </div>
		);
	}
});

var Timer = React.createClass({
	componentWillMount: function () {
		this.interval = setInterval(function(){this.setState({time: Math.max(0, this.state.time - 1)});}.bind(this), 1000);
		this.setState({time: this.props.timeout});
	},

	componentWillUnmount: function () {
		clearInterval(this.interval);
	},

	render: function() {
		return (
			<div>
				{this.state.time}
			</div>
		);
	}
});

var Board = React.createClass({
	render: function() {
		var width = this.props.width;
		var height = this.props.height;
		var callback = this.props.callback;
		if (!this.props.clickable) {
			callback = function(){};
		}
		var tableContents = [];
		for (var i=0;i<height;i++){
			row = [];
			for (var j=0;j<width;j++) {
				row.push(
					<Square 
						value={this.props.squares[i*width+j]} 
						clickable={this.props.clickable} 
						callback={function (i,j){return function(){callback(i,j);};}(i,j)}
					/>
				);
			}
			tableContents.push(<tr>{row}</tr>);
		}
		return (
			<div className="board">
				<table>
					{tableContents}
				</table>
			</div>
		);
	}
});

var Square = React.createClass({
	render: function() {
		var className = "square ";
		var onClick = function() {};
		switch(this.props.value) {
			case 0: 
				className += "red "; 
				break;
			case 1: 
				className += "blue "; 
				break;
			case -1: 
				if (this.props.clickable) {
					className += "clickable ";
					onClick = function(){this.props.callback();}.bind(this);
				}		
				break;
		}
		return (
			<td className={className} onClick={onClick}></td>
		);
	}
});

var DebugData = React.createClass({
	render: function() {
		var jssdkURL = document.getElementById("facebook-jssdk").src;
		var sdkLoc = "JS SDK location: " + jssdkURL.split('.')[1] + '.' + jssdkURL.split('.')[2];
		return (
			<div className="debug">{sdkLoc}</div>
		);
	}
});

