'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return [
      await queryInterface.createTable('service_user', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        service_code: {
          type: Sequelize.STRING(64),
          allowNull: false
        },
        service_user_id: {
          type: Sequelize.STRING(128),
          allowNull: false
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true
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
      }, {
        uniqueKeys: {
          service_code_service_user_id_UNIQUE_idx: {
            fields: ['service_code', 'service_user_id']
          }
        }
      }),
      await queryInterface.addConstraint('service_user', ['user_id'], {
        type: 'foreign key',
        name: 'service_user_user_id_user_id',
        references: {
          table: 'user',
          field: 'id',
        },
        onDelete: 'cascade',
      }),
    ]
  },
  down: async (queryInterface, Sequelize) => {
    return [
      await queryInterface.removeConstraint('service_user', 'service_user_user_id_user_id'),
      await queryInterface.dropTable('service_user'),
    ]
  }
};
