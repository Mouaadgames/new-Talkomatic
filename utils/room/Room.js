// Room Class 
/**
 * create a room
 * join a room
 * leave a room
 */

/**
 * @class
 * @param {string} name
 * @param {string} id
 */
class Room {
  constructor(name, owner) { // room creation
    this.id = Date.now().toString()
    this.name = name
    this.users = []
    
    this.addUser(owner)
  }

  addUser(user) { // joining a room
    user.currentRoom = this
    user.userPlace = this.users.length
    this.users.push(user)
  }

  removeUser(user) { // leaving a room
    this.users = this.users.filter(u => u.id !== user.id)
    this.users.forEach((user,i) => user.userPlace = i)
  }
}

module.exports = Room