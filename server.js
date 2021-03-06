var express = require('express');
var fs = require('fs');
var serverPort = (process.env.PORT || 3000);

const server = express()
  .use(express.static(__dirname + '/static')) 
  .listen(serverPort, () => console.log('Listening on ' + serverPort));


var io = require('socket.io')(server);

//io.set('transports', ['xhr-polling']);
//io.set('polling duration', 10);

var roomList = {};

function socketIdsInRoom(name) {
  var socketIds = io.nsps['/'].adapter.rooms[name];
  if (socketIds) {
    var collection = [];
    for (var key in socketIds) {
      collection.push(key);
    }
    return collection;
  } else {
    return [];
  }
}

io.on('connection', function (socket) {
  console.log('connection');
  socket.on('disconnect', function () {
    console.log('disconnect');
    if (socket.room) {
      var room = socket.room;
      setInterval(() => {
        io.to(room).emit('leave', socket.id);
        socket.leave(room);
      }, 1000);

    }
  });

  socket.on('join', function (name, callback) {
    console.log('join', name);
    var socketIds = socketIdsInRoom(name);
    callback(socketIds);
    socket.join(name);
    socket.room = name;
  });


  socket.on('exchange', function (data) {
    console.log('exchange', data);
    data.from = socket.id;
    var to = io.sockets.connected[data.to];
    setInterval(() => to.emit('exchange', data), 1000);
  });
});


