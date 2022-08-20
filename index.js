const db = require('./userQueries')
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
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.get('/users', db.getUsers)
app.get('/createTable', db.createTable)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)
app.post("/login", (req, res) => {
  console.log(req.body)
  db.createUser(req, res);
  const USERNAME = "uma victor";
  const PASSWORD = "8888";
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    const user = {
      id: 1,
      name: "uma victor",
      username: "uma victor",
    };
  } else {
    //res.status(403);
    // res.json({
    //   message: "wrong login information",
    // });
    //res.end();
  }
});
console.log('=================');
console.log('Session Started');
http.listen(3000, () => {
  console.log('listening on *:3000');
});
console.log('=================');

var count = 1;
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
    
    socket.on('clientLog', (msg) => {
        console.log('message: ' + msg);
        io.emit('serverLog', `${msg}.true`);
    });
    socket.on('updateGroupdb', (msg) => {
        console.log('recievedData: ' + msg);
        io.emit('updateGroupdb', `data: ${msg}`);
    });
    count = ++count;
});

