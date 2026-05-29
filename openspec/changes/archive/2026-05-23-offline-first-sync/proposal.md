## Why

O app foi concebido offline-first mas a implementação atual (`HybridProspectoRepository`) usa Supabase como fonte de verdade primária quando há rede, adicionando latência desnecessária e acoplamento de rede em toda operação de leitura/escrita. Precisamos inverter completamente: SQLite é sempre a fonte de verdade, Supabase é um destino de sync periódico.

## What Changes

- **BREAKING** `HybridProspectoRepository` removido — `SQLiteProspectoRepository` vira o único repository de `IProspectoRepository` no container
- `INetworkService` removido do fluxo de leitura/escrita de prospectos (repository não verifica rede)
- Toda escrita de prospecto vai direto ao SQLite com `syncStatus = pending`
- `useNetworkSync` refatorado: mantém trigger em reconexão + registra task periódica via `expo-background-fetch`
- Novo `src/tasks/syncTask.ts`: define background task `SYNC_PROSPECTOS` via `expo-task-manager`
- `expo-task-manager` + `expo-background-fetch` instalados; requer EAS build nativo
- Container simplificado: `prospectoRepository = new SQLiteProspectoRepository()` em todos os envs com real infra
- `ISessionRepository` / `SQLiteSessionRepository` removidos (já deletados no git) — session via `IAuthGateway` direto
- `INetworkService` removido do domain se não for mais usado por nenhum use case
- Specs de test atualizadas: remover specs de arquivos deletados, atualizar specs restantes para refletir arquitetura offline-first pura

## Capabilities

### New Capabilities
- `periodic-sync-scheduler`: Background task `SYNC_PROSPECTOS` via `expo-task-manager` + `expo-background-fetch`, registrada no mount de `useNetworkSync`, executada pelo SO em background a cada ~15min (iOS) ou menos (Android).

### Modified Capabilities
- `offline-first`: Spec atual descreve online-first com fallback. Inverter: SQLite é sempre fonte de verdade; Supabase é destino de sync, nunca fonte de leitura em tempo real.
- `network-sync-trigger`: Adicionar cenário de trigger periódico (interval-based) além dos triggers de reconexão existentes.

## Impact

- `prospecthome/src/infrastructure/database/HybridProspectoRepository.ts` — removido
- `prospecthome/src/dependency_injection/container.ts` — simplificado, remove `HybridProspectoRepository` e `INetworkService` do binding de repository
- `prospecthome/hooks/useNetworkSync.ts` — adiciona lógica de interval periódico
- `prospecthome/src/domain/repositories/INetworkService.ts` — mantido (ainda usado pelo hook e network listener)
- `prospecthome/src/infrastructure/database/SQLiteSessionRepository.ts` — já deletado, remover referências no container
- `prospecthome/src/domain/repositories/ISessionRepository.ts` — já deletado, limpar imports
- Specs de test: `HybridProspectoRepository.spec.ts` atualizado, specs de arquivos deletados removidos
