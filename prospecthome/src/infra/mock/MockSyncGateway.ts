import { ISyncGateway } from "../../domain/repositories/ISyncGateway";
import { Prospecto } from "../../domain/entities/Prospecto";

export class MockSyncGateway implements ISyncGateway {
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async uploadProspecto(prospecto: Prospecto): Promise<string> {
    await this.delay(800); // Simulando delay da nuvem
    return `remote-mock-${prospecto.id}`;
  }

  async pullUpdates(userId: string, lastSyncDate: Date): Promise<Prospecto[]> {
    await this.delay(500);
    return [];
  }
}
