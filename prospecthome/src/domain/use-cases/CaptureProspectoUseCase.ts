import { IPhotoService } from "../repositories/IPhotoService";
import { ILocationService } from "../repositories/ILocationService";
import { IPhotoStorage } from "../repositories/IPhotoStorage";
import { IProspectoRepository } from "../repositories/IProspectoRepository";
import { IGeocodeService } from "../repositories/IGeocodeService";
import { Prospecto } from "../entities/Prospecto";

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class CaptureProspectoUseCase {
  constructor(
    private readonly photoService: IPhotoService,
    private readonly locationService: ILocationService,
    private readonly photoStorage: IPhotoStorage,
    private readonly prospectoRepository: IProspectoRepository,
    private readonly geocodeService: IGeocodeService
  ) {}

  async execute(userId: string): Promise<Prospecto | null> {
    const rawPhotoUri = await this.photoService.capturePhoto();

    if (!rawPhotoUri) return null;

    const [compressedUri, coords] = await Promise.all([
      this.photoService.compressPhoto(rawPhotoUri),
      this.locationService.getCurrentPosition()
    ]);

    const savedPhoto = await this.photoStorage.savePhoto(compressedUri);

    const prospecto = Prospecto.create({
      id: generateUUID(),
      userId,
      photoPath: savedPhoto,
      coordinates: coords
    });

    try {
      const address = await this.geocodeService.reverseGeocode(coords);
      if (address) {
        prospecto.resolveAddress(address);
      }
    } catch(e) {
      console.error('Fail in reverse geocoding:', e);
    }

    await this.prospectoRepository.save(prospecto);
    

    return prospecto;
  }
}
