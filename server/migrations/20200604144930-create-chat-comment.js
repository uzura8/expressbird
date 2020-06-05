'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return [
      await queryInterface.createTable('chat_comment', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        chat_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        body: {
          type: Sequelize.TEXT,
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
      await queryInterface.addConstraint('chat_comment', ['chat_id'], {
        type: 'foreign key',
        name: 'chat_comment_chat_id_chat_id',
        references: {
          table: 'chat',
          field: 'id',
        },
        onDelete: 'cascade',
      }),
    ]
  },
  down: async (queryInterface, Sequelize) => {
    return [
      await queryInterface.removeConstraint('chat_comment', 'chat_comment_chat_id_chat_id'),
      await queryInterface.dropTable('chat_comment'),
    ]
  }
};
