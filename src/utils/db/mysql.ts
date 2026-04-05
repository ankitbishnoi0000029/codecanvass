import mysql from 'mysql2/promise';

// Load env vars for non-Next.js contexts
if (!process.env.DB_HOST) {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch {}
}

// ─── Types ─────────────────────────────────────────────

export interface DbPool extends mysql.Pool {}

// ─── Config ────────────────────────────────────────────

function getPoolConfig(): mysql.PoolOptions {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_SCHEMA, DB_PORT } = process.env;

  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_SCHEMA) {
    throw new Error(
      `Missing DB env vars. DB_HOST=${DB_HOST}, DB_USER=${DB_USER}, DB_SCHEMA=${DB_SCHEMA}`
    );
  }

  return {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_SCHEMA,
    port: Number(DB_PORT) || 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    connectTimeout: 10000,

    // 🔥 IMPROVED
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

    idleTimeout: 30000,

    namedPlaceholders: true,
  };
}

// ─── Singleton ─────────────────────────────────────────

const GLOBAL_KEY = Symbol.for('mysql2.pool');

type GlobalWithPool = typeof globalThis & {
  [GLOBAL_KEY]?: mysql.Pool;
};

function getPool(): mysql.Pool {
  const g = globalThis as GlobalWithPool;

  if (!g[GLOBAL_KEY]) {
    const pool = mysql.createPool(getPoolConfig());

    // 🔥 connection-level error handling
    pool.on('connection', (conn) => {
      conn.on('error', (err) => {
        console.error('[db] connection error:', err.code);

        if (
          err.code === 'PROTOCOL_CONNECTION_LOST' ||
          err.code === 'ECONNRESET'
        ) {
          console.log('[db] connection lost, will auto-recover via pool');
        }
      });
    });

    // 🔥 pool-level error handling
    (pool as any).on('error', (err: any) => {
      console.error('[db] pool error:', err.code);
    });

    g[GLOBAL_KEY] = pool;

    // 🔥 KEEP-ALIVE (important for WAMP / local / idle fix)
    setInterval(async () => {
      try {
        await pool.query('SELECT 1');
        // console.log('[db] keep-alive ping');
      } catch (err) {
        console.error('[db] keep-alive failed');
      }
    }, 30000);
  }

  return g[GLOBAL_KEY];
}

// ─── SAFE QUERY (🔥 MAIN FIX) ─────────────────────────

async function safeQuery<T = any>(
  query: string,
  values?: any[]
): Promise<[T, any]> {
  const pool = getPool();

  try {
    return (await pool.query(query, values)) as [T, any];
  } catch (err: any) {
    console.error('[db] query error:', err.code);

    // 🔁 retry on connection errors
    if (
      err.code === 'ECONNRESET' ||
      err.code === 'PROTOCOL_CONNECTION_LOST' ||
      err.code === 'ETIMEDOUT'
    ) {
      console.log('[db] retrying query...');
      return (await pool.query(query, values)) as [T, any];
    }

    throw err;
  }
}

// ─── Public Export ─────────────────────────────────────

const db = {
  query: safeQuery,
  execute: safeQuery,
};

export default db;