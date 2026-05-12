# Spec: Supabase Sync (delta)

## MODIFIED Requirements

### Requirement: SyncProspectosUseCase faz pull de atualizações após upload
`SyncProspectosUseCase.execute()` SHALL fazer pull dos dados remotos via `pullUpdates` após fazer upload dos itens pending. Isso garante que SQLite fica sincronizado com o Supabase, refletindo mudanças feitas em outros dispositivos ou na interface remota.

#### Scenario: Sync completo — upload + pull
- **WHEN** `SyncProspectosUseCase.execute()` é chamado
- **THEN** SHALL fazer upload dos items `pending`
- **THEN** após upload, SHALL chamar `syncGateway.pullUpdates(userId, new Date(0))` para trazer todos os dados do usuário
- **THEN** cada prospecto retornado pela pull SHALL ser persistido no SQLite via `prospectoRepository.save`
- **THEN** listagem ao recarregar mostra dados atualizados do Supabase

#### Scenario: Pull falha silenciosamente
- **WHEN** `pullUpdates` lança exceção
- **THEN** `SyncProspectosUseCase` SHALL capturar a exceção e continuar
- **THEN** upload já completou, então sync é considerado bem-sucedido
- **THEN** dados remotos não sincronizados até a próxima tentativa

#### Scenario: Nenhum item pending para upload
- **WHEN** `prospectoRepository.findPending()` retorna lista vazia
- **THEN** `SyncProspectosUseCase` SHALL ainda executar `pullUpdates` para trazer dados remotos
- **THEN** SQLite fica sincronizado mesmo sem items para upload
