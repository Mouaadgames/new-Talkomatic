const crypto = require('crypto');
const Store = require('../../Models/Store')


// user class 
class User {
  constructor(name) {
    this.id = Date.now()
    this.name = name
    this.token = crypto.randomBytes(32).toString('hex') // for authentication 
    this.currentRoom = null // current joined room 
    this.userPlace = -1
    this.inputField = ''
    Store.addUser(this)
  }
}

module.exports = User 