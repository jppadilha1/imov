import Constants from "expo-constants";

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

// Reais (não-supabase)
import { SQLiteProspectoRepository } from "../infrastructure/database/SQLiteProspectoRepository";
import { SQLiteSessionRepository } from "../infrastructure/database/SQLiteSessionRepository";
import { FileSystemPhotoStorage } from "../infrastructure/storage/FileSystemPhotoStorage";
import { ExpoLocationService } from "../infrastructure/services/ExpoLocationService";
import { ExpoPhotoService } from "../infrastructure/services/ExpoPhotoService";
import { NetworkService } from "../infrastructure/network/NetworkService";

const RECOGNIZED_ENVS = new Set(["production", "development", "test", "staging"]);

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
    const appEnv = Constants.expoConfig?.extra?.appEnv as string | undefined;
    const isProduction = appEnv === "production";

    if (appEnv !== undefined && !RECOGNIZED_ENVS.has(appEnv)) {
      console.warn(
        `[DI] APP_ENV "${appEnv}" não é reconhecido. Usando mocks. Valores válidos: production, development, test, staging.`
      );
    }

    this.sessionRepository = new SQLiteSessionRepository();
    this.photoStorage = new FileSystemPhotoStorage();
    this.photoService = new ExpoPhotoService();
    this.networkService = new NetworkService();

    this.prospectoRepository = isProduction
      ? new SQLiteProspectoRepository()
      : new MockProspectoRepository();
    this.locationService = isProduction
      ? new ExpoLocationService()
      : new MockLocationService();

    if (isProduction) {
      // Lazy require: evita carregar SupabaseClient (e validar env vars) em testes/dev.
      const { getSupabaseClient } = require("../infrastructure/supabase/SupabaseClient");
      const { SupabaseAuthGateway } = require("../infrastructure/supabase/SupabaseAuthGateway");
      const { SupabaseSyncGateway } = require("../infrastructure/supabase/SupabaseSyncGateway");
      const supabase = getSupabaseClient();
      this.authGateway = new SupabaseAuthGateway(supabase);
      this.syncGateway = new SupabaseSyncGateway(supabase, this.photoStorage);
    } else {
      this.authGateway = new MockAuthGateway();
      this.syncGateway = new MockSyncGateway();
    }
  }
}

export const container = new DIContainer();
