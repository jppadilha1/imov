import * as FileSystem from 'expo-file-system/legacy';

export function resolvePhotoUri(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${FileSystem.documentDirectory}${path}`;
}
