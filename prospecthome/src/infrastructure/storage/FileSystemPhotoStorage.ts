import { IPhotoStorage } from "../../domain/repositories/IPhotoStorage";
import { PhotoPath } from "../../domain/value-objects/PhotoPath";
import * as FileSystem from "expo-file-system";

export class FileSystemPhotoStorage implements IPhotoStorage {
  async savePhoto(localUri: string): Promise<PhotoPath> {
    const ext = localUri.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const destination = `${FileSystem.documentDirectory}${filename}`;
    
    await FileSystem.copyAsync({
      from: localUri,
      to: destination
    });

    return new PhotoPath(filename);
  }

  async deletePhoto(path: PhotoPath): Promise<void> {
    const fullPath = `${FileSystem.documentDirectory}${path.path}`;
    await FileSystem.deleteAsync(fullPath, { idempotent: true });
  }

  async getPhotoUri(path: PhotoPath): Promise<string | null> {
    const fullPath = `${FileSystem.documentDirectory}${path.path}`;
    const info = await FileSystem.getInfoAsync(fullPath);
    
    if (info.exists) {
      return fullPath;
    }
    return null;
  }
}
