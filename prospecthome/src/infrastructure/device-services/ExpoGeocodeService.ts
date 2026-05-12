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

      const { street, name, district, subregion } = results[0];

      // street is the road name; fall back to name (full address string) when absent
      const streetName = street || name;
      // district is the neighborhood/bairro; fall back to subregion (city area)
      const neighborhood = district || subregion;

      if (!streetName || !neighborhood) return null;

      return new Address(streetName, "S/N", neighborhood, "", "", "00000000");
    } catch {
      return null;
    }
  }
}
