import db from './db'
import User from './user'

class ServiceUser extends db.Sequelize.Model {
  static findByserviceUserId(serviceCode, serviceUserId) {
    return this.findOne({
      include: [{
        model: User,
      }],
      where: {
        serviceCode: serviceCode,
        serviceUserId: serviceUserId,
      }
    })
  }

  static findByUserId(userId) {
    return this.findOne({
      include: [{
        model: User,
      }],
      where: {
        userId: userId,
      }
    })
  }
}

ServiceUser.init(
  {
    id: {
      type: db.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    serviceCode: {
      type: db.Sequelize.STRING(64),
      allowNull: false
    },
    serviceUserId: {
      type: db.Sequelize.STRING(128),
      allowNull: false
    },
    userId: {
      type: db.Sequelize.INTEGER,
      allowNull: false
    },
  }, {
    sequelize: db.sequelize,
    modelName: 'ServiceUser',
    tableName: 'service_user',
    freezeTableName: true, // not changed table name
    underscored: true,
    timestamps: true, // Add updatedAt, createdAt
    indexes: [
      { fields: ['service_code', 'service_user_id'], unique: true },
    ],
  }
)

export default ServiceUser

