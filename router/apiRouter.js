const express = require('express')
const apiRouter = express.Router()
const Store = require('../Models/Store')

apiRouter.get('/rooms', (req, res) => {
  return res.json(Store.getRooms().map(r => ({ id: r.id, name: r.name, users: r.users.map(u => u.name) })))
})

module.exports = apiRouter