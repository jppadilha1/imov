import { SupabaseClient } from "@supabase/supabase-js";
import * as FileSystem from "expo-file-system/legacy";
import { IProspectoRepository } from "../../../domain/repositories/IProspectoRepository";
import { IPhotoStorage } from "../../../domain/repositories/IPhotoStorage";
import { Prospecto } from "../../../domain/entities/Prospecto";
import {
  ProspectoRow,
  mapProspectoToRow,
  mapRowToProspecto,
  base64ToArrayBuffer,
} from "./prospectoMapper";

const BUCKET = "prospecto-photos";
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 365 * 10; // 10 years

export class SupabaseProspectoRepository implements IProspectoRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly photoStorage: IPhotoStorage
  ) {}

  async findAll(): Promise<Prospecto[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await this.supabase
      .from("prospectos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Falha ao buscar prospectos no Supabase: ${error.message}`);
    }

    return (data ?? []).map((row) => mapRowToProspecto(row as ProspectoRow));
  }

  async findById(id: string): Promise<Prospecto | null> {
    const { data, error } = await this.supabase
      .from("prospectos")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Falha ao buscar prospecto ${id} no Supabase: ${error.message}`);
    }

    if (!data) return null;
    return mapRowToProspecto(data as ProspectoRow);
  }

  async save(prospecto: Prospecto): Promise<void> {
    const photoUrl = await this.resolvePhotoUrl(prospecto);
    const row = mapProspectoToRow(prospecto, photoUrl);

    const { error } = await this.supabase
      .from("prospectos")
      .upsert(row, { onConflict: "id" });

    if (error) {
      throw new Error(`Falha ao salvar prospecto no Supabase: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error: dbError } = await this.supabase
      .from("prospectos")
      .delete()
      .eq("id", id);

    if (dbError) {
      throw new Error(`Falha ao deletar prospecto ${id}: ${dbError.message}`);
    }

    const userId = await this.getCurrentUserId();
    if (userId) {
      const remotePath = `${userId}/${id}.jpg`;
      await this.supabase.storage.from(BUCKET).remove([remotePath]);
    }
  }

  async findPending(): Promise<Prospecto[]> {
    throw new Error("findPending não aplicável ao repositório remoto");
  }

  private async getCurrentUserId(): Promise<string | null> {
    const { data } = await this.supabase.auth.getUser();
    return data.user?.id ?? null;
  }

  private async resolvePhotoUrl(prospecto: Prospecto): Promise<string> {
    const path = prospecto.photoPath.path;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return this.uploadPhoto(prospecto);
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
      throw new Error(
        `Falha ao enviar foto ao Supabase Storage: ${uploadError.message}`
      );
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
}
