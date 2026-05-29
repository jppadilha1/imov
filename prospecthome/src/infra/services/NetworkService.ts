import { INetworkService } from "../../domain/repositories/INetworkService";
import * as NetInfo from "@react-native-community/netinfo";

export class NetworkService implements INetworkService {
  async isConnected(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return !!state.isConnected;
    } catch (e) {
      return false;
    }
  }

  addListener(callback: (isConnected: boolean) => void): () => void {
    return NetInfo.addEventListener((state) => {
      callback(!!state.isConnected);
    });
  }
}
