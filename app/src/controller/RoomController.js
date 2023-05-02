const { Users, room } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { dataToObj } = require("../utils/dataToObj");

class RoomController {
  createRoomGet(req, res) {
    res.render("room/createRoom");
  }
  async createRoomPost(req, res) {
    const { name, password } = req.body;
    const createRoom = { name, password };
    try {
      const newRoom = await room.build(createRoom); // Tạo một đối tượng mô hình mới
      await newRoom.validate();
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      await room.create(
        { name, password: hash },
        {
          validate: false,
        }
      );
      console.log("Tao phong thanh cong");
      res.redirect("/");
    } catch (err) {
      res.send({ message: err.message });
    }
  }
}

module.exports = new RoomController();
