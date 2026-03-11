# Domain — Entities

> Objetos com identidade (id), comportamento de negócio e estado mutável controlado. Zero dependências externas.

---

## Prospecto

Entidade principal do domínio. Representa um imóvel prospectado pelo corretor.

```typescript
class Prospecto {
  readonly id: string;            // UUID gerado localmente
  readonly userId: string;        // ID do corretor
  readonly photoPath: PhotoPath;  // caminho da foto no device
  readonly coordinates: Coordinates;  // GPS no momento da captura
  readonly createdAt: Date;

  private _address: Address | null;
  private _notes: string | null;
  private _status: ProspectoStatus;
  private _syncStatus: SyncStatus;
  private _remoteId: string | null;

  // ---------- Getters ----------
  get address(): Address | null         { return this._address; }
  get notes(): string | null            { return this._notes; }
  get status(): ProspectoStatus         { return this._status; }
  get syncStatus(): SyncStatus          { return this._syncStatus; }
  get remoteId(): string | null         { return this._remoteId; }

  // ---------- Factory ----------
  static create(params: {
    id: string;
    userId: string;
    photoPath: PhotoPath;
    coordinates: Coordinates;
    notes?: string;
  }): Prospecto {
    // Cria com status 'novo' e syncStatus 'pending'
  }

  static reconstruct(params: {
    id: string;
    userId: string;
    photoPath: PhotoPath;
    coordinates: Coordinates;
    address: Address | null;
    notes: string | null;
    status: ProspectoStatus;
    syncStatus: SyncStatus;
    remoteId: string | null;
    createdAt: Date;
  }): Prospecto {
    // Reconstrói do banco (sem validação de transição)
  }

  // ---------- Métodos de Negócio ----------

  markAsContacted(): void {
    // Transiciona status para 'contatado'
    // Lança InvalidStatusTransitionError se não permitido
  }

  updateNotes(notes: string): void {
    // Atualiza notas do prospecto
  }

  resolveAddress(address: Address): void {
    // Chamado após geocoding reverso resolver o endereço
  }

  markSynced(remoteId: string): void {
    // Marca como sincronizado — salva o remoteId do Supabase
    // syncStatus → 'synced'
  }

  markSyncError(): void {
    // Marca erro de sync
    // syncStatus → 'error'
  }

  isPending(): boolean {
    // Retorna true se syncStatus === 'pending'
  }
}
```

### Invariantes
- `id` e `userId` são imutáveis após criação
- `photoPath` e `coordinates` são imutáveis (capturados no momento da foto)
- `status` só muda via transições válidas (ver `ProspectoStatus`)
- `syncStatus` muda apenas por `markSynced()` / `markSyncError()`
- `address` começa `null` e é resolvido após sync

### Ciclo de vida
```
create() → [novo, pending]
  → markAsContacted() → [contatado, pending]
  → markSynced(remoteId) → [contatado, synced]
  → resolveAddress(addr) → endereço preenchido
```

### Value Objects usados
| Propriedade | Value Object |
|---|---|
| `photoPath` | `PhotoPath` |
| `coordinates` | `Coordinates` |
| `_address` | `Address` |
| `_status` | `ProspectoStatus` |
| `_syncStatus` | `SyncStatus` |

---

## Corretor

Entidade que representa o corretor de imóveis (usuário do app).

```typescript
class Corretor {
  constructor(
    readonly id: string,          // UUID do Supabase Auth
    readonly email: string,
    readonly nome: string | null,
    readonly createdAt: Date
  ) {}

  static create(params: {
    id: string;
    email: string;
    nome?: string;
  }): Corretor {
    // Cria com createdAt = now
  }
}
```

### Invariantes
- `id` vem do Supabase Auth (não gerado localmente)
- `email` é obrigatório
- `nome` é opcional (nem todos preenchem no cadastro)
- Entidade predominantemente de leitura — sem estado mutável

### Relacionamento
- Um `Corretor` possui 0..N `Prospecto` (via `userId`)
- Dados isolados por RLS no Supabase (um corretor não vê prospectos de outro)
