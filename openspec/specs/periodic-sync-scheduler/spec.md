# Spec: Periodic Sync Scheduler

### Requirement: Task de sync registrada via expo-task-manager
Um arquivo `src/tasks/syncTask.ts` SHALL definir uma background task com nome `SYNC_TASK_NAME = 'SYNC_PROSPECTOS'` usando `TaskManager.defineTask`. O handler da task SHALL instanciar `SyncProspectosUseCase` com as dependências do container e chamar `execute()`.

#### Scenario: Task handler executa sync com sucesso
- **WHEN** o SO aciona a background task `SYNC_PROSPECTOS`
- **THEN** o handler SHALL chamar `SyncProspectosUseCase.execute()`
- **THEN** após conclusão sem erro, SHALL retornar `BackgroundFetch.BackgroundFetchResult.NewData`

#### Scenario: Task handler com falha no sync
- **WHEN** `SyncProspectosUseCase.execute()` lança exceção
- **THEN** o handler SHALL capturar a exceção silenciosamente
- **THEN** SHALL retornar `BackgroundFetch.BackgroundFetchResult.Failed`

#### Scenario: Task handler sem pending items
- **WHEN** `SyncProspectosUseCase.execute()` completa mas não havia itens pendentes
- **THEN** SHALL retornar `BackgroundFetch.BackgroundFetchResult.NoData`

#### Scenario: Task definida no nível de módulo
- **WHEN** o arquivo `syncTask.ts` é importado
- **THEN** `TaskManager.defineTask` SHALL ser chamado imediatamente (fora de qualquer função React)
- **THEN** a task SHALL estar registrada antes de qualquer tentativa de `BackgroundFetch.registerTaskAsync`

### Requirement: Task registrada via expo-background-fetch no mount do useNetworkSync
O hook `useNetworkSync` SHALL registrar a task `SYNC_PROSPECTOS` via `BackgroundFetch.registerTaskAsync` com `minimumInterval: 15 * 60` (15 minutos), `stopOnTerminate: false` e `startOnBoot: true`.

#### Scenario: Registro bem-sucedido em build nativo
- **WHEN** `useNetworkSync` monta em ambiente com build nativo (EAS)
- **THEN** `BackgroundFetch.registerTaskAsync('SYNC_PROSPECTOS', options)` SHALL ser chamado
- **THEN** o SO agenda execuções periódicas da task

#### Scenario: Registro falha em Expo Go (sem build nativo)
- **WHEN** `BackgroundFetch.registerTaskAsync` lança exceção (Expo Go não suporta)
- **THEN** o erro SHALL ser capturado silenciosamente com `try/catch`
- **THEN** o app SHALL continuar funcionando normalmente sem background sync
- **THEN** sync na reconexão de rede (foreground) permanece ativo

#### Scenario: Desregistro no cleanup do hook
- **WHEN** o componente que monta `useNetworkSync` desmonta
- **THEN** `BackgroundFetch.unregisterTaskAsync('SYNC_PROSPECTOS')` SHALL ser chamado
- **THEN** o SO cancela o agendamento de execuções futuras

### Requirement: minimumInterval aceita limitações do SO
O campo `minimumInterval` de `BackgroundFetch.registerTaskAsync` SHALL ser `15 * 60` (900 segundos). O SO controla o scheduling real — iOS pode demorar mais que o mínimo configurado. Esse comportamento é aceito.

#### Scenario: iOS não garante intervalo exato
- **WHEN** a background task está registrada com `minimumInterval: 900`
- **THEN** o SO iOS PODE executar a task em intervalos maiores que 15 minutos
- **THEN** o app SHALL funcionar corretamente independentemente da frequência de execução da task

#### Scenario: Android respeita startOnBoot
- **WHEN** o dispositivo Android é reiniciado com a task registrada com `startOnBoot: true`
- **THEN** o SO SHALL reagendar a task automaticamente após o boot
