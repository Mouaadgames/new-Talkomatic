const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser");
const crypto = require('crypto')
const http = require("http")
const { WebSocketServer } = require("ws")

const app = express()
const port = 3000

let users = [{ id: "123", token: "ABC", name: "test", currentRoom: "" }] // {id:"",token:"",name:""}
let rooms = [] // {id:"",name:"",users:[]}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser());

app.post('/register', (req, res) => {
  console.log(req.body);
  if (req.body?.name) {
    if (users.find(user => user.name === req.body?.name)) {
      return res.redirect("/?error=Name already exists")
    }
    const newUser = {
      name: req.body?.name,
      id: Date.now(),
      token: crypto.randomBytes(32).toString('hex')
    }
    res.cookie('authCookie', newUser.token, { maxAge: 12 * 60 * 3600, httpOnly: false });
    res.cookie('name', newUser.name, { maxAge: 12 * 60 * 3600, httpOnly: false });
    users.push(newUser)
    return res.redirect('/lobby.html')
  }
  return res.status(400)
})

app.get("/logout", (req, res) => {
  // clear cookie and redirect
  res.clearCookie("authCookie");
  res.clearCookie("name");
  // remove user from users
  users = users.filter(user => user.token !== req.cookies?.authCookie)

  res.redirect("/");
})

app.get('/rooms', (req, res) => {
  return res.json(rooms)
})

app.post('/createRoom', (req, res) => {
  if (users.find(user => user.token === req.cookies?.authCookie) && req.body?.name) {
    owner = users.find(user => user.token === req.cookies?.authCookie)
    const newRoom = {
      id: Date.now(),
      name: req.body?.name,
      users: [{ id: owner.id, name: owner.name }],
    }
    rooms.push(newRoom)

    owner.currentRoom = newRoom.id
    console.log("room created");
    return res.redirect("/room.html?id=" + newRoom.id)
  }
  return res.redirect("/")
})


const server = http.createServer(app);
const wss = new WebSocketServer({ clientTracking: false, noServer: true });


server.on('upgrade', function (request, socket, head) {
  socket.on('error', console.error);
  socket.removeListener('error', console.error);
  wss.handleUpgrade(request, socket, head, function (ws) {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', function (ws, request) {
  console.log("connected");
  ws.on('error', console.error);

  ws.on('message', function (message) {
    const msg = JSON.parse(message)
    console.log(msg.id);
    console.log(msg.roomId);
    if (msg.id) {
      let user = users.find(user => user.token === msg.id)
      if (!user) return ws.send("no_user")
      if (!rooms.find(room => room.id == msg.roomId)) return ws.send("no_room")
      user.currentRoom = msg.roomId
      if (!rooms.find(room => room.users.find(u => u.id === users.find(user => user.token === msg.id).id)))
        rooms.find(room => room.id == msg.roomId).users.push({ id: users.find(user => user.token === msg.id).id, name: users.find(user => user.token === msg.id).name })
      ws.send(JSON.stringify({ col: rooms.find(room => room.id == msg.roomId).users.length - 1 }))
      return (ws.id = users.find(user => user.token === msg.id).id)
    }

    ws.emit("updateMsg", {
      userCol: rooms.find(r => r.id == msg.roomId).users.findIndex(u => u.id == ws.id),
      msg: msg.message
    })


  });

  ws.on('close', function () {
    console.log('disconnected ' + ws.id);
    try {
      let discUser = users.find(u => u.id === ws.id)
      let currRoom = Number(discUser.currentRoom)
      discUser.currentRoom = ""
      currRoom = rooms.find(r => r.id === currRoom)
      currRoom.users = currRoom.users.filter(u => u.id !== ws.id)
      if (currRoom.users.length === 0) {
        rooms = rooms.filter(r => r.id !== currRoom.id)
      }

    } catch (error) { }

  });


});

server.listen(port, function () {
  console.log(`Listening on http://localhost:${port}`);
});
