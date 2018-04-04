var express =require("express");
var app=express();
var bodyparser=require('body-parser');
var path=require('path');
var db;


app.use(bodyparser.urlencoded({
        extended: true
}));

app.get("/",function(req,res){
  res.sendFile(__dirname + '/html/index.html');
})

var server=app.listen(8081,function(){
  var host = server.address().address
  var port = server.address().port
  console.log("app listening at http://%s:%s", host, port)
})

var io=require('socket.io').listen(server);
io.on('connection',function(socket){
  console.log("user connected");
  socket.on('chat message', function(msg){
    socket.broadcast.emit('chat message', msg);
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
})
