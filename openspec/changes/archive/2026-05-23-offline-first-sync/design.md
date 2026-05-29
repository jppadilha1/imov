## Context

`HybridProspectoRepository` faz Supabase ser fonte de verdade quando há rede: `findAll` busca remoto e atualiza SQLite, `save` escreve no remoto primeiro. Isso introduz latência de rede em toda operação de leitura, acoplamento de conectividade no repository, e divergência do princípio offline-first original do app.

Estado atual: `prospectoRepository = HybridProspectoRepository(SQLiteRepo, SupabaseRepo, NetworkService)`.

Estado desejado: `prospectoRepository = SQLiteProspectoRepository()` — toda leitura/escrita é local, sync com Supabase é processo independente via BackgroundFetch.

`expo-background-fetch` e `expo-task-manager` não estão instalados — requerem adição de dependências e rebuild nativo via EAS. iOS impõe mínimo de ~15min entre execuções de background task. Android é mais flexível. Esses constraints são aceitos para esta change: estamos em fase de experimentação e o EAS rebuild é executável.

## Goals / Non-Goals

**Goals:**
- SQLite é a única fonte de verdade para todas leituras e escritas de prospectos
- Toda escrita salva com `syncStatus = pending` por padrão; `SyncProspectosUseCase` promove para `synced`
- Sync periódico via `expo-background-fetch` + `expo-task-manager` (background e foreground)
- Sync também disparado na reconexão de rede (comportamento existente mantido em `useNetworkSync`)
- Container simplificado: remover `HybridProspectoRepository`, remover binding de `ISessionRepository`
- Specs e testes refletem a nova arquitetura

**Non-Goals:**
- Resolução de conflitos de merge entre versões local e remota (last-write-wins via `updated_at`)
- Sync de outras entidades além de `Prospecto` (auth, configurações)
- Garantia de precisão do intervalo iOS (SO controla scheduling, mínimo ~15min)

## Decisions

### Decisão 1: Remover HybridProspectoRepository, usar SQLiteProspectoRepository diretamente

**Por quê não manter Hybrid simplificado:** Hybrid carrega a abstração de "checar rede antes de operar" que é exatamente o anti-padrão que estamos eliminando. Um repository deve ser stateless em relação à rede.

**Alternativa considerada:** Renomear Hybrid para OfflineFirstRepository mantendo interface. Rejeitado — o arquivo seria essencialmente o SQLiteProspectoRepository existente, criando confusão desnecessária.

**Decisão:** `container.prospectoRepository = new SQLiteProspectoRepository()` em todos os envs com infra real.

### Decisão 2: expo-background-fetch + expo-task-manager para sync periódico

**Por quê BackgroundFetch:** Roda mesmo quando app está suspenso (iOS) ou em background (Android). É o mecanismo nativo correto para tarefas periódicas em mobile. Fase de experimentação justifica o EAS rebuild.

**Constraints aceitos:**
- iOS: SO controla o scheduling, mínimo ~15min entre execuções. Não é exato.
- Android: mais flexível, mas também controlado pelo SO (Doze mode, battery saver).
- Requer `expo-task-manager` + `expo-background-fetch` instalados + EAS build nativo.
- Task DEVE ser definida no nível de módulo (fora de React), tipicamente em `src/tasks/syncTask.ts`.

**Alternativa descartada:** `setInterval` em `useNetworkSync`. Pausado pelo SO quando app está suspenso. Adequado apenas para foreground. Descartado em favor de BackgroundFetch.

**Decisão:** Criar `src/tasks/syncTask.ts` com `TaskManager.defineTask(SYNC_TASK_NAME, handler)`. Registrar via `BackgroundFetch.registerTaskAsync(SYNC_TASK_NAME, { minimumInterval: 15 * 60, stopOnTerminate: false, startOnBoot: true })` no mount de `useNetworkSync`. Manter trigger de reconexão existente no hook (BackgroundFetch não substitui notificações de rede).

