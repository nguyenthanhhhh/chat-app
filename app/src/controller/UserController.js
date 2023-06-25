const { Users, userFriend, MessageModel, sequelize } = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { dataToObj } = require('../utils/dataToObj')
const { Op } = require('sequelize')
const moment = require('moment')

class UserController {
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

      res.render('chat', {
        userChat: dataToObj(user),
        allFriend: dataToObj(allFr),
        userNameFInstance: dataToObj(userNameFInstance),
      })
    } catch (error) {
      console.log('[UserController][home] error: ' + error)
    }
  }

  registerGet(req, res) {
    res.render('user/register')
  }

  async registerPost(req, res) {
    const {
      userName,
      password,
      retypepassword,
      email,
      fullName,
      sex,
      birthday,
      phone,
    } = req.body
    if (password === retypepassword) {
      const user = { userName, password, email, fullName, sex, birthday, phone }
      try {
        const newUser = await Users.build(user) // Tạo một đối tượng mô hình mới
        await newUser.validate()
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)
        Users.create(
          { userName, password: hash, email, fullName, sex, birthday, phone },
          {
            validate: false,
          }
        )
          .then(async () => {
            res
              .status(201)
              .send(
                '<script>alert("Tạo tài khoản thành công."); window.location.href = "/";</script>'
              )
          })
          .catch((err) => {
            res.send({ message: err.message })
          })
      } catch (error) {
        let err = error.message
        err = err.replace(/Validation error: /g, '')
        console.log(error)
        res
          .status(400)
          .send(
            err +
              '<script>alert("Quay lại."); window.location.href = "/";</script>'
          )
      }
    } else {
      res.send(
        '<script>alert("Nhập lại mật khẩu không khớp!. "); window.location.href ="/user/register";</script>'
      )
    }
  }

  loginGet(req, res) {
    try {
      const token = req.cookies.auth
      if (!token) return res.render('user/login')

      return res.redirect('/')
    } catch (error) {
      console.log('[UserController][loginGet] error: ' + error)
      res.send('<script>alert("Có lỗi!"); window.location.href ="/";</script>')
    }
  }

  async loginPost(req, res) {
    const { userName, password } = req.body
    const token = req.cookies.auth
    if (token) {
      res
        .status(401)
        .send(
          '<script>alert("Bạn đã đăng nhập rồi, không thể đăng nhập. "); window.location.href ="/";</script>'
        )
    } else {
      const userLog = await Users.findOne({
        where: {
          userName,
        },
      })
      if (userLog) {
        const auth = await bcrypt.compare(password, userLog.password)
        if (auth) {
          const token = jwt.sign(
            {
              userName: userLog.userName,
              email: userLog.email,
              fullName: userLog.fullName,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
          )
          res.cookie('auth', token)
          res.status(200).redirect('/')
          console.log('Dang nhap thanh cong')
        } else {
          res
            .status(401)
            .send(
              '<script>alert("Mật khẩu không hợp lệ "); window.location.href ="/user/login";</script>'
            )
        }
      } else {
        res
          .status(401)
          .send('Tên đăng nhập không hợp lệ. <a href=/user/login>Quay lại </>')
      }
    }
  }

  logout(req, res) {
    // res.clearCookie("token");
    // req.logOut();
    res.status(200).clearCookie('auth')
    res.redirect('login')
    console.log('Logout')
  }

  async addFriend(req, res) {
    try {
      const { userName, userNameFriend } = req.body
      await userFriend.create({
        userName: userName,
        userNameFriend: userNameFriend,
      })
      await userFriend.create({
        userName: userNameFriend,
        userNameFriend: userName,
      })
    } catch (error) {
      res.send(
        '<script>alert("Người dùng không tồn tại hoặc đã kết bạn"); window.location.href ="/user/addFriend";</script>'
      )
    }

    res
      .status(201)
      .send(
        '<script>alert("Kết bạn thành công"); window.location.href ="/user/chat";</script>'
      )
  }

  async inbox(req, res) {
    const { userNameF, userNameT } = req.body
    const user = req.user
    const { userName } = user

    await userFriend.update({ isSelect: false }, { where: {} })

    await userFriend.update(
      { isSelect: true },
      {
        where: {
          userName: userNameF,
          userNameFriend: userNameT,
        },
      }
    )

    const query = `
      SELECT userFriends.*, u1.fullName AS userNameFullName, u2.fullName AS userNameFriendFullName,
      u1.avatar AS userNameAvt, u2.avatar AS userNameFriendAvt
      FROM userFriends
      JOIN Users AS u1 ON userFriends.userName = u1.userName
      JOIN Users AS u2 ON userFriends.userNameFriend = u2.userName
      WHERE userFriends.userName = :userName 
      ORDER BY updatedAt DESC
    `
    const temp = 'and userFriends.userNameFriend != :userNameT'

    const allFr = await sequelize.query(query, {
      replacements: { userName, userNameT },
      type: sequelize.QueryTypes.SELECT,
    })

    let userNameTInstance = await Users.findOne({
      where: { userName: userNameT },
    })

    const status = userNameTInstance.status

    const fullName_userNameT = userNameTInstance.fullName

    const allMessage = await MessageModel.findAll({
      where: {
        [Op.or]: [
          { userNameF, userNameT },
          { userNameF: userNameT, userNameT: userNameF },
        ],
      },
    })

    const allMessageFormat = allMessage.map((message) => {
      let newData = dataToObj(message)
      let time = newData.createdAt
      time = moment(time).format('DD/MM/YYYY - HH:mm:ss')
      newData.createdAt = time
      const messLocate = newData.message
      if (messLocate.indexOf('https://www.google.com') != -1) {
        newData.isLocate = true
      }

      if (message.userNameF === user.userName) newData.isSend = true
      return newData
    })

    userNameTInstance = dataToObj(userNameTInstance)
    let time = userNameTInstance.birthday
    time = moment(time).format('DD/MM/YYYY')
    userNameTInstance.birthday = time

    let userNameFInstance = await Users.findOne({
      where: {
        userName,
      },
    })

    userNameFInstance = dataToObj(userNameFInstance)
    let time2 = userNameFInstance.birthday
    time2 = moment(time2).format('DD/MM/YYYY')
    userNameFInstance.birthday = time2

    res.render('chat', {
      userChat: dataToObj(user),
      allFriend: dataToObj(allFr),
      allMessage: dataToObj(allMessageFormat),
      userNameT_fullName: dataToObj(fullName_userNameT),
      userNameT: dataToObj(userNameT),
      userNameF: dataToObj(userNameF),
      status: dataToObj(status),
      userNameTInstance: userNameTInstance,
      userNameFInstance: userNameFInstance,
      userNameChat: userName,
    })
  }

  async createMessage(req, res) {
    const { userNameF, userNameT, message } = req.body
    try {
      const newMessage = await MessageModel.create({
        userNameF,
        userNameT,
        message,
      })
      await userFriend.update(
        { latestMessage: message },
        {
          where: {
            userName: [userNameF, userNameT],
            userNameFriend: [userNameT, userNameF],
          },
        }
      )

      let newData = dataToObj(newMessage)
      let time = newData.createdAt
      time = moment(time).format('DD/MM/YYYY - HH:mm:ss')
      newData.createdAt = time

      const userF = await Users.findOne({ where: { userName: userNameF } })

      res.send({ newMessage: dataToObj(newData), userF: dataToObj(userF) })
    } catch (error) {
      console.log('[UserController][createMEssage] error: ' + error)
    }
  }

  async updateStatus(req, res) {
    const { userName, status } = req.body
    if (userName) {
      try {
        await Users.update(
          { status },
          {
            where: {
              userName,
            },
          }
        )
        res.send('true')
      } catch (error) {
        console.log(error)
        res.send(`LOI: ${error}`)
      }
    }
  }

  async changePassword(req, res) {
    const { oldPass, newPass, reNewPass } = req.body
    const { user } = req
    const userLog = Users.findOne({
      where: {
        userName: user.userName,
      },
    })
    if (userLog) {
      const auth = await bcrypt.compare(oldPass, userLog.password)
      if (auth) {
        if (newPass === reNewPass) {
          const salt = bcrypt.genSaltSync(10)
          const hash = bcrypt.hashSync(newPass, salt)
          await Users.update({ password: hash })
        } else {
          res.status(400).send('Mật khẩu nhập lại của bạn không khớp')
        }
      } else {
        res.status(400).send('Mật khẩu không đúng')
      }
    } else {
      res.status(400).send('Bạn chưa đăng nhập')
    }
  }

  async getProfile(req, res) {
    const { id } = req.body
    const profile = await Users.findOne({ id })
    res.send('chat', {
      profile: dataToObj(profile),
    })
  }

  async getAllMessage(req, res) {
    const { userChat } = req
    const { userNameF, userNameT } = req.body
    let allMessage = await MessageModel.findAll({
      where: {
        userNameF,
        userNameT,
      },
    })
    const allMessageFormat = allMessage.map((message) => {
      let newData = dataToObj(message)
      let time = newData.createdAt
      time = moment(time).format('DD/MM/YYYY - HH:mm:ss')
      newData.createdAt = time
      const messLocate = newData.message
      if (messLocate.indexOf('https://www.google.com') != -1) {
        newData.isLocate = true
      }

      if (message.userNameF === userChat.userName) newData.isSend = true
      return newData
    })

    res.send({ allMessage: allMessageFormat })
  }

  async updateProfileGet(req, res) {
    const { user } = req
    const userLog = await Users.findOne({ where: { userName: user.userName } })
    res.render('user/editProfile', { user: dataToObj(userLog) })
  }

  async updateProfilePost(req, res) {
    const { user } = req
    const payload = req.body
    try {
      Users.update(payload, {
        where: { userName: user.userName },
      })
        .then(async () => {
          res
            .status(200)
            .send(
              '<script>alert("Cập nhật tài khoản thành công. "); window.location.href ="/";</script>'
            )
        })
        .catch((err) => {
          res.send({ message: err.message })
        })
    } catch (error) {
      console.log(error)
      res
        .status(400)
        .send(
          error +
            '<script>alert("Có lỗi,  quay lại"); window.location.href ="/";</script>'
        )
    }
  }
}

module.exports = new UserController()
