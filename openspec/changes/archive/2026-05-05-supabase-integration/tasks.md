## 1. Setup do Projeto Supabase

- [x] 1.1 Criar projeto Supabase em supabase.com; copiar `Project URL` e `anon public key` da aba Settings → API
- [x] 1.2 No painel, ir em `Authentication → Settings` e desativar `Confirm email`
- [x] 1.3 Instalar Supabase CLI (instalado como devDependency em `prospecthome/`; comandos via `npx supabase`)
- [x] 1.4 Rodar `npx supabase login` para autenticar a CLI
- [x] 1.5 Rodar `npx supabase init` em `prospecthome/` (cria `prospecthome/supabase/config.toml`)
- [x] 1.6 Rodar `npx supabase link --project-ref <ref>` para vincular a CLI ao projeto remoto

## 2. Configuração de Ambiente

- [x] 2.1 Verificar se `@react-native-async-storage/async-storage` está instalado; instalá-lo se não estiver (`npx expo install @react-native-async-storage/async-storage`)
- [x] 2.2 Converter `app.json` para `app.config.js`, expondo `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `APP_ENV` via `extra` lidos de `process.env`
- [x] 2.3 Criar `.env.example` na raiz com placeholders: `SUPABASE_URL=`, `SUPABASE_ANON_KEY=`, `APP_ENV=development`
- [x] 2.4 Criar `.env` local (não commitado) com os valores reais do projeto Supabase
- [x] 2.5 Garantir que `.env` está no `.gitignore` (adicionar se ausente)

## 3. Schema Supabase

- [x] 3.1 Criar `supabase/migrations/0001_initial_schema.sql` com `CREATE TABLE prospectos`: `id TEXT PRIMARY KEY`, `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`, `photo_url TEXT NOT NULL`, `lat REAL NOT NULL`, `lng REAL NOT NULL`, `notes TEXT`, `status TEXT NOT NULL CHECK (status IN ('novo','contatado','negociando','fechado'))`, `address_endereco TEXT`, `address_bairro TEXT`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- [x] 3.2 Adicionar ao mesmo arquivo: função `handle_updated_at()` (`SET NEW.updated_at = now(); RETURN NEW`) e trigger `BEFORE UPDATE ON prospectos FOR EACH ROW EXECUTE FUNCTION handle_updated_at()`
- [x] 3.3 Adicionar índice composto `CREATE INDEX prospectos_user_updated_idx ON prospectos (user_id, updated_at DESC)`
- [x] 3.4 Adicionar `ALTER TABLE prospectos ENABLE ROW LEVEL SECURITY` e policies: SELECT, INSERT, UPDATE e DELETE com `USING (auth.uid() = user_id)` e `WITH CHECK (auth.uid() = user_id)`
- [x] 3.5 Criar `supabase/migrations/0002_storage_setup.sql` com `INSERT INTO storage.buckets (id, name, public) VALUES ('prospecto-photos', 'prospecto-photos', false)` e Storage policies que permitem leitura/escrita apenas em paths que começam com `auth.uid()::text || '/'`
- [x] 3.6 Aplicar as migrations no projeto remoto: `supabase db push` (aplicado manualmente via SQL Editor — `db push` quebra com erro de role no Cloud atual)
- [x] 3.7 Verificar no painel Supabase (Database → Tables) que `prospectos` existe com todas as colunas, constraints e índice

## 4. SupabaseClient

- [x] 4.1 Criar `src/infrastructure/supabase/SupabaseClient.ts` com singleton que lê `Constants.expoConfig?.extra` e chama `createClient(url, anonKey, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true } })`
- [x] 4.2 Adicionar validação: lançar `Error` descritivo se `SUPABASE_URL` ou `SUPABASE_ANON_KEY` estiverem ausentes no momento da criação do singleton

## 5. SupabaseAuthGateway

- [x] 5.1 Criar `src/infrastructure/supabase/SupabaseAuthGateway.ts` implementando `IAuthGateway`
- [x] 5.2 Implementar `login(email, password)` via `supabase.auth.signInWithPassword`, lançando `Error` em falha
- [x] 5.3 Implementar `register(email, password, name)` via `supabase.auth.signUp` com `options.data.nome = name`, lançando `Error` em falha
- [x] 5.4 Implementar `logout()` via `supabase.auth.signOut`
- [x] 5.5 Implementar `refreshToken(token)` via `supabase.auth.refreshSession`, lançando `Error` em falha
- [x] 5.6 Extrair helper privado `mapUserToCorretor(user: User): Corretor` mapeando `id`, `email`, `user_metadata.nome`, `created_at`
- [x] 5.7 Criar testes unitários em `__tests__/infrastructure/supabase/SupabaseAuthGateway.test.ts` mockando `SupabaseClient` — cobrir login com sucesso, login com erro, register, logout e refresh

## 6. SupabaseSyncGateway

- [x] 6.1 Criar `src/infrastructure/supabase/SupabaseSyncGateway.ts` implementando `ISyncGateway`
- [x] 6.2 Implementar `uploadProspecto(prospecto)`: ler arquivo local via `expo-file-system`, fazer upload ao bucket `prospecto-photos` com path `{userId}/{prospecto.id}.jpg`, lançar `Error` se upload falhar
- [x] 6.3 Continuar `uploadProspecto`: após upload bem-sucedido, fazer upsert na tabela `prospectos` com campos mapeados e `photo_url` = URL do Storage, retornar `id` remoto
- [x] 6.4 Implementar `pullUpdates(userId, lastSyncDate)`: query `supabase.from('prospectos').select('*').eq('user_id', userId).gt('updated_at', lastSyncDate.toISOString())`, mapear resultados para `Prospecto[]`
- [x] 6.5 Extrair helpers privados `mapProspectoToRow(p: Prospecto, photoUrl: string): object` e `mapRowToProspecto(row: object): Prospecto`
- [x] 6.6 Criar testes unitários em `__tests__/infrastructure/supabase/SupabaseSyncGateway.test.ts` mockando `SupabaseClient` — cobrir upload com sucesso, falha no upload de foto, pull com resultados, pull vazio

## 7. Container de DI

- [x] 7.1 Remover a constante `USE_REAL_DB` de `src/dependency_injection/container.ts`
- [x] 7.2 Importar `SupabaseAuthGateway` e `SupabaseSyncGateway` no container (via lazy `require` em modo production para evitar carregar Supabase em testes)
- [x] 7.3 Importar `Constants` de `expo-constants` e ler `appEnv = Constants.expoConfig?.extra?.appEnv`
- [x] 7.4 Substituir wiring de `authGateway` e `syncGateway`: `appEnv === 'production'` → Supabase; demais → mocks + `console.warn` se `appEnv` for um valor inesperado
- [x] 7.5 Manter wiring existente de `locationService` e `prospectoRepository` usando `appEnv === 'production'` em vez de `USE_REAL_DB`
- [x] 7.6 Verificar se algum teste existente referencia `USE_REAL_DB` e atualizar se necessário (nenhuma referência encontrada)

## 8. Testes e Validação

- [x] 8.1 Rodar suite de testes completa com `APP_ENV` não definido e confirmar que todos passam (modo mock intacto) — 116/116 passando
- [x] 8.2 Verificar com grep que não há nenhuma referência a `USE_REAL_DB` no codebase após a remoção
- [x] 8.3 Testar manualmente com `APP_ENV=production` e credenciais Supabase reais: registrar novo usuário, login (logout pendente — sem botão de UI ainda)
- [x] 8.4 Testar manualmente captura de prospecto online e verificar registro + foto no painel Supabase — 4 prospectos confirmados na tabela + bucket
- [ ] 8.5 Testar fluxo offline-first: capturar prospecto sem rede, reconectar e verificar sync para Supabase — não testado e2e (lógica coberta por unit tests)

## 9. Wiring de sync (gap descoberto durante e2e)

- [x] 9.1 Montar `useSync()` em `app/(tabs)/_layout.tsx` — hook existia mas nunca era invocado em nenhuma tela, deixando sync reativo morto
- [x] 9.2 Disparar `SyncProspectosUseCase.execute()` (fire-and-forget) em `useCapture` após captura bem-sucedida — sem isso, captura online só sincroniza no próximo evento de conectividade
