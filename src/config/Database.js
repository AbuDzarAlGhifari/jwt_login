import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import mysql2 from 'mysql2'

dotenv.config();

const db = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: process.env.DB_DIALECT,
  dialectModule: mysql2,
  benchmark: true
});

(async () => {
  try {
    await db.authenticate();
    console.log('Connected to the database');

    // Use sync() or sync({ alter: true }) to synchronize the database
    await db.sync({ alter: true });

    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

export default db;
