# ProspectHome MVP — Design

## Clean Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   PRESENTATION (React Native / Expo Router)                     │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │  Screens          Hooks            Components            │ │
│   │  LoginScreen      useAuth()        ProspectoCard         │ │
│   │  MapScreen        useProspectos()  MapMarker             │ │
│   │  CaptureScreen    useCapture()     SyncBadge             │ │
│   │  ListScreen       useSync()        StatusSelector        │ │
│   │  DetailScreen     useNetwork()     OfflineBanner         │ │
│   └──────────────────────────────────────────────────────────┘ │
│         │ depende de ▼                                         │
│   APPLICATION (Use Cases)                                       │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │  CaptureProspectoUseCase    LoginUseCase                 │ │
│   │  ListProspectosUseCase      RegisterUseCase              │ │
│   │  GetProspectoUseCase        LogoutUseCase                │ │
│   │  UpdateProspectoUseCase     RefreshTokenUseCase          │ │
│   │  DeleteProspectoUseCase     CheckSessionUseCase          │ │
│   │  SyncProspectosUseCase      GetCurrentLocationUseCase    │ │
│   └──────────────────────────────────────────────────────────┘ │
│         │ depende de ▼                                         │
│   DOMAIN (Entities + Value Objects + Interfaces)                │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │  Entities:        Value Objects:     Interfaces:          │ │
│   │  Prospecto        Coordinates        IProspectoRepository │ │
│   │  Corretor         Address            ISessionRepository   │ │
│   │                   PhotoPath          IPhotoStorage        │ │
│   │                   ProspectoStatus    IAuthGateway         │ │
│   │                   SyncStatus         ILocationService     │ │
│   │                                      IPhotoService        │ │
│   │                                      ISyncGateway         │ │
│   └──────────────────────────────────────────────────────────┘ │
│         ▲ implementa │                                         │
│   INFRASTRUCTURE (Implementações Concretas)                     │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │  SQLiteProspectoRepository   SupabaseAuthGateway         │ │
│   │  SQLiteSessionRepository     SupabaseSyncGateway         │ │
│   │  FileSystemPhotoStorage      ExpoLocationService         │ │
│   │  ExpoPhotoService            SupabaseClient (config)     │ │
│   │  DatabaseMigration           NetworkService              │ │
│   └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (External)                        │
│                                                                 │
│  Auth ─── Postgres ─── Storage ─── Edge Functions               │
│                                                                 │
│  Database Trigger: on INSERT prospectos                          │
│    → Edge Function "geocode-prospecto"                          │
│    → Nominatim API → UPDATE endereco, bairro                    │
└─────────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
src/
├── domain/                          # 🟢 Zero dependências externas
│   ├── entities/
│   │   ├── Prospecto.ts             # Entidade com identidade (id)
│   │   └── Corretor.ts             # Entidade do corretor
│   ├── value-objects/
│   │   ├── Coordinates.ts          # { latitude, longitude } imutável
│   │   ├── Address.ts              # { endereco, bairro } imutável
│   │   ├── PhotoPath.ts            # path validado da foto
│   │   ├── ProspectoStatus.ts      # enum: novo | contatado | negociando | fechado
│   │   └── SyncStatus.ts           # enum: pending | synced | error
│   └── repositories/               # Interfaces (contratos)
│       ├── IProspectoRepository.ts  # CRUD de prospectos
│       ├── ISessionRepository.ts   # Sessão do usuário
│       ├── IPhotoStorage.ts        # Salvar/Ler/Deletar fotos
│       ├── IAuthGateway.ts         # Login/Register/Refresh (abstrai Supabase)
│       ├── ILocationService.ts     # Obter GPS
│       ├── IPhotoService.ts        # Captura + compressão de foto
│       └── ISyncGateway.ts         # Upload para nuvem
│
├── application/                     # 🟡 Depende apenas do Domain
│   └── use-cases/
│       ├── prospecto/
│       │   ├── CaptureProspectoUseCase.ts
│       │   ├── ListProspectosUseCase.ts
│       │   ├── GetProspectoUseCase.ts
│       │   ├── UpdateProspectoUseCase.ts
│       │   └── DeleteProspectoUseCase.ts
│       ├── auth/
│       │   ├── LoginUseCase.ts
│       │   ├── RegisterUseCase.ts
│       │   ├── LogoutUseCase.ts
│       │   ├── RefreshTokenUseCase.ts
│       │   └── CheckSessionUseCase.ts
│       └── sync/
│           └── SyncProspectosUseCase.ts
│
├── infrastructure/                  # 🔴 Depende de frameworks e SDKs
│   ├── database/
│   │   ├── SQLiteClient.ts          # Inicialização do expo-sqlite
│   │   ├── migrations.ts           # Schema e migrações
│   │   ├── SQLiteProspectoRepository.ts  # implements IProspectoRepository
│   │   └── SQLiteSessionRepository.ts   # implements ISessionRepository
│   ├── storage/
│   │   └── FileSystemPhotoStorage.ts    # implements IPhotoStorage
│   ├── services/
│   │   ├── ExpoLocationService.ts       # implements ILocationService
│   │   └── ExpoPhotoService.ts          # implements IPhotoService
│   ├── supabase/
│   │   ├── SupabaseClient.ts            # Config e instância
│   │   ├── SupabaseAuthGateway.ts       # implements IAuthGateway
│   │   └── SupabaseSyncGateway.ts       # implements ISyncGateway
│   └── network/
│       └── NetworkService.ts            # NetInfo wrapper
│
├── presentation/                    # 🔵 React Native + Expo Router
│   ├── hooks/
│   │   ├── useAuth.ts              # Expõe Use Cases de auth para telas
│   │   ├── useProspectos.ts        # Expõe Use Cases de prospectos
│   │   ├── useCapture.ts           # Orquestra captura (foto + GPS + save)
│   │   ├── useSync.ts             # Auto-sync em foreground
│   │   └── useNetwork.ts          # Estado online/offline
│   ├── components/
│   │   ├── ProspectoCard.tsx       # Card na lista
│   │   ├── MapMarkerCallout.tsx   # Callout do pin no mapa
│   │   ├── SyncBadge.tsx          # Indicador de sync status
│   │   ├── StatusSelector.tsx     # Picker de status do prospecto
│   │   └── OfflineBanner.tsx      # Banner "Modo Offline"
│   └── screens/                    # Expo Router file-based (app/)
│       # Mapeados via Expo Router em app/
│
├── di/                              # 💉 Dependency Injection
│   └── container.ts                 # Wiring: cria instâncias e injeta dependências
│
└── app/                             # 📱 Expo Router (entry point)
    ├── _layout.tsx                  # Root layout + providers
    ├── (auth)/
    │   ├── login.tsx
    │   └── register.tsx
    └── (tabs)/
        ├── _layout.tsx              # Tab navigator
        ├── map.tsx                   # Home/Mapa
        ├── capture.tsx              # Câmera/Captura
        └── list/
            ├── index.tsx            # Lista de prospectos
            └── [id].tsx             # Detalhe do prospecto
