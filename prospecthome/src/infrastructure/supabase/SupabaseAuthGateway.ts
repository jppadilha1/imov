import { SupabaseClient, User } from "@supabase/supabase-js";
import { IAuthGateway } from "../../domain/repositories/IAuthGateway";
import { Corretor } from "../../domain/entities/Corretor";

export class SupabaseAuthGateway implements IAuthGateway {
  constructor(private readonly supabase: SupabaseClient) {}

  async login(email: string, password: string): Promise<{ corretor: Corretor; token: string }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error("Sessão Supabase ausente após login.");
    return {
      corretor: this.mapUserToCorretor(data.session.user),
      token: data.session.access_token,
    };
  }

  async register(email: string, password: string, name?: string): Promise<{ corretor: Corretor; token: string }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { nome: name ?? null } },
    });
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error("Sessão Supabase ausente após registro.");
    return {
      corretor: this.mapUserToCorretor(data.session.user),
      token: data.session.access_token,
    };
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  async refreshToken(_token: string): Promise<{ corretor: Corretor; token: string }> {
    const { data, error } = await this.supabase.auth.refreshSession();
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error("Sessão Supabase ausente após refresh.");
    return {
      corretor: this.mapUserToCorretor(data.session.user),
      token: data.session.access_token,
    };
  }

  private mapUserToCorretor(user: User): Corretor {
    const metadata = user.user_metadata ?? {};
    const nome = (metadata.nome as string | undefined) ?? null;
    return new Corretor(
      user.id,
      user.email ?? "",
      nome,
      new Date(user.created_at)
    );
  }
}
