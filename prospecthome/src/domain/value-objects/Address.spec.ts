import { Address } from "./Address";

describe("Address Value Object", () => {
  it("deve criar um endereco valido", () => {
    const endereco = new Address("Rua Augusta", "1000", "Consolação", "São Paulo", "SP", "01305-100");
    expect(endereco.street).toBe("Rua Augusta");
    expect(endereco.neighborhood).toBe("Consolação");
  });

  it("não deve permitir a criacao sem bairro", () => {
    expect(() => new Address("Rua X", "123", "", "SP", "SP", "01000-000"))
      .toThrow("O bairro é obrigatório.");
  });

  it("não deve permitir a criacao sem rua", () => {
    expect(() => new Address("", "123", "Centro", "SP", "SP", "01000-000"))
      .toThrow("A rua é obrigatória.");
  });

  it("deve rejeitar formatacao invalida de CEP", () => {
    expect(() => new Address("Rua Y", "12", "Centro", "SP", "SP", "123"))
      .toThrow("O formato do CEP é inválido. (Esperado: 00000-000 ou 00000000)");
  });

  it("deve aceitar CEP sem hífen e mascara-lo no getter ou apenas formatar corretamente", () => {
    const endereco = new Address("Rua Y", "12", "Centro", "SP", "SP", "01305100");
    expect(endereco.zipCode).toBe("01305-100");
  });

  it("deve retornar o endereco formatado (fullAddress)", () => {
    const endereco = new Address("Rua Augusta", "1000", "Consolação", "São Paulo", "SP", "01305-100");
    expect(endereco.fullAddress).toBe("Rua Augusta, 1000 - Consolação, São Paulo - SP, 01305-100");
  });
});
