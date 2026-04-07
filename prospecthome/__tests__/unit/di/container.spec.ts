import { container } from "../../../src/di/container";
import { MockAuthGateway } from "../../../src/infrastructure/mock/MockAuthGateway";
import { SQLiteProspectoRepository } from "../../../src/infrastructure/database/SQLiteProspectoRepository";

describe("DI Container", () => {
  it("deve instanciar e retornar as dependencias (singleton)", () => {
    expect(container).toBeDefined();
    expect(container.authGateway).toBeInstanceOf(MockAuthGateway);
    expect(container.prospectoRepository).toBeInstanceOf(SQLiteProspectoRepository);
  });

  it("deve retornar exatamente a mesma instancia para module loaders (singleton)", () => {
    const c1 = require("../../../src/di/container").container;
    const c2 = require("../../../src/di/container").container;
    expect(c1).toBe(c2);
  });
});
