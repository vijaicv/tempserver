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
        console.log("conected");
})


app.get("/",function(req,res){
  res.sendFile(__dirname + '/html/index.html');
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
    console.log(username+"has joined the conversation");
    socket.username=username;
  });

  socket.on('typing',function(user){
    socket.broadcast.emit('typing',user);
  })

  socket.on('chat message', function(msg){
      console.log(msg.username);
      var date =new Date();
      socket.broadcast.emit('chat message', msg);
      msg.time=date;
      db.collection("chat").update({community:"diacare"},{$push:{chatbox:msg}},function(err,res){
        if(err)throw(err);
      });
  });




  socket.on('disconnect', function(){
      console.log(socket.username+'disconnected');
  });

})
