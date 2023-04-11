const { Users } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { dataToObj } = require("../utils/dataToObj");

class UserController {
  registerGet(req, res) {
    res.render("user/register");
  }

  async registerPost(req, res) {
    const { userName, password, email } = req.body;
    const user = { userName, password, email };
    console.log(user);
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
        .then(() => {
          res.send("Tao tai khoan thanh cong <a href=/>Quay lại </a>");
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

  joinChat(req, res) {
    const { name, room } = req.query;
    console.log(name, room);
    res.render("chat.hbs", { name: dataToObj(name), room: dataToObj(room) });
  }
}

module.exports = new UserController();
