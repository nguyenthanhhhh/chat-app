'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ userFriend }) {
      // define association here
      this.hasMany(userFriend, { foreignKey: 'userName', as: 'userNameInf' })
      this.hasMany(userFriend, {
        foreignKey: 'userNameFriend',
        as: 'userNameFriendInf',
      })
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
            msg: 'Tên đăng nhập phải dài từ 5 đến 15 ký tự',
          },
          isUnique: function (value, next) {
            Users.findOne({ where: { username: value } })
              .then(function (user) {
                // Reject if a different user wants to use the same email
                if (user) {
                  return next('Tên đăng nhập đã tồn tại')
                }
                return next()
              })
              .catch(function (err) {
                return next(err)
              })
          },
        },
        unique: {
          arg: true,
          msg: 'Tên đăng nhập đã tồn tại',
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [5, 15],
            msg: 'Mật khẩu phải dài từ 5 đến 10 ký tự',
          },
          is: {
            args: /^(?=.*[!@#$%^&*])/,
            msg: 'Mật khẩu phải có ký tự đặc biệt',
          },
        },
      },
      fullName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      phone: { type: DataTypes.STRING, allowNull: false, unique: true },
      sex: { type: DataTypes.STRING, allowNull: false },
      birthday: { type: DataTypes.DATE, allowNull: false },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:
          'https://1.bp.blogspot.com/-tb6Jty3tGvI/XqGjhwS-9RI/AAAAAAAAikQ/MgRq5Ic_TC00ghFtSjAxleM-fDsmMUatwCLcBGAsYHQ/s1600/Hinh-anh-meo-ngau-nhat%2B%25288%2529.jpg',
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Users',
    }
  )
  return Users
}
