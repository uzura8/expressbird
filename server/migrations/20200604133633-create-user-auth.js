'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return [
      await queryInterface.createTable('user_auth', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
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
      await queryInterface.addConstraint('user_auth', ['user_id'], {
        type: 'foreign key',
        name: 'user_auth_user_id_user_id',
        references: {
          table: 'user',
          field: 'id',
        },
        onDelete: 'cascade',
      }),
    ];
  },
  down: async (queryInterface, Sequelize) => {
    return [
      await queryInterface.removeConstraint('user_auth', 'user_auth_user_id_user_id'),
      await queryInterface.dropTable('user_auth'),
    ]
  }
};
