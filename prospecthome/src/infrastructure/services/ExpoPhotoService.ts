import { IPhotoService } from "../../domain/repositories/IPhotoService";

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

export class ExpoPhotoService implements IPhotoService {
  async capturePhoto(): Promise<string | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      throw new Error("Permissão de câmera negada.");
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  }

  async compressPhoto(localUri: string): Promise<string> {
    const result = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: 800 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  }
}
