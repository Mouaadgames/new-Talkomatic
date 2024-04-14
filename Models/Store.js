let users = []
function addUser(user) {
  users.push(user)
}

function removeUser(userAuthCookie) {
  users = users.filter(u => u.token !== userAuthCookie)
}

function getAllUsers() {
  return users
}

function getUserByToken(token) {
  return users.find(u => u.token === token)
}
function getUserByWsId(id) {
  return users.find(u => u.wsId === id)
}


let rooms = []
function addRoom(room) {
  rooms.push(room)
}
function removeRoom(room) {
  rooms = rooms.filter(r => r.id !== room.id)
}
function getRooms() {
  return rooms
}


function getRoomById(roomId) {
  return rooms.find(r => r.id === roomId)
}
function getInitRoomData(roomId) {
  const currentRoom = rooms.find(r => r.id == roomId)
  return {
    roomName: currentRoom?.name,
    names: currentRoom?.users.map(u => u.name),
    initData: currentRoom?.users.map(u => u.inputField),
  }
}

function getUserByToken(token) {
  return users.find(u => u.token === token)
}

module.exports = {
  addUser,
  removeUser,
  getRooms,
  addRoom,
  removeRoom,
  getAllUsers,
  getInitRoomData,
  getUserByToken,
  getRoomById,
  getUserByWsId
}