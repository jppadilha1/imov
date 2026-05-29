import Constants from "expo-constants";

import { IProspectoRepository } from "../domain/repositories/IProspectoRepository";
import { IPhotoStorage } from "../domain/repositories/IPhotoStorage";
import { IAuthGateway } from "../domain/repositories/IAuthGateway";
import { ILocationService } from "../domain/repositories/ILocationService";
import { IPhotoService } from "../domain/repositories/IPhotoService";
import { ISyncGateway } from "../domain/repositories/ISyncGateway";
import { INetworkService } from "../domain/repositories/INetworkService";
import { IGeocodeService } from "../domain/repositories/IGeocodeService";

// Mocks
import { MockAuthGateway } from "../infra/mock/MockAuthGateway";
import { MockSyncGateway } from "../infra/mock/MockSyncGateway";
import { MockLocationService } from "../infra/mock/MockLocationService";
import { MockProspectoRepository } from "../infra/mock/MockProspectoRepository";
import { MockGeocodeService } from "../infra/mock/MockGeocodeService";

import { SQLiteProspectoRepository } from "../infra/database/SQLiteProspectoRepository";
import { getSupabaseClient } from "../infra/database/supabase/SupabaseClient";
import { SupabaseAuthGateway } from "../infra/database/supabase/SupabaseAuthGateway";
import { SupabaseSyncGateway } from "../infra/database/supabase/SupabaseSyncGateway";
import { FileSystemPhotoStorage } from "../infra/services/FileSystemPhotoStorage";
import { ExpoLocationService } from "../infra/services/ExpoLocationService";
import { ExpoGeocodeService } from "../infra/services/ExpoGeocodeService";
import { ExpoPhotoService } from "../infra/services/ExpoPhotoService";
import { NetworkService } from "../infra/services/NetworkService";

const RECOGNIZED_ENVS = new Set(["production", "development", "test", "staging"]);

class DIContainer {
  public prospectoRepository: IProspectoRepository;
  public photoStorage: IPhotoStorage;
  public authGateway: IAuthGateway;
  public locationService: ILocationService;
  public photoService: IPhotoService;
  public syncGateway: ISyncGateway;
  public networkService: INetworkService;
  public geocodeService: IGeocodeService;

  constructor() {
    const appEnv = Constants.expoConfig?.extra?.appEnv as string | undefined;
    const isProduction = appEnv === "production";

    if (appEnv !== undefined && !RECOGNIZED_ENVS.has(appEnv)) {
      console.warn(`[DI] APP_ENV "${appEnv}" is not recognized. Using mocks...`);
    }

    this.photoStorage = new FileSystemPhotoStorage();
    this.photoService = new ExpoPhotoService();
    this.networkService = new NetworkService();

    if (isProduction) {
      const supabase = getSupabaseClient();
      this.authGateway = new SupabaseAuthGateway(supabase);
      this.syncGateway = new SupabaseSyncGateway(supabase, this.photoStorage);
      this.prospectoRepository = new SQLiteProspectoRepository();
      this.locationService = new ExpoLocationService();
      this.geocodeService = new ExpoGeocodeService();
    } else {
      this.authGateway = new MockAuthGateway();
      this.syncGateway = new MockSyncGateway();
      this.prospectoRepository = new MockProspectoRepository();
      this.locationService = new MockLocationService();
      this.geocodeService = new MockGeocodeService();
    }
  }
}

export const container = new DIContainer();
