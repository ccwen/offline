var Kde=require("ksana-document").kde;
var Kse=require("ksana-document").kse;
var filesystemPath="cbeta";
    Kde.openLocal(filesystemPath,function(engine){
      console.time("search")
      Kse.search(engine,"乘",{},function(Q){
        console.timeEnd("search")
     //   console.log(Q);
      })
    });
