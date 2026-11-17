import pg from "pg";

const { Pool } = pg;
let pool: pg.Pool | undefined;
type SqlClient = { query: (text: string, values?: readonly unknown[]) => Promise<unknown> };

const getPool = () => {
  if (!process.env.DATABASE_URL) return undefined;
  return (pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.SQL_POOL_MAX) || 10,
    connectionTimeoutMillis: Number(process.env.SQL_CONNECT_TIMEOUT_MS) || 3000,
    idleTimeoutMillis: 30_000,
  }));
};

export function createAuditLogRepository(connection: SqlClient) {
  return {
    async ensureTable() {
      await connection.query(`
    CREATE TABLE IF NOT EXISTS api_audit_log (
      id BIGSERIAL PRIMARY KEY,
      request_id VARCHAR(128) NOT NULL,
      method VARCHAR(16) NOT NULL,
      path TEXT NOT NULL,
      status INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
      return true;
    },
    async record(entry: {
  requestId: string;
  method: string;
  path: string;
  status: number;
    }) {
      await connection.query(
        "INSERT INTO api_audit_log (request_id, method, path, status) VALUES ($1, $2, $3, $4)",
        [entry.requestId, entry.method, entry.path, entry.status],
      );
      return true;
    },
  };
}

export async function ensureAuditLogTable() {
  const connection = getPool();
  if (!connection) return false;
  return createAuditLogRepository(connection).ensureTable();
}

export async function recordAuditLog(entry: {
  requestId: string;
  method: string;
  path: string;
  status: number;
}) {
  const connection = getPool();
  if (!connection) return false;
  return createAuditLogRepository(connection).record(entry);
}

export async function closeSqlPool() {
  await pool?.end();
  pool = undefined;
}
