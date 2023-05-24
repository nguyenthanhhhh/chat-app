'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class userFriend extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Users }) {
      // define association here
      this.belongsTo(Users, { foreignKey: 'userName', as: 'userNameInf' })
      this.belongsTo(Users, {
        foreignKey: 'userNameFriend',
        as: 'userNameFriendInf',
      })
    }
  }
  userFriend.init(
    {
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userNameFriend: {
        type: DataTypes.STRING,
        allowNull: true,

        validate: {
          isDifferentToUserName(value) {
            if (value === this.userName) {
              throw new Error('userName and userNameFriend must different')
            }
          },
        },
      },
      latestMessage: {
        type: DataTypes.STRING,
      },
      isSelect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'userFriend',
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['userName', 'userNameFriend'],
        },
      ],
    }
  )
  return userFriend
}
