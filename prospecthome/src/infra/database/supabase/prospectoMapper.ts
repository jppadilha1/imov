import { Prospecto } from "../../../domain/entities/Prospecto";
import { Coordinates } from "../../../domain/value-objects/Coordinates";
import { PhotoPath } from "../../../domain/value-objects/PhotoPath";
import { Address } from "../../../domain/value-objects/Address";
import { ProspectoStatus } from "../../../domain/value-objects/ProspectoStatus";
import { SyncStatus } from "../../../domain/value-objects/SyncStatus";

export type ProspectoRow = {
  id: string;
  user_id: string;
  photo_url: string;
  lat: number;
  lng: number;
  notes: string | null;
  status: string;
  address_endereco: string | null;
  address_bairro: string | null;
  created_at: string;
  updated_at: string;
};

export function mapProspectoToRow(p: Prospecto, photoUrl: string): ProspectoRow {
  return {
    id: p.id,
    user_id: p.userId,
    photo_url: photoUrl,
    lat: p.coordinates.latitude,
    lng: p.coordinates.longitude,
    notes: p.notes,
    status: p.status.value,
    address_endereco: p.address?.street ?? null,
    address_bairro: p.address?.neighborhood ?? null,
    created_at: p.createdAt.toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function mapRowToProspecto(row: ProspectoRow): Prospecto {
  let address: Address | null = null;
  if (row.address_endereco) {
    address = new Address(
      row.address_endereco,
      "S/N",
      row.address_bairro ?? "Sem Bairro",
      "",
      "",
      "00000000"
    );
  }

  return Prospecto.reconstruct({
    id: row.id,
    userId: row.user_id,
    photoPath: new PhotoPath(row.photo_url),
    coordinates: new Coordinates(row.lat, row.lng),
    address,
    notes: row.notes,
    status: new ProspectoStatus(row.status as any),
    syncStatus: SyncStatus.synced(),
    remoteId: row.id,
    createdAt: new Date(row.created_at),
  });
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = globalThis.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
