import { Prospecto } from "../entities/Prospecto";

export interface ISyncGateway {
  uploadProspecto(prospecto: Prospecto): Promise<string>;
  pullUpdates(userId: string, lastSyncDate: Date): Promise<Prospecto[]>;
}
