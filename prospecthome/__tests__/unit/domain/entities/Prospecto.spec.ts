import { Prospecto } from "../../../../src/domain/entities/Prospecto";
import { Coordinates } from "../../../../src/domain/value-objects/Coordinates";
import { PhotoPath } from "../../../../src/domain/value-objects/PhotoPath";
import { Address } from "../../../../src/domain/value-objects/Address";
import { ProspectoStatus } from "../../../../src/domain/value-objects/ProspectoStatus";
import { SyncStatus } from "../../../../src/domain/value-objects/SyncStatus";

describe("Prospecto Entity", () => {
  const defaultParams = () => ({
    id: "prospecto-123",
    userId: "corretor-1",
    photoPath: new PhotoPath("image.jpg"),
    coordinates: new Coordinates(0, 0)
  });

  it("deve criar um prospecto novo com status 'novo' e 'pending'", () => {
    const p = Prospecto.create({ ...defaultParams(), notes: "casa bonita" });
    expect(p.status.value).toBe("novo");
    expect(p.syncStatus.value).toBe("pending");
    expect(p.isPending()).toBe(true);
    expect(p.address).toBeNull();
    expect(p.notes).toBe("casa bonita");
    expect(p.createdAt).toBeInstanceOf(Date);
  });

  it("deve permitir alterar as notas", () => {
    const p = Prospecto.create(defaultParams());
    p.updateNotes("nota nova");
    expect(p.notes).toBe("nota nova");
  });

  it("deve resolver um endereco corretamente", () => {
    const p = Prospecto.create(defaultParams());
    const addr = new Address("Rua X", "123", "Bairro Y", "Cid", "SP", "00000000");
    p.resolveAddress(addr);
    expect(p.address).toBe(addr);
  });

  it("deve transicionar status com markAsContacted() se for permitido", () => {
    const p = Prospecto.create(defaultParams());
    expect(p.status.value).toBe("novo");
    
    p.markAsContacted();
    expect(p.status.value).toBe("contatado");
  });

  it("deve rejeitar transicao invalida no markAsContacted()", () => {
    const p = Prospecto.reconstruct({
      ...defaultParams(),
      address: null,
      notes: null,
      status: ProspectoStatus.fechado(),
      syncStatus: SyncStatus.pending(),
      remoteId: null,
      createdAt: new Date()
    });

    // fechado -> contatado é inválido segundo a regra
    expect(() => p.markAsContacted()).toThrow("Transição de status inválida.");
  });

  it("deve marcar como sincronizado corretamente", () => {
    const p = Prospecto.create(defaultParams());
    expect(p.isPending()).toBe(true);
    
    p.markSynced("remote-id-123");
    
    expect(p.remoteId).toBe("remote-id-123");
    expect(p.syncStatus.value).toBe("synced");
    expect(p.isPending()).toBe(false);
  });

  it("deve marcar com erro de sincronizacao", () => {
    const p = Prospecto.create(defaultParams());
    p.markSyncError();
    expect(p.syncStatus.value).toBe("error");
  });
});
