export class PhotoPath {
  private readonly _path: string;

  constructor(path: string) {
    if (!path || path.trim() === "") {
      throw new Error("O caminho da foto não pode ser vazio.");
    }
    
    const pathWithoutQuery = path.toLowerCase().split("?")[0];
    if (!pathWithoutQuery.endsWith(".jpg") && !pathWithoutQuery.endsWith(".jpeg") && !pathWithoutQuery.endsWith(".png")) {
      throw new Error(`A foto deve ser um arquivo JPEG ou PNG válido. Recebido: ${path}`);
    }

    this._path = path.trim();
    Object.freeze(this);
  }

  get path(): string {
    return this._path;
  }
}
