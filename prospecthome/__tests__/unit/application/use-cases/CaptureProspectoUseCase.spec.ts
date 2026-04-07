import { CaptureProspectoUseCase } from "../../../../src/application/use-cases/CaptureProspectoUseCase";
import { Coordinates } from "../../../../src/domain/value-objects/Coordinates";
import { PhotoPath } from "../../../../src/domain/value-objects/PhotoPath";

describe("CaptureProspectoUseCase", () => {
  let useCase: CaptureProspectoUseCase;
  let mockPhotoSvc: { capturePhoto: jest.Mock; compressPhoto: jest.Mock };
  let mockLocationSvc: { getCurrentPosition: jest.Mock };
  let mockRepo: { save: jest.Mock };
  let mockStorage: { savePhoto: jest.Mock };

  beforeEach(() => {
    mockPhotoSvc = {
      capturePhoto: jest.fn(),
      compressPhoto: jest.fn()
    };
    mockLocationSvc = {
      getCurrentPosition: jest.fn()
    };
    mockRepo = {
      save: jest.fn()
    };
    mockStorage = {
      savePhoto: jest.fn()
    };
    
    // Default mocks
    mockPhotoSvc.capturePhoto.mockResolvedValue("file:///tmp/raw.jpg");
    mockPhotoSvc.compressPhoto.mockResolvedValue("file:///tmp/comp.jpg");
    mockLocationSvc.getCurrentPosition.mockResolvedValue(new Coordinates(10, 20));
    mockStorage.savePhoto.mockResolvedValue(new PhotoPath("final.jpg"));
    mockRepo.save.mockResolvedValue(undefined);

    useCase = new CaptureProspectoUseCase(
      mockPhotoSvc as any,
      mockLocationSvc as any,
      mockStorage as any,
      mockRepo as any
    );
  });

  it("deve capturar foto, geoloc, criar modelo e salvar a prospecto no sqlite", async () => {
    const prospecto = await useCase.execute("user-1");

    expect(mockPhotoSvc.capturePhoto).toHaveBeenCalled();
    expect(mockPhotoSvc.compressPhoto).toHaveBeenCalledWith("file:///tmp/raw.jpg");
    expect(mockLocationSvc.getCurrentPosition).toHaveBeenCalled();
    expect(mockStorage.savePhoto).toHaveBeenCalledWith("file:///tmp/comp.jpg");
    
    expect(mockRepo.save).toHaveBeenCalled();
    const saved = mockRepo.save.mock.calls[0][0];

    expect(saved.userId).toBe("user-1");
    expect(saved.coordinates.latitude).toBe(10);
    expect(saved.photoPath.path).toBe("final.jpg");
    expect(saved.isPending()).toBe(true); // default from entity

    // Retorna a variavel montada
    expect(prospecto).toBe(saved);
  });

  it("deve retornar null se usuario cancelar captura de foto", async () => {
    mockPhotoSvc.capturePhoto.mockResolvedValue(null);
    const p = await useCase.execute("user-1");

    expect(p).toBeNull();
    expect(mockLocationSvc.getCurrentPosition).not.toHaveBeenCalled();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
