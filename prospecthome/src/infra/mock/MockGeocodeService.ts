import { IGeocodeService } from "../../domain/repositories/IGeocodeService";
import { Coordinates } from "../../domain/value-objects/Coordinates";
import { Address } from "../../domain/value-objects/Address";

export class MockGeocodeService implements IGeocodeService {
  async reverseGeocode(_coordinates: Coordinates): Promise<Address | null> {
    return null;
  }
}
