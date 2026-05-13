import { CaptureProspectoUseCase } from "../../../../src/application/use-cases/CaptureProspectoUseCase";
import { Coordinates } from "../../../../src/domain/value-objects/Coordinates";
import { PhotoPath } from "../../../../src/domain/value-objects/PhotoPath";
import { Address } from "../../../../src/domain/value-objects/Address";

describe("CaptureProspectoUseCase", () => {
  let useCase: CaptureProspectoUseCase;
  let mockPhotoSvc: { capturePhoto: jest.Mock; compressPhoto: jest.Mock };
  let mockLocationSvc: { getCurrentPosition: jest.Mock };
  let mockRepo: { save: jest.Mock };
  let mockStorage: { savePhoto: jest.Mock };
  let mockGeocode: { reverseGeocode: jest.Mock };

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
    mockGeocode = {
      reverseGeocode: jest.fn()
    };

    // Default mocks
    mockPhotoSvc.capturePhoto.mockResolvedValue("file:/tmp/raw.jpg");
    mockPhotoSvc.compressPhoto.mockResolvedValue("file:/tmp/comp.jpg");
    mockLocationSvc.getCurrentPosition.mockResolvedValue(new Coordinates(10, 20));
    mockStorage.savePhoto.mockResolvedValue(new PhotoPath("final.jpg"));
    mockRepo.save.mockResolvedValue(undefined);
    mockGeocode.reverseGeocode.mockResolvedValue(null);

    useCase = new CaptureProspectoUseCase(
      mockPhotoSvc as any,
      mockLocationSvc as any,
      mockStorage as any,
      mockRepo as any,
      mockGeocode as any
    );
  });

  it("deve capturar foto, geoloc, criar modelo e salvar a prospecto no sqlite", async () => {
    const prospecto = await useCase.execute("user-1");

    expect(mockPhotoSvc.capturePhoto).toHaveBeenCalled();
    expect(mockPhotoSvc.compressPhoto).toHaveBeenCalledWith("file:/tmp/raw.jpg");
    expect(mockLocationSvc.getCurrentPosition).toHaveBeenCalled();
    expect(mockStorage.savePhoto).toHaveBeenCalledWith("file:/tmp/comp.jpg");

    expect(mockRepo.save).toHaveBeenCalled();
    const saved = mockRepo.save.mock.calls[0][0];

    expect(saved.userId).toBe("user-1");
    expect(saved.coordinates.latitude).toBe(10);
    expect(saved.photoPath.path).toBe("final.jpg");
    expect(saved.isPending()).toBe(true);

    expect(prospecto).toBe(saved);
  });

  it("deve retornar null se usuario cancelar captura de foto", async () => {
    mockPhotoSvc.capturePhoto.mockResolvedValue(null);
    const p = await useCase.execute("user-1");

    expect(p).toBeNull();
    expect(mockLocationSvc.getCurrentPosition).not.toHaveBeenCalled();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it("resolve endereço via geocodeService antes de salvar quando online", async () => {
    const address = new Address("Rua das Flores", "S/N", "Pinheiros", "", "", "00000000");
    mockGeocode.reverseGeocode.mockResolvedValue(address);

    const prospecto = await useCase.execute("user-1");

    expect(mockGeocode.reverseGeocode).toHaveBeenCalledWith(expect.objectContaining({
      latitude: 10,
      longitude: 20
    }));
    expect(prospecto!.address).toBe(address);
    const saved = mockRepo.save.mock.calls[0][0];
    expect(saved.address).toBe(address);
  });

  it("salva prospecto sem endereço quando geocodeService retorna null", async () => {
    mockGeocode.reverseGeocode.mockResolvedValue(null);

    const prospecto = await useCase.execute("user-1");

    expect(prospecto!.address).toBeNull();
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it("salva prospecto sem endereço quando geocodeService lança exceção", async () => {
    mockGeocode.reverseGeocode.mockRejectedValue(new Error("Network failed"));

    const prospecto = await useCase.execute("user-1");

    expect(prospecto!.address).toBeNull();
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
