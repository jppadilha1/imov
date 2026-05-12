## Why

A arquitetura atual é "offline-first sempre": app lê do SQLite incondicionalmente, com Supabase usado apenas como destino de upload de itens pending. Resultado: dados editados no Supabase (ou em outro dispositivo) nunca aparecem na listagem porque o app nunca lê do remoto. A intenção real do produto é "online quando possível, offline como fallback" — Supabase é a fonte de verdade quando há rede, SQLite é cache local para uso sem rede.

## What Changes

- **Repositório híbrido (`HybridProspectoRepository`)**: novo wrapper que implementa `IProspectoRepository` e roteia em runtime baseado em `INetworkService.isConnected()`:
  - `findAll()` / `findById()`: online → busca Supabase, atualiza cache SQLite; offline → lê SQLite
  - `save()`: online → grava Supabase E SQLite (com `synced`); offline → grava SQLite com `pending`
  - `findPending()`: sempre SQLite (itens locais não sincronizados)
  - `delete()`: online → deleta Supabase + SQLite; offline → deleta SQLite (sem propagar remoto no MVP)
- **`SupabaseProspectoRepository` (novo)**: implementa `IProspectoRepository` direto contra Supabase (CRUD remoto). Reutiliza mapeamento de `SupabaseSyncGateway`. Usado internamente pelo híbrido.
- **DIContainer**: em produção injeta `HybridProspectoRepository(local: SQLiteProspectoRepository, remote: SupabaseProspectoRepository, network: NetworkService)`. Mocks e dev mode continuam com `MockProspectoRepository`.
- **Sync automático na inicialização e na reconexão**: hook `useNetworkSync` (novo) escuta `NetworkService.addListener` e chama `SyncProspectosUseCase` quando transição offline→online.
- **BREAKING**: capability `offline-first` muda de "SQLite é Single Source of Truth primária" para "Supabase é fonte de verdade quando online, SQLite é cache + fila offline".

## Capabilities

### New Capabilities
- `hybrid-prospecto-repository`: padrão de repositório híbrido que roteia leituras/escritas entre Supabase (online) e SQLite (offline/cache), incluindo `SupabaseProspectoRepository` para CRUD remoto.
- `network-sync-trigger`: hook `useNetworkSync` que dispara `SyncProspectosUseCase` na transição online (incluindo ao abrir o app já online).

### Modified Capabilities
- `offline-first`: princípio invertido — Supabase é fonte de verdade quando online; SQLite vira cache + fila de pending. Captura offline continua salvando local com `pending` (semelhante ao atual); leitura passa a preferir remoto quando online.

## Impact

- **Arquivos novos**: `src/infrastructure/database/supabase/SupabaseProspectoRepository.ts`, `src/infrastructure/database/HybridProspectoRepository.ts`, `hooks/useNetworkSync.ts`
- **Arquivos modificados**: `src/dependency_injection/container.ts` (instancia híbrido em produção), `app/_layout.tsx` ou root hook para usar `useNetworkSync`
- **Testes**: specs novos para `HybridProspectoRepository` (4 cenários: online read, offline read, online write, offline write), `SupabaseProspectoRepository`, `useNetworkSync`
- **Sem novas dependências**: usa `INetworkService` existente; sem libs adicionais