```

## SOLID Applied

### Single Responsibility (S)
Cada módulo tem uma única razão para mudar:
- `CaptureProspectoUseCase` → só lida com a lógica de capturar um prospecto
- `SQLiteProspectoRepository` → só lida com persistência SQLite de prospectos
- `ExpoPhotoService` → só lida com captura e compressão de fotos

### Open/Closed (O)
Use Cases são fechados para modificação, abertos para extensão via interfaces:
```
CaptureProspectoUseCase
  → usa IPhotoService (hoje: ExpoPhotoService)
  → usa ILocationService (hoje: ExpoLocationService)
  → usa IProspectoRepository (hoje: SQLiteProspectoRepository)

Trocar SQLite por WatermelonDB? Só cria novo Repository. Use Case nem percebe.
```

### Liskov Substitution (L)
Qualquer implementação de `IProspectoRepository` é intercambiável:
```
IProspectoRepository
  ├── SQLiteProspectoRepository   (offline, local)
  └── SupabaseSyncGateway         (online, remoto)
  └── InMemoryRepository          (testes)
```

### Interface Segregation (I)
Interfaces focadas por responsabilidade:
```
IPhotoService      → capturePhoto(), compressPhoto()
IPhotoStorage      → save(), load(), delete()
ILocationService   → getCurrentPosition()
IAuthGateway       → login(), register(), refreshToken()
ISyncGateway       → uploadProspecto(), pullUpdates()
```
Nenhuma interface força implementar métodos desnecessários.

### Dependency Inversion (D)
Use Cases dependem de abstrações (interfaces do Domain), nunca de implementações:
```typescript
// ✅ CORRETO — depende da interface
class CaptureProspectoUseCase {
  constructor(
    private photoService: IPhotoService,         // interface
    private locationService: ILocationService,    // interface
    private prospectoRepo: IProspectoRepository,  // interface
    private photoStorage: IPhotoStorage           // interface
  ) {}
}

