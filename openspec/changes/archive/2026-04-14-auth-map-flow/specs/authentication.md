## ADDED Requirements

### Requirement: User Authentication Flow
O sistema deve permitir que o usuário faça login ou crie uma nova conta para acessar o aplicativo.

#### Scenario: Successful Login with Mock Data
- **WHEN** o usuário insere credenciais válidas na tela de login
- **THEN** o sistema deve autenticar o usuário e redirecioná-lo para a tela principal (Mapa).

#### Scenario: Navigation to Creation Account
- **WHEN** o usuário clica em "Criar conta" na tela de login
- **THEN** o sistema deve exibir o formulário de cadastro.

### Requirement: Authentication Persistence
O estado de autenticação deve ser persistido para que o usuário não precise logar novamente em cada sessão.

#### Scenario: Auto-login on Launch
- **WHEN** o aplicativo é aberto e existe um token de sessão válido (mesmo que mockado)
- **THEN** o sistema deve pular a tela de login e ir direto para o Mapa.
