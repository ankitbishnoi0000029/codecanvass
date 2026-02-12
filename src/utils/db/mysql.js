import mysql from 'mysql2/promise';

// Ensure environment variables are loaded
if (!process.env.DB_HOST) {
  require('dotenv').config({ path: '.env.local' });
}

const ddb = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA,
    port: Number(process.env.DB_PORT),
    // Try without SSL first
    // ssl: {
    //     ca: process.env.AIVEN_SSL_CA,
    //     rejectUnauthorized: false,
    // },
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 60000, // 60 seconds
    // Enable keep alive to prevent connection drops
    keepAliveInitialDelay: 0,
});
export default ddb;
