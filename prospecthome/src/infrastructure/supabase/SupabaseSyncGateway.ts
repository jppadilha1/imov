import { SupabaseClient } from "@supabase/supabase-js";
import * as FileSystem from "expo-file-system/legacy";
import { ISyncGateway } from "../../domain/repositories/ISyncGateway";
import { IPhotoStorage } from "../../domain/repositories/IPhotoStorage";
import { Prospecto } from "../../domain/entities/Prospecto";
import { Coordinates } from "../../domain/value-objects/Coordinates";
import { PhotoPath } from "../../domain/value-objects/PhotoPath";
import { Address } from "../../domain/value-objects/Address";
import { ProspectoStatus } from "../../domain/value-objects/ProspectoStatus";
import { SyncStatus } from "../../domain/value-objects/SyncStatus";

const BUCKET = "prospecto-photos";
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 365 * 10; // 10 anos

type ProspectoRow = {
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

export class SupabaseSyncGateway implements ISyncGateway {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly photoStorage: IPhotoStorage
  ) {}

  async uploadProspecto(prospecto: Prospecto): Promise<string> {
    const photoUrl = await this.uploadPhoto(prospecto);
    const row = this.mapProspectoToRow(prospecto, photoUrl);

    const { error } = await this.supabase
      .from("prospectos")
      .upsert(row, { onConflict: "id" });

    if (error) {
      throw new Error(`Falha ao inserir prospecto no Supabase: ${error.message}`);
    }

    return prospecto.id;
  }

  async pullUpdates(userId: string, lastSyncDate: Date): Promise<Prospecto[]> {
    const { data, error } = await this.supabase
      .from("prospectos")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", lastSyncDate.toISOString());

    if (error) {
      throw new Error(`Falha ao buscar atualizações no Supabase: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapRowToProspecto(row as ProspectoRow));
  }

  private async uploadPhoto(prospecto: Prospecto): Promise<string> {
    const localUri = await this.photoStorage.getPhotoUri(prospecto.photoPath);
    if (!localUri) {
      throw new Error(`Foto local não encontrada: ${prospecto.photoPath.path}`);
    }

    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const arrayBuffer = base64ToArrayBuffer(base64);

    const remotePath = `${prospecto.userId}/${prospecto.id}.jpg`;
    const { error: uploadError } = await this.supabase.storage
      .from(BUCKET)
      .upload(remotePath, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Falha ao enviar foto ao Supabase Storage: ${uploadError.message}`);
    }

    const { data: signed, error: signError } = await this.supabase.storage
      .from(BUCKET)
      .createSignedUrl(remotePath, SIGNED_URL_EXPIRES_IN_SECONDS);

    if (signError || !signed?.signedUrl) {
      throw new Error(
        `Falha ao gerar URL assinada da foto: ${signError?.message ?? "URL ausente"}`
      );
    }

    return signed.signedUrl;
  }

  private mapProspectoToRow(p: Prospecto, photoUrl: string): ProspectoRow {
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

  private mapRowToProspecto(row: ProspectoRow): Prospecto {
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
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = globalThis.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
