# ProspectHome MVP — Tasks

> **🛑 REGRA DE OURO (STEP-BY-STEP RIGOROSO COM TDD):**
> 1. Execute apenas **UMA** sub-tarefa (checkbox da lista) por vez e aguarde a revisão humana.
> 2. **Obrigatório TDD Estrito:** Nenhum arquivo de produção (`.ts`/`.tsx`) pode ser criado ou alterado ANTES do seu respectivo arquivo de teste (`.spec.ts`/`.spec.tsx`) ser criado e falhar ou assegurar os comportamentos esperados.
> 3. Se uma task for complexa, pare e proponha o fracionamento dela.
> 4. Todas as lógicas do domínio/app devem ser validadas primariamente utilizando Mocks locais antes de integrações pesadas.

## Fase 1: Setup do Projeto

- [x] **1.1 Inicializar projeto Expo**
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

- [x] **1.2 Estrutura de pastas Clean Architecture**
  - Criar estrutura: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/presentation/`, `src/di/`
  - Criar subpastas conforme design.md (entities, value-objects, repositories, use-cases, etc.)

- [x] **1.3 CI/CD e Qualidade de Código Inicial**
  - Configurar Github Actions
  - Configurar pipeline automatizado rodando ESLint, Type Checking (`tsc --noEmit`) e a Bateria de Testes (TDD) via Jest.

---

## Fase 2: Domain Layer (TDD Estrito)

- [x] **2.1 Value Objects — Coordinates**
  - [x] 🔴 Criar `domain/value-objects/Coordinates.spec.ts` (Testar limites lat/lng e imutabilidade)
  - [x] 🟢 Criar `domain/value-objects/Coordinates.ts` e passar nos testes

- [x] **2.2 Value Objects — Address**
  - [x] 🔴 Criar `domain/value-objects/Address.spec.ts` (Testar formatação estrutural, obrigatoriedade de bairro)
  - [x] 🟢 Criar `domain/value-objects/Address.ts` e passar nos testes

- [x] **2.3 Value Objects — PhotoPath**
  - [x] 🔴 Criar `domain/value-objects/PhotoPath.spec.ts`
  - [x] 🟢 Criar `domain/value-objects/PhotoPath.ts` e passar nos testes

- [x] **2.4 Value Objects — Enums de Status**
  - [x] 🔴 Criar `domain/value-objects/ProspectoStatus.spec.ts` e `SyncStatus.spec.ts` (Testar transições válidas)
  - [x] 🟢 Implementar `ProspectoStatus.ts` e `SyncStatus.ts` com os enums reais

- [x] **2.5 Entities — Prospecto**
  - [x] 🔴 Criar `domain/entities/Prospecto.spec.ts` (Testar construtor, `markAsContacted`, `updateNotes`, `resolveAddress`, ciclo `markSynced`)
  - [x] 🟢 Implementar `domain/entities/Prospecto.ts` fazendo os testes passarem

- [x] **2.6 Entities — Corretor**
  - [x] 🔴 Criar `domain/entities/Corretor.spec.ts`
  - [x] 🟢 Implementar `domain/entities/Corretor.ts`

- [x] **2.7 Repository Interfaces (Apenas Tipagem)**
  - Implementar arquivos com as assinaturas padrão de cada interface:
  - [x] `domain/repositories/IProspectoRepository.ts`
  - [x] `domain/repositories/ISessionRepository.ts`
  - [x] `domain/repositories/IPhotoStorage.ts`
  - [x] `domain/repositories/IAuthGateway.ts`
  - [x] `domain/repositories/ILocationService.ts`
  - [x] `domain/repositories/IPhotoService.ts`
  - [x] `domain/repositories/ISyncGateway.ts`

---

## Fase 3: Infrastructure Layer (Mocks e Drivers)

- [x] **3.1 Gateways Mocks Iniciais**
  - [x] 🔴 Criar `infrastructure/mock/MockAuthGateway.spec.ts`
  - [x] 🟢 Implementar `infrastructure/mock/MockAuthGateway.ts` (Simulando auth com sucesso e falha)
  - [x] 🔴 Criar `infrastructure/mock/MockSyncGateway.spec.ts`
  - [x] 🟢 Implementar `infrastructure/mock/MockSyncGateway.ts` (Simulando upload delays)

- [x] **3.2 FileSystem e Location Serviços**
  - [x] 🔴 Criar `infrastructure/storage/FileSystemPhotoStorage.spec.ts` (Mocando o Expo FileSystem)
  - [x] 🟢 Implementar `FileSystemPhotoStorage.ts`
  - [x] 🔴 Criar `infrastructure/services/ExpoLocationService.spec.ts`
  - [x] 🟢 Implementar `ExpoLocationService.ts`
  - [x] 🔴 Criar `infrastructure/services/ExpoPhotoService.spec.ts`
  - [x] 🟢 Implementar `ExpoPhotoService.ts`
  - [x] 🔴 Criar `infrastructure/network/NetworkService.spec.ts`
  - [x] 🟢 Implementar `NetworkService.ts` (Usando mock do NetInfo)

- [x] **3.3 SQLite Setup e Repositórios**
  - [x] Configurar schema de `migrations.ts` e `SQLiteClient.ts` base
  - [x] 🔴 Criar `infrastructure/database/SQLiteSessionRepository.spec.ts`
  - [x] 🟢 Implementar `SQLiteSessionRepository.ts`
  - [x] 🔴 Criar `infrastructure/database/SQLiteProspectoRepository.spec.ts` (Testar Mapeamento de entidade DB->Entity e Entity->DB)
  - [x] 🟢 Implementar `SQLiteProspectoRepository.ts`

- [x] **3.4 Supabase Drivers (Opcional/Mockado para agora)**
  - [x] 🔴 Criar `infrastructure/supabase/SupabaseSyncGateway.spec.ts` (Teste ignorado se sem API key)
  - [x] 🟢 Implementar `SupabaseSyncGateway.ts`
  - [x] 🟢 Substituir bindings de injeção temporária (Mocks -> Reais) em `di/container.ts`

---

## Fase 4: Application Layer (Use Cases)

- [x] **4.1 Use Cases — Auth & Core**
  - [x] 🔴 Criar `application/use-cases/LoginUseCase.spec.ts`
  - [x] 🟢 Implementar `LoginUseCase.ts`
  - [x] 🔴 Criar `application/use-cases/CaptureProspectoUseCase.spec.ts` (Dependências: `IPhotoService`, `ILocationService`, `IProspectoRepository`)
  - [x] 🟢 Implementar `CaptureProspectoUseCase.ts`
  - [x] 🔴 Criar `application/use-cases/SyncProspectosUseCase.spec.ts` (Lógica de upload de pendentes e pull)
  - [x] 🟢 Implementar `SyncProspectosUseCase.ts` e `DeleteProspectoUseCase.ts`

- [x] **4.4 Use Case de Sync**
  - [x] 🔴 Criar `application/use-cases/SyncProspectosUseCase.spec.ts`
  - [x] 🟢 Implementar `SyncProspectosUseCase.ts`

---

## Fase 5: DI Container

- [x] **5.1 Container de Dependências**
  - [x] 🔴 Criar `di/container.spec.ts` (Testar injeção e resolução de dependências, garantindo instâncias únicas/singleton para UseCases)
  - [x] 🟢 Implementar o injetor em `di/container.ts`

---

## Fase 6: Presentation Layer — Auth

- [x] **6.1 Hooks e Contexto de Auth**
  - [x] 🔴 Criar `presentation/hooks/useAuth.spec.ts`
  - [x] 🟢 Implementar `AuthContext.tsx`
  - [x] 🟢 Implementar `useAuth.ts`


- [x] **6.2 Tela de Login**
  - [x] 🔴 Criar `app/(auth)/login.spec.tsx`
  - [x] 🟢 Implementar `app/(auth)/login.tsx`

- [x] **6.3 Tela de Registro**
  - [x] 🔴 Criar `app/(auth)/register.spec.tsx`
  - [x] 🟢 Implementar `app/(auth)/register.tsx`

- [x] **6.4 Auth Guard**
  - [x] 🔴 Criar `app/_layout.spec.tsx`
  - [x] 🟢 Implementar `app/_layout.tsx` redirecionando usuários não autenticados

---

## Fase 7: Presentation Layer — Captura

- [x] **7.1 Hook de Captura**
  - [x] 🔴 Criar `presentation/hooks/useCapture.spec.ts`
  - [x] 🟢 Implementar `useCapture.ts` gerenciando loadings e erros da View

- [x] **7.2 Tela de Captura e Componentes**
  - [x] 🔴 Criar `presentation/components/OfflineBanner.spec.tsx` e implementar logo depois.
  - [x] 🔴 Criar `app/(tabs)/capture.spec.tsx`
  - [x] 🟢 Implementar `app/(tabs)/capture.tsx` utilizando Use Case via Container

---

## Fase 8: Presentation Layer — Lista e Detalhe

- [x] **8.1 Hook de Prospectos**
  - [x] 🔴 Criar `presentation/hooks/useProspectos.spec.ts`
  - [x] 🟢 Implementar `useProspectos.ts` com pull-to-refresh embutido no state

- [x] **8.2 Componentes e Telas de Lista**
  - [x] 🔴 Criar `presentation/components/ProspectoCard.spec.tsx` e `SyncBadge.spec.tsx` implementando logo em seguida
  - [x] 🔴 Criar `app/(tabs)/list/index.spec.tsx` (Lista FlatList com os hooks)
  - [x] 🟢 Implementar `app/(tabs)/list/index.tsx`

- [x] **8.3 Tela de Detalhe**
  - [x] 🔴 Criar `presentation/components/StatusSelector.spec.tsx` testando chamadas onChange e implementar.
  - [x] 🔴 Criar `app/(tabs)/list/[id].spec.tsx`
  - [x] 🟢 Implementar `app/(tabs)/list/[id].tsx`

---

## Fase 9: Presentation Layer — Mapa

- [x] **9.1 Tela do Mapa (Home)**
  - [x] 🔴 Criar `presentation/components/MapMarkerCallout.spec.tsx`
  - [x] 🟢 Implementar callouts com navegação embutida
  - [x] 🔴 Criar `app/(tabs)/map.spec.tsx` (Validar lógica de clusterização mocada)
  - [x] 🟢 Implementar `app/(tabs)/map.tsx` com a biblioteca MapView e Clustering

---

## Fase 10: Integração com Backend (Supabase)

- [ ] **10.1 Setup do Projeto e Gateways Reais**
  - [ ] Configurar Dashboard do Supabase, Auth, Storage public bucket ("fotos") e RLS.
  - [ ] Exportar variáveis via `.env` (API Url, API Key base)
  - [ ] 🔴 Criar `infrastructure/supabase/SupabaseClient.spec.ts` e `SupabaseAuthGateway.spec.ts`
  - [ ] 🟢 Implementar drivers definitivos do DB/Auth do Supabase
  - [ ] 🔴 Criar e implementar testes+real para `SupabaseSyncGateway.ts` simulando a edge behavior.
  - [ ] Atualizar o `di/container.ts` para prover os Gateways Reais.

- [ ] **10.2 Edge Functions & Triggers**
  - [ ] Criar Edge Function em Deno que consome `Nominatim` para transformar geoPoint -> Rastreamento Bairro/Rua.
  - [ ] Ativar de forma automatizada (Database Webhooks) via painel/SQL `on INSERT` na tabela prospectos.

---

- [x] **11.1 Hook de Sync (Base com Mocks/SQLite)**
  - [x] 🔴 Criar `presentation/hooks/useSync.spec.ts`
  - [x] 🟢 Implementar `useSync.ts` (Listen de rede + SyncUC)
  - [~] 🟢 Integrar toast views na próxima proposal de UI/UX avançada

---

## Fase 12: Build e Homologação Final (Qualidade)

- [ ] **12.1 Testes E2E Nativos (Maestro)**
  - Escrever fluxos Maestro (`.yaml`) para cenários do dia a dia (sem rede, com rede intermitente, aceitando GPS no prompt do SO).

- [ ] **12.2 Distribuição e Build (EAS)**
  - Setup do projeto Expo Application Services
  - Fazer os builds físicos e emulados do MVP.
