export class Corretor {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly nome: string | null,
    readonly createdAt: Date
  ) {}

  static create(params: {
    id: string;
    email: string;
    nome?: string;
  }): Corretor {
    return new Corretor(
      params.id,
      params.email,
      params.nome || null,
      new Date()
    );
  }
}
