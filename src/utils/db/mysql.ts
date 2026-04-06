import mysql from 'mysql2/promise';

if (!process.env.DB_HOST) {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch {}
}

export interface DbPool extends mysql.Pool {}

function getPoolConfig(): mysql.PoolOptions {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_SCHEMA, DB_PORT } = process.env;

  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_SCHEMA) {
    throw new Error(
      `Missing required DB env vars. DB_HOST=${DB_HOST}, DB_USER=${DB_USER}, DB_SCHEMA=${DB_SCHEMA}`
    );
  }

  return {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_SCHEMA,
    port: Number(DB_PORT) || 3306,

    waitForConnections: true,

    // ✅ VERCEL KE LIYE SABSE IMPORTANT
    // Har serverless function sirf 1 connection use kare
    // 5 rakha toh = disaster (50 concurrent users = 250 connections = Hostinger ban)
    connectionLimit: 1,
    queueLimit: 10,

    connectTimeout: 8_000,
    idleTimeout: 20_000,    // Hostinger ka wait_timeout usually 28800s hai
                             // lekin serverless mein 20s rakhna safe hai

    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

    namedPlaceholders: true,
  };
}

const GLOBAL_KEY = Symbol.for('mysql2.pool');
type GlobalWithPool = typeof globalThis & { [GLOBAL_KEY]?: mysql.Pool };

function getPool(): mysql.Pool {
  const g = globalThis as GlobalWithPool;

  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = mysql.createPool(getPoolConfig());

    g[GLOBAL_KEY].on('connection', (conn) => {
      conn.on('error', (err) => {
        if (
          err.code === 'ECONNRESET' ||
          err.code === 'PROTOCOL_CONNECTION_LOST' ||
          err.code === 'ECONNREFUSED'
        ) {
          return; // silently ignore — pool recover kar lega
        }
        console.error('[db] unexpected error:', err.code, err.message);
      });
    });
  }

  return g[GLOBAL_KEY];
}

async function executeWithRetry<T>(
  fn: (pool: mysql.Pool) => Promise<T>,
  retries = 2
): Promise<T> {
  const pool = getPool();
  try {
    return await fn(pool);
  } catch (err: any) {
    if (
      retries > 0 &&
      (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST')
    ) {
      await new Promise(r => setTimeout(r, 150));
      return executeWithRetry(fn, retries - 1);
    }
    throw err;
  }
}

const ddb: mysql.Pool = new Proxy({} as mysql.Pool, {
  get(_target, prop) {
    if (!process.env.DB_HOST) {
      if (prop === 'query' || prop === 'execute') {
        return async () => {
          throw new Error('[db] Database environment variables are not set.');
        };
      }
      return undefined;
    }

    const pool = getPool();

    if (prop === 'query' || prop === 'execute') {
      return (...args: any[]) =>
        executeWithRetry((p) => (p[prop] as Function)(...args));
    }

    const value = (pool as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(pool) : value;
  },
});

export default ddb;