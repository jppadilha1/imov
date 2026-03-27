type ProspectoStatusValue = 'novo' | 'contatado' | 'negociando' | 'fechado';

export class ProspectoStatus {
  private static readonly VALID_TRANSITIONS: Record<ProspectoStatusValue, ProspectoStatusValue[]> = {
    novo:        ['contatado'],
    contatado:   ['negociando', 'novo'],
    negociando:  ['fechado', 'contatado'],
    fechado:     [],
  };

  constructor(readonly value: ProspectoStatusValue) {
    Object.freeze(this);
  }

  canTransitionTo(next: ProspectoStatus): boolean {
    return ProspectoStatus.VALID_TRANSITIONS[this.value].includes(next.value);
  }

  equals(other: ProspectoStatus): boolean {
    return this.value === other.value;
  }

  static novo(): ProspectoStatus       { return new ProspectoStatus('novo'); }
  static contatado(): ProspectoStatus  { return new ProspectoStatus('contatado'); }
  static negociando(): ProspectoStatus { return new ProspectoStatus('negociando'); }
  static fechado(): ProspectoStatus    { return new ProspectoStatus('fechado'); }
}
