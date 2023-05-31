const express = require('express')
const UserController = require('../controller/UserController')
const { authenticate } = require('../middlewares/authenticate/authen')
const FriendController = require('../controller/FriendController')

const friendRouter = express.Router()

friendRouter.get('/home', FriendController.home)
friendRouter.get('/request', FriendController.friendRequest)

module.exports = friendRouter
