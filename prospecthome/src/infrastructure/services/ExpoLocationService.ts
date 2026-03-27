import { ILocationService } from "../../domain/repositories/ILocationService";
import { Coordinates } from "../../domain/value-objects/Coordinates";

import * as Location from "expo-location";

export class ExpoLocationService implements ILocationService {
  async getCurrentPosition(): Promise<Coordinates> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== "granted") {
      throw new Error("Permissão de localização negada.");
    }

    const { coords } = await Location.getCurrentPositionAsync({});
    return new Coordinates(coords.latitude, coords.longitude);
  }
}
