# Domain — Gateway Interfaces

> Contratos para comunicação com serviços externos (auth, sync). Definidos no Domain, implementados na Infrastructure. Zero dependências externas.

---

## IAuthGateway

Contrato para autenticação — abstrai Supabase Auth.

```typescript
interface AuthResult {
  userId: string;
  email: string;
  nome: string | null;
  accessToken: string;
  refreshToken: string;
}

interface IAuthGateway {
  /**
   * Autentica com email/senha.
   * @throws AuthenticationError se credenciais inválidas
   * @throws NetworkError se sem internet
   */
  login(email: string, password: string): Promise<AuthResult>;

  /**
   * Registra novo corretor.
   * @throws RegistrationError se email já existe
   * @throws NetworkError se sem internet
   */
  register(email: string, password: string, nome?: string): Promise<AuthResult>;

  /**
   * Renova o access token usando o refresh token.
   * @throws TokenExpiredError se refresh token expirado
   * @throws NetworkError se sem internet
   */
  refreshToken(refreshToken: string): Promise<AuthResult>;
}
```

### Implementações previstas
| Implementação | Camada | Descrição |
|---|---|---|
| `SupabaseAuthGateway` | Infrastructure/supabase | Supabase Auth SDK |

### Notas
- Requer internet — operações exclusivamente online
- `AuthResult` contém tudo necessário para salvar via `ISessionRepository`
- Erros são mapeados para erros de domínio (não expõe erros do Supabase)

---

## ISyncGateway

Contrato para sincronização de prospectos com o backend.

```typescript
interface SyncedProspecto {
  remoteId: string;
  address: Address | null;   // resolvido via geocoding no backend
}

interface ISyncGateway {
  /**
   * Faz upload de uma foto para o Storage bucket.
   * @returns URL pública da foto no Supabase Storage
   */
  uploadPhoto(
    photoUri: string,
    corretorId: string,
    prospectoId: string
  ): Promise<string>;

  /**
   * Insere um prospecto no Supabase Postgres.
   * @returns remoteId (UUID gerado pelo Postgres)
   */
  insertProspecto(
    prospecto: Prospecto,
    fotoUrl: string
  ): Promise<string>;

  /**
   * Busca prospectos atualizados no backend (ex: endereço resolvido via geocoding).
   * @param lastSyncTimestamp - puxar apenas atualizações após este timestamp
   * @returns lista de prospectos com dados atualizados
   */
  pullUpdates(lastSyncTimestamp?: Date): Promise<SyncedProspecto[]>;
}
```

### Implementações previstas
| Implementação | Camada | Descrição |
|---|---|---|
| `SupabaseSyncGateway` | Infrastructure/supabase | Supabase Storage + Postgres |

### Notas
- `uploadPhoto()` envia para o bucket `fotos` no path `{corretorId}/{prospectoId}.jpg`
- `insertProspecto()` insere na tabela `public.prospectos` — trigger de geocoding é automático no backend
- `pullUpdates()` traz endereços resolvidos para atualizar os prospectos locais
- Todos os métodos requerem internet
