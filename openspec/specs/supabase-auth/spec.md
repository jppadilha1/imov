# Spec: Supabase Auth

## ADDED Requirements

### Requirement: SupabaseAuthGateway implementa IAuthGateway via Supabase Auth
A classe `SupabaseAuthGateway` em `src/infrastructure/supabase/SupabaseAuthGateway.ts` SHALL implementar a interface `IAuthGateway` completa (`login`, `register`, `logout`, `refreshToken`), delegando cada operação ao cliente Supabase Auth. O `nome` do corretor SHALL ser lido/escrito via `user_metadata` do Supabase Auth.

#### Scenario: Login com credenciais válidas
- **WHEN** `login(email, password)` é chamado com credenciais corretas
- **THEN** `supabase.auth.signInWithPassword({ email, password })` SHALL ser invocado
- **THEN** o método SHALL retornar `{ corretor: Corretor, token: string }` mapeando `session.user` para a entidade `Corretor` e `session.access_token` para `token`

#### Scenario: Login com credenciais inválidas
- **WHEN** `login(email, password)` retorna erro do Supabase
- **THEN** o método SHALL lançar um `Error` com a mensagem de erro do Supabase

#### Scenario: Registro de novo usuário
- **WHEN** `register(email, password, name)` é chamado
- **THEN** `supabase.auth.signUp({ email, password, options: { data: { nome: name } } })` SHALL ser invocado
- **THEN** o método SHALL retornar `{ corretor: Corretor, token: string }` mapeando os dados do usuário recém-criado

#### Scenario: Registro com email já existente
- **WHEN** `register` retorna erro de email duplicado do Supabase
- **THEN** o método SHALL lançar um `Error` com mensagem indicando conflito

#### Scenario: Logout
- **WHEN** `logout()` é chamado
- **THEN** `supabase.auth.signOut()` SHALL ser invocado
- **THEN** o método SHALL completar sem erros

#### Scenario: Refresh de token válido
- **WHEN** `refreshToken(token)` é chamado
- **THEN** `supabase.auth.refreshSession()` SHALL ser invocado
- **THEN** o método SHALL retornar novos `{ corretor, token }` com o access token atualizado

#### Scenario: Refresh de token expirado ou inválido
- **WHEN** `refreshToken` retorna erro do Supabase
- **THEN** o método SHALL lançar um `Error`

### Requirement: SupabaseAuthGateway mapeia Corretor de forma consistente
O mapeamento de `User` do Supabase para a entidade `Corretor` SHALL ser determinístico e consistente: `id` vem de `user.id`, `email` de `user.email`, `nome` de `user.user_metadata.nome ?? null`, `createdAt` de `new Date(user.created_at)`.

#### Scenario: Usuário sem nome cadastrado
- **WHEN** `user.user_metadata.nome` está ausente ou nulo
- **THEN** `Corretor.nome` SHALL ser `null`

#### Scenario: Usuário com nome cadastrado
- **WHEN** `user.user_metadata.nome` contém uma string válida
- **THEN** `Corretor.nome` SHALL conter essa string