// ❌ ERRADO — dependeria de implementação concreta
class CaptureProspectoUseCase {
  constructor(
    private picker: ExpoImagePicker,  // framework!
    private sqlite: SQLiteDatabase,   // framework!
  ) {}
}
```

## DDD Tactical Patterns

### Entities

```typescript
// domain/entities/Prospecto.ts
class Prospecto {
  readonly id: string;
  readonly userId: string;
  readonly photoPath: PhotoPath;
  readonly coordinates: Coordinates;
  private _address: Address | null;
  private _notes: string | null;
  private _status: ProspectoStatus;
  private _syncStatus: SyncStatus;
  readonly createdAt: Date;

  // Métodos de negócio no próprio entity
  markAsContacted(): void
  updateNotes(notes: string): void
  resolveAddress(address: Address): void
  markSynced(remoteId: string): void
  markSyncError(): void
  isPending(): boolean
}
```

### Value Objects

```typescript
// domain/value-objects/Coordinates.ts — imutável, validado
class Coordinates {
  constructor(readonly latitude: number, readonly longitude: number) {
    if (latitude < -90 || latitude > 90) throw new InvalidCoordinatesError();
    if (longitude < -180 || longitude > 180) throw new InvalidCoordinatesError();
  }
  equals(other: Coordinates): boolean
  toString(): string  // "-23.5505, -46.6333"
}

// domain/value-objects/ProspectoStatus.ts — enum com comportamento
type ProspectoStatusValue = 'novo' | 'contatado' | 'negociando' | 'fechado';
class ProspectoStatus {
  constructor(readonly value: ProspectoStatusValue) {}
  canTransitionTo(next: ProspectoStatus): boolean
  static novo(): ProspectoStatus
}
```

### Repository Interfaces (Domain)

```typescript
// domain/repositories/IProspectoRepository.ts
interface IProspectoRepository {
  save(prospecto: Prospecto): Promise<void>;
  findById(id: string): Promise<Prospecto | null>;
  findAllByUser(userId: string): Promise<Prospecto[]>;
  findPending(): Promise<Prospecto[]>;
  update(prospecto: Prospecto): Promise<void>;
  delete(id: string): Promise<void>;
}
```

## Dependency Injection (DI Container)

```typescript
// di/container.ts
// Wiring manual — simples e sem framework de DI

import { SQLiteProspectoRepository } from '../infrastructure/database/SQLiteProspectoRepository';
import { SQLiteSessionRepository } from '../infrastructure/database/SQLiteSessionRepository';
import { FileSystemPhotoStorage } from '../infrastructure/storage/FileSystemPhotoStorage';
import { ExpoLocationService } from '../infrastructure/services/ExpoLocationService';
import { ExpoPhotoService } from '../infrastructure/services/ExpoPhotoService';
import { SupabaseAuthGateway } from '../infrastructure/supabase/SupabaseAuthGateway';
import { SupabaseSyncGateway } from '../infrastructure/supabase/SupabaseSyncGateway';
import { CaptureProspectoUseCase } from '../application/use-cases/prospecto/CaptureProspectoUseCase';
// ... outros use cases

// Infra
const db = new SQLiteClient();
const prospectoRepo = new SQLiteProspectoRepository(db);
const sessionRepo = new SQLiteSessionRepository(db);
const photoStorage = new FileSystemPhotoStorage();
const locationService = new ExpoLocationService();
const photoService = new ExpoPhotoService();
const authGateway = new SupabaseAuthGateway();
const syncGateway = new SupabaseSyncGateway();

