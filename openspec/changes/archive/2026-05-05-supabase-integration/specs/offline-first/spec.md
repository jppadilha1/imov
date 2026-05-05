## MODIFIED Requirements

### Requirement: Sincronização reativa a mudanças de rede
Quando a conectividade for restaurada, o sistema MUST iniciar a sincronização de forma autônoma e transparente. O mecanismo de escuta SHALL usar `INetworkService.addListener()` para garantir que hooks e use cases dependam da abstração de domínio, não do NetInfo diretamente. Em `production`, o destino da sincronização SHALL ser o `SupabaseSyncGateway` (Supabase real); em demais ambientes, SHALL ser o `MockSyncGateway`.

#### Scenario: Sync disparado por listener de rede em produção
- **WHEN** `INetworkService.addListener` notifica transição para online e `APP_ENV === 'production'`
- **THEN** `SyncProspectosUseCase.execute()` SHALL ser chamado automaticamente
- **THEN** o use case SHALL delegar ao `SupabaseSyncGateway` o upload dos prospectos pendentes
- **THEN** a UI SHALL refletir o andamento sem bloquear o usuário

#### Scenario: Sync disparado por listener de rede em desenvolvimento
- **WHEN** `INetworkService.addListener` notifica transição para online e `APP_ENV !== 'production'`
- **THEN** `SyncProspectosUseCase.execute()` SHALL ser chamado automaticamente
- **THEN** o use case SHALL delegar ao `MockSyncGateway` (comportamento de desenvolvimento preservado)
