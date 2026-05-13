# Spec: Hybrid Prospecto Repository

## ADDED Requirements

### Requirement: SupabaseProspectoRepository implementa IProspectoRepository contra Supabase
A classe `SupabaseProspectoRepository` em `src/infrastructure/database/supabase/SupabaseProspectoRepository.ts` SHALL implementar `IProspectoRepository` realizando CRUD direto na tabela `prospectos` do Supabase. Mapeamento de campos SHALL reutilizar o padrão de `SupabaseSyncGateway` (`photo_url` → `photoPath`, `address_endereco` → `address.street`, etc).

#### Scenario: findAll retorna prospectos do usuário autenticado
- **WHEN** `findAll()` é chamado
- **THEN** SHALL fazer query na tabela `prospectos` filtrando pelo `userId` da sessão atual
- **THEN** SHALL retornar array de `Prospecto` mapeado dos registros
- **THEN** se nenhum registro encontrado, SHALL retornar array vazio

#### Scenario: findById retorna prospecto específico
- **WHEN** `findById(id)` é chamado com ID existente
- **THEN** SHALL fazer query filtrando por `id`
- **THEN** SHALL retornar o `Prospecto` mapeado

#### Scenario: findById com ID inexistente
- **WHEN** `findById(id)` é chamado com ID que não existe
- **THEN** SHALL retornar `null`

#### Scenario: save insere ou atualiza no Supabase
- **WHEN** `save(prospecto)` é chamado
- **THEN** SHALL fazer `upsert` na tabela `prospectos` com onConflict `id`
- **THEN** se o `photoPath` for caminho local (não URL), SHALL fazer upload da foto via Supabase Storage primeiro e usar a URL no campo `photo_url`
- **THEN** se o `photoPath` já for URL pública, SHALL usar diretamente sem re-upload

#### Scenario: delete remove do Supabase
- **WHEN** `delete(id)` é chamado
- **THEN** SHALL deletar o registro da tabela `prospectos` filtrando por `id`
- **THEN** SHALL deletar o arquivo do Supabase Storage correspondente

#### Scenario: findPending lança erro
- **WHEN** `findPending()` é chamado em `SupabaseProspectoRepository`
- **THEN** SHALL lançar `Error("findPending não aplicável ao repositório remoto")`, pois "pending" é conceito local

### Requirement: HybridProspectoRepository roteia leituras e escritas baseado em rede
A classe `HybridProspectoRepository` em `src/infrastructure/database/HybridProspectoRepository.ts` SHALL implementar `IProspectoRepository` encapsulando um repositório local (`SQLiteProspectoRepository`), um repositório remoto (`SupabaseProspectoRepository`) e `INetworkService`. SHALL rotear operações em runtime baseado em `network.isConnected()`.

#### Scenario: findAll online — busca remoto e atualiza cache local
- **WHEN** `findAll()` é chamado e `network.isConnected()` retorna `true`
- **THEN** SHALL chamar `remote.findAll()`
- **THEN** SHALL chamar `local.save(p)` para cada prospecto retornado (write-through cache)
- **THEN** SHALL retornar o array de prospectos do remoto

#### Scenario: findAll offline — lê apenas do cache local
- **WHEN** `findAll()` é chamado e `network.isConnected()` retorna `false`
- **THEN** SHALL chamar `local.findAll()` e retornar o resultado
- **THEN** NÃO SHALL chamar `remote.findAll()`

#### Scenario: findAll com falha remoto — fallback para local
- **WHEN** `findAll()` é chamado, `network.isConnected()` retorna `true`, mas `remote.findAll()` lança exceção
- **THEN** SHALL capturar a exceção
- **THEN** SHALL retornar `local.findAll()` como fallback

#### Scenario: findById online — busca remoto e atualiza cache
- **WHEN** `findById(id)` é chamado e online
- **THEN** SHALL chamar `remote.findById(id)`
- **THEN** se resultado não-null, SHALL chamar `local.save(result)` para cache
- **THEN** SHALL retornar o resultado

#### Scenario: findById offline — lê apenas local
- **WHEN** `findById(id)` é chamado e offline
- **THEN** SHALL chamar `local.findById(id)` e retornar o resultado

#### Scenario: save online — escreve remoto e local
- **WHEN** `save(prospecto)` é chamado e online
- **THEN** SHALL chamar `remote.save(prospecto)`
- **THEN** após sucesso remoto, SHALL marcar prospecto como `synced` e chamar `local.save(prospecto)`

#### Scenario: save offline — escreve apenas local com pending
- **WHEN** `save(prospecto)` é chamado e offline
- **THEN** SHALL marcar prospecto com `syncStatus = pending`
- **THEN** SHALL chamar `local.save(prospecto)`
- **THEN** NÃO SHALL tentar chamar `remote.save`

#### Scenario: save online com falha remoto — fallback para pending local
- **WHEN** `save(prospecto)` é chamado, online, mas `remote.save` lança exceção
- **THEN** SHALL marcar prospecto como `pending`
- **THEN** SHALL chamar `local.save(prospecto)` para preservar o dado
- **THEN** SHALL propagar a exceção para que UI possa avisar

#### Scenario: findPending sempre lê do local
- **WHEN** `findPending()` é chamado em qualquer estado de rede
- **THEN** SHALL chamar `local.findPending()` e retornar o resultado

#### Scenario: delete online — remove remoto e local
- **WHEN** `delete(id)` é chamado e online
- **THEN** SHALL chamar `remote.delete(id)`
- **THEN** SHALL chamar `local.delete(id)`

#### Scenario: delete offline — remove apenas local
- **WHEN** `delete(id)` é chamado e offline
- **THEN** SHALL chamar `local.delete(id)` apenas
- **THEN** NÃO SHALL tentar remoto (limitação aceita do MVP: item pode "ressuscitar" no próximo pull online)

### Requirement: DIContainer instancia HybridProspectoRepository em produção
O `DIContainer` em `src/dependency_injection/container.ts` SHALL, em modo produção, instanciar `HybridProspectoRepository(local, remote, network)` e atribuir a `this.prospectoRepository`. Em demais modos (mock/dev), continua usando `MockProspectoRepository`.

#### Scenario: Produção — repositório híbrido injetado
- **WHEN** `appEnv === "production"` e `DIContainer` é instanciado
- **THEN** `this.prospectoRepository` SHALL ser uma instância de `HybridProspectoRepository`
- **THEN** o `local` SHALL ser `SQLiteProspectoRepository`
- **THEN** o `remote` SHALL ser `SupabaseProspectoRepository`
- **THEN** o `network` SHALL ser `NetworkService`

#### Scenario: Dev/test — mock continua intacto
- **WHEN** `appEnv !== "production"`
- **THEN** `this.prospectoRepository` SHALL ser `MockProspectoRepository`
- **THEN** `HybridProspectoRepository` e `SupabaseProspectoRepository` NÃO SHALL ser instanciados
