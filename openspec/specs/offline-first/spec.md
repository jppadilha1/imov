# Spec: Comportamento Offline-First

Estas especificações definem as garantias do aplicativo em ambientes desprovidos de conectividade (ou com instabilidade), de acordo com RFC 2119.

## 1. Princípios Gerais

- O aplicativo MUST se manter integralmente funcional para tarefas cruciais de captação, sem necessidade de internet ativa (Offline-First).
- O sistema SHALL utilizar um repositório local resiliente como a Single Source of Truth primária.
- A interface de usuário MUST prover clareza sobre o estado da rede sem ser obstrutiva. Na tela do mapa, isso SHALL incluir substituição do `MapView` por um placeholder estático com ícone e mensagem orientativa quando offline, em vez de apenas um indicador sutil ou banner.

## 2. Cenários (Behavior-Driven)

### 2.1. Captura de Imóvel Sem Internet
- **Dado** que o dispositivo não possui acesso à internet ou reporta timeouts na nuvem,
- **Quando** o corretor efetuar uma nova captura de Prospecto,
- **Então** o sistema MUST salvar imediatamente o registro junto com sua foto comprimida e coordenadas no cache local.
- **E** a interface MUST exibir um feedback positivo garantindo que os dados não serão perdidos ("Salvo para envio posterior").
- **E** o fluxo principal SHALL NOT exibir loadings infinitos ou travar aguardando pacotes de rede.

### 2.2. Sincronização Transparente (Background Sync)
- **Dado** que há cadastros pendentes na fila local do dispositivo,
- **Quando** a conectividade for restaurada com estabilidade,
- **Então** o sistema MUST iniciar a sincronização com o banco de dados principal de forma autônoma e transparente. O mecanismo de escuta SHALL usar `INetworkService.addListener()` para garantir que hooks e use cases dependam da abstração de domínio, não do NetInfo diretamente.
- **E** `SyncProspectosUseCase.execute()` SHALL ser chamado automaticamente quando `INetworkService.addListener` notifica transição para online.
- **E** o destino da sincronização SHALL depender de `APP_ENV`: em `production`, SHALL ser `SupabaseSyncGateway` (Supabase real); em demais ambientes, SHALL ser `MockSyncGateway`.
- **E** a interface de usuário SHOULD refletir esse andamento através de um indicador sutil (ex.: um badge de envio no histórico), sem interromper o trabalho em andamento.

### 2.3. Tela do Mapa Offline
- **Dado** que o dispositivo não possui conexão e o usuário acessa a aba do mapa,
- **Então** o `MapView` SHALL ser substituído por placeholder com ícone `WifiOff` e texto orientativo.
- **E** o texto MUST orientar o usuário a continuar capturando imóveis normalmente.
- **E** o texto MUST informar que a sincronização ocorrerá automaticamente ao reconectar.

### 2.4. Resolução de Endereço em Nuvem
- **Dado** que um imóvel foi recém capturado com suas latitudes e longitudes exatas,
- **Quando** a internet retornar e o pacote desse prospecto subir,
- **Então** o frontend SHALL delegar ao servidor as tarefas massivas (como o Reverse Geocoding via API do Google/Mapbox).
- **E** após o servidor enriquecer o pacote, o frontend MUST atualizar o registro na lista de histórico silenciosamente num próximo "pull".