// Use Cases (injetando abstrações)
export const captureProspecto = new CaptureProspectoUseCase(
  photoService, locationService, prospectoRepo, photoStorage
);
export const listProspectos = new ListProspectosUseCase(prospectoRepo);
export const loginUseCase = new LoginUseCase(authGateway, sessionRepo);
export const syncProspectos = new SyncProspectosUseCase(
  prospectoRepo, syncGateway, photoStorage
);
// ... etc
```

## Technology Decisions

### Expo Router para Navegação
- File-based routing nativo do Expo
- Suporte a layouts (tabs, stack)
- Deep linking built-in

### expo-image-picker (não expo-camera)
- Abre câmera nativa do Android — UX familiar
- `launchCameraAsync()` retorna URI da foto diretamente
- Implementado via `ExpoPhotoService` (implements `IPhotoService`)

### expo-image-manipulator para Compressão
- Redimensiona para ~800px de largura (mantendo aspect ratio)
- Compressão JPEG 70-80% — reduz ~5MB → ~200KB
- Trata orientação EXIF automaticamente
- Encapsulado no `ExpoPhotoService`

### Foreground Sync (não Background)
- Quando app está aberto e `NetInfo` detecta internet → sincroniza
- Orquestrado pelo `SyncProspectosUseCase` via hook `useSync()`
- Background sync planejado para v2

## Native Expo Configuration (app.json / app.config.js)

Para garantir que o hardware seja acessado corretamente, as permissões nativas MUST ser configuradas no `app.json` ou `app.config.js` através dos plugins oficiais do Expo:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Permita que o ProspectHome acesse sua localização para salvar as coordenadas exatas do imóvel capturado."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Permita que o ProspectHome acesse sua câmera para fotografar as fachadas dos imóveis."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Permita o acesso à galeria caso queira anexar uma foto existente do imóvel."
        }
      ]
    ]
  }
}
```

## Data Model

### SQLite (Local — Single Source of Truth do App)

```sql
CREATE TABLE session (
  id INTEGER PRIMARY KEY DEFAULT 1,
  user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  email TEXT NOT NULL,
  nome TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prospectos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  foto_path TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  endereco TEXT,
  bairro TEXT,
  notas TEXT,
  status TEXT DEFAULT 'novo',
  
  -- Controle de Sincronização e Erros
  sync_status TEXT DEFAULT 'pending', -- pending | synced | error
  sync_error_message TEXT,
  sync_retry_count INTEGER DEFAULT 0,
  remote_id TEXT,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Supabase (Postgres)

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.prospectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id UUID NOT NULL REFERENCES public.profiles(id),
  foto_url TEXT NOT NULL,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  endereco TEXT,
  bairro TEXT,
  notas TEXT,
  
  -- Enum Types ou check constraint
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'negociando', 'fechado')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prospectos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Corretor vê seus prospectos"
  ON public.prospectos FOR SELECT USING (corretor_id = auth.uid());

CREATE POLICY "Corretor insere seus prospectos"
  ON public.prospectos FOR INSERT WITH CHECK (corretor_id = auth.uid());

CREATE POLICY "Corretor atualiza seus prospectos"
  ON public.prospectos FOR UPDATE USING (corretor_id = auth.uid());
```

### Edge Function: geocode-prospecto

```
Trigger: Database Webhook on INSERT public.prospectos
Input: { id, latitude, longitude }
Flow: Nominatim reverse → UPDATE endereco, bairro
Error: retry com backoff, NULL se falhar
```

## Auth Flow

```
PRIMEIRO USO (online obrigatório)
═════════════════════════════════
LoginUseCase.execute(email, password)
  → IAuthGateway.login() (Supabase)
  → ISessionRepository.save(session) (SQLite)
  → retorna Corretor entity

USOS SUBSEQUENTES
═════════════════
CheckSessionUseCase.execute()
  ├── ISessionRepository.get()
  ├── online? → RefreshTokenUseCase.execute()
  ├── offline? → retorna user do token local
  └── sem sessão? → redireciona Login

LOGOUT
══════
LogoutUseCase.execute()
  → IProspectoRepository.findPending()
  → se tem → alerta antes
  → ISessionRepository.clear()
  → IPhotoStorage.clearAll()
```

