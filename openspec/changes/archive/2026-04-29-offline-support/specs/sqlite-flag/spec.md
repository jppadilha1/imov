## ADDED Requirements

### Requirement: Container expõe constante USE_REAL_DB
O arquivo `src/dependency_injection/container.ts` SHALL exportar (ou declarar internamente) uma constante booleana nomeada `USE_REAL_DB` que controla qual implementação de `IProspectoRepository` é instanciada.

#### Scenario: USE_REAL_DB false (padrão de desenvolvimento)
- **WHEN** `USE_REAL_DB` é `false`
- **THEN** o container SHALL instanciar `MockProspectoRepository` para `prospectoRepository`
- **THEN** os dados existem apenas em memória e são perdidos ao reiniciar o app

#### Scenario: USE_REAL_DB true (SQLite persistido)
- **WHEN** `USE_REAL_DB` é `true`
- **THEN** o container SHALL instanciar `SQLiteProspectoRepository` para `prospectoRepository`
- **THEN** os dados são persistidos no banco SQLite local do dispositivo entre sessões

### Requirement: Auth e sync permanecem mockados independentemente de USE_REAL_DB
Independentemente do valor de `USE_REAL_DB`, `authGateway` SHALL usar `MockAuthGateway` e `syncGateway` SHALL usar `MockSyncGateway` nesta change, refletindo a política Mocks First do projeto.

#### Scenario: Integrações de nuvem sempre mockadas nesta change
- **WHEN** `USE_REAL_DB` é `true` ou `false`
- **THEN** `container.authGateway` SHALL ser instância de `MockAuthGateway`
- **THEN** `container.syncGateway` SHALL ser instância de `MockSyncGateway`
