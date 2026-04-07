# ProspectHome Refactor — Design Specs

## System Architecture

Mantemos a Clean Architecture (Domain, Application, Infrastructure, Presentation) de 4 camadas. O foco deste refactor é a organização da camada de **Presentation** e da infraestrutura de **Testes**.

## Test Infrastructure (Centralization)

Fica estabelecido que o ponto único de verdade para testes unitários e mocks agora é centralizado na raiz do projeto mobile:

- **Root**: `prospecthome/__tests__/unit/`
- **Estrutura Interna**:
  - `unit/domain/`: Testes de Entidades e Value Objects.
  - `unit/application/`: Testes de Use Cases.
  - `unit/infrastructure/`: Testes de Gateways e Repositórios Mockados.
  - `unit/presentation/`: Testes de Hooks, Componentes e Contextos.
  - `unit/mocks/`: Arquivos de dados e classes mockadas compartilhadas.

### Naming Convention
Todos os arquivos de teste DEVEM terminar em `.spec.ts` ou `.spec.tsx`.

## UI Refactoring (Presentation Layer)

A refatoração visual será guiada pelos exports em `docs/stitch_export/`.

### Screens & Components
- **Auth**: Refatorar `app/(auth)/login.tsx` com base em `authentication_screen`.
- **Capture**: Refatorar `app/(tabs)/capture.tsx` e componentes de câmera baseados em `nova_captura_updated_nav`.
- **List**: Refatorar `app/(tabs)/list/index.tsx` e `ProspectoCard` baseados em `lista_de_prospectos_final_consistency_fix`.
- **Detail**: Refatorar `app/(tabs)/list/[id].tsx` baseado em `detalhe_do_prospecto`.
- **Map**: Refatorar `app/(tabs)/map.tsx` baseado em `mapa_online_com_pins`.

### Styling Guidelines
- Uso estrito de `StyleSheet` nativo conforme `config.yaml`.
- Cores e espaçamentos devem ser extraídos visualmente dos mocks de alta fidelidade.
- Garantir que o `SafeAreaView` e o layout responsivo estejam consistentes entre telas.

## Dependency Resolution

Utilizaremos o `di/container.ts` para injetar implementações "estritamente mockadas" que garantam o funcionamento do app sem internet real:
- `MockAuthGateway`
- `MockSyncGateway`
- `SQLiteProspectoRepository` (com dados iniciais de teste)
- `MockLocationService` (com coordenadas fixas próximas se o GPS falhar no simulador)
