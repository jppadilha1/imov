# Spec: Geocode Service

## Requirements

### Requirement: IGeocodeService define contrato de geocoding reverso no domínio
A interface `IGeocodeService` em `src/domain/repositories/IGeocodeService.ts` SHALL declarar o método `reverseGeocode(coordinates: Coordinates): Promise<Address | null>`. Retorna `null` quando não for possível resolver o endereço (sem cobertura, erro de rede, campos ausentes).

#### Scenario: Interface exportada do domínio
- **WHEN** outro módulo importa `IGeocodeService`
- **THEN** o import SHALL vir de `src/domain/repositories/IGeocodeService`
- **THEN** a interface SHALL declarar apenas `reverseGeocode(coordinates: Coordinates): Promise<Address | null>`

### Requirement: ExpoGeocodeService implementa IGeocodeService via expo-location
A classe `ExpoGeocodeService` em `src/infrastructure/device-services/ExpoGeocodeService.ts` SHALL implementar `IGeocodeService` usando `Location.reverseGeocodeAsync({latitude, longitude})` do `expo-location`.

#### Scenario: Geocoding bem-sucedido com street e district disponíveis
- **WHEN** `reverseGeocode(coordinates)` é chamado com coordenadas válidas
- **THEN** SHALL chamar `Location.reverseGeocodeAsync({latitude: coordinates.latitude, longitude: coordinates.longitude})`
- **THEN** SHALL usar `results[0].street` (fallback: `name`) como rua e `results[0].district` (fallback: `subregion`) como bairro
- **THEN** SHALL retornar `new Address(streetName, "S/N", neighborhood, "", "", "00000000")`

#### Scenario: reverseGeocodeAsync retorna array vazio
- **WHEN** `Location.reverseGeocodeAsync` retorna `[]`
- **THEN** `reverseGeocode` SHALL retornar `null`

#### Scenario: street/name e district/subregion ausentes no resultado
- **WHEN** `street`, `name`, `district` e `subregion` são todos `null` ou string vazia
- **THEN** `reverseGeocode` SHALL retornar `null` sem tentar criar `Address`

#### Scenario: reverseGeocodeAsync lança exceção
- **WHEN** `Location.reverseGeocodeAsync` lança qualquer exceção (timeout, permissão negada, erro de rede)
- **THEN** `ExpoGeocodeService` SHALL capturar a exceção e retornar `null`
- **THEN** nenhuma exceção SHALL ser propagada ao chamador

### Requirement: MockGeocodeService retorna null para uso em dev e testes
A classe `MockGeocodeService` em `src/infrastructure/mock/MockGeocodeService.ts` SHALL implementar `IGeocodeService` retornando `Promise.resolve(null)` em `reverseGeocode()`, sem fazer chamadas externas.

#### Scenario: reverseGeocode em ambiente de teste
- **WHEN** `MockGeocodeService.reverseGeocode(coordinates)` é chamado com qualquer valor
- **THEN** SHALL retornar `null` sem chamar `expo-location`
