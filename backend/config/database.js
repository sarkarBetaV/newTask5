import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Critical: Check if the DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is not set.');
  process.exit(1); // Exit the application if the database URL is missing
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Set to true in development if you want to see SQL logs
  dialectOptions: {
    ssl: {
      require: true, // This is important for Render
      rejectUnauthorized: false // This is necessary for Render's SSL setup
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;