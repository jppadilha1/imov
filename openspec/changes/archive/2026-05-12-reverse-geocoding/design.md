## Context

`expo-location` já está instalado e em uso no `ExpoLocationService`. A função `Location.reverseGeocodeAsync({latitude, longitude})` retorna `LocationGeocodedAddress[]` com os campos `street` (nome da rua) e `region` (bairro/região — validado para a cidade alvo). As colunas `address_endereco` e `address_bairro` já existem em `public.prospectos` (Supabase) e na tabela SQLite local. O `SupabaseSyncGateway` já mapeia esses campos no `uploadProspecto`. O `SyncProspectosUseCase` atualmente não injeta nenhum serviço de geocoding.

```
FLUXO ATUAL (sem endereço)
──────────────────────────
captura → SQLite {lat, lng, address: null}
  → sync → Supabase {lat, lng, address_endereco: null, address_bairro: null}

FLUXO NOVO (com geocoding client-side)
──────────────────────────────────────
captura → SQLite {lat, lng, address: null}
  → sync → ExpoGeocodeService.reverseGeocode(coords)
              └─ Location.reverseGeocodeAsync({lat, lng})
                   └─ {street, region}
                        └─ new Address(street, region)
  → prospecto.resolveAddress(address)
  → SQLite atualizado com endereço
  → Supabase {lat, lng, address_endereco: "Rua X", address_bairro: "Bairro Y"}
```

## Goals / Non-Goals

**Goals:**
- Resolver `street` e `region` via `expo-location` antes de cada upload ao Supabase
- Persistir endereço no SQLite local antes do upload (não só na nuvem)
- Falhar silenciosamente: se geocoding retornar null, upload prossegue sem endereço
- Zero novas dependências npm

**Non-Goals:**
- Geocoding em background (sync já é foreground)
- Resolução de endereço no momento da captura (offline → sem rede)
- Pull de endereço do Supabase de volta ao app — o endereço já vai preenchido no upload
- Modificar o value object `Address` para remover validações existentes

## Decisions

### 1. Nova interface `IGeocodeService` separada de `ILocationService`

**Decisão:** Criar `src/domain/repositories/IGeocodeService.ts` com método único `reverseGeocode(coordinates: Coordinates): Promise<Address | null>`.

**Alternativas consideradas:**
- Adicionar `reverseGeocode` ao `ILocationService` existente: viola ISP — posicionamento e geocoding são responsabilidades distintas; `MockLocationService` seria forçado a implementar método que não usa
- Implementar diretamente no `SyncProspectosUseCase`: viola DIP — Use Case dependeria de framework diretamente

**Rationale:** Interface segregada, testável isoladamente, segue o padrão já existente no projeto.

### 2. Geocoding em `SyncProspectosUseCase`, não em `SupabaseSyncGateway`

**Decisão:** `SyncProspectosUseCase` injeta `IGeocodeService` e resolve endereço antes de chamar `syncGateway.uploadProspecto(prospecto)`.

**Alternativas consideradas:**
- Injetar `IGeocodeService` no `SupabaseSyncGateway`: gateway ficaria responsável por lógica de domínio (resolver endereço), misturando concern de infra de rede com lógica de negócio

**Rationale:** `SyncProspectosUseCase` já é o orquestrador da operação de sync — é o lugar certo para coordenar "resolve endereço → salva local → faz upload".

### 3. Persistir endereço no SQLite antes do upload

**Decisão:** Após `reverseGeocode` retornar um endereço, chamar `prospecto.resolveAddress(address)` e depois `prospectoRepository.save(prospecto)` antes do `uploadProspecto`.

**Alternativas consideradas:**
- Só passar o endereço no upload sem persistir no SQLite: prospecto local ficaria sem endereço; se o app reabrir sem sync, endereço sumia da lista

**Rationale:** SQLite é a fonte de verdade offline. Endereço resolvido deve estar persistido localmente, não apenas enviado para a nuvem.

### 4. `Address` com campos fixos para campos não disponíveis

**Decisão:** `ExpoGeocodeService` cria `new Address(street, "S/N", region, "", "", "00000000")` — valores fixos para `number`, `city`, `state`, `zipCode`.

**Rationale:** Padrão já estabelecido em `SupabaseSyncGateway.mapRowToProspecto()`. O app só exibe `street` e `region` para o corretor. Alterar o `Address` VO para tornar esses campos opcionais é escopo de outra change.

### 5. `MockGeocodeService` retorna `null`

**Decisão:** Em dev/test, `MockGeocodeService.reverseGeocode()` retorna `null` sem chamar nenhuma API.

**Rationale:** `reverseGeocodeAsync` requer rede. Em dev/test o sync já usa `MockSyncGateway` (sem Supabase real), portanto endereços null são aceitáveis. Evita chamadas externas em testes.

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| `region` retorna estado (SP) em vez de bairro para algumas coordenadas | Testar com coordenadas da cidade alvo antes do deploy; aceitar como "melhor esforço" no MVP |
| `street` null para coordenadas sem OSM coverage | `ExpoGeocodeService` retorna `null` → upload prossegue sem endereço |
| `reverseGeocodeAsync` lança exceção (permissão revogada, timeout) | `try/catch` em `ExpoGeocodeService` → retorna `null` silenciosamente |
| Endereço resolvido só no momento do sync (não na captura) | Comportamento esperado — captura é offline; endereço aparece após primeiro sync |
