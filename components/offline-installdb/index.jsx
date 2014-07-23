/** @jsx React.DOM */
var Kde=Require("ksana-document").kde;
var Kse=Require("ksana-document").kse;
var html5fs=Require("ksana-document").html5fs;
//var othercomponent=Require("other"); 
var filelist= React.createClass({
  showfile:function(e) {
    return <div key={e.name}>{e[0]} 
        <button key={"del-"+e.name} onClick={this.deleteFile} data-url={e[1]}>Delete</button>
        <button key={"btn-"+e.name} onClick={this.openFile} data-url={e[1]}>Open</button>
    </div>
  },
  openFile:function(e) {
    var url=e.target.attributes["data-url"].value;
    this.props.action("open",url);
  },
  deleteFile:function( e) {
    var url=e.target.attributes["data-url"].value;
    this.props.action("delete",url);
  },
  render:function() {
    if (!this.props.files || !this.props.files.length) return <div key="fl">no files</div>
    return <div>
          {this.props.files.map(this.showfile)}
      </div>
  }
});


var installdb = React.createClass({
  getInitialState: function() {
    return {bar: "world",downloading:false,progress:0};
  },
  deleteFile:function(filesystemPath) {
    html5fs.rm(filesystemPath,this,function(){
      this.readDirectories();
    });
  },
  openFile:function(filesystemPath) {
    var that=this;
    Kde.openLocal(filesystemPath,function(engine){
      console.time("search")
      Kse.search(engine,"པའི",{},function(Q){
        that.setState({error:"raw "+Q.rawresult.length})
        console.timeEnd("search")
      })
    }); 
  },
  initFS:function() {
    html5fs.init(1024*1024*512,this,function(fs,bytes){
      this.setState({fssize:bytes});
      this.readDirectories();
    });
  },
  componentDidMount:function() {
    this.initFS();
  },
  action:function() {
    var args = Array.prototype.slice.call(arguments);
    var type=args.shift();
    var res=null, that=this;
    if (type=="delete") {
      this.deleteFile(args[0]);
    } else if (type=="open") {
      this.openFile(args[0]);
    }
  },
  readDirectories:function() {
    html5fs.readdir(this,function(files){this.setState({files:files})});
  },
 
  addFiles:function(e) {
    var that=this;
    for (var i = 0, file; file = e.target.files[i]; ++i) {
      // Capture current iteration's file in local scope for the getFile() callback.
      (function(f) { 
        var filename = file.name.replace(/\s/g, '_');
        html5fs.writeFile(filename,f,this,function(){
          this.readDirectories();
        }); 
      })(file);
    }    
  },     
  download:function() { 
    var url=this.refs.url.getDOMNode().value;
    var filename=url.substr(url.lastIndexOf("/")+1);
    this.setState({downloading:true,progress:0});
    html5fs.download(url,filename,this,function(){
      this.setState({downloading:false,progress:1});
      this.readDirectories();
    },function(progress){
      this.setState({progress:progress});
    })
  },
  showProgress:function() {
     if (this.state.downloading) {
      var progress=Math.round(this.state.progress*100);
      return (
      <div key="progress" className="progress">
          <div className="progress-bar" role="progressbar" 
              aria-valuenow={progress} aria-valuemin="0" 
              aria-valuemax="100" style={{width: progress+"%"}}>
            {progress}%
          </div>
        </div>
        );
      } else {
        return <button onClick={this.download}>download</button>
      }
  },
  render: function() {
    return (
      <div>
        <input onChange={this.addFiles} type="file" id="files" multiple="true" className="button" accept=".kdb"></input>
        <filelist action={this.action} files={this.state.files}/>
        <div>
          <div className="col-md-4">
              <input ref="url" defaultValue='cbeta.kdb'></input>
            {this.showProgress()}
            </div>
        </div>
      </div>
    );
  }
});
module.exports=installdb;