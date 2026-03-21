import mysql from 'mysql2/promise';

// Load env vars for non-Next.js contexts (e.g. scripts, tests)
if (!process.env.DB_HOST) {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch {
    // dotenv may not be installed — that's fine in production
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbPool extends mysql.Pool {}

// ─── Config ───────────────────────────────────────────────────────────────────

function getPoolConfig(): mysql.PoolOptions {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_SCHEMA, DB_PORT } = process.env;

  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_SCHEMA) {
    throw new Error(
      `Missing required DB env vars. Received: DB_HOST=${DB_HOST}, DB_USER=${DB_USER}, DB_SCHEMA=${DB_SCHEMA}`
    );
  }

  return {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_SCHEMA,
    port: Number(DB_PORT) || 3306,

    // Pool sizing — keep small for serverless/edge environments
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 50,           // queue up to 50 pending requests instead of unlimited

    // Timeouts
    connectTimeout: 10_000,   // 10 s to establish connection
    idleTimeout: 60_000,      // release idle connections after 60 s

    // Keep-alive so the TCP connection doesn't silently drop
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,

    // Automatically re-establish dropped connections
    // (mysql2 handles this internally via the pool)
    namedPlaceholders: true,
  };
}

// ─── Singleton (survives HMR in dev, one instance per lambda warm start) ─────

const GLOBAL_KEY = Symbol.for('mysql2.pool');

type GlobalWithPool = typeof globalThis & { [GLOBAL_KEY]?: mysql.Pool };

function getPool(): mysql.Pool {
  const g = globalThis as GlobalWithPool;

  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = mysql.createPool(getPoolConfig());

    // Surface pool-level errors rather than swallowing them silently
    g[GLOBAL_KEY].on('connection', (conn) => {
      conn.on('error', (err) => {
        console.error('[db] connection error:', err.code, err.message);
      });
    });
  }

  return g[GLOBAL_KEY];
}

// ─── Public pool export ───────────────────────────────────────────────────────

/**
 * Use `db` anywhere you need the pool:
 *   const [rows] = await db.query('SELECT 1');
 */
const db: mysql.Pool = new Proxy({} as mysql.Pool, {
  get(_target, prop) {
    // During Next.js build, env vars may be absent — fail gracefully
    if (!process.env.DB_HOST) {
      if (prop === 'query' || prop === 'execute') {
        return async () => {
          throw new Error('[db] Database environment variables are not set.');
        };
      }
      return undefined;
    }

    const pool = getPool();
    const value = (pool as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(pool) : value;
  },
});

export default db;