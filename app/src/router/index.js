const express = require('express')
const { authenticate } = require('../middlewares/authenticate/authen')
const UserController = require('../controller/UserController')

const userRouter = require('./user.router')
const friendRouter = require('./friend.router')

const rootRouter = express.Router()

rootRouter.use('/user', userRouter)
rootRouter.use('/friend', friendRouter)

rootRouter.get('/', authenticate, UserController.home)

module.exports = rootRouter
