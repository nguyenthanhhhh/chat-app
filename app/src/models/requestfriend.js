'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class requestFriend extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Users }) {
      this.belongsTo(Users, {
        foreignKey: 'userNameF',
        targetKey: 'userName',
        as: 'reqName',
      })
    }
  }
  requestFriend.init(
    {
      userNameF: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: 'Users', key: 'userName' },
      },
      userNameT: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isDifferentToUserName(value) {
            if (value === this.userName) {
              throw new Error('userName and userNameFriend must different')
            }
          },
        },
      },
      request: DataTypes.BOOLEAN,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'requestFriend',
    }
  )
  return requestFriend
}
