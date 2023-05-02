"use strict";
const { Model, STRING, INTEGER } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({}) {}
  }
  room.init(
    {
      roomName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 10],
            msg: "Tên phòng phải dài từ 3 đến 10 ký tự",
          },
          isUnique: function (value, next) {
            room
              .findOne({ where: { roomName: value } })
              .then(function (rooms) {
                // Reject if a different user wants to use the same email
                if (rooms) {
                  return next("Tên phòng đã tồn tại");
                }
                return next();
              })
              .catch(function (err) {
                return next(err);
              });
          },
        },
        unique: {
          arg: true,
          msg: "Tên phòng đã tồn tại",
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 9],
            msg: "Mật khẩu phải dài từ 3 đến 9 ký tự",
          },
          is: {
            args: /^(?=.*[!@#$%^&*])/,
            msg: "Mật khẩu phải có ký tự đặc biệt",
          },
        },
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },

    {
      sequelize,
      modelName: "room",
    }
  );
  return room;
};
