## MODIFIED Requirements

### Requirement: Interface de usuário provê clareza sobre estado da rede
A interface de usuário MUST prover clareza sobre o estado da rede sem ser obstrutiva. Na tela do mapa, isso SHALL incluir substituição do `MapView` por um placeholder estático com ícone e mensagem orientativa quando offline, em vez de apenas um indicador sutil ou banner.

#### Scenario: Tela do mapa offline
- **WHEN** o dispositivo não possui conexão e o usuário acessa a aba do mapa
- **THEN** o `MapView` SHALL ser substituído por placeholder com ícone `WifiOff` e texto orientativo
- **THEN** o texto MUST orientar o usuário a continuar capturando imóveis normalmente
- **THEN** o texto MUST informar que a sincronização ocorrerá automaticamente ao reconectar

### Requirement: Sincronização reativa a mudanças de rede
Quando a conectividade for restaurada, o sistema MUST iniciar a sincronização de forma autônoma e transparente. O mecanismo de escuta SHALL usar `INetworkService.addListener()` para garantir que hooks e use cases dependam da abstração de domínio, não do NetInfo diretamente.

#### Scenario: Sync disparado por listener de rede
- **WHEN** `INetworkService.addListener` notifica transição para online
- **THEN** `SyncProspectosUseCase.execute()` SHALL ser chamado automaticamente
- **THEN** a UI SHALL refletir o andamento sem bloquear o usuário
