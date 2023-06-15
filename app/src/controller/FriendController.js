const {
  Users,
  userFriend,
  MessageModel,
  requestFriend,
  sequelize,
} = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { dataToObj } = require('../utils/dataToObj')
const { Op } = require('sequelize')
const moment = require('moment')

class FriendController {
  //đây là home của list friend
  async home(req, res) {
    try {
      const user = req.user
      const { userName } = user
      const query = `
      SELECT userFriends.*, u1.fullName AS userNameFullName, u2.fullName AS userNameFriendFullName,
      u1.avatar AS userNameAvt, u2.avatar AS userNameFriendAvt
      FROM userFriends
      JOIN Users AS u1 ON userFriends.userName = u1.userName
      JOIN Users AS u2 ON userFriends.userNameFriend = u2.userName
      WHERE userFriends.userName = :userName
      ORDER BY updatedAt DESC
    `

      const allFr = await sequelize.query(query, {
        replacements: { userName },
        type: sequelize.QueryTypes.SELECT,
      })

      let userNameFInstance = await Users.findOne({
        where: {
          userName,
        },
      })

      userNameFInstance = dataToObj(userNameFInstance)
      let time2 = userNameFInstance.birthday
      time2 = moment(time2).format('DD/MM/YYYY')
      userNameFInstance.birthday = time2

      res.render('addFriend/detail/listFriend', {
        userChat: dataToObj(user),
        allFriend: dataToObj(allFr),
        userNameFInstance: dataToObj(userNameFInstance),
      })
    } catch (error) {
      console.log('[FriendController][home] error: ' + error)
      res
        .status(500)
        .send('<script>alert("Error."); window.location.href = "/";</script>')
    }
  }

  async showRequestAddFriend(req, res) {
    try {
      const { search } = req.body
      const userFind = await Users.findOne({
        where: {
          [Op.or]: [{ userName: search }, { phone: search }],
        },
      })

      if (userFind) {
        let newData = dataToObj(userFind)
        let time = newData.birthday
        time = moment(time).format('DD/MM/YYYY')
        newData.birthday = time
        res.status(200).send(newData)
      } else {
        res
          .status(404)
          .send(
            '<script>alert("Username invalid."); window.location.href = "/friend/home";</script>'
          )
      }
    } catch (error) {
      console.log('[FriendController][showRequestAddFriend] error: ' + error)
      res
        .status(500)
        .send('<script>alert("Error."); window.location.href = "/";</script>')
    }
  }

  //đây là home của friend request
  async friendRequest(req, res) {
    try {
      const user = req.user
      const { userName } = user

      //   const query = `
      //   SELECT userFriends.*, u1.fullName AS userNameFullName, u2.fullName AS userNameFriendFullName,
      //   u1.avatar AS userNameAvt, u2.avatar AS userNameFriendAvt
      //   FROM userFriends
      //   JOIN Users AS u1 ON userFriends.userName = u1.userName
      //   JOIN Users AS u2 ON userFriends.userNameFriend = u2.userName
      //   WHERE userFriends.userName = :userName
      //   ORDER BY updatedAt DESC
      // `

      //   const allFr = await sequelize.query(query, {
      //     replacements: { userName },
      //     type: sequelize.QueryTypes.SELECT,
      //   })

      let userNameFInstance = await Users.findOne({
        where: {
          userName,
        },
      })

      userNameFInstance = dataToObj(userNameFInstance)
      let time2 = userNameFInstance.birthday
      time2 = moment(time2).format('DD/MM/YYYY')
      userNameFInstance.birthday = time2

      const allRequest = await requestFriend.findAll({
        include: [
          {
            model: Users,
            as: 'reqName',
            attributes: ['fullName', 'avatar'],
          },
        ],
      })

      res.render('addFriend/detail/friendRequest', {
        userChat: dataToObj(user),
        userNameFInstance: dataToObj(userNameFInstance),
        allRequest: dataToObj(allRequest),
      })
    } catch (error) {
      console.log('[FriendController][friendRequest] error: ' + error)
      res
        .status(500)
        .send('<script>alert("Error."); window.location.href = "/";</script>')
    }
  }

  async sendRequest(req, res) {
    try {
      const { userNameF, userNameT } = req.body
      if (userNameF === userNameT) {
        res
          .status(404)
          .send(
            '<script>alert("Tên đăng nhập không hợp lệ"); window.location.href = "/friend/home";</script>'
          )
      } else {
        const request = {
          userNameF,
          userNameT,
          request: true,
          status: 'request',
        }
        await requestFriend.create(request)
        res.send(
          '<script>alert("Gửi yêu cầu kết bạn thành công."); window.location.href = "/friend/request";</script>'
        )
      }
    } catch (error) {
      console.log('[FriendController][sendRequest] error: ' + error)
      res
        .status(500)
        .send(
          '<script>alert("Bạn đã kết bạn với người này rồi!"); window.location.href = "/friend/home";</script>'
        )
    }
  }

  async updateStatusRequest(req, res) {
    try {
      const { id, status, userName, userNameFriend } = req.body

      if (status === 'accept') {
        await userFriend.create({
          userName: userName,
          userNameFriend: userNameFriend,
        })
        await userFriend.create({
          userName: userNameFriend,
          userNameFriend: userName,
        })
      }

      await requestFriend.update({ request: false }, { where: { id } })
      await requestFriend.update({ status }, { where: { id } })
      console.log('Thanh cong')
      res.status(200).redirect('/friend/home')
    } catch (error) {
      console.log('[FriendController][updateStatusRequest] error: ' + error)
      res
        .status(500)
        .send(
          '<script>alert("Error"); window.location.href = "/friend/home";</script>'
        )
    }
  }
}

module.exports = new FriendController()
