/** @jsx React.DOM */
var Kde=Require("ksana-document").kde;
var Kse=Require("ksana-document").kse;
//var othercomponent=Require("other"); 
var filelist= React.createClass({
  showfile:function(e) {
    return <div key={e.name}>{e[0]} <button onClick={this.deleteFile} data-url={e[1]}>Delete</button>
    <button onClick={this.openFile} data-url={e[1]}>Open</button>
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
    return <div key="fl">{this.props.files.map(this.showfile)}</div>
  }
});

var remoteFile=React.createClass({
  getInitialState:function() {
    return {downloading:false}
  },
  addRemoteFile:function(url) {

      var xhr = new XMLHttpRequest();
      var filename='cbeta.kdb';
      var that=this;
      this.setState({downloading:true,progress:0});
      xhr.open('get', filename, true);
      xhr.responseType = 'blob';

      xhr.addEventListener('progress', function(event) {
        that.setState({progress:event.loaded / event.total});
      },  false);
      xhr.addEventListener('load', function() {
        //console.log('load',   this.response.byteLength,this.response);
        that.writeFile(filename,this.response);
      },
      false);
      
      xhr.send();
  },
  writeFile:function(filename,buf) {
        var that=this;
        FS_.root.getFile(filename, {create: true, exclusive: false}, function(fileEntry) {
          fileEntry.createWriter(function(fileWriter) {
            fileWriter.write(buf);
            fileWriter.onwriteend = function(e) {
              that.setState({downloading:false})
              that.props.update();
            };            
          }, console.error);
        }, console.error);
  },
  render:function() {
    if (this.state.downloading)  {
      var progress=Math.round(this.state.progress*100);
      return (
        <div className="progress">
          <div className="progress-bar" role="progressbar" 
              aria-valuenow={progress} aria-valuemin="0" 
              aria-valuemax="100" style={{width: progress+"%"}}>
            {progress}%
          </div>
        </div>
        );
    } else {
      return <button onClick={this.addRemoteFile}>add remote</button>  
    }
  }
});
var installdb = React.createClass({
  getInitialState: function() {
    return {bar: "world"};
  },
  deleteFile:function(filesystemPath) {
    var that=this;
    webkitResolveLocalFileSystemURL(filesystemPath, function(fileEntry) {
      fileEntry.remove(function() {
        that.readDirectories();
      }, console.error);
    },  console.error);
  },
  openFile:function(filesystemPath) {
    Kde.openLocal(filesystemPath,function(engine){
      console.time("search")
      Kse.search(engine,"乘",{},function(Q){
        console.timeEnd("search")
        console.log(Q);
      })
    });
  },
  initFS:function() {
    var that=this;
    navigator.webkitPersistentStorage.requestQuota(1024*1024*1024, 
      function(grantedBytes) {
      webkitRequestFileSystem(PERSISTENT, grantedBytes,  function(fs) {
          window.FS_ = fs;
          that.readDirectories();
      }, console.error );

    }, function(e) {
      console.error( e);
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
   var dirReader = FS_.root.createReader();
   var out=[],that=this;
    // Need to recursively read directories until there are no more results.
    dirReader.readEntries(function(entries) {
      if (entries.length) {
          for (var i = 0, entry; entry = entries[i]; ++i) {
            if (entry.isFile) {
              out.push([entry.name,entry.toURL ? entry.toURL() : entry.toURI()]);
            }
          }
      }
      that.setState({files:out});
      }, console.error);
  },
 
  writeFile:function(filename,buf) {
        var that=this;
        FS_.root.getFile(filename, {create: true, exclusive: true}, function(fileEntry) {
          fileEntry.createWriter(function(fileWriter) {
            fileWriter.write(buf);
            fileWriter.onwriteend = function(e) {
              console.log('Write completed.',e);
              that.readDirectories();
            };            
          }, console.error);
        }, console.error);
  },
  addFiles:function(e) {
    var that=this;
    for (var i = 0, file; file = e.target.files[i]; ++i) {
      // Capture current iteration's file in local scope for the getFile() callback.
      (function(f) {
        var filename = file.name.replace(/\s/g, '_');
        that.writeFile(filename,f);
      })(file);
    }
  },
  render: function() {
    return (
      <div>
        <input onChange={this.addFiles} type="file" id="files" multiple="true" className="button" accept=".kdb"></input>
        <filelist action={this.action} files={this.state.files}/>
        <div>
          <div className="col-md-4">
            <remoteFile update={this.readDirectories} />
            </div>
        </div>
      </div>
    );
  }
});
module.exports=installdb;