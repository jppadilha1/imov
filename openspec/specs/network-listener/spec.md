# Spec: Network Listener

## ADDED Requirements

### Requirement: INetworkService expõe listener de conectividade
A interface `INetworkService` SHALL declarar o método `addListener(callback: (isConnected: boolean) => void): () => void`, que registra um callback chamado sempre que o estado de conectividade mudar, e retorna uma função de cleanup (unsubscribe).

#### Scenario: Listener é registrado e notificado
- **WHEN** `addListener` é chamado com um callback
- **THEN** o callback SHALL ser invocado cada vez que o estado de conectividade mudar
- **THEN** o valor passado ao callback SHALL ser `true` quando online e `false` quando offline

#### Scenario: Cleanup do listener
- **WHEN** a função retornada por `addListener` é invocada
- **THEN** o callback SHALL parar de receber notificações de mudança de rede

### Requirement: NetworkService implementa addListener via NetInfo
A implementação concreta `NetworkService` SHALL implementar `addListener` usando `NetInfo.addEventListener`, garantindo que o listener reflita o estado real do dispositivo.

#### Scenario: Implementação delega ao NetInfo
- **WHEN** `addListener` é chamado na instância `NetworkService`
- **THEN** um listener NetInfo SHALL ser registrado internamente
- **THEN** cada mudança de estado NetInfo SHALL disparar o callback com o valor de `state.isConnected`

### Requirement: useSync utiliza addListener do container
O hook `useSync` SHALL usar `container.networkService.addListener()` para reagir a mudanças de conectividade, em vez de acessar NetInfo diretamente.

#### Scenario: Sync disparado ao reconectar
- **WHEN** `addListener` notifica que `isConnected` passou a `true`
- **THEN** `SyncProspectosUseCase.execute()` SHALL ser chamado automaticamente

#### Scenario: Cleanup no unmount do hook
- **WHEN** o componente que usa `useSync` é desmontado
- **THEN** a função de unsubscribe retornada por `addListener` SHALL ser chamada no cleanup do `useEffect`
