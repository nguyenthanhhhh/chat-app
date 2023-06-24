'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('userFriends', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userNameFriend: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      latestMessage: {
        type: Sequelize.STRING,
      },
      isSelect: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })

    await queryInterface.addConstraint('userFriends', {
      type: 'unique',
      fields: ['userName', 'userNameFriend'],
      name: 'userFriends_unique_constraint',
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('userFriends')
  },
}
