# Spec: Offline-First com SQLite como Fonte de Verdade

### Requirement: Princípios gerais — SQLite como única fonte de verdade
O aplicativo MUST operar em modo offline-first: SQLite é a Single Source of Truth para todas leituras e escritas. Supabase é exclusivamente um destino de sincronização periódica, nunca uma fonte de leitura em tempo real. O app SHALL funcionar completamente sem rede para todas as operações de captura e visualização de prospectos.

#### Scenario: Leitura sempre vai para SQLite
- **WHEN** o app executa `findAll` ou `findById` com ou sem conexão ativa
- **THEN** leituras SHALL buscar exclusivamente do SQLite local
- **THEN** Supabase NÃO SHALL ser consultado durante operações de leitura

#### Scenario: Escrita sempre vai para SQLite
- **WHEN** o corretor captura ou edita um Prospecto
- **THEN** escrita SHALL persistir imediatamente no SQLite com `syncStatus = pending`
- **THEN** Supabase NÃO SHALL ser chamado no fluxo de escrita do use case

#### Scenario: App funciona sem rede
- **WHEN** dispositivo não tem conexão com internet
- **THEN** todas as operações de captura e listagem SHALL funcionar normalmente
- **THEN** UI NÃO SHALL exibir erros de conectividade para operações locais

### Requirement: Captura offline mantém fila de pending
A captura de um prospecto SHALL salvar imediatamente no SQLite com `syncStatus = pending`. A sincronização SHALL ocorrer via `SyncProspectosUseCase` disparado pelo scheduler periódico ou por reconexão de rede.

#### Scenario: Captura sem internet
- **WHEN** o corretor captura um Prospecto e o dispositivo está offline
- **THEN** o sistema MUST salvar o registro com foto comprimida e coordenadas em SQLite com `syncStatus = pending`
- **THEN** UI MUST exibir feedback positivo ("Salvo para envio posterior")
- **THEN** fluxo principal SHALL NOT travar aguardando rede

#### Scenario: Sync após reconexão promove pending para synced
- **WHEN** conectividade é restaurada com `pending` items na fila local
- **THEN** `SyncProspectosUseCase.execute()` SHALL ser acionado
- **THEN** upload SHALL ser feito; após sucesso, items marcados como `synced`

### Requirement: Tela do mapa offline mantém placeholder
A tela do mapa SHALL continuar substituindo o `MapView` por placeholder com ícone `WifiOff` e texto orientativo quando offline.

#### Scenario: Mapa sem conexão
- **WHEN** dispositivo offline e usuário acessa aba do mapa
- **THEN** `MapView` SHALL ser substituído por placeholder com ícone `WifiOff`
- **THEN** texto SHALL orientar o usuário a continuar capturando normalmente
- **THEN** texto SHALL informar que sync ocorre automaticamente ao reconectar ou no próximo ciclo de sync

### Requirement: Resolução de endereço no momento da captura
A resolução de endereço (reverse geocoding) SHALL ser feita via `ExpoGeocodeService` em `CaptureProspectoUseCase` ANTES do save inicial. Se offline ou falha, o save prossegue sem endereço e `SyncProspectosUseCase` faz retry no próximo sync.

#### Scenario: Endereço resolvido na captura online
- **WHEN** captura é feita com rede disponível
- **THEN** `CaptureProspectoUseCase` SHALL chamar `geocodeService.reverseGeocode(coords)` antes do save
- **THEN** se geocode retorna `Address`, prospecto é salvo com endereço resolvido no SQLite

#### Scenario: Geocode falha na captura — retry no sync
- **WHEN** geocode retorna `null` ou lança exceção
- **THEN** prospecto é salvo sem endereço com `syncStatus = pending`
- **THEN** `SyncProspectosUseCase` tenta geocode novamente antes do upload
