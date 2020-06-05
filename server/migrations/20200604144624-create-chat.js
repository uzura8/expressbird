'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return [
      await queryInterface.createTable('chat', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        type: {
          type: Sequelize.ENUM,
          values: ['private', 'public', 'support'],
          allowNull: false,
          defaultValue: 'public',
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: true
        },
        body: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          onUpdate : Sequelize.literal('CURRENT_TIMESTAMP'),
        }
      }),
      queryInterface.bulkInsert('chat', [{
        type: 'public',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      }])
    ]
  },
  down: async (queryInterface, Sequelize) => {
    return [
      await queryInterface.bulkDelete('chat', null, {}),
      await queryInterface.dropTable('chat'),
    ]
  }
};

