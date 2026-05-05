## Context

O projeto usa Clean Architecture com DI explícito via `container.ts`. Mocks de auth (`MockAuthGateway`) e sync (`MockSyncGateway`) funcionam em desenvolvimento e testes. O SDK `@supabase/supabase-js` v2 já está instalado. Não há sistema de variáveis de ambiente configurado — o app usa `app.json` estático e não lê nenhuma variável em runtime. O `app.json` precisará ser convertido para `app.config.js` para suportar injeção de vars via `process.env` em build time.

As migrations SQLite em `src/infrastructure/database/migrations.ts` são exclusivamente do banco local offline (tabelas `session` e `prospectos`). O banco Supabase é um destino separado e não compartilha conexão, arquivo ou processo com o SQLite.

## Goals / Non-Goals

**Goals:**
- Implementar `SupabaseAuthGateway` e `SupabaseSyncGateway` como alternativas reais às mocks existentes
- Criar um singleton `SupabaseClient` isolado, configurado por variáveis de ambiente
- Fazer o container alternar implementações com base em `APP_ENV` (`production` → Supabase, demais → mocks)
- Criar schema SQL do banco Supabase (`supabase/migrations/`) com tabela `prospectos`, bucket de storage e RLS
- Garantir que a mudança não quebre nenhum teste existente nem o modo desenvolvimento

**Non-Goals:**
- Realtime subscriptions (Supabase Realtime) — fora do escopo desta change
- `IPhotoStorage` via Supabase Storage como repositório primário — fotos continuam em FileSystem; Supabase Storage recebe cópia apenas durante sync
- Migração automática de dados locais para o Supabase — sync já cobre isso via `findPending()`
- Autenticação social (OAuth Google/Apple) — apenas email/senha nesta change
- Row-Level Security avançada (multi-tenant) — RLS básica por `user_id`

## Decisions

### 1. Variáveis de ambiente via `app.config.js` + `expo-constants`

**Decisão:** Converter `app.json` para `app.config.js` e expor variáveis como `extra` do Expo. Ler via `Constants.expoConfig?.extra`.

**Alternativas consideradas:**
- `react-native-dotenv` (babel plugin): requer configuração extra de Babel e não é idiomático no Expo SDK 51+
- Hardcoded no container: obviamente descartado (segurança e flexibilidade)
- `expo-env.d.ts` com `process.env` diretamente: funciona apenas com EAS Build onde vars são injetadas; não funciona em `expo start --dev-client` sem configuração adicional

**Rationale:** `app.config.js` com `extra` é a abordagem documentada pelo Expo para variáveis de ambiente em projetos managed workflow. `expo-constants` já está instalado e não requer dependências novas.

### 2. Switch por `APP_ENV` no container, não por `USE_REAL_DB`

**Decisão:** Substituir a constante `USE_REAL_DB` (boolean) por lógica que lê `APP_ENV` de `Constants.expoConfig.extra`. Quando `APP_ENV === 'production'`, wirear Supabase para auth e sync (e SQLite para o repositório de prospectos). Quando diferente, wirear todos os mocks.

**Alternativas consideradas:**
- Manter `USE_REAL_DB` e adicionar `USE_REAL_CLOUD` em paralelo: duplicação desnecessária com dois flags independentes
- Feature flags em runtime via Supabase Remote Config: over-engineering para o momento

**Rationale:** Um único `APP_ENV` como string é mais expressivo, extensível (pode adicionar `staging` no futuro) e familiar para desenvolvedores web. Elimina flags booleanos avulsos.

### 3. `SupabaseClient` como singleton isolado

**Decisão:** Arquivo `src/infrastructure/supabase/SupabaseClient.ts` exporta uma instância única criada com `createClient(url, anonKey)`. Toda infra Supabase (auth, db, storage) importa este singleton.

**Rationale:** Evita múltiplas instâncias do cliente (cada uma abre conexão própria de realtime/ws). Centraliza a configuração. Facilita substituição em testes por injeção ou mock do módulo.

### 4. `SupabaseSyncGateway` faz upload de foto durante sync

**Decisão:** `uploadProspecto()` envia a foto local para Supabase Storage (bucket `prospecto-photos`, path `{userId}/{prospecto.id}.jpg`) antes de inserir o registro na tabela `prospectos`. O campo `photo_url` no Supabase aponta para a URL pública/signed.

**Alternativas consideradas:**
- Não sincronizar fotos (apenas metadados): perde valor de produto; o app é centrado em captura fotográfica de imóveis
- Sincronizar foto em step separado após o registro: cria janela de inconsistência (registro sem foto no servidor)

**Rationale:** Upload atômico garante consistência. Em caso de falha de rede, o prospecto permanece `pending` no SQLite e será retentado no próximo sync.

### 5. Schema Supabase independente do SQLite

**Decisão:** Criar `supabase/migrations/0001_initial_schema.sql` com DDL do banco remoto. A tabela `prospectos` remota espelha os campos da local, com `photo_url TEXT` em vez de `photo_path TEXT` (remoto armazena URL, local armazena path de filesystem).

```
SQLite local                   Supabase remoto
─────────────────────────────────────────────
prospectos.photo_path (path)   prospectos.photo_url (url pública)
session (tabela local)         auth.users (gerenciado pelo Supabase Auth)
```

**Rationale:** Separação clara de responsabilidades. SQLite = cache offline. Supabase = fonte de verdade na nuvem. Nenhum conflito de schema, nenhuma migration compartilhada.

**Ajustes ao schema (revisão pós-design):**

