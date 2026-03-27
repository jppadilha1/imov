import { IPhotoService } from "../../domain/repositories/IPhotoService";
import { ILocationService } from "../../domain/repositories/ILocationService";
import { IPhotoStorage } from "../../domain/repositories/IPhotoStorage";
import { IProspectoRepository } from "../../domain/repositories/IProspectoRepository";
import { Prospecto } from "../../domain/entities/Prospecto";
import { v4 as uuidv4 } from "uuid";

export class CaptureProspectoUseCase {
  constructor(
    private readonly photoService: IPhotoService,
    private readonly locationService: ILocationService,
    private readonly photoStorage: IPhotoStorage,
    private readonly prospectoRepository: IProspectoRepository
  ) {}

  async execute(userId: string): Promise<Prospecto | null> {
    const rawPhotoUri = await this.photoService.capturePhoto();
    
    // Usuário cancelou ou foto falhou
    if (!rawPhotoUri) return null;

    // GPS e Compressor
    // Usamos Promise.all porque operações são independentes e O(N) de compress/IO
    const [compressedUri, coords] = await Promise.all([
      this.photoService.compressPhoto(rawPhotoUri),
      this.locationService.getCurrentPosition()
    ]);

    // Copia e valida com repositório / storage do expo filesys
    const savedPhoto = await this.photoStorage.savePhoto(compressedUri);

    // Cria e insere no banco local offline
    const prospecto = Prospecto.create({
      id: "local-" + Date.now() + Math.random().toString(36).substring(7),
      userId,
      photoPath: savedPhoto,
      coordinates: coords
    });

    await this.prospectoRepository.save(prospecto);

    return prospecto;
  }
}
