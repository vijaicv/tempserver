var express =require("express");
var app=express();
var bodyparser=require('body-parser');
var path=require('path');
var db;
var dburl="mongodb://vijaicv:ucuredme@ds113179.mlab.com:13179/youcuredme"
var MongoClient = require('mongodb').MongoClient;



app.use(bodyparser.urlencoded({
        extended: true
}));


MongoClient.connect(dburl, function (err, client) {
        if (err) {
                console.log("could'nt connect to database => " + err)
        };
        db = client.db("youcuredme");
        console.log("connected");
})


app.get("/",function(req,res){
  res.sendFile(__dirname + '/html/index.html');
})

app.get("/getmessages",function(req,res){
  var username=req.query.u;
  console.log("requesting lattimestamp of "+username);
      db.collection("users").find({name:username}).project({_id:0}).toArray(function(err,resp){
      if(err)console.log(err);
        var lastonline=resp[0].lasttimestamp;
        console.log(resp[0].lasttimestamp);
        db.collection("chat").find({time:{$gt:new Date(lastonline)}}).project({_id:0}).limit(50).toArray(function(err,resp){
          if(err)throw err;
          res.json({resp});
          console.log(resp);
        })
      })

      db.collection("users").update({name:username},{$set:{lasttimestamp:new Date()}},function(err,resp){
              if(err)throw err;
      });
})


var server=app.listen(process.env.PORT||8081,function(){
  var host = server.address().address
  var port = server.address().port
  console.log("app listening at http://%s:%s", host, port)
})

var io=require('socket.io').listen(server);
io.on('connection',function(socket){
  console.log("user connected");

  socket.on('joinchat', function(username){
  socket.username=username;
  socket.timestamp=new Date();
    console.log(socket.username+"has joined the conversation at "+socket.timestamp);
  });

  socket.on('typing',function(user){
    socket.broadcast.emit('typing',user);
  })

  socket.on('chat message', function(msg){
      var date =new Date();
      socket.broadcast.emit('chat message', msg);
      socket.timestamp=date;
      console.log(socket.timestamp);
      msg.time=date;
      db.collection("chat").insertOne(msg,function(err,res){
        if(err)throw(err);
      });
  });

  socket.on('disconnect', function(){
      console.log(socket.username+' disconnected at '+socket.timestamp);
      db.collection("users").update({name:socket.username},{$set:{lasttimestamp:socket.timestamp}},function(err,resp){
        if(err)throw err;
      });
  });


})
