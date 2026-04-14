import { ILocationService } from "../../domain/repositories/ILocationService";
import { Coordinates } from "../../domain/value-objects/Coordinates";

/**
 * MockLocationService provides stable GPS coordinates for dev/simulator
 * without requiring real GPS access.
 * 
 * Default coordinates are near Av. Paulista, São Paulo (-23.5613, -46.6560).
 */
export class MockLocationService implements ILocationService {
  private readonly defaultCoords: Coordinates;

  constructor(lat: number = -23.5613, lng: number = -46.6560) {
    this.defaultCoords = new Coordinates(lat, lng);
  }

  async getCurrentPosition(): Promise<Coordinates> {
    // Simulate a small GPS delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.defaultCoords;
  }
}
