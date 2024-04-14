const express = require('express')
const Server = require("socket.io").Server
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser");

const pageRouter = require('./router/pageRouter')
const apiRouter = require('./router/apiRouter')
const {socketIoLogic} = require('./utils/socketIo/socketIoLogic')

const app = express()
const port = 3000


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("src")) // for index.html
// app.use(express.static("dist")) // for room only need to include the socket io lib
app.use(cookieParser());

app.use(pageRouter)
app.use(apiRouter)

const srv = app.listen(port, function () {
  console.log(`Listening on http://localhost:${port}`);
});
const io = new Server(srv);
socketIoLogic(io)

