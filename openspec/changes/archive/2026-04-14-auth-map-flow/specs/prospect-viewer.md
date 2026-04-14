## ADDED Requirements

### Requirement: Interactive Map with Prospect Pins
O sistema deve exibir um mapa interativo mostrando a localização de diversos prospectos via pins.

#### Scenario: Display Mocked Pins
- **WHEN** a tela de mapa é carregada
- **THEN** o sistema deve buscar os prospectos mockados do repositório e renderizar os pins correspondentes nas coordenadas geográficas.

### Requirement: Prospect Preview Card
Ao tocar em um pin, o sistema deve exibir informações rápidas sobre o prospecto sem sair da tela de mapa.

#### Scenario: Show Preview on Pin Tap
- **WHEN** o usuário toca em um pin de prospecto no mapa
- **THEN** um mini modal (preview card) deve aparecer na tela contendo: imagem, badge de status (ex: NOVO), endereço simplificado e link para detalhes.

### Requirement: Prospect Detail Navigation
O usuário deve poder acessar a ficha completa do prospecto a partir da prévia.

#### Scenario: Navigate to Details
- **WHEN** o usuário clica em "Ver detalhes" no preview card
- **THEN** o sistema deve navegar para a tela de detalhes completa do prospecto.
