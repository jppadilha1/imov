export const MIGRATIONS = [
  `
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      nome TEXT,
      created_at TEXT NOT NULL,
      token TEXT NOT NULL
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS prospectos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      photo_path TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      notes TEXT,
      status TEXT NOT NULL,
      sync_status TEXT NOT NULL,
      remote_id TEXT,
      address_endereco TEXT,
      address_bairro TEXT,
      created_at TEXT NOT NULL
    );
  `
];

export async function runMigrations(db: any) {
  // Expo SQLite modern api execAsync / execSync
  for (const statement of MIGRATIONS) {
    if (db.execAsync) {
      await db.execAsync(statement);
    } else {
      // fallback for test mocks
      await db.exec([{ sql: statement, args: [] }], false);
    }
  }
}
