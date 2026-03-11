# Domain — Service Interfaces

> Contratos para serviços de dispositivo (câmera, GPS). Definidos no Domain, implementados na Infrastructure. Zero dependências externas.

---

## ILocationService

Contrato para obter a localização GPS do dispositivo.

```typescript
interface ILocationService {
  /**
   * Obtém a posição atual do dispositivo via GPS.
   * Solicita permissão de localização se necessário.
   * @throws LocationPermissionDeniedError se usuário negou permissão
   * @throws LocationUnavailableError se GPS desativado
   */
  getCurrentPosition(): Promise<Coordinates>;
}
```

### Implementações previstas
| Implementação | Camada | Descrição |
|---|---|---|
| `ExpoLocationService` | Infrastructure/services | `expo-location` SDK |

### Notas
- Funciona offline (GPS não precisa de internet)
- Precisão: usa `Accuracy.High` para obter coordenadas precisas
- Permissão: solicita `foregroundPermission` no primeiro uso
- Retorna `Coordinates` (Value Object) — validação de range acontece no VO

---

## IPhotoService

Contrato para captura e compressão de fotos.

```typescript
interface IPhotoService {
  /**
   * Abre a câmera nativa e captura uma foto.
   * @throws PhotoCaptureCancelledError se usuário cancelou
   * @throws CameraPermissionDeniedError se permissão negada
   * @returns URI temporária da foto capturada
   */
  capturePhoto(): Promise<string>;

  /**
   * Comprime uma foto para reduzir tamanho.
   * - Redimensiona para ~800px de largura (mantém aspect ratio)
   * - Compressão JPEG 70-80%
   * - Corrige orientação EXIF automaticamente
   * @param sourceUri - URI da foto original
   * @returns PhotoPath — path da foto comprimida
   */
  compressPhoto(sourceUri: string): Promise<PhotoPath>;
}
```

### Implementações previstas
| Implementação | Camada | Descrição |
|---|---|---|
| `ExpoPhotoService` | Infrastructure/services | `expo-image-picker` + `expo-image-manipulator` |

### Notas
- `capturePhoto()` usa `expo-image-picker` com `launchCameraAsync()` — câmera nativa do Android
- `compressPhoto()` usa `expo-image-manipulator` para redimensionar e comprimir
- Resultado: foto de ~5MB → ~200KB (suficiente para visualizar fachadas)
- EXIF: orientação corrigida automaticamente pelo `expo-image-manipulator`
- Funciona 100% offline

### Fluxo de uso no CaptureProspectoUseCase
```
1. capturePhoto()           → URI temporária (~5MB)
2. compressPhoto(tempUri)    → PhotoPath (~200KB)
3. photoStorage.save(path)  → PhotoPath permanente
```
