import { Corretor } from "../entities/Corretor";

export interface IAuthGateway {
  login(email: string, password: string): Promise<{ corretor: Corretor; token: string }>;
  register(email: string, password: string, name?: string): Promise<{ corretor: Corretor; token: string }>;
  logout(): Promise<void>;
  refreshToken(token: string): Promise<{ corretor: Corretor; token: string }>;
}
