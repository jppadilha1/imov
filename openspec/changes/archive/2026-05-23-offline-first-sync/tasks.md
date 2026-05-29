## 0. Instalar dependências nativas

- [x] 0.1 Instalar `expo-task-manager` e `expo-background-fetch` via `npx expo install expo-task-manager expo-background-fetch`
- [x] 0.2 Verificar que ambos aparecem em `package.json` com versões compatíveis com Expo SDK 54
- [ ] 0.3 Executar EAS build (development build) para dispositivo físico — background tasks não funcionam em Expo Go

## 1. Limpeza de arquivos e imports obsoletos

- [x] 1.1 Deletar `prospecthome/src/infrastructure/database/HybridProspectoRepository.ts`
- [x] 1.2 Deletar `prospecthome/__tests__/unit/infrastructure/database/HybridProspectoRepository.spec.ts`
- [x] 1.3 Deletar `prospecthome/__tests__/unit/infrastructure/database/SQLiteSessionRepository.spec.ts` (arquivo fonte já deletado)
- [x] 1.4 Deletar `prospecthome/__tests__/unit/infrastructure/network/NetworkService.spec.ts` (NetworkService mantido mas não testado unitariamente)
- [x] 1.5 Deletar `prospecthome/__tests__/unit/dependency_injection/container.spec.ts` (ou reescrever — ver task 4.1)

## 2. Simplificar container.ts

- [x] 2.1 Remover imports de `ISessionRepository`, `SQLiteSessionRepository`, `HybridProspectoRepository` do container
- [x] 2.2 No branch `isProduction`: substituir `HybridProspectoRepository(localRepo, remoteRepo, networkService)` por `new SQLiteProspectoRepository()` como `prospectoRepository`
- [x] 2.3 No branch dev/test: `prospectoRepository` já usa `MockProspectoRepository` — sem mudança necessária
- [x] 2.4 Remover `this.sessionRepository` e binding de `ISessionRepository` do container
- [x] 2.5 Manter `this.networkService` e `NetworkService` no container — usado por `useNetworkSync`

## 3. Criar syncTask.ts e atualizar useNetworkSync

- [x] 3.1 Criar `prospecthome/src/tasks/syncTask.ts` com `export const SYNC_TASK_NAME = 'SYNC_PROSPECTOS'`
- [x] 3.2 Em `syncTask.ts`, chamar `TaskManager.defineTask(SYNC_TASK_NAME, handler)` no nível de módulo (fora de qualquer função)
- [x] 3.3 O handler da task deve instanciar `SyncProspectosUseCase` usando `container`, chamar `execute()`, retornar `BackgroundFetch.BackgroundFetchResult.NewData/NoData/Failed` conforme resultado
- [x] 3.4 Em `hooks/useNetworkSync.ts`, importar `syncTask.ts` (garante que `TaskManager.defineTask` rode antes do registro)
- [x] 3.5 No `useEffect` de `useNetworkSync`, substituir lógica de `setInterval` por `BackgroundFetch.registerTaskAsync(SYNC_TASK_NAME, { minimumInterval: 15 * 60, stopOnTerminate: false, startOnBoot: true })` dentro de `try/catch`
- [x] 3.6 No cleanup do `useEffect`, chamar `BackgroundFetch.unregisterTaskAsync(SYNC_TASK_NAME)` dentro de `try/catch`
- [x] 3.7 Manter o listener de reconexão (`network.addListener`) e o sync inicial no mount — não são substituídos pelo BackgroundFetch

## 4. Atualizar spec de teste do useNetworkSync

- [x] 4.1 Em `__tests__/unit/hooks/useNetworkSync.spec.tsx`: mockar `expo-background-fetch` e `expo-task-manager`
- [x] 4.2 Adicionar cenário: `registerTaskAsync` chamado no mount
- [x] 4.3 Adicionar cenário: `registerTaskAsync` lança erro (Expo Go) → app não crasha, listener de rede continua ativo
- [x] 4.4 Adicionar cenário: `unregisterTaskAsync` chamado no unmount
- [x] 4.5 Verificar que cenários de reconexão existentes ainda passam

## 5. Atualizar specs de teste afetados

