'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('requestFriends', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userNameF: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userNameT: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      request: {
        type: Sequelize.BOOLEAN,
      },
      status: {
        type: Sequelize.STRING,
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

    await queryInterface.addConstraint('requestFriends', {
      type: 'unique',
      fields: ['userNameF', 'userNameT'],
      name: 'userRequests_unique_constraint',
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('requestFriends')
  },
}
