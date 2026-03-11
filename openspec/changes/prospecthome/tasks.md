# ProspectHome MVP — Tasks

## Fase 1: Setup do Projeto

- [ ] **1.1 Inicializar projeto Expo**
  - Criar projeto com `npx create-expo-app`
  - Configurar Expo Router (file-based routing)
  - Instalar dependências core:
    - `expo-router`, `expo-sqlite`, `expo-location`
    - `expo-image-picker`, `expo-image-manipulator`, `expo-file-system`
    - `react-native-maps`, `@react-native-community/netinfo`
    - `@supabase/supabase-js`, `uuid`

- [ ] **1.2 Estrutura de pastas Clean Architecture**
  - Criar estrutura: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/presentation/`, `src/di/`
  - Criar subpastas conforme design.md (entities, value-objects, repositories, use-cases, etc.)

- [ ] **1.3 Configurar Supabase**
  - Criar projeto no Supabase
  - Configurar Auth (email/senha)
  - Criar tabelas: `profiles`, `prospectos`
  - Configurar RLS policies
  - Criar Storage bucket "fotos" com policies
  - Criar `infrastructure/supabase/SupabaseClient.ts`

---

## Fase 2: Domain Layer

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

- [ ] **3.4 Supabase — Gateways (implements interfaces)**
  - `infrastructure/supabase/SupabaseAuthGateway.ts` — implements `IAuthGateway`
  - `infrastructure/supabase/SupabaseSyncGateway.ts` — implements `ISyncGateway`
    - `uploadProspecto()`: foto → Storage, dados → Postgres
    - `pullUpdates()`: busca registros atualizados (endereço resolvido)

- [ ] **3.5 Network Service**
  - `infrastructure/network/NetworkService.ts` — wrapper NetInfo (online/offline)

---

## Fase 4: Application Layer (Use Cases)

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
    - Fluxo: busca pending → upload cada um → pull updates

---

## Fase 5: DI Container

- [ ] **5.1 Container de Dependências**
  - `di/container.ts`
    - Instancia todas as implementações de infra
    - Cria todos os Use Cases injetando interfaces
    - Exporta Use Cases prontos para uso na Presentation

---

## Fase 6: Presentation Layer — Auth

- [ ] **6.1 Hooks de Auth**
  - `presentation/hooks/useAuth.ts`
    - Expõe: `login()`, `register()`, `logout()`, `user`, `isOnline`
    - Usa Use Cases do container

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
  - `presentation/components/MapMarkerCallout.tsx`
  - Pins com callout → navega para Detalhe
  - Mensagem offline se sem internet

---

## Fase 10: Sincronização

- [ ] **10.1 Hook de Sync**
  - `presentation/hooks/useSync.ts`
  - Monitora NetInfo → trigger `SyncProspectosUseCase`
  - Intervalo mínimo entre syncs (30s)
  - `presentation/hooks/useNetwork.ts` — estado online/offline

- [ ] **10.2 Integração na UI**
  - Badge de pendentes na tab lista
  - Toast ao completar sync
  - Loading states

---

## Fase 11: Supabase Backend

- [ ] **11.1 Edge Function: geocode-prospecto**
  - Chama Nominatim → UPDATE endereço e bairro
  - Retry com backoff (rate limit 1 req/s)

- [ ] **11.2 Database Trigger/Webhook**
  - Trigger on INSERT `public.prospectos`
  - Chama Edge Function automaticamente

---

## Fase 12: Testes e Validação

- [ ] **12.1 Testes manuais**
  - Fluxo offline: login → captura → lista
  - Fluxo sync: Wi-Fi → dados sobem
  - Geocoding: endereço resolvido
  - Mapa: pins + navegação para detalhe
  - Logout com pendentes: alerta

- [ ] **12.2 Build Android**
  - APK de desenvolvimento via `eas build`
  - Teste em device real (câmera, GPS, offline)
