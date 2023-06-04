'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'requestFriends',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        userNameF: {
          type: Sequelize.STRING,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'userName',
          },
        },
        userNameT: {
          type: Sequelize.STRING,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'userName',
          },
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
      },
      {
        uniqueKeys: {
          actions_unique: {
            fields: ['userNameF', 'userNameT'],
          },
        },
      }
    )
    await queryInterface.addConstraint('userRequest', {
      type: 'unique',
      fields: ['id', 'username'],
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('requestFriends')
  },
}
