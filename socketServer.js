const db = require('./userQueries')
require('dotenv').config()
const express = require('express');
const app = express();
const http = require('http').createServer(app);

var cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://localhost:8080']
  }
});




//html for websocket backend
//Todo:
//make prety
//set ports to env
//send console logs to update on admin backend  (push to arrays)
app.get('/', (req, res) => {
  res.send('<h1>Hey Socket.io</h1>');
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors())
app.get('/api/listAllUsers', function (req, res) {
  console.log(res)
  res.send(connectedusers)
  //res.end();
})

console.log('=================');
console.log('Socket Session Started');
http.listen(process.env.socketIOPort, () => {
  console.log('listening on *:'+process.env.socketIOPort);
});
console.log('=================');

var count = 1;
var connectedusers = [];
io.on('connection', (socket) => {
  var totalCount = io.engine.clientsCount;
    console.log(`session user ${count} of ${totalCount} connected uid ${socket.id}`);

    socket.conn.on("close", (reason) => {
      // called when the underlying connection is closed
      console.log(`session user ${count} disconnected uid ${socket.id}`);
    });
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('send-nickname', function(username) {
      socket.user = username;
      console.log('==================')
      console.log(socket.user.id)

      let obj = connectedusers.find((o, index) => {
        if(o.id === socket.user.id){
          connectedusers[index] = {
            userID: socket.id,
            ...socket.user,
          }
          return o;
      }});
      console.log(obj);
      if(obj){
        io.emit('reconnect', 1);
        return true;
      }
      connectedusers.push({
        userID: socket.id,
        ...socket.user,
      });
      //users.push(socket.username);
      //console.log(users);
    });
    socket.on('clientLog', (msg) => {
        console.log('message: ' + msg);
        io.emit('serverLog', `${msg}.true`);
    });
    socket.on('listAllOnline', async (id) => {
      console.log('this user requsts online user: ' + id);
      const ListAllsockets = await io.fetchSockets();
      
      for (const key of ListAllsockets) {
        console.log(socket.username);
        //connectedusers.push(socket.username)
        //console.log(socket.handshake);
        
        console.log(socket.rooms);
        //console.log(socket.data);
        //socket.emit(/* ... */);
        //socket.join(/* ... */);
        //socket.leave(/* ... */);
        //socket.disconnect(/* ... */);
      }
      console.log(connectedusers);
      io.emit('send-nickname', connectedusers);

      //io.emit(id, 'init chanel for member');
     // skuArray.push(id)
  });
  
    socket.on('updateGroupdb', (msg) => {
        console.log('recievedData: ' + msg);
        io.emit('updateGroupdb', `data: ${msg}`);
    });
    count = ++count;
});

