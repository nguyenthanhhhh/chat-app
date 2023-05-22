'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class MessageModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MessageModel.init(
    {
      userNameF: DataTypes.STRING,
      userNameT: { type: DataTypes.STRING, allowNull: true },
      message: DataTypes.STRING,
      isLocate: { type: DataTypes.BOOLEAN, defaultValue: false },
      isSend: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: 'MessageModel',
      timestamps: true,
      deletedAt: true,
      paranoid: true,
    }
  )
  return MessageModel
}
