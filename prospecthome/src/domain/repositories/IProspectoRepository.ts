import { Prospecto } from "../entities/Prospecto";

export interface IProspectoRepository {
  save(prospecto: Prospecto): Promise<void>;
  findById(id: string): Promise<Prospecto | null>;
  findAll(): Promise<Prospecto[]>;
  findPending(): Promise<Prospecto[]>;
  delete(id: string): Promise<void>;
}
