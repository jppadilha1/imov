import { container } from "../../../src/dependency_injection/container";
import { MockProspectoRepository } from "../../../src/infrastructure/mock/MockProspectoRepository";

describe("DI Container", () => {
  it("deve instanciar e retornar as dependencias (singleton)", () => {
    expect(container).toBeDefined();
    expect(container.prospectoRepository).toBeInstanceOf(MockProspectoRepository);
  });

  it("deve retornar exatamente a mesma instancia para module loaders (singleton)", () => {
    const c1 = require("../../../src/dependency_injection/container").container;
    const c2 = require("../../../src/dependency_injection/container").container;
    expect(c1).toBe(c2);
  });
});
