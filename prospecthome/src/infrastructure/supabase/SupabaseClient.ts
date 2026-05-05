import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient as SupabaseSDKClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

let _client: SupabaseSDKClient | null = null;

export function getSupabaseClient(): SupabaseSDKClient {
  if (_client) return _client;

  const extra = Constants.expoConfig?.extra ?? {};
  const supabaseUrl = (extra.supabaseUrl as string | undefined) ?? "";
  const supabaseAnonKey = (extra.supabaseAnonKey as string | undefined) ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Variáveis Supabase ausentes. Configure SUPABASE_URL e SUPABASE_ANON_KEY no .env e reinicie o Expo."
    );
  }

  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return _client;
}
