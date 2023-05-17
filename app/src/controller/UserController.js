const { Users, userFriend, MessageModel } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { dataToObj } = require("../utils/dataToObj");
const { Op } = require("sequelize");
const moment = require("moment");

class UserController {
  async home(req, res) {
    try {
      const user = req.user;
      const { userName } = user;
      const allFr = await userFriend.findAll({
        where: {
          userName: userName,
        },
      });

      const allMessage = await MessageModel.findAll();

      res.render("chat", {
        userChat: dataToObj(user),
        allFriend: dataToObj(allFr),
        allMessage: dataToObj(allMessage),
      });
    } catch (error) {
      console.log("[UserController][home] error: " + error);
    }
  }

  registerGet(req, res) {
    res.render("user/register");
  }

  async registerPost(req, res) {
    const { userName, password, email } = req.body;
    const user = { userName, password, email };
    try {
      const newUser = await Users.build(user); // Tạo một đối tượng mô hình mới
      await newUser.validate();
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      Users.create(
        { userName, password: hash, email },
        {
          validate: false,
        }
      )
        .then(async () => {
          res
            .status(201)
            .send("Tạo tài khoản thành công. <a href=/>Quay lại </a>");
        })
        .catch((err) => {
          res.send({ message: err.message });
        });
    } catch (error) {
      let err = error.message;
      err = err.replace(/Validation error: /g, "");
      console.log(err);
      res.status(400).send(err + " <a href=/>Quay lại </a>");
    }
  }

  loginGet(req, res) {
    res.render("user/login");
  }

  async loginPost(req, res) {
    const { userName, password } = req.body;
    const token = req.cookies.auth;
    if (token) {
      res
        .status(401)
        .send(
          "Bạn đã đăng nhập rồi, không thể đăng nhập. <a href = />Quay lại </a>"
        );
    } else {
      const userLog = await Users.findOne({
        where: {
          userName,
        },
      });
      if (userLog) {
        const auth = await bcrypt.compare(password, userLog.password);
        if (auth) {
          const token = jwt.sign(
            { userName: userLog.userName, email: userLog.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
          );
          res.cookie("auth", token);
          res.status(200).redirect("/");
          console.log("Dang nhap thanh cong");
        } else {
          res.status(401).send("mật khẩu không hợp lệ");
        }
      } else {
        res
          .status(401)
          .send("Tên đăng nhập không hợp lệ. <a href=/user/login>Quay lại </>");
      }
    }
  }

  logout(req, res) {
    // res.clearCookie("token");
    // req.logOut();
    res.status(200).clearCookie("auth");
    res.redirect("login");
    console.log("Logout");
  }

  // async joinChat(req, res) {
  //   const user = req.user;
  //   const name = user.name;
  //   try {
  //     const auth = await bcrypt.compare(password, roomJoin.password);
  //     if (auth) {
  //       res.render("chat.hbs", {
  //         userName: dataToObj(name),
  //       });
  //     } else {
  //       res.status(401).send("Đăng nhập thất bại.  <a href=/>Quay lại </>");
  //     }
  //   } catch (error) {
  //     res.send({ message: error.message });
  //   }
  // }

  async addFriend(req, res) {
    const { userName, userNameFriend } = req.body;
    await userFriend.create({
      userName: userName,
      userNameFriend: userNameFriend,
    });
    await userFriend.create({
      userName: userNameFriend,
      userNameFriend: userName,
    });

    res.status(201).send("Tao user friend thanh cong");
  }

  async inbox(req, res) {
    const { userNameF, userNameT } = req.body;
    const user = req.user;
    const { userName } = user;
    const allFr = await userFriend.findAll({
      where: {
        [Op.and]: [
          { userName: userName },
          { userNameFriend: { [Op.ne]: userNameT } },
        ],
      },
    });

    const allMessage = await MessageModel.findAll({
      where: {
        [Op.or]: [
          { userNameF, userNameT },
          { userNameF: userNameT, userNameT: userNameF },
        ],
      },
    });

    const allMessageFormat = allMessage.map((message) => {
      let newData = dataToObj(message);
      let time = newData.createdAt;
      time = moment(time).format("DD/MM/YYYY - HH:mm:ss");
      newData.createdAt = time;
      return newData;
    });

    res.render("chat", {
      userChat: dataToObj(user),
      allFriend: dataToObj(allFr),
      allMessage: dataToObj(allMessageFormat),
      userNameT: dataToObj(userNameT),
    });
  }

  async createMessage(req, res) {
    try {
      const { userNameF, userNameT, message } = req.body;
      await MessageModel.create({ userNameF, userNameT, message });
    } catch (error) {
      console.log("[UserController][createMEssage] error: " + error);
    }
  }
}

module.exports = new UserController();
