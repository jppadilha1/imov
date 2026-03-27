import { ISyncGateway } from "../../domain/repositories/ISyncGateway";
import { Prospecto } from "../../domain/entities/Prospecto";
import { createClient } from "@supabase/supabase-js";

// Supabase client lazy initialization
let supabase: any = null;

export class SupabaseSyncGateway implements ISyncGateway {
  private getClient() {
    if (!supabase) {
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
         // Fallback if not loaded
         return null;
      }
      supabase = createClient(
        process.env.EXPO_PUBLIC_SUPABASE_URL,
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
      );
    }
    return supabase;
  }

  async uploadProspecto(prospecto: Prospecto): Promise<string> {
    const sb = this.getClient();
    if (!sb) return `fallback-remote-${prospecto.id}`;

    // Converte a local entity to remote remote logic
    const { data, error } = await sb.from('prospectos').upsert({
      id: prospecto.id,
      user_id: prospecto.userId,
      lat: prospecto.coordinates.latitude,
      lng: prospecto.coordinates.longitude,
      status: prospecto.status.value,
      created_at: prospecto.createdAt.toISOString(),
      notes: prospecto.notes,
      address_endereco: prospecto.address?.street,
      address_bairro: prospecto.address?.neighborhood
    }).select().single();

    if (error) {
      throw new Error(`Erro no Supabase: ${error.message}`);
    }

    return data.id; // retorno do remote ID real (ou mesmo ID logado)
  }

  async pullUpdates(userId: string, lastSyncDate: Date): Promise<Prospecto[]> {
    const sb = this.getClient();
    if (!sb) return [];

    const { data, error } = await sb
      .from('prospectos')
      .select('*')
      .eq('user_id', userId)
      .gt('updated_at', lastSyncDate.toISOString());

    if (error) {
      throw new Error(`Erro ao puxar dados: ${error.message}`);
    }

    // Mapeamento futuro conforme necessário
    return [];
  }
}
