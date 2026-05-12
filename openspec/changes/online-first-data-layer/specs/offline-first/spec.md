# Spec: Comportamento Offline-First (delta — Online-First com Fallback Offline)

## MODIFIED Requirements

### Requirement: Princípios gerais — Supabase como fonte de verdade online
O aplicativo MUST permanecer funcional sem rede para captura e visualização de dados já cacheados, mas o fluxo padrão é online: quando há conectividade, Supabase é a Single Source of Truth e SQLite serve como cache de leitura e fila de escritas pendentes. Quando offline, SQLite assume temporariamente o papel de fonte de verdade até a próxima sincronização.

#### Scenario: Princípio invertido — online primeiro
- **WHEN** o app é executado com conexão ativa
- **THEN** leituras (`findAll`, `findById`) SHALL preferir Supabase como fonte
- **THEN** escritas (`save`) SHALL persistir em Supabase e atualizar cache SQLite
- **THEN** SQLite NÃO SHALL ser usado como fonte primária quando há rede

#### Scenario: Fallback offline ainda funcional
- **WHEN** o app perde conexão durante uso
- **THEN** leituras subsequentes SHALL servir do cache SQLite (dados da última visita online)
- **THEN** escritas SHALL ir para SQLite com `syncStatus = pending`
- **THEN** UI NÃO SHALL travar ou exibir loadings infinitos por causa de chamadas remotas

#### Scenario: UI reflete estado de rede sem obstruir
- **WHEN** o dispositivo está offline
- **THEN** a interface MUST exibir indicação clara de estado offline (banner ou ícone)
- **THEN** placeholder no mapa SHALL ser exibido conforme spec original (sem alteração)

### Requirement: Captura offline mantém fila de pending
A captura de um prospecto sem rede SHALL salvar imediatamente no SQLite com `syncStatus = pending`, e a sincronização SHALL ocorrer automaticamente assim que `INetworkService.addListener` notificar transição para online, via `useNetworkSync` que aciona `SyncProspectosUseCase.execute()`.

#### Scenario: Captura sem internet
- **WHEN** o corretor captura um Prospecto e o dispositivo está offline
- **THEN** o sistema MUST salvar o registro com foto comprimida e coordenadas em SQLite com `syncStatus = pending`
- **THEN** UI MUST exibir feedback positivo ("Salvo para envio posterior")
- **THEN** fluxo principal SHALL NOT travar aguardando rede

#### Scenario: Sincronização transparente ao reconectar
- **WHEN** conectividade é restaurada com `pending` items na fila local
- **THEN** `useNetworkSync` SHALL acionar `SyncProspectosUseCase.execute()`
- **THEN** upload SHALL ser feito; após sucesso, items marcados como `synced`
- **THEN** UI SHOULD refletir andamento via indicador sutil

### Requirement: Tela do mapa offline mantém placeholder
A tela do mapa SHALL continuar substituindo o `MapView` por placeholder com ícone `WifiOff` e texto orientativo quando offline, sem alteração em relação ao comportamento atual.

#### Scenario: Mapa sem conexão
- **WHEN** dispositivo offline e usuário acessa aba do mapa
- **THEN** `MapView` SHALL ser substituído por placeholder com ícone `WifiOff`
- **THEN** texto SHALL orientar o usuário a continuar capturando normalmente
- **THEN** texto SHALL informar que sync ocorre automaticamente ao reconectar

### Requirement: Resolução de endereço continua em nuvem
A resolução de endereço (reverse geocoding) SHALL continuar sendo feita via `ExpoGeocodeService` no `SyncProspectosUseCase`, sem alteração em relação ao comportamento atual.

#### Scenario: Endereço resolvido durante sync
- **WHEN** um prospecto sem `address` é sincronizado
- **THEN** `SyncProspectosUseCase` SHALL chamar `geocodeService.reverseGeocode` antes do upload
- **THEN** comportamento idêntico ao spec `geocode-service` existente
