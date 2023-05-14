"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class userFriend extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Users }) {
      // define association here
      this.belongsTo(Users, { foreignKey: "userName" });
      this.belongsTo(Users, { foreignKey: "userNameFriend" });
    }
  }
  userFriend.init(
    {
      userName: { type: DataTypes.STRING, allowNull: false, unique: false },
      userNameFriend: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
        validate: {
          isDifferentToUserName(value) {
            if (value === this.userName) {
              throw new Error("userName and userNameFriend must different");
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "userFriend",
    }
  );
  return userFriend;
};
