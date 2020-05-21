import Sequelize from 'sequelize'
import config from '@/config/config.json'

const DB_HOST = process.env.DB_HOST || config.dbs.mysql.host
const DB_PORT = process.env.DB_PORT || config.dbs.mysql.port
const DB_USER = process.env.DB_USER || config.dbs.mysql.user
const DB_PASSWORD = process.env.DB_PASSWORD || config.dbs.mysql.password
const DB_NAME = process.env.DB_NAME || config.dbs.mysql.database
const DB_LOGGING = process.env.DB_LOGGING || config.dbs.mysql.logging

const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    user: DB_USER,
    host: DB_HOST,
    port: DB_PORT,
    logging: DB_LOGGING,
    dialect: 'mysql',
  }
)

export default { sequelize, Sequelize }

