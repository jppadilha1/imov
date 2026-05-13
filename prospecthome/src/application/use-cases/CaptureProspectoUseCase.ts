import { IPhotoService } from "../../domain/repositories/IPhotoService";
import { ILocationService } from "../../domain/repositories/ILocationService";
import { IPhotoStorage } from "../../domain/repositories/IPhotoStorage";
import { IProspectoRepository } from "../../domain/repositories/IProspectoRepository";
import { IGeocodeService } from "../../domain/repositories/IGeocodeService";
import { Prospecto } from "../../domain/entities/Prospecto";

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
      id: "local-" + Date.now() + Math.random().toString(36).substring(7),
      userId,
      photoPath: savedPhoto,
      coordinates: coords
    });

    try {
      const address = await this.geocodeService.reverseGeocode(coords);
      if (address) {
        prospecto.resolveAddress(address);
      }
    } catch {
      // Geocode failure non-fatal: prospecto saves without address.
      // SyncProspectosUseCase retries geocode for pending items.
    }

    await this.prospectoRepository.save(prospecto);

    return prospecto;
  }
}
