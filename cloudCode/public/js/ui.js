/** @jsx React.DOM */

UI = {};

UI.Screen = React.createClass({
	getInitialState: function() {
		return {
			state: "preload"
		};
	},

	setOptions: function(options){
		var state = this.state;
		for (var prop in options) {
			if(options.hasOwnProperty(prop)){
				state.options[prop] = options[prop];
			}
		}
		this.setState(state);
	},
		
	gotoState: function(state, options){
		this.setState({
			state: state,
			options: options
		});
	},

	render: function() {
		var top;
		var contents;
		switch(this.state.state){
			case "preload":
				contents = <h1>Loading!</h1>;
				break;
			case "create":
				contents = 
					<div>
						<h1>Create new game!</h1>
						<button onClick={this.state.options.callback}>CREATE</button>
					</div>;		
				break;
			case "wait":
				top = <button onClick={this.state.options.callback}>{"<< "}BACK</button>;
				contents = 
					<div>
						<h1>Game created!</h1>
						<i>Please wait for your friend</i>
						<br/>
					</div>;		
				break;
			case "game":
				top = <button onClick={this.state.options.callback}>{"<< "}BACK</button>;
				var data = this.state.options.data;
				var myID = data.myID;
				var myPlayerID = data.players.indexOf(data.myID);
				var opponentPlayerID = (myPlayerID + 1) % 2;
				var opponentID = data.players[opponentPlayerID];
				
				var blocked = false;
				if (this.state.options.blocked || data.winner!=-1) {
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
		return (
		<div>
			{top}
			{contents}
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