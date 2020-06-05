import Sequelize from 'sequelize'
import config from '@/config/config.json'

const DATABASE_URL = process.env.DATABASE_URL || config.dbs.mysql.url
const DB_LOGGING = process.env.DB_LOGGING || config.dbs.mysql.logging

const sequelize = new Sequelize(DATABASE_URL, {
  logging: DB_LOGGING,
  dialect: 'mysql',
})

export default { sequelize, Sequelize }

