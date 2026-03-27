export interface INetworkService {
  isConnected(): Promise<boolean>;
}
