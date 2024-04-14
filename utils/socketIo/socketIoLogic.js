
const { isTokenValid, isRoomIdValid } = require("../validation")
const Store = require("../../Models/Store")
const applyInstructionsToTheText = require("./textManipulation")
function socketIoLogic(io) {

  io.on('connection', function (ws, request) {
    console.log("connected - ws id :", ws.id);
    let currentUser = null
    ws.on('error', console.error);

    ws.on("init", (msg) => {
      console.log("init req on server side : ", msg);
      if (!isTokenValid(msg.token))
        return ws.send("no_user")
      if ((!isRoomIdValid(msg.roomId)))
        return ws.send("no_room")
      if (Store.getRoomById(msg.roomId).users.length === 5)
        return ws.send("full_room")

      currentUser = Store.getUserByToken(msg.token)
      ws.join(msg.roomId) // joining the room id is roomId 
      const currentRoom = Store.getRoomById(msg.roomId)

      //check if the user dose not exist in the room thats mean that this init req is for a new user 
      if (currentRoom.users.findIndex(u => u.id === Store.getUserByToken(msg.token).id) === -1) {
        currentRoom.addUser(Store.getUserByToken(msg.token))
      }

      // send to the user in their init chanel the init data {pos,old users data}
      ws.emit("init", {
        ...Store.getInitRoomData(msg.roomId), // {roomName,names,initData}
        currentIndex: Store.getUserByToken(msg.token).userPlace
      })

      // inform other that a new user joined
      console.log("new user joined");
      ws.to(msg.roomId).emit("newUser", {
        name: currentUser.name,
        index: currentUser.userPlace
      })
    })

    ws.on('updateMsg', function (msg) {
      console.log(currentUser.name, " -> request updateMsg with : ", msg);
      if (!msg) return
      // check if it's a a valid req
      if (!currentUser) return ws.send("no_user")
      if (!currentUser.currentRoom) return ws.send("no_room")

      ws.to(currentUser.currentRoom.id).emit("updateMsgs", {
        userCol: currentUser.userPlace,
        msg
      })
      //update the input filed in the user obj using the send instructions
      currentUser.inputField = applyInstructionsToTheText(msg, currentUser.inputField)
    });

    ws.on('disconnect', function () {
      console.log('disconnected ' + currentUser);

      if (!currentUser) return

      currentUser.currentRoom.removeUser(currentUser)

      //remove empty room
      if (currentUser.currentRoom.users.length === 0)
        Store.removeRoom(currentUser.currentRoom)

      ws.to(currentUser.currentRoom.id).emit("userLeft", {
        index: currentUser.userPlace
      })
      currentUser.currentRoom = null
      currentUser.userPlace = -1
      currentUser.inputField = ''

    });


  })
}

module.exports = {
  socketIoLogic
}