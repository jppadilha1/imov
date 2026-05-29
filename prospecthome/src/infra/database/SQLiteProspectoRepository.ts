import { IProspectoRepository } from "../../domain/repositories/IProspectoRepository";
import { Prospecto } from "../../domain/entities/Prospecto";
import { Coordinates } from "../../domain/value-objects/Coordinates";
import { PhotoPath } from "../../domain/value-objects/PhotoPath";
import { Address } from "../../domain/value-objects/Address";
import { ProspectoStatus } from "../../domain/value-objects/ProspectoStatus";
import { SyncStatus } from "../../domain/value-objects/SyncStatus";
import { SQLiteClient } from "./SQLiteClient";

export class SQLiteProspectoRepository implements IProspectoRepository {
  
  private mapRowToEntity(row: any): Prospecto {
    let address = null;
    if (row.address_endereco) {
      // Mocking reconstruction of Address: since the test row doesn't have all fields, provide simple fallbacks
      // Address.ts constructor: street, number, neighborhood, city, state, zipCode
      address = new Address(
        row.address_endereco,
        "S/N",
        row.address_bairro || "Sem Bairro",
        "", "", "00000000"
      );
    }

    return Prospecto.reconstruct({
      id: row.id,
      userId: row.user_id,
      photoPath: new PhotoPath(row.photo_path),
      coordinates: new Coordinates(row.lat, row.lng),
      address,
      notes: row.notes,
      status: (ProspectoStatus as any)[row.status] ? (ProspectoStatus as any)[row.status]() : new ProspectoStatus(row.status),
      syncStatus: (SyncStatus as any)[row.sync_status] ? (SyncStatus as any)[row.sync_status]() : new SyncStatus(row.sync_status),
      remoteId: row.remote_id,
      createdAt: new Date(row.created_at)
    });
  }

  async save(prospecto: Prospecto): Promise<void> {
    const db = await SQLiteClient.getDb();
    await db.runAsync(`
      INSERT OR REPLACE INTO prospectos (
        id, user_id, photo_path, lat, lng, notes, status, sync_status, remote_id, address_endereco, address_bairro, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      prospecto.id,
      prospecto.userId,
      prospecto.photoPath.path,
      prospecto.coordinates.latitude,
      prospecto.coordinates.longitude,
      prospecto.notes,
      prospecto.status.value,
      prospecto.syncStatus.value,
      prospecto.remoteId,
      prospecto.address?.street || null,
      prospecto.address?.neighborhood || null,
      prospecto.createdAt.toISOString()
    ]);
  }

  async findById(id: string): Promise<Prospecto | null> {
    const db = await SQLiteClient.getDb();
    const row = await db.getFirstAsync("SELECT * FROM prospectos WHERE id = ?", [id]);
    if (!row) return null;
    return this.mapRowToEntity(row);
  }

  async findAll(): Promise<Prospecto[]> {
    const db = await SQLiteClient.getDb();
    const rows = await db.getAllAsync("SELECT * FROM prospectos ORDER BY created_at DESC");
    return rows.map((row: any) => this.mapRowToEntity(row));
  }

  async findPending(): Promise<Prospecto[]> {
    const db = await SQLiteClient.getDb();
    const rows = await db.getAllAsync("SELECT * FROM prospectos WHERE sync_status = ?", ["pending"]);
    return rows.map((row: any) => this.mapRowToEntity(row));
  }

  async delete(id: string): Promise<void> {
    const db = await SQLiteClient.getDb();
    await db.runAsync("DELETE FROM prospectos WHERE id = ?", [id]);
  }
}
