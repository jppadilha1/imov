# Domain — Value Objects

> Objetos imutáveis, sem identidade, com validação no construtor. Zero dependências externas.

---

## Coordinates

Representa um par lat/lng geográfico validado.

```typescript
class Coordinates {
  constructor(
    readonly latitude: number,   // -90 a 90
    readonly longitude: number   // -180 a 180
  ) {
    if (latitude < -90 || latitude > 90) throw new InvalidCoordinatesError();
    if (longitude < -180 || longitude > 180) throw new InvalidCoordinatesError();
  }

  equals(other: Coordinates): boolean {
    return this.latitude === other.latitude && this.longitude === other.longitude;
  }

  toString(): string {
    return `${this.latitude}, ${this.longitude}`;
    // Exemplo: "-23.5505, -46.6333"
  }
}
```

**Regras de negócio:**
- Latitude: `[-90, 90]`
- Longitude: `[-180, 180]`
- Imutável — qualquer alteração cria nova instância

**Usado por:** `Prospecto` (entity), `ILocationService` (retorno)

---

## Address

Representa um endereço resolvido via geocoding reverso.

```typescript
class Address {
  constructor(
    readonly endereco: string,    // "Rua Augusta, 1234"
    readonly bairro?: string      // "Consolação"
  ) {
    if (!endereco || endereco.trim().length === 0) {
      throw new InvalidAddressError();
    }
  }

  equals(other: Address): boolean {
    return this.endereco === other.endereco && this.bairro === other.bairro;
  }

  toString(): string {
    return this.bairro ? `${this.endereco} - ${this.bairro}` : this.endereco;
  }
}
```

**Regras de negócio:**
- `endereco` é obrigatório e não pode ser vazio
- `bairro` é opcional (nem todo geocoding retorna bairro)
- Resolvido pelo backend (Edge Function + Nominatim), nunca pelo app

**Usado por:** `Prospecto.resolveAddress(address)`

---

## PhotoPath

Representa o caminho local validado de uma foto no filesystem.

```typescript
class PhotoPath {
  constructor(readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new InvalidPhotoPathError();
    }
  }

  equals(other: PhotoPath): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

**Regras de negócio:**
- Não pode ser vazio
- Representa um path no `expo-file-system` (ex: `file:///data/.../photo_abc.jpg`)
- Não faz validação de existência do arquivo (responsabilidade da infra)

**Usado por:** `Prospecto` (entity), `IPhotoStorage`, `IPhotoService`

---

## ProspectoStatus

Enum com transições válidas — controla o ciclo de vida do prospecto.

```typescript
type ProspectoStatusValue = 'novo' | 'contatado' | 'negociando' | 'fechado';

class ProspectoStatus {
  private static readonly VALID_TRANSITIONS: Record<ProspectoStatusValue, ProspectoStatusValue[]> = {
    novo:        ['contatado'],
    contatado:   ['negociando', 'novo'],
    negociando:  ['fechado', 'contatado'],
    fechado:     [],  // estado final
  };

  constructor(readonly value: ProspectoStatusValue) {}

  canTransitionTo(next: ProspectoStatus): boolean {
    return ProspectoStatus.VALID_TRANSITIONS[this.value].includes(next.value);
  }

  equals(other: ProspectoStatus): boolean {
    return this.value === other.value;
  }

  // Factory methods
  static novo(): ProspectoStatus       { return new ProspectoStatus('novo'); }
  static contatado(): ProspectoStatus  { return new ProspectoStatus('contatado'); }
  static negociando(): ProspectoStatus { return new ProspectoStatus('negociando'); }
  static fechado(): ProspectoStatus    { return new ProspectoStatus('fechado'); }
}
```

**Fluxo de transição:**
```
novo → contatado → negociando → fechado
              ↑          ↓
              └──────────┘
```

**Regras de negócio:**
- `fechado` é estado final — não permite voltar
- `contatado` pode regredir para `novo`
- `negociando` pode regredir para `contatado`

**Usado por:** `Prospecto.markAsContacted()`, `Prospecto.updateStatus()`

---

## SyncStatus

Enum que representa o estado de sincronização com o backend.

```typescript
type SyncStatusValue = 'pending' | 'synced' | 'error';

class SyncStatus {
  constructor(readonly value: SyncStatusValue) {}

  isPending(): boolean { return this.value === 'pending'; }
  isSynced(): boolean  { return this.value === 'synced'; }
  isError(): boolean   { return this.value === 'error'; }

  equals(other: SyncStatus): boolean {
    return this.value === other.value;
  }

  // Factory methods
  static pending(): SyncStatus { return new SyncStatus('pending'); }
  static synced(): SyncStatus  { return new SyncStatus('synced'); }
  static error(): SyncStatus   { return new SyncStatus('error'); }
}
```

**Regras de negócio:**
- Todo prospecto começa como `pending`
- Após sync bem-sucedido → `synced`
- Se falhar → `error` (permite retry)
- `error` → `pending` ao tentar novamente

**Usado por:** `Prospecto.markSynced()`, `Prospecto.markSyncError()`, `SyncProspectosUseCase`
