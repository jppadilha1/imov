import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";

let dbInstance: any | null = null;

export class SQLiteClient {
  static async getDb() {
    if (!dbInstance) {
      dbInstance = await SQLite.openDatabaseAsync("prospecthome.db");
      await runMigrations(dbInstance);
    }
    return dbInstance;
  }

  // Permite injetar um DB em memoria para os testes
  static setMockDb(mockDb: any) {
    dbInstance = mockDb;
  }
}
