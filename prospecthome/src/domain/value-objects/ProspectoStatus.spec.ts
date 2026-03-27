import { ProspectoStatus } from "./ProspectoStatus";

describe("ProspectoStatus Value Object", () => {
  it("deve criar usando as factories methods", () => {
    expect(ProspectoStatus.novo().value).toBe("novo");
    expect(ProspectoStatus.contatado().value).toBe("contatado");
    expect(ProspectoStatus.negociando().value).toBe("negociando");
    expect(ProspectoStatus.fechado().value).toBe("fechado");
  });

  describe("verificacao de transicoes de estado validas e invalidas", () => {
    it("novo pode transicionar apenas para contatado", () => {
      const status = ProspectoStatus.novo();
      expect(status.canTransitionTo(ProspectoStatus.contatado())).toBe(true);
      expect(status.canTransitionTo(ProspectoStatus.negociando())).toBe(false);
      expect(status.canTransitionTo(ProspectoStatus.fechado())).toBe(false);
      expect(status.canTransitionTo(ProspectoStatus.novo())).toBe(false);
    });

    it("contatado pode transicionar p/ negociando ou novo", () => {
      const status = ProspectoStatus.contatado();
      expect(status.canTransitionTo(ProspectoStatus.negociando())).toBe(true);
      expect(status.canTransitionTo(ProspectoStatus.novo())).toBe(true);
      expect(status.canTransitionTo(ProspectoStatus.fechado())).toBe(false);
      expect(status.canTransitionTo(ProspectoStatus.contatado())).toBe(false);
    });

    it("negociando pode transicionar p/ fechado ou contatado", () => {
      const status = ProspectoStatus.negociando();
      expect(status.canTransitionTo(ProspectoStatus.fechado())).toBe(true);
      expect(status.canTransitionTo(ProspectoStatus.contatado())).toBe(true);
      expect(status.canTransitionTo(ProspectoStatus.novo())).toBe(false);
    });

    it("fechado eh estado final sem saida", () => {
      const status = ProspectoStatus.fechado();
      expect(status.canTransitionTo(ProspectoStatus.novo())).toBe(false);
      expect(status.canTransitionTo(ProspectoStatus.contatado())).toBe(false);
      expect(status.canTransitionTo(ProspectoStatus.negociando())).toBe(false);
    });
  });

  it("deve verificar igualdade", () => {
    expect(ProspectoStatus.novo().equals(ProspectoStatus.novo())).toBe(true);
    expect(ProspectoStatus.novo().equals(ProspectoStatus.fechado())).toBe(false);
  });
});
