"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init(
    {
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [5, 15],
            msg: "Tên đăng nhập phải dài từ 5 đến 15 ký tự",
          },
          isUnique: function (value, next) {
            Users.findOne({ where: { username: value } })
              .then(function (user) {
                // Reject if a different user wants to use the same email
                if (user) {
                  return next("Tên đăng nhập đã tồn tại");
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
          msg: "Tên đăng nhập đã tồn tại",
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [5, 15],
            msg: "Mật khẩu phải dài từ 5 đến 10 ký tự",
          },
          is: {
            args: /^(?=.*[!@#$%^&*])/,
            msg: "Mật khẩu phải có ký tự đặc biệt",
          },
        },
      },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    {
      sequelize,
      modelName: "Users",
    }
  );
  return Users;
};
