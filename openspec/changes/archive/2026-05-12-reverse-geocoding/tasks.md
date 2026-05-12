## 1. Domínio — IGeocodeService

- [x] 1.1 Criar `src/domain/repositories/IGeocodeService.ts` com método `reverseGeocode(coordinates: Coordinates): Promise<Address | null>`

## 2. Infraestrutura — ExpoGeocodeService

- [x] 2.1 Criar `src/infrastructure/device-services/ExpoGeocodeService.ts` implementando `IGeocodeService`
- [x] 2.2 Implementar `reverseGeocode`: chamar `Location.reverseGeocodeAsync({latitude, longitude})`, extrair `results[0].street` e `results[0].region`
- [x] 2.3 Retornar `new Address(street, "S/N", region, "", "", "00000000")` quando ambos os campos estão presentes
- [x] 2.4 Retornar `null` nos casos: array vazio, `street` ou `region` ausentes, exceção capturada

## 3. Infraestrutura — MockGeocodeService

- [x] 3.1 Criar `src/infrastructure/mock/MockGeocodeService.ts` com `reverseGeocode()` retornando `Promise.resolve(null)`

## 4. Use Case — SyncProspectosUseCase

- [x] 4.1 Injetar `IGeocodeService` no construtor de `SyncProspectosUseCase`
- [x] 4.2 Para cada prospecto com `address === null`: chamar `geocodeService.reverseGeocode(prospecto.coordinates)` antes do `uploadProspecto`
- [x] 4.3 Se retornar `Address`: chamar `prospecto.resolveAddress(address)` e `prospectoRepository.save(prospecto)`
- [x] 4.4 Se retornar `null` ou lançar exceção: prosseguir com upload sem bloquear ou marcar erro

## 5. DI Container

- [x] 5.1 Adicionar `geocodeService: IGeocodeService` em `DIContainer`
- [x] 5.2 Wirear `ExpoGeocodeService` em `isProduction` e `MockGeocodeService` nos demais ambientes
- [x] 5.3 Passar `container.geocodeService` na instanciação de `SyncProspectosUseCase` (onde for criado — verificar se é no container ou no hook `useSync`)

## 6. Testes

- [x] 6.1 Escrever teste unitário para `ExpoGeocodeService`: mock de `Location.reverseGeocodeAsync`, cobrir cenários de sucesso, array vazio, campos null, exceção
- [x] 6.2 Atualizar testes de `SyncProspectosUseCase`: injetar `MockGeocodeService`, cobrir fluxo com geocoding bem-sucedido e com geocoding retornando null

## 7. Validação

- [x] 7.1 Executar todos os testes existentes (`npm test`) sem regressões
- [ ] 7.2 Testar em device/simulador com `APP_ENV=production`: capturar prospecto, sincronizar, verificar que `address_endereco` e `address_bairro` aparecem no Supabase e na lista local
