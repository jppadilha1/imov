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

describe("DI Container — modo produção", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock("expo-constants", () => ({
      __esModule: true,
      default: { expoConfig: { extra: { appEnv: "production" } } },
    }));
    jest.doMock("../../../src/infrastructure/database/supabase/SupabaseClient", () => ({
      getSupabaseClient: () => ({
        auth: { getUser: jest.fn() },
        from: jest.fn(),
        storage: { from: jest.fn() },
      }),
    }));
    jest.doMock("../../../src/infrastructure/database/supabase/SupabaseAuthGateway", () => ({
      SupabaseAuthGateway: class {},
    }));
    jest.doMock("../../../src/infrastructure/database/supabase/SupabaseSyncGateway", () => ({
      SupabaseSyncGateway: class {},
    }));
    jest.doMock("../../../src/infrastructure/database/supabase/SupabaseProspectoRepository", () => ({
      SupabaseProspectoRepository: class {},
    }));
  });

  afterEach(() => {
    jest.dontMock("expo-constants");
    jest.resetModules();
  });

  it("em produção, prospectoRepository é HybridProspectoRepository", () => {
    const { container: prodContainer } = require("../../../src/dependency_injection/container");
    const { HybridProspectoRepository } = require("../../../src/infrastructure/database/HybridProspectoRepository");
    expect(prodContainer.prospectoRepository).toBeInstanceOf(HybridProspectoRepository);
  });
});
