export interface INetworkService {
  isConnected(): Promise<boolean>;
  addListener(callback: (isConnected: boolean) => void): () => void;
}
