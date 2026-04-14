import { PhotoPath } from "../../../../src/domain/value-objects/PhotoPath";

describe("PhotoPath Value Object", () => {
  it("deve criar um PhotoPath a partir de um path valido", () => {
    const photo = new PhotoPath("file:/data/user/0/com.app/cache/photo.jpg");
    expect(photo.path).toBe("file:/data/user/0/com.app/cache/photo.jpg");
  });

  it("deve rejeitar path vazio", () => {
    expect(() => new PhotoPath("")).toThrow("O caminho da foto não pode ser vazio.");
    expect(() => new PhotoPath("   ")).toThrow("O caminho da foto não pode ser vazio.");
  });

  it("deve rejeitar extensoes nao permitidas", () => {
    expect(() => new PhotoPath("/path/to/doc.pdf")).toThrow("A foto deve ser um arquivo JPEG ou PNG válido.");
  });

  it("deve aceitar extensoes .png e .jpg / .jpeg", () => {
    expect(new PhotoPath("imagem.png").path).toBe("imagem.png");
    expect(new PhotoPath("imagem.jpeg").path).toBe("imagem.jpeg");
    expect(new PhotoPath("IMAGEM.JPG").path).toBe("IMAGEM.JPG");
  });
});
