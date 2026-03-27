import { Corretor } from "../entities/Corretor";

export interface ISessionRepository {
  saveSession(corretor: Corretor, token: string): Promise<void>;
  getSession(): Promise<{ corretor: Corretor; token: string } | null>;
  clearSession(): Promise<void>;
}
