# ProspectHome MVP — Tasks

> **🛑 REGRA DE OURO (STEP-BY-STEP RIGOROSO):**
> 1. Execute apenas **UMA** tarefa (checkbox da lista) por vez e aguarde a revisão humana.
> 2. **NUNCA** implemente lógica futura ou gere arquivos que não correspondam à task atual.
> 3. Se uma task for complexa (exigindo modificação de muitos arquivos de uma vez), **pare e proponha o fracionamento** dela.
> 4. Todas as lógicas do domínio/app **devem** ser construídas primeiro utilizando TDD e Mocks. Integração real (Supabase) **apenas** no final.

## Fase 1: Setup do Projeto

- [ ] **1.1 Inicializar projeto Expo**
  - Criar projeto com `npx create-expo-app`
  - Configurar Expo Router (file-based routing)
  - Instalar dependências core:
    - `expo-router`, `expo-sqlite`, `expo-location`
    - `expo-image-picker`, `expo-image-manipulator`, `expo-file-system`
    - `react-native-maps`, `react-native-map-clustering`, `@react-native-community/netinfo`
    - `@supabase/supabase-js`, `uuid`
  - Utilizar a API nativa `StyleSheet` do React Native para a estruturação visual e definição de estilos
  - Instalar biblioteca de ícones `lucide-react-native`
  - Configurar plugins no `app.json` (permissões de Câmera e Localização)
  - Configurar variáveis de ambiente (`.env` com strings do Supabase)
  - Configurar ambiente de TDD: instalar `jest`, `jest-expo` e `@testing-library/react-native`
  - Inicializar estrutura base do `Maestro` para testes E2E

