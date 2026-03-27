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

// Reais
import { SQLiteProspectoRepository } from "../infrastructure/database/SQLiteProspectoRepository";
import { SQLiteSessionRepository } from "../infrastructure/database/SQLiteSessionRepository";
import { FileSystemPhotoStorage } from "../infrastructure/storage/FileSystemPhotoStorage";
import { ExpoLocationService } from "../infrastructure/services/ExpoLocationService";
import { ExpoPhotoService } from "../infrastructure/services/ExpoPhotoService";
import { NetworkService } from "../infrastructure/network/NetworkService";
import { SupabaseSyncGateway } from "../infrastructure/supabase/SupabaseSyncGateway";

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
    this.prospectoRepository = new SQLiteProspectoRepository();
    this.sessionRepository = new SQLiteSessionRepository();
    this.photoStorage = new FileSystemPhotoStorage();
    
    const useMock = process.env.EXPO_PUBLIC_MOCK_API === 'true';
    
    // Mantendo MockAuthGateway para agora conforme specs pra nao depender de criacao de user no supabase
    this.authGateway = new MockAuthGateway(); 
    this.syncGateway = useMock ? new MockSyncGateway() : new SupabaseSyncGateway();

    this.locationService = new ExpoLocationService();
    this.photoService = new ExpoPhotoService();
    this.networkService = new NetworkService();
  }
}

export const container = new DIContainer();
