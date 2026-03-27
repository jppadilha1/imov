export class Address {
  private readonly _street: string;
  private readonly _number: string;
  private readonly _neighborhood: string;
  private readonly _city: string;
  private readonly _state: string;
  private readonly _zipCode: string;

  constructor(
    street: string,
    number: string,
    neighborhood: string,
    city: string,
    state: string,
    zipCode: string
  ) {
    if (!street || street.trim() === "") {
      throw new Error("A rua é obrigatória.");
    }
    if (!neighborhood || neighborhood.trim() === "") {
      throw new Error("O bairro é obrigatório.");
    }

    const cleanZip = zipCode ? zipCode.replace(/\D/g, "") : "";
    if (cleanZip.length !== 8) {
      throw new Error("O formato do CEP é inválido. (Esperado: 00000-000 ou 00000000)");
    }

    this._street = street.trim();
    this._number = number ? number.trim() : "S/N";
    this._neighborhood = neighborhood.trim();
    this._city = city ? city.trim() : "";
    this._state = state ? state.trim() : "";
    this._zipCode = `${cleanZip.slice(0, 5)}-${cleanZip.slice(5)}`;

    Object.freeze(this);
  }

  get street(): string { return this._street; }
  get number(): string { return this._number; }
  get neighborhood(): string { return this._neighborhood; }
  get city(): string { return this._city; }
  get state(): string { return this._state; }
  get zipCode(): string { return this._zipCode; }

  get fullAddress(): string {
    return `${this.street}, ${this.number} - ${this.neighborhood}, ${this.city} - ${this.state}, ${this.zipCode}`;
  }
}
