import mysql from 'mysql2/promise';

// Ensure environment variables are loaded
if (!process.env.DB_HOST) {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    // Ignore if .env.local not found
  }
}

let ddb = null;

const createPool = () => {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_SCHEMA) {
    throw new Error('Database environment variables not set');
  }
  return mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_SCHEMA,
      port: Number(process.env.DB_PORT) || 3306,
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
};

export default new Proxy({}, {
  get(target, prop) {
    if (!ddb) {
      try {
        ddb = createPool();
      } catch (error) {
        // During build, if DB not available, return a mock that throws error
        if (typeof window === 'undefined') { // Server side
          return {
            query: async () => {
              throw new Error('Database not available during build');
            }
          };
        }
        throw error;
      }
    }
    return ddb[prop];
  }
});
