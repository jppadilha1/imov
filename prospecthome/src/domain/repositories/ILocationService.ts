import { Coordinates } from "../value-objects/Coordinates";

export interface ILocationService {
  getCurrentPosition(): Promise<Coordinates>;
}