### Decisão 3: syncStatus inicial de escritas

**Comportamento atual (Hybrid):** `save` sem rede → `pending`; `save` com rede → tenta remoto → `synced`.

**Novo comportamento:** Todo `save` via `SQLiteProspectoRepository` é local-only. O `syncStatus` do prospecto no momento do save é preservado como-está (entidade carrega seu próprio status). `CaptureProspectoUseCase` cria prospecto com `SyncStatus.pending()`. `SyncProspectosUseCase` promove para `synced` após upload.

Sem mudança no `SyncProspectosUseCase` — ele já opera sobre `findPending()`.

### Decisão 4: INetworkService no domain

`INetworkService` continua no domain — ainda é usado por `useNetworkSync` e pelo network listener. Não é mais injetado no repository, mas continua necessário para o hook.

### Decisão 5: Remoção de ISessionRepository / SQLiteSessionRepository

Arquivos já deletados no working tree. Container ainda importa `ISessionRepository` e `SQLiteSessionRepository`. Remover imports e bindings no container. Session é gerenciada via `IAuthGateway` (Supabase auth state).

## Risks / Trade-offs

**[Risco] Sync periódico dispara mesmo sem pending items** → Mitigação: `SyncProspectosUseCase.execute()` faz `findPending()` primeiro; se vazio, o upload loop é no-op. Pull ainda acontece. Overhead mínimo.

**[Risco] BackgroundFetch duplicado se hook re-montar** → Mitigação: `BackgroundFetch.registerTaskAsync` é idempotente — re-registrar a mesma task com mesmo nome não cria duplicatas. Cleanup de unmount chama `unregisterTaskAsync`.

**[Risco] iOS não garante intervalo exato** → Trade-off aceito. SO pode demorar mais que `minimumInterval`. Sync na reconexão de rede (foreground) cobre a maioria dos casos de uso. Background é complementar.

**[Risco] Conflito de dados: usuário edita offline, dados remotos divergem** → Mitigação: MVP usa last-write-wins via `updated_at`. Conflitos silenciosos são aceitáveis no escopo atual.

**[Risco] Task não disponível sem EAS build** → Mitigação: Em ambiente Expo Go / dev sem build nativo, `BackgroundFetch.registerTaskAsync` lança erro. Handler deve ser protegido com try/catch; app funciona normalmente, só sem background sync.

## Migration Plan

1. Instalar `expo-background-fetch` e `expo-task-manager` via npm
2. Criar `src/tasks/syncTask.ts`: `TaskManager.defineTask(SYNC_TASK_NAME, handler)` — handler instancia `SyncProspectosUseCase` e executa
3. Simplificar `container.ts`: remover `HybridProspectoRepository`, `SQLiteSessionRepository`, `ISessionRepository`, binding de `networkService` no repository
4. Atualizar `useNetworkSync.ts`: remover `setInterval`, adicionar `BackgroundFetch.registerTaskAsync` no mount e `unregisterTaskAsync` no cleanup; manter listener de reconexão
5. Deletar `HybridProspectoRepository.ts` e specs de teste de arquivos deletados
6. Executar EAS build para testar background task em dispositivo físico
7. Verificar que todos testes passam com nova arquitetura

**Rollback:** `git revert` — mudança é aditiva/removível sem impacto em schema de banco ou dados do usuário.

## Open Questions

- Pull de atualizações remotas: usar `new Date(0)` como `since` (pull tudo) ou persistir `lastSyncedAt` no SQLite? (MVP: `new Date(0)` — simples, correto, sem estado extra)
- `SYNC_TASK_NAME` deve ser constante compartilhada entre `syncTask.ts` e `useNetworkSync.ts` — definir em arquivo de constantes ou direto no `syncTask.ts` e importar no hook?
- Em Expo Go (sem build nativo), `BackgroundFetch.registerTaskAsync` falha — logging do erro no `try/catch` suficiente ou avisar o usuário?
