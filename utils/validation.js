const { ModuleFilenameHelpers } = require("webpack")
const Store = require("../Models/Store")

function isTokenValid(token) {
  return (Store.getAllUsers().findIndex(t => t.token === token) !== -1) //add .Dsqdsq
}
function isRoomIdValid(roomId) {
  return (Store.getRooms().findIndex(r => r.id == roomId) !== -1)
}

module.exports = {
  isTokenValid,
  isRoomIdValid
}