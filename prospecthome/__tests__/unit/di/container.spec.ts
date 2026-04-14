import { container } from "../../../src/di/container";
import { MockProspectoRepository } from "../../../src/infrastructure/mock/MockProspectoRepository";

describe("DI Container", () => {
  it("deve instanciar e retornar as dependencias (singleton)", () => {
    expect(container).toBeDefined();
    expect(container.prospectoRepository).toBeInstanceOf(MockProspectoRepository);
  });

  it("deve retornar exatamente a mesma instancia para module loaders (singleton)", () => {
    const c1 = require("../../../src/di/container").container;
    const c2 = require("../../../src/di/container").container;
    expect(c1).toBe(c2);
  });
});
