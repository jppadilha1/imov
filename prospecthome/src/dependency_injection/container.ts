import { IProspectoRepository } from "../domain/repositories/IProspectoRepository";
import { ISessionRepository } from "../domain/repositories/ISessionRepository";
import { IPhotoStorage } from "../domain/repositories/IPhotoStorage";
import { IAuthGateway } from "../domain/repositories/IAuthGateway";
import { ILocationService } from "../domain/repositories/ILocationService";
import { IPhotoService } from "../domain/repositories/IPhotoService";
import { ISyncGateway } from "../domain/repositories/ISyncGateway";
import { INetworkService } from "../domain/repositories/INetworkService";

// Mocks
import { MockAuthGateway } from "../infrastructure/mock/MockAuthGateway";
import { MockSyncGateway } from "../infrastructure/mock/MockSyncGateway";
import { MockLocationService } from "../infrastructure/mock/MockLocationService";
import { MockProspectoRepository } from "../infrastructure/mock/MockProspectoRepository";

// Reais
import { SQLiteProspectoRepository } from "../infrastructure/database/SQLiteProspectoRepository";
import { SQLiteSessionRepository } from "../infrastructure/database/SQLiteSessionRepository";
import { FileSystemPhotoStorage } from "../infrastructure/storage/FileSystemPhotoStorage";
import { ExpoLocationService } from "../infrastructure/services/ExpoLocationService";
import { ExpoPhotoService } from "../infrastructure/services/ExpoPhotoService";
import { NetworkService } from "../infrastructure/network/NetworkService";

const USE_REAL_DB = false;

class DIContainer {
  public prospectoRepository: IProspectoRepository;
  public sessionRepository: ISessionRepository;
  public photoStorage: IPhotoStorage;
  public authGateway: IAuthGateway;
  public locationService: ILocationService;
  public photoService: IPhotoService;
  public syncGateway: ISyncGateway;
  public networkService: INetworkService;

  constructor() {
    this.prospectoRepository = USE_REAL_DB
      ? new SQLiteProspectoRepository()
      : new MockProspectoRepository();
    this.locationService = USE_REAL_DB
      ? new ExpoLocationService()
      : new MockLocationService();

    this.sessionRepository = new SQLiteSessionRepository();
    this.photoStorage = new FileSystemPhotoStorage();
    this.photoService = new ExpoPhotoService();
    this.networkService = new NetworkService();

    // Cloud integrations remain mocked until explicitly enabled
    this.authGateway = new MockAuthGateway();
    this.syncGateway = new MockSyncGateway();
  }
}

export const container = new DIContainer();
