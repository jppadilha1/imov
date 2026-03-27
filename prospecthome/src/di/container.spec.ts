import { container } from "./container";
import { MockAuthGateway } from "../infrastructure/mock/MockAuthGateway";
import { SQLiteProspectoRepository } from "../infrastructure/database/SQLiteProspectoRepository";

describe("DI Container", () => {
  it("deve instanciar e retornar as dependencias (singleton)", () => {
    expect(container).toBeDefined();
    expect(container.authGateway).toBeInstanceOf(MockAuthGateway);
    expect(container.prospectoRepository).toBeInstanceOf(SQLiteProspectoRepository);
  });

  it("deve retornar exatamente a mesma instancia para module loaders (singleton)", () => {
    const c1 = require("./container").container;
    const c2 = require("./container").container;
    expect(c1).toBe(c2);
  });
});
