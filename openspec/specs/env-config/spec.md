# Spec: Env Config

## ADDED Requirements

### Requirement: app.config.js expõe variáveis de ambiente via expo-constants
O arquivo `app.config.js` (convertido de `app.json`) SHALL ler variáveis de ambiente do processo (`process.env`) e expô-las via campo `extra` do Expo, tornando-as acessíveis em runtime via `Constants.expoConfig?.extra`. As variáveis obrigatórias são `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `APP_ENV`.

#### Scenario: Variáveis presentes no ambiente de build
- **WHEN** `process.env.SUPABASE_URL`, `process.env.SUPABASE_ANON_KEY` e `process.env.APP_ENV` estão definidas
- **THEN** `Constants.expoConfig.extra.supabaseUrl`, `.supabaseAnonKey` e `.appEnv` SHALL conter os valores correspondentes em runtime

#### Scenario: .env.example documenta variáveis necessárias
- **WHEN** um desenvolvedor clona o repositório
- **THEN** o arquivo `.env.example` SHALL existir na raiz com placeholders para todas as variáveis necessárias
- **THEN** o arquivo `.env` real NÃO SHALL estar commitado no repositório (`.gitignore`)

### Requirement: Container de DI usa APP_ENV para selecionar implementações
O `container.ts` SHALL ler `APP_ENV` de `Constants.expoConfig?.extra?.appEnv` e usá-lo para decidir quais implementações wirear. Quando `APP_ENV === 'production'`, SHALL wirear `SupabaseAuthGateway` e `SupabaseSyncGateway`. Em qualquer outro valor (incluindo ausente), SHALL wirear `MockAuthGateway` e `MockSyncGateway`.

#### Scenario: APP_ENV production wira Supabase
- **WHEN** `APP_ENV === 'production'`
- **THEN** `container.authGateway` SHALL ser instância de `SupabaseAuthGateway`
- **THEN** `container.syncGateway` SHALL ser instância de `SupabaseSyncGateway`
- **THEN** `container.prospectoRepository` SHALL ser instância de `SQLiteProspectoRepository`
- **THEN** `container.locationService` SHALL ser instância de `ExpoLocationService`

#### Scenario: APP_ENV ausente ou diferente de production mantém mocks
- **WHEN** `APP_ENV` é `undefined`, `'development'`, `'test'` ou qualquer valor diferente de `'production'`
- **THEN** `container.authGateway` SHALL ser instância de `MockAuthGateway`
- **THEN** `container.syncGateway` SHALL ser instância de `MockSyncGateway`

#### Scenario: Warning quando APP_ENV não é reconhecido
- **WHEN** `APP_ENV` é um valor diferente de `'production'` e diferente de `undefined`
- **THEN** o container SHALL emitir `console.warn` indicando que o valor não é reconhecido e que mocks serão usados

### Requirement: USE_REAL_DB é removido e substituído por APP_ENV
A constante `USE_REAL_DB` em `container.ts` SHALL ser removida. Toda a lógica de seleção de implementação SHALL ser consolidada sob a leitura de `APP_ENV`.

#### Scenario: Remoção de USE_REAL_DB
- **WHEN** o container é inicializado
- **THEN** NÃO SHALL existir nenhuma referência à constante `USE_REAL_DB` no código do container
