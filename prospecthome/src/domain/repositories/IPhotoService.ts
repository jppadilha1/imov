export interface IPhotoService {
  capturePhoto(): Promise<string | null>;
  compressPhoto(localUri: string): Promise<string>;
}
