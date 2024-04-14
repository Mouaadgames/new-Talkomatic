const express = require('express')
const router = express.Router()
const Store = require('../Models/Store')
const User = require('../utils/user/User');
const Room = require('../utils/room/Room');


router.post('/register', (req, res) => { // add user
  console.log(req.body); // { name: 'hello' }
  if (!req.body?.name) return res.status(400)

  if (Store.getAllUsers().find(user => user.name === req.body?.name))
    return res.redirect("/?error=Name already exists")

  const newUser = new User(req.body.name)
  res.cookie('authCookie', newUser.token, { maxAge: 12 * 60 * 3600, httpOnly: false });
  res.cookie('name', newUser.name, { maxAge: 12 * 60 * 3600, httpOnly: false });
  return res.redirect('/lobby.html')
})

router.get("/logout", (req, res) => { // remove user
  // clear cookie and redirect
  res.clearCookie("authCookie");
  res.clearCookie("name");
  // remove user from users
  Store.removeUser(req.cookies?.authCookie)
  res.redirect("/");
})



router.post('/createRoom', (req, res) => {
  const owner = Store.getAllUsers().find(user => user.token === req.cookies?.authCookie)
  if (owner && req.body?.name) {
    const newRoom = new Room(req.body?.name, owner)
    Store.addRoom(newRoom)
    owner.currentRoom = newRoom
    console.log("room created");
    return res.redirect("/room.html?id=" + newRoom.id)
  }
  return res.redirect("/")
})



module.exports = router