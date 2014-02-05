/** @jsx React.DOM */

UI = {};

UI.init = function(){
	React.renderComponent(
		<h1>Hello, world!</h1>,
		document.getElementById('main')
	);
}

UI.renderButton = function(label, callback, div) {
	React.renderComponent(
		<button onClick={callback}>{label}</button>,
		document.getElementById(div)
	);
}



var Board = React.createClass({
  render: function() {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});