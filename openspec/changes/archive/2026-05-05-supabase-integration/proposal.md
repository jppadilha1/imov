## Why

O app já funciona em modo offline-first com mocks de autenticação e sincronização, mas não possui nenhuma integração real com nuvem. O `MockAuthGateway` e o `MockSyncGateway` precisam ser substituídos por implementações Supabase reais para que o produto seja utilizável em produção, mantendo o comportamento mock intacto para desenvolvimento.

## What Changes

- Introduzir um cliente Supabase singleton configurado via variáveis de ambiente (Supabase URL + Anon Key), lidas através de `expo-constants` com `app.config.js`.
- Criar `SupabaseAuthGateway` implementando `IAuthGateway` (login, register, logout, refreshToken) usando Supabase Auth.
- Criar `SupabaseSyncGateway` implementando `ISyncGateway` (uploadProspecto, pullUpdates) usando Supabase Database + Supabase Storage para fotos.
- Atualizar o container de DI para alternar entre Supabase e mocks com base na variável `APP_ENV`: `production` wira Supabase, qualquer outro valor mantém os mocks.
- Criar schema e migrations do banco Supabase (tabela `prospectos` + políticas RLS + bucket de storage) como arquivos SQL em `supabase/migrations/`. Esses arquivos são independentes das migrations SQLite locais e sem conflito com elas.

## Capabilities

### New Capabilities

- `supabase-client`: Singleton de configuração do cliente Supabase, alimentado por variáveis de ambiente lidas via `expo-constants`. Ponto único de acesso ao SDK `@supabase/supabase-js` no projeto.
- `supabase-auth`: `SupabaseAuthGateway` — implementação real de `IAuthGateway` via Supabase Auth. Cobre login por email/senha, registro, logout e refresh de token.
- `supabase-sync`: `SupabaseSyncGateway` — implementação real de `ISyncGateway`. Upload de prospecto inclui envio de foto ao Supabase Storage e inserção do registro na tabela `prospectos` no banco Supabase. Pull retorna registros remotos filtrados por `user_id` e `last_sync_date`.
- `supabase-schema`: Schema e migrations SQL para o banco Supabase (tabela `prospectos`, bucket `prospecto-photos`, políticas RLS). Separados e independentes das migrations SQLite locais.
- `env-config`: Mecanismo de configuração por ambiente via variável `APP_ENV`. Em `production`, o container wira implementações Supabase; em qualquer outro valor, mantém mocks. Variáveis sensíveis (URL, chaves) são injetadas via `app.config.js` + `expo-constants`.

### Modified Capabilities

- `offline-first`: A sincronização reativa passa a ter um destino real em produção — `SupabaseSyncGateway` é invocado pelo `SyncProspectosUseCase` quando `APP_ENV=production`. O comportamento offline-first (fila local, sync ao reconectar) não muda; apenas o destino do upload.

## Impact

- `src/infrastructure/supabase/SupabaseClient.ts` — novo singleton
- `src/infrastructure/supabase/SupabaseAuthGateway.ts` — novo
- `src/infrastructure/supabase/SupabaseSyncGateway.ts` — novo
- `src/dependency_injection/container.ts` — lógica `APP_ENV` substitui `USE_REAL_DB` para auth e sync
- `app.config.js` — adicionado (ou convertido de `app.json`) para expor variáveis via `expo-constants`
- `.env` — novo arquivo (não commitado) com `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_ENV`
- `supabase/migrations/` — novo diretório com SQL do schema remoto
- Sem novas dependências npm (supabase-js e expo-constants já instalados)
