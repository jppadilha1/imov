## 1. INetworkService — addListener

- [x] 1.1 Adicionar método `addListener(callback: (isConnected: boolean) => void): () => void` à interface `src/domain/repositories/INetworkService.ts`
- [x] 1.2 Implementar `addListener` em `src/infrastructure/network/NetworkService.ts` usando `NetInfo.addEventListener`, retornando a função de unsubscribe

## 2. useSync — corrigir listener de rede

- [x] 2.1 Atualizar `hooks/useSync.ts` para usar `container.networkService.addListener()` corretamente no `useEffect`, retornando o unsubscribe como cleanup

## 3. DI Container — flag USE_REAL_DB

- [x] 3.1 Substituir `useMock` por constante nomeada `USE_REAL_DB: boolean` em `src/dependency_injection/container.ts`
- [x] 3.2 Condicionar `prospectoRepository` entre `MockProspectoRepository` (false) e `SQLiteProspectoRepository` (true) usando `USE_REAL_DB`
- [x] 3.3 Manter `authGateway` e `syncGateway` sempre apontando para mocks, independente do flag

## 4. Mapa — placeholder offline

- [x] 4.1 Importar `useNetwork` em `app/(tabs)/map.tsx`
- [x] 4.2 Criar componente de placeholder inline na tela do mapa: ícone `WifiOff` (lucide-react-native) + título + texto orientativo usando `StyleSheet`
- [x] 4.3 Condicionar o render: quando `isConnected` for `false`, exibir o placeholder; quando `true`, exibir o `MapView` com todos os controles existentes
- [x] 4.4 Garantir que o placeholder ocupe o mesmo espaço do `mapContainer` (flex: 1, centralizado)

## 5. Testes

- [x] 5.1 Atualizar mocks de `INetworkService` nos testes unitários para incluir o método `addListener` (retornar no-op unsubscribe)
- [x] 5.2 Adicionar teste em `hooks/useSync` verificando que o sync é disparado quando `addListener` notifica `isConnected = true`
- [x] 5.3 Adicionar teste na tela do mapa verificando que o placeholder aparece quando `isConnected = false` e o `MapView` aparece quando `isConnected = true`
