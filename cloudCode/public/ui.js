/** @jsx React.DOM */

UI = {};

UI.Screen = React.createClass({
	getInitialState: function() {
		return {
			state: "preload"
		};
	},

	setOptions: function(options){
		this.setState({
			state: this.state.state,
			options: options
		});
	},
	
	gotoState: function(state, options){
		this.setState({
			state: state,
			options: options
		});
	},

	render: function() {
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
				contents = 
					<div>
						<h1>Game created!</h1>
						<i>Send this link to a friend and wait for him to join</i>
						<br/>
						<b>{this.state.options.link}</b>
					</div>;		
				break;
			case "game":
				var data = this.state.options.data;
				var opponentID = data.players[(data.players.indexOf(data.myID)+1)%2];
				contents = 
					<div className="game">
						<PlayerPanel id={data.players.indexOf(opponentID)} user_id={opponentID} turn={data.turn==data.players.indexOf(opponentID)} />
						<Board width={data.boardWidth} height={data.boardHeight} squares={data.squares} clickable={data.turn==data.players.indexOf(data.myID)} callback={data.callback}/>
						<PlayerPanel id={data.players.indexOf(data.myID)} user_id={data.myID} turn={data.turn==data.players.indexOf(data.myID)} />
					</div>
				break;
			
		}
		return (
		<div>
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
		if (this.props.id==0) {
			css += "red ";
		} else {
			css += "blue ";
		}
		var name="";
		if (this.state && this.state.name) {
			name = this.state.name;
		}
		return (
		  <div className={css}>
			<img src={"http://graph.facebook.com/"+this.props.user_id+"/picture?height=50"}/>
			<div className="name"><h1>{name}</h1></div>
		  </div>
		);
	}
});


var Board = React.createClass({
	render: function() {
		var width = this.props.width;
		var height = this.props.height;
		var callback = this.props.callback;
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