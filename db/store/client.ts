import { createClient, type Client } from "@libsql/client";

// FabriPass standalone data store (libSQL / SQLite dialect) — replaces the
// Cloudflare D1/R2 bindings that only exist on the OpenAI Sites platform.
// DATABASE_URL unset -> local file, no account needed (dev default).
// DATABASE_URL set -> any libSQL-compatible endpoint (e.g. Turso) for prod.
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS workspaces (
  owner TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  batch TEXT NOT NULL,
  payload TEXT NOT NULL,
  version INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS products_owner_sku_batch ON products(owner, sku, batch);
CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  object_key TEXT
);
CREATE INDEX IF NOT EXISTS evidence_owner_product ON evidence(owner, product_id);
CREATE TABLE IF NOT EXISTS activity (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  snapshot TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS activity_owner ON activity(owner);
CREATE TABLE IF NOT EXISTS blobs (
  key TEXT PRIMARY KEY,
  content BLOB NOT NULL,
  content_type TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS demo_events (
  id TEXT PRIMARY KEY,
  session TEXT NOT NULL,
  product TEXT NOT NULL,
  checkpoint TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS demo_events_session_time ON demo_events(session, created_at);
CREATE TABLE IF NOT EXISTS pilot_inquiries (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

let client: Client | null = null;
let ready: Promise<void> | null = null;

function rawClient(): Client {
  if (!client) {
    const url = process.env.DATABASE_URL || "file:./db/store/local.db";
    client = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return client;
}

async function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = rawClient()
      .executeMultiple(SCHEMA)
      .then(() => undefined)
      .catch((e) => {
        ready = null;
        throw e;
      });
  }
  return ready;
}

export type Row = Record<string, unknown>;

class BoundStatement {
  constructor(
    public readonly sql: string,
    public readonly args: unknown[],
  ) {}
  async first<T = Row>(): Promise<T | null> {
    await ensureSchema();
    const r = await rawClient().execute({ sql: this.sql, args: this.args as never[] });
    return (r.rows[0] as unknown as T) ?? null;
  }
  async all<T = Row>(): Promise<{ results: T[] }> {
    await ensureSchema();
    const r = await rawClient().execute({ sql: this.sql, args: this.args as never[] });
    return { results: r.rows as unknown as T[] };
  }
  async run(): Promise<{ success: true; meta: { changes: number } }> {
    await ensureSchema();
    const r = await rawClient().execute({ sql: this.sql, args: this.args as never[] });
    return { success: true, meta: { changes: r.rowsAffected ?? 0 } };
  }
}

class PreparedStatement {
  constructor(private sql: string) {}
  bind(...args: unknown[]): BoundStatement {
    return new BoundStatement(this.sql, args);
  }
}

export interface Store {
  prepare(sql: string): PreparedStatement;
  batch(
    statements: BoundStatement[],
  ): Promise<{ meta: { changes: number }; results: unknown[] }[]>;
}

export function getStore(): Store {
  return {
    prepare(sql: string) {
      return new PreparedStatement(sql);
    },
    async batch(statements: BoundStatement[]) {
      await ensureSchema();
      const results = await rawClient().batch(
        statements.map((s) => ({ sql: s.sql, args: s.args as never[] })),
        "write",
      );
      return results.map((r) => ({
        meta: { changes: r.rowsAffected ?? 0 },
        results: r.rows,
      }));
    },
  };
}

export interface BlobObject {
  body: ArrayBuffer;
  httpMetadata?: { contentType?: string };
}

export interface BlobStore {
  put(
    key: string,
    content: Uint8Array,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<void>;
  get(key: string): Promise<BlobObject | null>;
  delete(key: string): Promise<void>;
}

export function getBlobStore(): BlobStore {
  return {
    async put(key, content, options) {
      await ensureSchema();
      await rawClient().execute({
        sql: "INSERT INTO blobs(key,content,content_type,created_at) VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET content=excluded.content,content_type=excluded.content_type,created_at=excluded.created_at",
        args: [
          key,
          content,
          options?.httpMetadata?.contentType || "application/octet-stream",
          new Date().toISOString(),
        ] as never[],
      });
    },
    async get(key) {
      await ensureSchema();
      const r = await rawClient().execute({
        sql: "SELECT content,content_type FROM blobs WHERE key=?",
        args: [key] as never[],
      });
      const row = r.rows[0] as unknown as { content: Uint8Array; content_type: string } | undefined;
      if (!row) return null;
      const bytes = Buffer.isBuffer(row.content) ? row.content : Buffer.from(row.content);
      return {
        body: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
        httpMetadata: { contentType: row.content_type },
      };
    },
    async delete(key) {
      await ensureSchema();
      await rawClient().execute({ sql: "DELETE FROM blobs WHERE key=?", args: [key] as never[] });
    },
  };
}
