import { FileSystemPhotoStorage } from "./FileSystemPhotoStorage";
import { PhotoPath } from "../../domain/value-objects/PhotoPath";
import * as FileSystem from "expo-file-system";

// Mocking expo-file-system behavior
jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///mock/data/",
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn()
}));

describe("FileSystemPhotoStorage", () => {
  let storage: FileSystemPhotoStorage;

  beforeEach(() => {
    storage = new FileSystemPhotoStorage();
    jest.clearAllMocks();
  });

  it("deve carregar a photo uri corretamente se o arquivo existir", async () => {
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });

    const path = new PhotoPath("mock_img.jpg");
    const uri = await storage.getPhotoUri(path);

    expect(uri).toBe("file:///mock/data/mock_img.jpg");
    expect(FileSystem.getInfoAsync).toHaveBeenCalledWith("file:///mock/data/mock_img.jpg");
  });

  it("deve retornar null se o arquivo da foto não existir", async () => {
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

    const path = new PhotoPath("mock_img_deleted.jpg");
    const uri = await storage.getPhotoUri(path);

    expect(uri).toBeNull();
  });

  it("deve salvar a foto e retornar o PhotoPath comente do nome do arquivo", async () => {
    const localCacheUri = "file:///cache/123-temp.jpg";
    
    const photoPath = await storage.savePhoto(localCacheUri);
    
    expect(photoPath.path).toContain(".jpg");
    expect(FileSystem.copyAsync).toHaveBeenCalledWith({
      from: localCacheUri,
      to: expect.stringContaining("file:///mock/data/")
    });
  });

  it("deve deletar a foto do sistema de arquivos", async () => {
    const path = new PhotoPath("mock_img.jpg");
    await storage.deletePhoto(path);

    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
      "file:///mock/data/mock_img.jpg",
      { idempotent: true }
    );
  });
});