- [x] 5.1 Em `__tests__/unit/application/use-cases/LoginUseCase.spec.ts`: remover referências a `ISessionRepository` se existirem
- [x] 5.2 Em `__tests__/unit/application/use-cases/RegisterUseCase.spec.ts`: remover referências a `ISessionRepository` se existirem
- [x] 5.3 Em `__tests__/unit/hooks/useAuth.spec.tsx`: verificar dependências de `SQLiteSessionRepository` — atualizar se necessário
- [x] 5.4 Em `__tests__/unit/infrastructure/supabase/SupabaseAuthGateway.spec.ts`: adicionar testes de `getSession`
- [x] 5.5 Em `__tests__/unit/infrastructure/supabase/SupabaseProspectoRepository.spec.ts`: verificar consistência
- [x] 5.6 Em `__tests__/unit/infrastructure/supabase/SupabaseSyncGateway.spec.ts`: verificar consistência

## 6. Verificar domain — ISessionRepository e INetworkService

- [x] 6.1 Confirmar que `ISessionRepository` não é importado em nenhum use case ativo — deletar `src/domain/repositories/ISessionRepository.ts` se não usado
- [x] 6.2 Confirmar que `INetworkService` ainda é necessário (usado em `useNetworkSync`) — manter
- [x] 6.3 Verificar se `useNetwork.ts` (hook separado) tem dependências a limpar

## 7. Validação final

- [x] 7.1 Rodar `jest` — todos os testes devem passar sem erro de import (29 suítes, 143 testes ✓)
- [x] 7.2 Verificar TypeScript: `npx tsc --noEmit` sem erros relacionados a arquivos removidos (apenas 2 erros pré-existentes em `useProspectoDetail.ts` não relacionados)
- [x] 7.3 Confirmar que `container.ts` compila sem referências a arquivos deletados
- [ ] 7.4 Testar em dispositivo físico (EAS build): capturar prospecto → verificar `syncStatus = pending` → aguardar background task executar → verificar sync no console/Supabase

## 8. Refator auth (escopo expandido)

- [x] 8.1 Adicionar `getSession()` ao `IAuthGateway`
- [x] 8.2 Implementar `getSession()` em `SupabaseAuthGateway` via `supabase.auth.getSession()`
- [x] 8.3 Implementar `getSession()` em `MockAuthGateway` (retorna `null`)
- [x] 8.4 Refatorar `LoginUseCase` — remove `sessionRepository`, delega tudo ao `authGateway`
- [x] 8.5 Refatorar `RegisterUseCase` — remove `sessionRepository`, delega tudo ao `authGateway`
- [x] 8.6 Refatorar `CheckSessionUseCase` — usa `authGateway.getSession()` em vez de `sessionRepository.getSession()`
- [x] 8.7 Refatorar `LogoutUseCase` — remove `sessionRepository.clearSession()`, `authGateway.logout()` já invalida sessão
- [x] 8.8 Atualizar `AuthContext` — remove referências a `container.sessionRepository`
- [x] 8.9 Deletar `src/domain/repositories/ISessionRepository.ts`

## 9. Limpeza + bug fixes pós-review

- [x] 9.1 Em `src/infrastructure/database/migrations.ts`: remover migration de CREATE TABLE `session` e adicionar migration `DROP TABLE IF EXISTS session;` (sessão fica em AsyncStorage do supabase-js, tabela é dead code)
- [x] 9.2 Adicionar método `markDirty()` ao `src/domain/entities/Prospecto.ts` que reseta `syncStatus` para `pending` (usado quando edits locais precisam reupload)
- [x] 9.3 Em `hooks/useProspectoDetail.ts`: chamar `markDirty()` nos updates de status/notes antes de salvar, garantindo que background task pegue as edições
- [x] 9.4 Adicionar testes em `__tests__/unit/domain/entities/Prospecto.spec.ts` para `markDirty()` (synced → pending, error → pending)
- [x] 9.5 Criar `prospecthome/utils/photoUri.ts` com função `resolvePhotoUri(path: string)` que detecta URL (http/https → usa direto) ou filename (prefixa `FileSystem.documentDirectory`)
- [x] 9.6 Em `components/ProspectoCard.tsx`: usar `resolvePhotoUri(prospecto.photoPath.path)` ao montar `Image source.uri`
- [x] 9.7 Verificar outros locais que renderizam foto (`ProspectPreviewCard`, `app/(tabs)/list/[id].tsx`) e aplicar mesmo resolver
- [x] 9.8 Adicionar testes em `__tests__/unit/utils/photoUri.spec.ts` (URL passa direto, filename ganha prefix)
- [x] 9.9 Rodar `jest` — todos os testes devem passar
- [x] 9.10 Rodar `npx tsc --noEmit` — sem novos erros