- [ ] **1.2 Estrutura de pastas Clean Architecture**
  - Criar estrutura: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/presentation/`, `src/di/`
  - Criar subpastas conforme design.md (entities, value-objects, repositories, use-cases, etc.)

- [ ] **1.3 CI/CD e Qualidade de Código Inicial**
  - Configurar Github Actions (ou similar)
  - Configurar pipeline automatizado rodando ESLint, Type Checking (`tsc --noEmit`) e a Bateria de Testes (TDD) via Jest.

---

## Fase 2: Domain Layer

> **Requisito TDD:** Escrever os testes unitários (`.test.ts`) cobrindo validações e invariantes ANTES de implementar as entidades e objetos de valor.

- [ ] **2.1 Value Objects**
  - `domain/value-objects/Coordinates.ts` — lat/lng validado, imutável
  - `domain/value-objects/Address.ts` — endereco + bairro, imutável
  - `domain/value-objects/PhotoPath.ts` — path validado
  - `domain/value-objects/ProspectoStatus.ts` — enum com transições válidas
  - `domain/value-objects/SyncStatus.ts` — enum: pending | synced | error

- [ ] **2.2 Entities**
  - `domain/entities/Prospecto.ts` — Entity com métodos de negócio:
    - `markAsContacted()`, `updateNotes()`, `resolveAddress()`
    - `markSynced(remoteId)`, `markSyncError()`, `isPending()`
  - `domain/entities/Corretor.ts` — Entity do corretor (id, email, nome)

- [ ] **2.3 Repository Interfaces**
  - `domain/repositories/IProspectoRepository.ts` — CRUD + findPending()
  - `domain/repositories/ISessionRepository.ts` — save/get/clear sessão
  - `domain/repositories/IPhotoStorage.ts` — save/load/delete fotos
  - `domain/repositories/IAuthGateway.ts` — login/register/refreshToken
  - `domain/repositories/ILocationService.ts` — getCurrentPosition()
  - `domain/repositories/IPhotoService.ts` — capturePhoto/compressPhoto
  - `domain/repositories/ISyncGateway.ts` — upload/pull

---

## Fase 3: Infrastructure Layer

> **Requisito TDD:** Criar testes para os Repositórios e Serviços utilizando mocks (`jest.mock`) para APIs externas e SDKs (ex: SQLite, Supabase e FileSystem) antes de codificar as integrações.

- [ ] **3.1 SQLite — Setup e Migrations**
  - `infrastructure/database/SQLiteClient.ts` — init expo-sqlite
  - `infrastructure/database/migrations.ts` — schema session + prospectos

- [ ] **3.2 SQLite — Repositórios (implements interfaces)**
  - `infrastructure/database/SQLiteProspectoRepository.ts`
    - implements `IProspectoRepository`
    - Mapeia entre entidade `Prospecto` e rows do SQLite
  - `infrastructure/database/SQLiteSessionRepository.ts`
    - implements `ISessionRepository`

- [ ] **3.3 FileSystem e Serviços Expo**
  - `infrastructure/storage/FileSystemPhotoStorage.ts` — implements `IPhotoStorage`
  - `infrastructure/services/ExpoLocationService.ts` — implements `ILocationService`
  - `infrastructure/services/ExpoPhotoService.ts` — implements `IPhotoService`
    - `capturePhoto()` via expo-image-picker
    - `compressPhoto()` via expo-image-manipulator (800px, 70-80%)

- [ ] **3.4 Gateways — Mocks Iniciais (Clean Architecture)**
  - `infrastructure/mock/MockAuthGateway.ts` — implements `IAuthGateway` (simula auth de sucesso)
  - `infrastructure/mock/MockSyncGateway.ts` — implements `ISyncGateway` (simula delay de nuvem)
  - *Obs: Validar a UI e Use Cases 100% locamente antes da adoção da nuvem. Integração real adiada para a Fase 10.*

- [ ] **3.5 Network Service**
  - `infrastructure/network/NetworkService.ts` — wrapper NetInfo (online/offline)

---

## Fase 4: Application Layer (Use Cases)

> **Requisito TDD:** Projetar os testes dos Use Cases introduzindo stubs locais para os contratos do Domain. O objetivo deve ser validar 100% das regras de negócio e exceções pré-implementação.

- [ ] **4.1 Use Cases de Auth**
  - `application/use-cases/auth/LoginUseCase.ts`
    - Recebe: `IAuthGateway`, `ISessionRepository`
    - Fluxo: login → salva sessão
  - `application/use-cases/auth/RegisterUseCase.ts`
  - `application/use-cases/auth/LogoutUseCase.ts`
    - Verifica pendentes antes de limpar
  - `application/use-cases/auth/RefreshTokenUseCase.ts`
  - `application/use-cases/auth/CheckSessionUseCase.ts`

- [ ] **4.2 Use Cases de Prospecto**
  - `application/use-cases/prospecto/CaptureProspectoUseCase.ts`
    - Recebe: `IPhotoService`, `ILocationService`, `IProspectoRepository`, `IPhotoStorage`
    - Fluxo: captura foto → comprime → pega GPS → cria Entity → salva
  - `application/use-cases/prospecto/ListProspectosUseCase.ts`
  - `application/use-cases/prospecto/GetProspectoUseCase.ts`
  - `application/use-cases/prospecto/UpdateProspectoUseCase.ts`
  - `application/use-cases/prospecto/DeleteProspectoUseCase.ts`

- [ ] **4.3 Use Case de Sync**
  - `application/use-cases/sync/SyncProspectosUseCase.ts`
    - Recebe: `IProspectoRepository`, `ISyncGateway`, `IPhotoStorage`
    - Fluxo: busca pending → upload cada um → pull updates → atualiza entidades resolvendo endereços → salva no repositório local

---

## Fase 5: DI Container

- [ ] **5.1 Container de Dependências**
  - `di/container.ts`
    - Instancia todas as implementações de infra
    - Cria todos os Use Cases injetando interfaces
    - Exporta Use Cases prontos para uso na Presentation

---

## Fase 6: Presentation Layer — Auth

> **Requisito TDD:** Utilizar `@testing-library/react-native` para renderizar componentes vitais e simular interações, garantindo a lógica de view (Hooks) desvinculada do layout final e testada antes de testar num emulador real.

- [ ] **6.1 Contexto e Hooks de Auth**
  - Criar `presentation/context/AuthContext.tsx`
    - Mantém estado global ativo de sessão (`user`, `loading`) evitando prop prop drilling
  - `presentation/hooks/useAuth.ts`
    - Expõe: `login()`, `register()`, `logout()`, `user`, `isOnline`
    - Interliga o Contexto com os Use Cases do container

- [ ] **6.2 Tela de Login**
  - `app/(auth)/login.tsx`
  - Layout: email + senha + botão login + link "criar conta"
  - Validação + feedback de erro

- [ ] **6.3 Tela de Registro**
  - `app/(auth)/register.tsx`
  - Layout: nome + email + senha + confirmar senha

- [ ] **6.4 Auth Guard**
  - `app/_layout.tsx`
  - Usa `CheckSessionUseCase` ao abrir app
  - Redireciona conforme resultado

---

## Fase 7: Presentation Layer — Captura

- [ ] **7.1 Hook de Captura**
  - `presentation/hooks/useCapture.ts`
  - Orquestra: `CaptureProspectoUseCase.execute()`
  - Gerencia estado: loading, preview, error

- [ ] **7.2 Tela de Captura**
  - `app/(tabs)/capture.tsx`
  - Botão "Tirar Foto" → preview + GPS + campo de notas
  - Botão "Salvar" → Use Case → feedback

- [ ] **7.3 Componentes**
  - `presentation/components/OfflineBanner.tsx`

---

## Fase 8: Presentation Layer — Lista e Detalhe

- [ ] **8.1 Hook de Prospectos**
  - `presentation/hooks/useProspectos.ts`
  - Expõe: `prospectos[]`, `loading`, `refresh()`, `getById()`, `update()`

- [ ] **8.2 Tela de Lista**
  - `app/(tabs)/list/index.tsx`
  - `presentation/components/ProspectoCard.tsx`
  - `presentation/components/SyncBadge.tsx`

- [ ] **8.3 Tela de Detalhe**
  - `app/(tabs)/list/[id].tsx`
  - `presentation/components/StatusSelector.tsx`

---

## Fase 9: Presentation Layer — Mapa

- [ ] **9.1 Tela do Mapa (Home)**
  - `app/(tabs)/map.tsx`
  - Implementar clustering nativo no MapView (usar `react-native-map-clustering`)
  - `presentation/components/MapMarkerCallout.tsx`
  - Pins com callout → navega para Detalhe
  - Mensagem offline se sem internet

---

## Fase 10: Integração com Backend (Supabase)

> **Requisito Clean Architecture:** A infraestrutura de nuvem só é implementada após o Domínio, Testes, UseCases e Telas estarem rodando impecavelmente com as camadas simuladas (Mocks).

- [ ] **10.1 Setup do Projeto no Supabase**
  - Criar tabelas e regras RLS (`profiles`, `prospectos`)
  - Configurar ambiente de Auth e Storage bucket ("fotos")
  - Criar `infrastructure/supabase/SupabaseClient.ts`

- [ ] **10.2 Gateways Reais (Substituindo os Mocks)**
  - Implementar `SupabaseAuthGateway.ts` (implements `IAuthGateway`)
  - Implementar `SupabaseSyncGateway.ts` (implements `ISyncGateway`)
  - Substituir mocks no contêiner de Injeção de Dependências (`di/container.ts`)

- [ ] **10.3 Edge Function e Webhooks**
  - Função no Deno/Supabase que chama Nominatim (Geocoding)
  - Ativar Database Trigger `on INSERT public.prospectos` chamando a Edge Function

---

## Fase 11: Sincronização UI/UX

- [ ] **11.1 Hook de Sync Real**
  - Implementar verificação `NetInfo` em `presentation/hooks/useSync.ts`
  - Disparar `SyncProspectosUseCase.execute()` de fundo
- [ ] **11.2 Feedback Visual na UI**
  - Atualizar badges de pendentes nas tabs
  - Configurar interceptadores de erro e Toasts de sucesso

---

## Fase 12: Build e Homologação Final (Qualidade)

- [ ] **12.1 Testes E2E Nativos (Maestro)**
  - Escrever fluxos declarativos (YAML) do Maestro para mockar a navegação e alertas nativos
  - Rodar o fluxo offline local: negar GPS (fallback UI), aceitar GPS, simular lentidão de rede
  - Garantir navegações críticas cobrindo as premissas RFC 2119
  
- [ ] **12.2 Distribuição e Build (EAS)**
  - Validar configuração do `eas.json` para os perfis de ambos os mundos.
  - Gerar e instalar os binários do MVP (APK/AAB para Android e IPA/TestFlight para iOS) com Expo Application Services
  - Testes exploratórios físicos em aparelhos Android e iOS limpos
