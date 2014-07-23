/** @jsx React.DOM */

var installdb=Require("installdb"); 

var main = React.createClass({
  getInitialState: function() {
    return {bar: "world23", online: this.online() };
  },
  online:function() {
    return navigator.onLine; 
  },
  action:function() {
    var args = Array.prototype.slice.call(arguments);
    var type=args.shift();
    var res=null, that=this;
  },
  render: function() {
    return ( 
      <div>
        {this.state.online}
        <installdb action={this.action} />
      </div>
    );
  }
});
module.exports=main;