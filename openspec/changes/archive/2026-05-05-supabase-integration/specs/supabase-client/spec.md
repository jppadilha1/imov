## ADDED Requirements

### Requirement: SupabaseClient é um singleton configurado por variáveis de ambiente
O módulo `src/infrastructure/supabase/SupabaseClient.ts` SHALL exportar uma única instância do cliente Supabase criada com `createClient(url, anonKey)`, onde `url` e `anonKey` são lidos de `Constants.expoConfig?.extra` (via `expo-constants`). A instância SHALL ser criada uma única vez e reutilizada por todos os módulos de infraestrutura Supabase.

#### Scenario: Cliente inicializado com variáveis válidas
- **WHEN** `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão presentes em `Constants.expoConfig.extra`
- **THEN** `createClient` SHALL ser chamado com os valores corretos
- **THEN** a instância exportada SHALL ser do tipo `SupabaseClient` do SDK `@supabase/supabase-js`

#### Scenario: Ausência de variáveis de ambiente
- **WHEN** `SUPABASE_URL` ou `SUPABASE_ANON_KEY` estão ausentes ou vazios
- **THEN** o módulo SHALL lançar um `Error` com mensagem descritiva durante a inicialização do singleton

### Requirement: SupabaseClient configura AsyncStorage como storage adapter
O cliente Supabase SHALL ser inicializado com `AsyncStorage` de `@react-native-async-storage/async-storage` como adaptador de storage, substituindo o `localStorage` padrão incompatível com React Native.

#### Scenario: Persistência de sessão Auth entre reinicios do app
- **WHEN** o usuário faz login e fecha o app
- **THEN** a sessão Supabase Auth SHALL ser persistida via AsyncStorage
- **THEN** ao reabrir o app, o cliente Supabase SHALL restaurar a sessão sem novo login
