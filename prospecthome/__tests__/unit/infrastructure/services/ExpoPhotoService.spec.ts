import { ExpoPhotoService } from "../../../../src/infrastructure/services/ExpoPhotoService";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn()
}));

jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: "jpeg" }
}));

describe("ExpoPhotoService", () => {
  let service: ExpoPhotoService;

  beforeEach(() => {
    service = new ExpoPhotoService();
    jest.clearAllMocks();
  });

  describe("capturePhoto", () => {
    it("deve solicitar permissao e retornar URI da foto capturada", async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:/camera/123.jpg" }]
      });

      const uri = await service.capturePhoto();

      expect(uri).toBe("file:/camera/123.jpg");
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
    });

    it("deve lancar erro se nao tiver permissao", async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: "denied" });

      await expect(service.capturePhoto()).rejects.toThrow("Permissão de câmera negada.");
    });

    it("deve retornar nulo se o usuario cancelar a foto", async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: true
      });

      const uri = await service.capturePhoto();
      expect(uri).toBeNull();
    });
  });

  describe("compressPhoto", () => {
    it("deve comprimir e retornar a uri da nova foto", async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: "file:/tmp/compressed.jpg"
      });

      const uri = await service.compressPhoto("file:/camera/123.jpg");

      expect(uri).toBe("file:/tmp/compressed.jpg");
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        "file:/camera/123.jpg",
        [{ resize: { width: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
    });
  });
});
