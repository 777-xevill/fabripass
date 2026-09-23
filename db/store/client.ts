import postgres from "postgres";

// FabriPass data store: Postgres (Supabase). Keeps the D1-style
// prepare().bind().first()/all()/run() + batch() shape the API routes use,
// translating `?` placeholders to `$n`.
const TABLES = ["users", "sessions", "workspaces", "products", "evidence", "activity", "blobs", "demo_events", "pilot_inquiries"];

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
  seq BIGINT GENERATED ALWAYS AS IDENTITY,
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  object_key TEXT
);
CREATE INDEX IF NOT EXISTS evidence_owner_product ON evidence(owner, product_id);
CREATE TABLE IF NOT EXISTS activity (
  seq BIGINT GENERATED ALWAYS AS IDENTITY,
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  snapshot TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS activity_owner ON activity(owner);
CREATE TABLE IF NOT EXISTS blobs (
  key TEXT PRIMARY KEY,
  content BYTEA NOT NULL,
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
${TABLES.map((t) => `ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;`).join("\n")}
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON ${TABLES.join(", ")} FROM anon, authenticated;
  END IF;
END $$;
`;

// Supabase's pooled URL carries driver hints (e.g. supa=, pgbouncer=) that
// postgres.js would forward as server startup parameters and get rejected.
function connectionUrl(): string {
  const raw = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!raw) throw new Error("POSTGRES_URL is not configured.");
  const url = new URL(raw);
  for (const key of [...url.searchParams.keys()]) {
    if (key !== "sslmode") url.searchParams.delete(key);
  }
  return url.toString();
}

let sql: postgres.Sql | null = null;
let ready: Promise<void> | null = null;

function db(): postgres.Sql {
  if (!sql) {
    const url = connectionUrl();
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    sql = postgres(url, {
      prepare: false,
      max: 3,
      idle_timeout: 20,
      ssl: local ? false : "require",
      transform: { undefined: null },
    });
  }
  return sql;
}

async function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = db()
      .begin(async (tx) => {
        await tx`SELECT pg_advisory_xact_lock(724301)`;
        await tx.unsafe(SCHEMA);
      })
      .then(() => undefined)
      .catch((e) => {
        ready = null;
        throw e;
      });
  }
  return ready;
}

function toPg(query: string): string {
  let n = 0;
  return query.replace(/\?/g, () => `$${++n}`);
}

type Param = postgres.ParameterOrJSON<never>;
export type Row = Record<string, unknown>;

class BoundStatement {
  constructor(
    public readonly sql: string,
    public readonly args: unknown[],
  ) {}
  private async exec(runner: postgres.Sql | postgres.TransactionSql = db()) {
    return runner.unsafe(toPg(this.sql), this.args as Param[]);
  }
  async first<T = Row>(): Promise<T | null> {
    await ensureSchema();
    const rows = await this.exec();
    return (rows[0] as unknown as T) ?? null;
  }
  async all<T = Row>(): Promise<{ results: T[] }> {
    await ensureSchema();
    const rows = await this.exec();
    return { results: [...rows] as unknown as T[] };
  }
  async run(): Promise<{ success: true; meta: { changes: number } }> {
    await ensureSchema();
    const rows = await this.exec();
    return { success: true, meta: { changes: rows.count ?? 0 } };
  }
  runIn(tx: postgres.TransactionSql) {
    return this.exec(tx);
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
  batch(statements: BoundStatement[]): Promise<{ meta: { changes: number }; results: unknown[] }[]>;
}

export function getStore(): Store {
  return {
    prepare(query: string) {
      return new PreparedStatement(query);
    },
    async batch(statements: BoundStatement[]) {
      await ensureSchema();
      const results = await db().begin(async (tx) => {
        const out = [];
        for (const s of statements) out.push(await s.runIn(tx));
        return out;
      });
      return results.map((r) => ({ meta: { changes: r.count ?? 0 }, results: [...r] }));
    },
  };
}

export interface BlobObject {
  body: ArrayBuffer;
  httpMetadata?: { contentType?: string };
}

export interface BlobStore {
  put(key: string, content: Uint8Array, options?: { httpMetadata?: { contentType?: string } }): Promise<void>;
  get(key: string): Promise<BlobObject | null>;
  delete(key: string): Promise<void>;
}

export function getBlobStore(): BlobStore {
  return {
    async put(key, content, options) {
      await ensureSchema();
      const type = options?.httpMetadata?.contentType || "application/octet-stream";
      await db()`INSERT INTO blobs(key,content,content_type,created_at) VALUES(${key},${Buffer.from(content)},${type},${new Date().toISOString()})
        ON CONFLICT(key) DO UPDATE SET content=excluded.content,content_type=excluded.content_type,created_at=excluded.created_at`;
    },
    async get(key) {
      await ensureSchema();
      const [row] = await db()<{ content: Buffer; content_type: string }[]>`SELECT content,content_type FROM blobs WHERE key=${key}`;
      if (!row) return null;
      const bytes = row.content;
      return {
        body: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
        httpMetadata: { contentType: row.content_type },
      };
    },
    async delete(key) {
      await ensureSchema();
      await db()`DELETE FROM blobs WHERE key=${key}`;
    },
  };
}
