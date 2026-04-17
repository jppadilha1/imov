import { ILocationService } from "../../domain/repositories/ILocationService";
import { Coordinates } from "../../domain/value-objects/Coordinates";

/**
 * MockLocationService provides stable GPS coordinates for dev/simulator
 * without requiring real GPS access.
 * 
 * Default coordinates are near Centro, Varginha - MG (-21.5544, -45.4384).
 */
export class MockLocationService implements ILocationService {
  private readonly defaultCoords: Coordinates;

  constructor(lat: number = -21.5544, lng: number = -45.4384) {
    this.defaultCoords = new Coordinates(lat, lng);
  }

  async getCurrentPosition(): Promise<Coordinates> {
    // Simulate a small GPS delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.defaultCoords;
  }
}
