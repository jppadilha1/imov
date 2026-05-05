## ADDED Requirements

### Requirement: Mapa exibe placeholder quando offline
Quando o dispositivo não possui conexão de rede, a tela do mapa SHALL substituir o componente `MapView` por um placeholder estático contendo ícone e texto orientativo, sem renderizar tiles ou tentar qualquer requisição de rede relacionada ao mapa.

#### Scenario: Usuário abre o mapa sem conexão
- **WHEN** o app abre a aba do mapa e `useNetwork().isConnected` retorna `false`
- **THEN** o `MapView` NÃO SHALL ser renderizado
- **THEN** um ícone `WifiOff` e texto orientativo SHALL ser exibidos no lugar

#### Scenario: Conexão é perdida enquanto o mapa está aberto
- **WHEN** o estado `isConnected` transiciona de `true` para `false`
- **THEN** o `MapView` SHALL ser desmontado e substituído pelo placeholder imediatamente via re-render reativo

#### Scenario: Conexão é restaurada enquanto o placeholder está visível
- **WHEN** o estado `isConnected` transiciona de `false` para `true`
- **THEN** o placeholder SHALL ser substituído pelo `MapView` sem necessidade de ação do usuário

### Requirement: Texto orientativo guia o usuário offline
O placeholder offline SHALL exibir uma mensagem que instrui o usuário a continuar capturando imóveis normalmente, informando que os dados serão sincronizados automaticamente quando a conexão voltar.

#### Scenario: Conteúdo do placeholder
- **WHEN** o placeholder offline é exibido
- **THEN** o texto SHALL conter orientação para o usuário tirar fotos normalmente
- **THEN** o texto SHALL informar que a sincronização ocorrerá automaticamente ao reconectar
