# Spec: Supabase Schema

## ADDED Requirements

### Requirement: Migration SQL cria tabela prospectos no Supabase
O arquivo `supabase/migrations/0001_initial_schema.sql` SHALL criar a tabela `prospectos` no banco Supabase com todos os campos necessários para espelhar o domínio da aplicação, incluindo `photo_url` (URL remota) em vez de `photo_path` (caminho local).

#### Scenario: Estrutura da tabela prospectos
- **WHEN** a migration é aplicada ao banco Supabase
- **THEN** a tabela `prospectos` SHALL existir com as colunas: `id TEXT PRIMARY KEY`, `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`, `photo_url TEXT NOT NULL`, `lat REAL NOT NULL`, `lng REAL NOT NULL`, `notes TEXT`, `status TEXT NOT NULL`, `address_endereco TEXT`, `address_bairro TEXT`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

#### Scenario: Foreign key vincula prospecto a usuário do Auth
- **WHEN** um usuário é deletado de `auth.users` via Supabase Auth
- **THEN** todos os prospectos com `user_id` correspondente SHALL ser deletados em cascata pelo banco

#### Scenario: Sem conflito com schema SQLite local
- **WHEN** as migrations SQLite locais (`src/infrastructure/database/migrations.ts`) são executadas
- **THEN** elas NÃO SHALL afetar o banco Supabase
- **THEN** as migrations Supabase NÃO SHALL afetar o banco SQLite local

### Requirement: Coluna status restrita a valores válidos por CHECK constraint
A coluna `status` da tabela `prospectos` SHALL ter um `CHECK` constraint que limita os valores aceitos a `'novo'`, `'contatado'`, `'negociando'` e `'fechado'`, espelhando o value object `ProspectoStatus` do domínio.

#### Scenario: Insert com status válido
- **WHEN** um INSERT é feito com `status = 'novo'`
- **THEN** a operação SHALL ser aceita pelo banco

#### Scenario: Insert com status inválido
- **WHEN** um INSERT é feito com `status = 'qualquer-coisa'`
- **THEN** o banco SHALL rejeitar com erro de CHECK constraint

### Requirement: updated_at é mantido automaticamente por trigger
Um trigger `BEFORE UPDATE ON prospectos` SHALL atualizar a coluna `updated_at` para `now()` em toda modificação de linha, garantindo que o campo sempre reflita a data da última alteração sem depender do cliente.

#### Scenario: UPDATE atualiza updated_at automaticamente
- **WHEN** um UPDATE é executado em uma linha de `prospectos`
- **THEN** o trigger SHALL definir `updated_at = now()` antes da escrita
- **THEN** o valor antigo de `updated_at` NÃO SHALL persistir

### Requirement: Índice composto acelera queries de pull
A migration SHALL criar um índice composto `(user_id, updated_at DESC)` na tabela `prospectos` para suportar eficientemente o filtro do `pullUpdates` (`WHERE user_id = ? AND updated_at > ?`).

#### Scenario: Query de pull usa o índice
- **WHEN** uma query `SELECT * FROM prospectos WHERE user_id = ? AND updated_at > ?` é executada
- **THEN** o plano de execução SHALL utilizar o índice composto em vez de full table scan

### Requirement: RLS garante isolamento de dados por usuário
A tabela `prospectos` SHALL ter Row Level Security habilitada com políticas que garantam que cada usuário autenticado só possa ler e escrever seus próprios registros.

#### Scenario: SELECT filtrado por usuário autenticado
- **WHEN** um usuário autenticado faz SELECT na tabela `prospectos`
- **THEN** SHALL retornar apenas registros onde `user_id = auth.uid()`

#### Scenario: INSERT vinculado ao usuário autenticado
- **WHEN** um usuário autenticado insere um registro com `user_id` diferente do seu `auth.uid()`
- **THEN** a operação SHALL ser rejeitada pelo Supabase com erro de policy

#### Scenario: Acesso não autenticado bloqueado
- **WHEN** uma requisição sem JWT válido tenta acessar a tabela `prospectos`
- **THEN** a operação SHALL ser bloqueada pela RLS

### Requirement: Bucket prospecto-photos criado com acesso controlado
O bucket `prospecto-photos` no Supabase Storage SHALL ser criado com acesso privado por padrão. A policy de Storage SHALL permitir que usuários autenticados leiam e escrevam apenas arquivos no path que começa com seu próprio `auth.uid()`.

#### Scenario: Upload de foto por usuário autenticado
- **WHEN** um usuário autenticado faz upload para o path `{auth.uid()}/{prospecto.id}.jpg`
- **THEN** o upload SHALL ser permitido pela Storage policy

#### Scenario: Leitura de foto por outro usuário bloqueada
- **WHEN** um usuário tenta acessar um arquivo cujo path começa com o `uid` de outro usuário
- **THEN** o acesso SHALL ser bloqueado

### Requirement: Confirm email desabilitado em Auth settings
A configuração `Authentication → Settings → Confirm email` no painel Supabase SHALL estar desativada nesta change. Isso simplifica o fluxo de registro do MVP — o usuário pode logar imediatamente após `signUp` sem precisar verificar email.

#### Scenario: Registro habilita login imediato
- **WHEN** um novo usuário se registra via `register(email, password, name)`
- **THEN** o `session.access_token` SHALL ser retornado imediatamente
- **THEN** o usuário SHALL conseguir executar operações autenticadas sem confirmar email