- `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` — FK explícita para o Auth, com cascata para evitar registros órfãos
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` + trigger `BEFORE UPDATE` que atualiza automaticamente — o `pullUpdates` filtra por `updated_at` para também detectar edições, não só novos registros
- `CHECK (status IN ('novo','contatado','negociando','fechado'))` — espelha o value object `ProspectoStatus`, evita strings inválidas no banco
- `CREATE INDEX ON prospectos (user_id, updated_at DESC)` — acelera o filtro do pull

### 6. Apenas tabela `prospectos`; nome do corretor em `user_metadata`

**Decisão:** Não criar tabela `profiles`. O `nome` do corretor é armazenado em `auth.users.user_metadata.nome`, populado no `signUp` via `options.data.nome`. O app tem foco operacional (captura de imóveis), não de gestão de usuários — adicionar tabela `profiles` agora seria over-engineering.

**Alternativas consideradas:**
- Tabela `public.profiles (id UUID PK REFERENCES auth.users(id), nome TEXT)` com trigger `AFTER INSERT ON auth.users`: padrão idiomático Supabase, permite JOIN com `prospectos`. Adiado para uma change futura se surgir necessidade de listar/filtrar prospectos por nome do corretor.

**Rationale:** Apenas 1 tabela no schema público (`prospectos`). Mais simples, suficiente para o MVP. A migração para `profiles` posterior é trivial: criar tabela + backfill a partir do `user_metadata`.

### 7. Migrations gerenciadas via Supabase CLI

**Decisão:** Usar Supabase CLI (`supabase init`, `supabase link`, `supabase db push`) para versionar e aplicar migrations. Os arquivos vivem em `supabase/migrations/<timestamp>_<name>.sql`, são commitados no git e aplicados via comando.

**Alternativas consideradas:**
- Aplicar SQL manualmente pelo painel (SQL Editor): rápido mas perde versionamento
- Usar uma ferramenta externa (Prisma Migrate, Drizzle): adiciona dependência e complexidade, sem ganho relevante para o tamanho do projeto

**Rationale:** É a ferramenta oficial Supabase, não exige dependências npm extras, e permite `supabase start` (Postgres + Studio + Auth via Docker) caso o time queira ambiente local idêntico ao remoto. Pré-requisito: Supabase CLI instalado (`scoop install supabase` no Windows ou `npm i -g supabase`).

### 8. `Confirm email` desabilitado em Auth settings

**Decisão:** Desligar `Authentication → Settings → Confirm email` no painel Supabase para esta change. Usuários conseguem logar imediatamente após `signUp`.

**Alternativas consideradas:**
- Manter `Confirm email` ON com Magic Link: adiciona dependência de fluxo de email (Inbucket local, SMTP em prod) e step extra de UX
- Implementar fluxo de verificação dentro do app: escopo grande, fora do MVP

**Rationale:** Reduz fricção no MVP. Pode ser reativado em uma change futura quando o produto exigir verificação de identidade.

### 6. `SupabaseAuthGateway` wraps Supabase Auth, mapeia para `Corretor`

**Decisão:** `login()` chama `supabase.auth.signInWithPassword()`, mapeia `session.user` para entidade `Corretor`. O `nome` do corretor é lido do `user_metadata` (populado no registro). `refreshToken()` chama `supabase.auth.refreshSession()`.

**Rationale:** Supabase Auth já gerencia JWT, refresh tokens e sessão OAuth internamente. O `ISessionRepository` (SQLite) continua salvando o `Corretor` + token para persistência local entre sessões sem conexão.

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| `app.config.js` sem `.env` no CI/CD quebra build | Adicionar valores fallback (`process.env.X ?? ''`) e documentar variáveis necessárias |
| `APP_ENV` não definido cai silenciosamente em modo mock em produção | Logar warning explícito no container quando `APP_ENV` não for reconhecido |
| Upload de foto grande causa timeout no sync | Comprimir antes do upload (já feito pelo `ExpoPhotoService`); implementar timeout configurável |
| RLS mal configurada expõe dados entre usuários | Testar policies com `supabase test` antes de deploy; verificar que todo SELECT/INSERT inclui `auth.uid()` |
| Supabase SDK pode ser incompatível com ambiente React Native (AsyncStorage) | Passar `AsyncStorage` como `storage` no `createClient` para evitar erros de localStorage não disponível |

## Migration Plan

1. Criar projeto Supabase no painel; copiar `SUPABASE_URL` e `ANON_KEY`
2. Desabilitar `Authentication → Settings → Confirm email` no painel
3. Instalar Supabase CLI localmente (`scoop install supabase` ou `npm i -g supabase`)
4. Rodar `supabase init` e `supabase link --project-ref <ref>` no projeto
5. Criar `app.config.js` a partir do `app.json` existente, expondo `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_ENV` via `extra`
6. Criar `.env` local (não commitado) com valores reais e `.env.example` (commitado) com placeholders
7. Criar infra Supabase (`SupabaseClient`, `SupabaseAuthGateway`, `SupabaseSyncGateway`)
8. Escrever migrations SQL em `supabase/migrations/0001_initial_schema.sql` e aplicar via `supabase db push`
9. Atualizar container com lógica `APP_ENV`
10. Rodar todos os testes existentes com `APP_ENV` não definido (deve usar mocks e passar)
11. Testar manualmente com `APP_ENV=production` apontando para projeto Supabase real

**Rollback:** Reverter `container.ts` para `USE_REAL_DB = false` + mocks. Sem impacto em dados locais.

## Open Questions

- O bucket `prospecto-photos` deve ser público (URL direta) ou privado (signed URLs com expiração)? Recomenda-se privado com signed URLs de longa duração para fotos de prospectos comerciais — decidir antes de aplicar a migration de Storage.
