# Spec: Network Sync Trigger

## ADDED Requirements

### Requirement: useNetworkSync dispara SyncProspectosUseCase em transições online
O hook `useNetworkSync` em `hooks/useNetworkSync.ts` SHALL ser montado no root layout do app e SHALL chamar `SyncProspectosUseCase.execute()` automaticamente em dois gatilhos: (1) ao montar, se o app já está online; (2) quando `INetworkService.addListener` notificar transição `offline → online`.

#### Scenario: App abre já com conexão — sync inicial
- **WHEN** `useNetworkSync` monta e `network.isConnected()` retorna `true`
- **THEN** SHALL chamar `SyncProspectosUseCase.execute()` uma única vez
- **THEN** sync resultará em upload de pending items e pull de dados remotos

#### Scenario: App abre offline — sem sync inicial
- **WHEN** `useNetworkSync` monta e `network.isConnected()` retorna `false`
- **THEN** NÃO SHALL chamar `SyncProspectosUseCase.execute()`
- **THEN** SHALL apenas registrar o listener de rede

#### Scenario: Transição offline → online — sync automático
- **WHEN** `useNetworkSync` está montado e `network.addListener` notifica `isConnected = true` após estar `false`
- **THEN** SHALL chamar `SyncProspectosUseCase.execute()`
- **THEN** UI passa a refletir dados sincronizados após sync completar

#### Scenario: Transição online → offline — sem ação
- **WHEN** `network.addListener` notifica `isConnected = false`
- **THEN** NÃO SHALL chamar `SyncProspectosUseCase.execute()`
- **THEN** sync em andamento, se houver, é finalizado normalmente (não cancelado abruptamente)

#### Scenario: Múltiplas notificações de online em sequência — sync único em flight
- **WHEN** `network.addListener` notifica `isConnected = true` enquanto um sync já está em andamento
- **THEN** NÃO SHALL iniciar um novo sync paralelo
- **THEN** ignora notificações duplicadas até o sync atual concluir

#### Scenario: Listener removido ao desmontar
- **WHEN** o componente que usa `useNetworkSync` desmonta
- **THEN** o callback retornado por `network.addListener` SHALL ser chamado para limpar o listener
- **THEN** transições subsequentes NÃO SHALL disparar sync após unmount

### Requirement: Root layout usa useNetworkSync uma única vez
O arquivo `app/_layout.tsx` (ou componente raiz equivalente) SHALL invocar `useNetworkSync()` no escopo do componente raiz, garantindo um único listener ativo por sessão do app.

#### Scenario: Root layout monta o hook
- **WHEN** `app/_layout.tsx` renderiza
- **THEN** `useNetworkSync()` SHALL ser chamado
- **THEN** o sync automático passa a operar para toda a sessão do app
