import { Coordinates } from "../value-objects/Coordinates";
import { Address } from "../value-objects/Address";

export interface IGeocodeService {
  reverseGeocode(coordinates: Coordinates): Promise<Address | null>;
}
