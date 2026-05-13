## 1. SupabaseProspectoRepository

- [x] 1.1 Criar `src/infrastructure/database/supabase/SupabaseProspectoRepository.ts` implementando `IProspectoRepository` com `findAll`, `findById`, `save`, `delete`
- [x] 1.2 Reaproveitar mapper `mapRowToProspecto` de `SupabaseSyncGateway` (extrair pra função utilitária `src/infrastructure/database/supabase/prospectoMapper.ts` ou duplicar)
- [x] 1.3 `save`: detectar se `photoPath.path` começa com `file://` ou `https://` — se local, fazer upload via Storage primeiro; se URL, usar direto
- [x] 1.4 `findPending`: lançar `Error("findPending não aplicável ao repositório remoto")` (concept-only-local)
- [x] 1.5 `delete`: remover registro da tabela `prospectos` E deletar arquivo do Supabase Storage
- [x] 1.6 Criar `__tests__/unit/infrastructure/supabase/SupabaseProspectoRepository.spec.ts` cobrindo todos os cenários do spec

## 2. HybridProspectoRepository

- [x] 2.1 Criar `src/infrastructure/database/HybridProspectoRepository.ts` implementando `IProspectoRepository`
- [x] 2.2 Construtor recebe `local: IProspectoRepository`, `remote: IProspectoRepository`, `network: INetworkService`
- [x] 2.3 `findAll`: se online → `remote.findAll()` + write-through pra `local.save` por item; se offline → `local.findAll()`; com try/catch pra fallback em caso de falha remota
- [x] 2.4 `findById`: similar — online preferido com fallback local; cache write-through quando online
- [x] 2.5 `save`: online → marca `synced` e chama `remote.save` + `local.save`; offline → marca `pending` e chama só `local.save`; em falha remoto online, marca `pending` no local e propaga erro
- [x] 2.6 `findPending`: sempre delega pra `local.findPending()`
- [x] 2.7 `delete`: online → `remote.delete` + `local.delete`; offline → só `local.delete`
- [x] 2.8 Criar `__tests__/unit/infrastructure/database/HybridProspectoRepository.spec.ts` cobrindo 12+ cenários (online/offline × cada método + fallbacks)

## 3. DIContainer wiring

- [x] 3.1 Em `src/dependency_injection/container.ts`, no branch `isProduction`, instanciar `local = new SQLiteProspectoRepository()`, `remote = new SupabaseProspectoRepository(supabase, photoStorage)`, e atribuir `this.prospectoRepository = new HybridProspectoRepository(local, remote, this.networkService)`
- [x] 3.2 Confirmar que em dev mode `this.prospectoRepository = new MockProspectoRepository()` continua
- [x] 3.3 Atualizar `__tests__/unit/dependency_injection/container.spec.ts` para verificar que em produção `prospectoRepository` é `HybridProspectoRepository`

## 4. useNetworkSync hook

- [x] 4.1 Criar `hooks/useNetworkSync.ts` que invoca `SyncProspectosUseCase` no mount (se online) e em transições offline→online via `network.addListener`
- [x] 4.2 Usar `useRef` para garantir único sync em flight (ignora notificações enquanto `syncInFlight === true`)
- [x] 4.3 Cleanup do listener no unmount (return da `addListener` callback)
- [x] 4.4 Criar `__tests__/unit/hooks/useNetworkSync.spec.tsx` cobrindo: mount online, mount offline, transição online, transição offline, múltiplas notificações, unmount

## 5. Root layout integration

- [x] 5.1 Em `app/_layout.tsx`, importar e invocar `useNetworkSync()` no escopo do componente raiz
- [x] 5.2 Verificar manualmente em device: capturar offline, voltar online, observar sync automático na UI

## 6. Cleanup e regression

- [x] 6.1 Verificar que `useProspectos`, `useProspectoDetail`, `useSync`, `useCapture` continuam funcionando sem alteração (recebem `IProspectoRepository`, transparente ao novo híbrido)
- [x] 6.2 Rodar suite completa de testes: `npm test` — 32 novos testes passam (2 falhas pré-existentes em `ExpoGeocodeService` não relacionadas a esta change)
- [x] 6.3 Verificar manualmente no device: edição de prospecto online aparece na listagem após voltar; captura offline aparece no Supabase após reconectar
