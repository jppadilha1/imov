export class Coordinates {
  private readonly _latitude: number;
  private readonly _longitude: number;

  constructor(latitude: number, longitude: number) {
    if (latitude < -90 || latitude > 90) {
      throw new Error("Latitude inválida. Deve estar entre -90 e 90.");
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error("Longitude inválida. Deve estar entre -180 e 180.");
    }
    
    this._latitude = latitude;
    this._longitude = longitude;
    Object.freeze(this);
  }

  get latitude(): number {
    return this._latitude;
  }

  get longitude(): number {
    return this._longitude;
  }
}
