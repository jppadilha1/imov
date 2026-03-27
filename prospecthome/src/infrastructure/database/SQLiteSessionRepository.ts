import { ISessionRepository } from "../../domain/repositories/ISessionRepository";
import { Corretor } from "../../domain/entities/Corretor";
import { SQLiteClient } from "./SQLiteClient";

export class SQLiteSessionRepository implements ISessionRepository {
  async saveSession(corretor: Corretor, token: string): Promise<void> {
    const db = await SQLiteClient.getDb();
    
    // Deleta sessão anterior (só queremos 1)
    await db.runAsync("DELETE FROM session");
    
    // Insere nova
    await db.runAsync(
      "INSERT INTO session (id, email, nome, created_at, token) VALUES (?, ?, ?, ?, ?)",
      [corretor.id, corretor.email, corretor.nome, corretor.createdAt.toISOString(), token]
    );
  }

  async getSession(): Promise<{ corretor: Corretor; token: string } | null> {
    const db = await SQLiteClient.getDb();
    const row = await db.getFirstAsync("SELECT * FROM session LIMIT 1");
    
    if (!row) return null;

    // Reconstrói a Entity
    const corretor = new Corretor(
      row.id,
      row.email,
      row.nome,
      new Date(row.created_at)
    );

    return { corretor, token: row.token };
  }

  async clearSession(): Promise<void> {
    const db = await SQLiteClient.getDb();
    await db.runAsync("DELETE FROM session");
  }
}
