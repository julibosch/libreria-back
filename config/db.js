import Sequelize from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); 

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER_ESTEFA , process.env.DB_PASSWORD_ESTEFA,{
  host: '127.0.0.1',
  port: '3307',
  dialect: 'mysql',
  define: {
    timestamps: false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  operatorAliases: false
});

export default db;