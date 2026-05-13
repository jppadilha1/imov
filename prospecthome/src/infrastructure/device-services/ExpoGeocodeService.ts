import * as Location from "expo-location";
import { IGeocodeService } from "../../domain/repositories/IGeocodeService";
import { Coordinates } from "../../domain/value-objects/Coordinates";
import { Address } from "../../domain/value-objects/Address";

export class ExpoGeocodeService implements IGeocodeService {
  async reverseGeocode(coordinates: Coordinates): Promise<Address | null> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      if (!results || results.length === 0) return null;

      const { street, district, name, subregion } = results[0];

      const streetName = street || name || '';
      const neighborhood = district || subregion || '';

      if (!streetName || !neighborhood) return null;

      return new Address(streetName, "S/N", neighborhood, "", "", "00000000");
    } catch {
      return null;
    }
  }
}
