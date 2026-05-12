## Why

Prospectos capturados offline chegam ao Supabase sem endereço legível — apenas `lat`/`lng`. O corretor precisa ver rua e bairro na lista e no detalhe sem nenhuma ação manual. `expo-location` já está instalado e expõe `reverseGeocodeAsync()` que converte coordenadas em `street` e `region` — zero dependências novas, zero infraestrutura Supabase extra.

## What Changes

- **Novo `IGeocodeService`**: interface no domínio com `reverseGeocode(coordinates): Promise<Address | null>`
- **Novo `ExpoGeocodeService`**: implementação em `infrastructure/device-services` usando `Location.reverseGeocodeAsync()` do `expo-location`
- **Novo `MockGeocodeService`**: retorna `null` em dev/test (sem geocoding fake)
- **`SyncProspectosUseCase` modificado**: injeta `IGeocodeService`, resolve endereço antes de cada `uploadProspecto()` quando `address` é `null`
- **`container.ts` atualizado**: expõe `geocodeService`, wiring `ExpoGeocodeService` em produção e `MockGeocodeService` demais

## Capabilities

### New Capabilities
- `geocode-service`: Interface + implementação `expo-location` para resolver coordenadas em endereço (`street` → `address_endereco`, `region` → `address_bairro`) client-side, durante o sync

### Modified Capabilities
- `supabase-sync`: `SyncProspectosUseCase` passa a resolver endereço antes do upload via `IGeocodeService` injetado

## Impact

- **Novos arquivos**: `IGeocodeService.ts`, `ExpoGeocodeService.ts`, `MockGeocodeService.ts`
- **Arquivos modificados**: `SyncProspectosUseCase.ts`, `container.ts`
- **Sem mudanças**: migrations SQL (colunas `address_endereco`/`address_bairro` já existem em `0001_initial_schema.sql`), `SupabaseSyncGateway` (já mapeia esses campos), entidades de domínio
- **Zero dependências novas**: `expo-location` já instalado
- **Sem Edge Function, sem webhook, sem Nominatim**
