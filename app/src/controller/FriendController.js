const { Users, userFriend, MessageModel, sequelize } = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { dataToObj } = require('../utils/dataToObj')
const { Op } = require('sequelize')
const moment = require('moment')

class FriendController {
  async home(req, res) {
    res.render('addFriend/detail/listFriend')
  }
}

module.exports = new FriendController()
