## MODIFIED Requirements

### Requirement: useNetworkSync dispara SyncProspectosUseCase em transições online e registra BackgroundFetch
O hook `useNetworkSync` em `hooks/useNetworkSync.ts` SHALL ser montado no root layout do app e SHALL operar em dois modos complementares: (1) foreground — chama `SyncProspectosUseCase.execute()` diretamente em transições de rede; (2) background — registra a task `SYNC_PROSPECTOS` via `BackgroundFetch.registerTaskAsync` para execuções periódicas gerenciadas pelo SO.

#### Scenario: App abre já com conexão — sync inicial
- **WHEN** `useNetworkSync` monta e `network.isConnected()` retorna `true`
- **THEN** SHALL chamar `SyncProspectosUseCase.execute()` uma única vez
- **THEN** sync resultará em upload de pending items e pull de dados remotos

#### Scenario: App abre offline — sem sync inicial, task registrada
- **WHEN** `useNetworkSync` monta e `network.isConnected()` retorna `false`
- **THEN** NÃO SHALL chamar `SyncProspectosUseCase.execute()` imediatamente
- **THEN** SHALL registrar o listener de rede e tentar registrar a BackgroundFetch task

#### Scenario: Transição offline → online — sync automático no foreground
- **WHEN** `useNetworkSync` está montado e `network.addListener` notifica `isConnected = true` após estar `false`
- **THEN** SHALL chamar `SyncProspectosUseCase.execute()`
- **THEN** UI passa a refletir dados sincronizados após sync completar

#### Scenario: Transição online → offline — sem ação
- **WHEN** `network.addListener` notifica `isConnected = false`
- **THEN** NÃO SHALL chamar `SyncProspectosUseCase.execute()`
- **THEN** sync em andamento, se houver, é finalizado normalmente

#### Scenario: Múltiplas notificações de online em sequência — sync único em flight
- **WHEN** qualquer gatilho dispara `runSync` enquanto sync já está em andamento
- **THEN** NÃO SHALL iniciar um novo sync paralelo
- **THEN** ignora disparos duplicados até o sync atual concluir

#### Scenario: Cleanup ao desmontar
- **WHEN** o componente que usa `useNetworkSync` desmonta
- **THEN** o listener de rede SHALL ser removido via callback retornado por `network.addListener`
- **THEN** `BackgroundFetch.unregisterTaskAsync('SYNC_PROSPECTOS')` SHALL ser chamado
- **THEN** transições subsequentes NÃO SHALL disparar sync após unmount

### Requirement: Root layout usa useNetworkSync uma única vez
O arquivo `app/_layout.tsx` (ou componente raiz equivalente) SHALL invocar `useNetworkSync()` no escopo do componente raiz, garantindo um único listener ativo e um único registro de BackgroundFetch task por sessão do app.

#### Scenario: Root layout monta o hook
- **WHEN** `app/_layout.tsx` renderiza
- **THEN** `useNetworkSync()` SHALL ser chamado uma única vez
- **THEN** sync automático por reconexão (foreground) e por BackgroundFetch (background) passam a operar para toda a sessão do app

### Requirement: syncTask.ts importado antes do registro
O arquivo `src/tasks/syncTask.ts` SHALL ser importado no arquivo onde `useNetworkSync` é usado (ou no entry point do app) para garantir que `TaskManager.defineTask` seja executado antes de `BackgroundFetch.registerTaskAsync`.

#### Scenario: Task definida antes do registro
- **WHEN** `BackgroundFetch.registerTaskAsync('SYNC_PROSPECTOS')` é chamado
- **THEN** `TaskManager.isTaskDefined('SYNC_PROSPECTOS')` SHALL retornar `true`
- **THEN** o registro SHALL completar sem erro de "task not defined"
