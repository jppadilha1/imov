import { PhotoPath } from "../value-objects/PhotoPath";

export interface IPhotoStorage {
  savePhoto(localUri: string): Promise<PhotoPath>;
  deletePhoto(path: PhotoPath): Promise<void>;
  getPhotoUri(path: PhotoPath): Promise<string | null>;
}
