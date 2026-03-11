# Domain — Repository Interfaces

> Contratos de persistência definidos no Domain. Implementações concretas ficam na Infrastructure. Zero dependências externas.

---

## IProspectoRepository

Contrato para persistência de prospectos (local e/ou remoto).

```typescript
interface IProspectoRepository {
  /**
   * Salva um novo prospecto.
   * @throws se já existir um prospecto com o mesmo id
   */
  save(prospecto: Prospecto): Promise<void>;

  /**
   * Busca um prospecto pelo id.
   * @returns Prospecto reconstruído ou null se não encontrado
   */
  findById(id: string): Promise<Prospecto | null>;

  /**
   * Lista todos os prospectos de um corretor.
   * Ordenados por createdAt descendente (mais recente primeiro).
   */
  findAllByUser(userId: string): Promise<Prospecto[]>;

  /**
   * Busca todos os prospectos com syncStatus = 'pending'.
   * Usado pelo SyncProspectosUseCase para saber o que sincronizar.
   */
  findPending(): Promise<Prospecto[]>;

  /**
   * Atualiza um prospecto existente (status, notas, endereço, syncStatus).
   * @throws se o prospecto não existir
   */
  update(prospecto: Prospecto): Promise<void>;

  /**
   * Remove um prospecto pelo id.
   * @throws se o prospecto não existir
   */
  delete(id: string): Promise<void>;
}
```

### Implementações previstas
| Implementação | Camada | Descrição |
|---|---|---|
| `SQLiteProspectoRepository` | Infrastructure/database | Persistência local offline |
| `InMemoryProspectoRepository` | Testes | Mock para unit tests |

### Notas
- O mapeamento Entity ↔ row do SQLite é responsabilidade da implementação (não do domain)
- `findPending()` é essencial para o fluxo de sync

---

## ISessionRepository

Contrato para persistência da sessão do usuário logado.

```typescript
interface SessionData {
  userId: string;
  accessToken: string;
  refreshToken: string;
  email: string;
  nome: string | null;
}

interface ISessionRepository {
  /**
   * Salva/atualiza a sessão ativa.
   * Sempre sobrescreve (só uma sessão por vez).
   */
  save(session: SessionData): Promise<void>;

  /**
   * Retorna a sessão ativa ou null se não houver.
   */
  get(): Promise<SessionData | null>;

  /**
   * Limpa a sessão (logout).
   */
  clear(): Promise<void>;
}
```

### Implementações previstas
| Implementação | Camada | Descrição |
|---|---|---|
| `SQLiteSessionRepository` | Infrastructure/database | Sessão em tabela SQLite local |

### Notas
- Apenas uma sessão ativa por vez (tabela com id fixo = 1)
- Tokens JWT armazenados localmente para uso offline
- `clear()` é chamado no `LogoutUseCase`

---

## IPhotoStorage

Contrato para armazenamento/leitura de fotos no filesystem local.

```typescript
interface IPhotoStorage {
  /**
   * Salva uma foto comprimida no filesystem.
   * @param photoPath - path temporário da foto (output do image-picker)
   * @returns PhotoPath — path permanente no filesystem do app
   */
  save(tempUri: string): Promise<PhotoPath>;

  /**
   * Lê o conteúdo de uma foto como base64 ou URI.
   * @returns URI acessível para exibir a imagem
   */
  load(photoPath: PhotoPath): Promise<string>;

  /**
   * Remove uma foto do filesystem.
   */
  delete(photoPath: PhotoPath): Promise<void>;

  /**
   * Remove todas as fotos do corretor (usado no logout).
   */
  clearAll(): Promise<void>;
}
```

### Implementações previstas
| Implementação | Camada | Descrição |
|---|---|---|
| `FileSystemPhotoStorage` | Infrastructure/storage | `expo-file-system` |

### Notas
- `save()` move a foto do path temporário para um path permanente no document directory
- `clearAll()` é chamado no `LogoutUseCase` para limpar dados após logout
- Fotos são comprimidas **antes** de chegar aqui (responsabilidade do `IPhotoService`)
