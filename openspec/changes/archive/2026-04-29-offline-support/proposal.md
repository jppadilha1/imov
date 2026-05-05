## Why

O app não detecta ausência de rede e tenta renderizar o mapa normalmente quando offline, causando falhas silenciosas. Além disso, o `INetworkService` carece de um mecanismo de escuta reativa (listener), e o container usa `MockProspectoRepository` em vez do `SQLiteProspectoRepository` real, impedindo que capturas feitas offline sejam persistidas localmente.

## What Changes

- Adicionar `addListener()` a `INetworkService` e sua implementação concreta `NetworkService`, corrigindo o bug no `useSync`.
- Substituir a tela de mapa por um placeholder estático (ícone + texto orientativo) quando o dispositivo está offline.
- Introduzir uma constante de feature flag (`USE_REAL_DB`) no container de DI para alternar entre `MockProspectoRepository` e `SQLiteProspectoRepository` de forma explícita.
- Garantir que `useSync` reaja corretamente a transições de rede usando o listener implementado.
- O `MockSyncGateway` permanece como stub de sincronização; nenhuma integração Supabase real é adicionada nessa change.

## Capabilities

### New Capabilities

- `offline-map`: Detecção de estado de rede na tela do mapa com exibição de mensagem estática offline no lugar do `MapView`.
- `network-listener`: Extensão de `INetworkService` com suporte a listeners reativos de mudança de conectividade.
- `sqlite-flag`: Mecanismo de feature flag (`USE_REAL_DB`) no container de DI para ativar o repositório SQLite real de prospectos.

### Modified Capabilities

- `offline-first`: A estratégia offline-first passa a incluir feedback visual explícito na UI e listener de rede funcional no hook de sync.

## Impact

- `src/domain/repositories/INetworkService.ts` — novo método `addListener()`
- `src/infrastructure/network/NetworkService.ts` — implementação de `addListener()` via NetInfo
- `src/dependency_injection/container.ts` — constante `USE_REAL_DB`, wiring condicional do `SQLiteProspectoRepository`
- `hooks/useSync.ts` — passa a usar `addListener()` de forma confiável
- `app/(tabs)/map.tsx` — renderiza placeholder offline via `useNetwork()`
- Sem novas dependências externas
