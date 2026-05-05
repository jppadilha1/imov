# Spec: Supabase Sync

## ADDED Requirements

### Requirement: SupabaseSyncGateway implementa ISyncGateway via Supabase Database e Storage
A classe `SupabaseSyncGateway` em `src/infrastructure/supabase/SupabaseSyncGateway.ts` SHALL implementar a interface `ISyncGateway` completa (`uploadProspecto`, `pullUpdates`), usando o cliente Supabase para operações de banco de dados e Supabase Storage para fotos.

#### Scenario: Upload bem-sucedido de prospecto
- **WHEN** `uploadProspecto(prospecto)` é chamado com um `Prospecto` válido
- **THEN** a foto local SHALL ser lida do filesystem e enviada ao bucket `prospecto-photos` com path `{userId}/{prospecto.id}.jpg`
- **THEN** o registro SHALL ser inserido (ou upsert) na tabela `prospectos` do Supabase com todos os campos mapeados
- **THEN** o método SHALL retornar o `remote_id` correspondente ao `id` do registro no Supabase

#### Scenario: Falha no upload da foto
- **WHEN** o envio da foto ao Supabase Storage falha
- **THEN** o método SHALL lançar um `Error` sem inserir o registro no banco
- **THEN** o prospecto permanece `pending` no SQLite local para retentativa

#### Scenario: Falha na inserção no banco após upload da foto
- **WHEN** a foto é enviada com sucesso mas a inserção no banco falha
- **THEN** o método SHALL lançar um `Error`

#### Scenario: Pull de atualizações remotas
- **WHEN** `pullUpdates(userId, lastSyncDate)` é chamado
- **THEN** SHALL ser feita uma query na tabela `prospectos` filtrando `user_id = userId` e `updated_at > lastSyncDate`
- **THEN** o método SHALL retornar um array de `Prospecto` mapeados dos registros remotos
- **THEN** se nenhum registro for encontrado, SHALL retornar array vazio
- **THEN** registros que foram editados após `lastSyncDate` (não apenas criados) SHALL ser incluídos no resultado

#### Scenario: Pull com erro de autenticação
- **WHEN** `pullUpdates` retorna erro de autorização do Supabase (RLS)
- **THEN** o método SHALL lançar um `Error` com a mensagem do Supabase

### Requirement: SupabaseSyncGateway mapeia campos entre domínio e banco remoto
O mapeamento entre `Prospecto` (domínio) e a linha da tabela `prospectos` remota SHALL ser bidirecional e consistente. O campo local `photo_path` (caminho de arquivo) NÃO é enviado ao Supabase; em seu lugar, a URL pública/signed do Storage é armazenada em `photo_url` no banco remoto.

#### Scenario: Mapeamento de upload (domínio → banco)
- **WHEN** um `Prospecto` é enviado ao Supabase
- **THEN** `id`, `user_id`, `lat`, `lng`, `notes`, `status`, `address_endereco`, `address_bairro`, `created_at` SHALL ser mapeados diretamente
- **THEN** `photo_url` SHALL conter a URL do arquivo enviado ao Supabase Storage

#### Scenario: Mapeamento de pull (banco → domínio)
- **WHEN** um registro remoto é recebido no pull
- **THEN** `photo_path` no domínio SHALL ser preenchido com a `photo_url` remota (URL como path)
- **THEN** `sync_status` SHALL ser `'synced'`
- **THEN** `remote_id` SHALL ser o `id` do registro remoto