## Gerenciamento do Bucket (Storage Workflow)

O ciclo de vida físico de uma foto capturada é estritamente controlado para não estourar a RAM do dispositivo e otimizar a rede:

1. **Memória Temporária (RAM/Cache da Câmera):** A câmera nativa (`expo-image-picker`) devolve uma URI temporária (`file:///.../Cache/...`) que aponta para uma imagem pesada (~5 MB).
2. **Compressão (RAM → Cache):** O `expo-image-manipulator` carrega a URI, redimensiona para 800px de largura e comprime para JPEG (70-80%), salvando uma nova URI no cache.
3. **Persistência Local (FileSystem):** O `FileSystemPhotoStorage` copia o arquivo comprimido do cache temporário para o diretório de documentos permanente do app (`FileSystem.documentDirectory`), isolando-o de limpezas automáticas do SO. O path persistido é salvo no SQLite.
4. **Multipart Upload (FileSystem → Supabase Storage):** Durante a sincronização, o `SupabaseSyncGateway` lê o arquivo como *buffer/base64* do filesystem e realiza um *multipart upload* (usando a API do Supabase Storage / `FormData`) endereçando ao bucket `fotos` no path `/{corretor_id}/{prospecto_id}.jpg`.

## Sync Flow (Mecanismo de Sincronização)

O mecanismo exato de sincronização do MVP roda em **Foreground (Sincronização Agressiva e Transparente):**

- **Gatilho de Montagem:** A sincronização roda automaticamente no momento da montagem (mount) do componente principal da interface (`MapScreen` ou `ListScreen` principal) através do hook `useSync()`.
- **Gatilho de Rede:** O `useSync()` reage ativamente a mudanças no estado da rede (via `NetInfo`). Assim que o dispositivo transiciona de Offline para Online, o processo de push/pull inicia imediatamente sem intervenção do usuário.
- **Isolamento de UI:** O processo roda em Promises apartadas da thread principal da UI. A interface deve apenas reagir de forma passiva através de indicadores sutis (ex: `SyncBadge` rodando).

```
SyncProspectosUseCase.execute()
  1. IProspectoRepository.findPending()
  2. Para cada:
     a. IPhotoStorage.load(photoPath) → file
     b. ISyncGateway.uploadPhoto(file) → url
     c. ISyncGateway.insertProspecto(prospecto, fotoUrl)
     d. prospecto.markSynced(remoteId)
     e. IProspectoRepository.update(prospecto)
  3. ISyncGateway.pullUpdates(lastSync)
     → prospectos com endereço resolvido
     → IProspectoRepository.update() cada um
  4. Erros: prospecto.markSyncError() + retry
```

## Key Design Decisions

| Decisão | Escolha | Razão |
|---------|---------|-------|
| Arquitetura | Clean Architecture + DDD | Testabilidade, manutenibilidade, separação de concerns |
| DI | Manual (sem framework) | Simplicidade para MVP, fácil de entender |
| Câmera | `expo-image-picker` via `IPhotoService` | Mais simples, UX nativa, desacoplado |
| Fotos | FileSystem via `IPhotoStorage` | Performance, padrão da indústria |
| Sync | Foreground via `SyncProspectosUseCase` | Confiabilidade no MVP |
| Geocoding | DB Trigger → Edge Function | Desacoplamento total |
| Compressão | 800px, 70-80% quality | Economia de ~96% de espaço |
| Estilização CSS | `StyleSheet` nativo | Performance nativa sem sobrecarga de tooling (zero dependencies) e tipagem total integrada no framework |
| Ícones | `lucide-react-native` | Extenso, elegante e compatível com as regras de preenchimento e stroke do React Native |
| Testes Unitários | `@testing-library/react-native` | Renderização e verificação de nós virtuais focadas no comportamento do usuário (acessibilidade) |
| Testes E2E | `Maestro` | Abordagem declarativa baseada em fluxos de tela robustos, garantindo os cenários nativos (permissões, scrolls) |
