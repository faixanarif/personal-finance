import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Initialize MySQL connection pool with mysql2
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'aaysha100',
  database: process.env.DB_NAME || 'personalfinancedb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export promise wrapper for async/await querying
const promisePool = pool.promise();

/**
 * Ping MySQL on boot to verify connectivity.
 * If it fails, log the exact error and exit with status code 1.
 */
export const testConnection = async () => {
  try {
    await promisePool.query('SELECT 1');
    console.log(`✅ Successfully connected to MySQL database: ${process.env.DB_NAME || 'personalfinancedb'}`);
  } catch (error) {
    console.error(`❌ Failed to connect to MySQL database: ${error.message}`);
    process.exit(1);
  }
};

export default promisePool;
