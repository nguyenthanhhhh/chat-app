const express = require('express')
const UserController = require('../controller/UserController')
const { authenticate } = require('../middlewares/authenticate/authen')
const FriendController = require('../controller/FriendController')

const friendRouter = express.Router()

friendRouter.get('/home', authenticate, FriendController.home)
friendRouter.post(
  '/showRequest',
  authenticate,
  FriendController.showRequestAddFriend
)
friendRouter.get('/request', authenticate, FriendController.friendRequest)
friendRouter.post('/sendReq', authenticate, FriendController.sendRequest)
friendRouter.post(
  '/updateStatusRequest',
  authenticate,
  FriendController.updateStatusRequest
)

module.exports = friendRouter
