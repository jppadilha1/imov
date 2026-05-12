## MODIFIED Requirements

### Requirement: SyncProspectosUseCase resolve endereço antes de fazer upload
`SyncProspectosUseCase` SHALL injetar `IGeocodeService` via construtor e, para cada prospecto pendente com `address === null`, chamar `geocodeService.reverseGeocode(prospecto.coordinates)` antes de `syncGateway.uploadProspecto()`. Se o geocoding retornar um `Address`, SHALL chamar `prospecto.resolveAddress(address)` e persistir localmente com `prospectoRepository.save(prospecto)` antes do upload. Se retornar `null`, o upload SHALL prosseguir normalmente sem endereço.

#### Scenario: Geocoding bem-sucedido antes do upload
- **WHEN** `SyncProspectosUseCase.execute()` processa um prospecto com `address = null`
- **THEN** SHALL chamar `geocodeService.reverseGeocode(prospecto.coordinates)`
- **THEN** SHALL chamar `prospecto.resolveAddress(address)` com o resultado
- **THEN** SHALL persistir o prospecto atualizado localmente via `prospectoRepository.save(prospecto)`
- **THEN** SHALL chamar `syncGateway.uploadProspecto(prospecto)` com endereço preenchido

#### Scenario: Geocoding retorna null — upload prossegue sem endereço
- **WHEN** `geocodeService.reverseGeocode()` retorna `null`
- **THEN** `SyncProspectosUseCase` SHALL chamar `syncGateway.uploadProspecto(prospecto)` normalmente
- **THEN** `address_endereco` e `address_bairro` SHALL ser `null` no registro Supabase
- **THEN** o prospecto NÃO SHALL ser marcado como erro por falha no geocoding

#### Scenario: Prospecto já tem endereço — geocoding ignorado
- **WHEN** `SyncProspectosUseCase.execute()` processa um prospecto com `address !== null`
- **THEN** SHALL NÃO chamar `geocodeService.reverseGeocode()`
- **THEN** SHALL prosseguir direto para `syncGateway.uploadProspecto()`

#### Scenario: Geocoding falha silenciosamente — upload não é bloqueado
- **WHEN** `geocodeService.reverseGeocode()` lança exceção inesperada
- **THEN** `SyncProspectosUseCase` SHALL capturar a exceção
- **THEN** SHALL prosseguir com o upload sem endereço
- **THEN** o prospecto NÃO SHALL ser marcado como erro por causa do geocoding
