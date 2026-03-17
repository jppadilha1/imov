# Spec: Requisitos Funcionais e Não-Funcionais

Este documento define os Requisitos Funcionais (RF) e Requisitos Não-Funcionais (RNF) obrigatórios para o ProspectHome MVP, extraídos das propostas e discussões de design técnico em conformidade com o padrão RFC 2119.

## 1. Requisitos Funcionais (RF)

Os Requisitos Funcionais definem as ações que o sistema MUST executar em resposta a estímulos do usuário ou do próprio sistema.

*   **[RF-01] Autenticação e Autorização:** O sistema MUST permitir que o usuário (corretor) faça login e cadastro usando email e senha.
*   **[RF-02] Isolamento de Dados:** O sistema MUST garantir que um corretor só tenha acesso aos prospectos que ele mesmo criou (Row Level Security).
*   **[RF-03] Captura Fotográfica:** O sistema MUST permitir a abertura da câmera nativa para captura de fotos de fachadas.
*   **[RF-04] Captura de Coordenadas:** O sistema MUST extrair a latitude e longitude exatas do dispositivo no momento exato em que a fotografia do prospecto for confirmada.
*   **[RF-05] Modo de Operação Offline:** O sistema MUST permitir a execução dos fluxos de listagem local, captura fotográfica e de coordenadas mesmo sem conexão com a internet.
*   **[RF-06] Sincronização Transparente:** O sistema MUST iniciar o envio de dados locais (prospectos e fotos) para a nuvem de forma automática no momento em que o aplicativo identificar conexão estável com a internet.
*   **[RF-07] Geocoding Reverso (Backend):** O sistema MUST resolver automaticamente as coordenadas (lat/lng) em um endereço legível e atualizá-lo na base de dados após a sincronização, sem sobrecarregar o cliente.
*   **[RF-08] Atualização de Dados Resolvidos:** O sistema (frontend) MUST realizar um processo de busca (pull) de tempos em tempos (enquanto houver internet) para atualizar a lista local com os endereços resolvidos pelo Geocoding.
*   **[RF-09] Visualização de Prospectos:** O sistema MUST exibir uma lista simples de todos os prospectos do usuário, apresentando de maneira clara o seu Status (Novo, Contatado, etc.) e o seu Sync Status (Pendente, Sincronizado).
*   **[RF-10] Visualização em Mapa:** O sistema MUST exibir um mapa interativo contendo os marcadores (pins) de todos os imóveis prospectados pelo usuário, exigindo internet para o carregamento do mapa.
*   **[RF-11] Feedback de Logout Inseguro:** O sistema MUST alertar ativamente o usuário caso ele tente realizar logout enquanto houver dados na fila local aguardando sincronização.

## 2. Requisitos Não-Funcionais (RNF)

Os Requisitos Não-Funcionais ditam padrões de qualidade, arquitetura e tecnologias que o sistema MUST adotar para atender às métricas de sucesso.

*   **[RNF-01] Tempo de Resposta da Captura:** O processo de salvar um prospecto offline (foto e metadados) no cache de banco de dados MUST ocorrer de maneira instantânea (em até 1 segundo), sem bloquear a UI.
*   **[RNF-02] Otimização de Armazenamento:** Todas as fotos capturadas MUST ser redimensionadas para ~800px de largura e comprimidas utilizando padrão JPEG (qualidade 70-80%) antes de serem salvas ou enviadas pela rede.
*   **[RNF-03] Arquitetura Desacoplada:** O sistema MUST seguir as 4 camadas estritas da *Clean Architecture*, de forma que a camada de Domínio jamais importe pacotes de UI (React Native) ou Infraestrutura (Supabase, SQLite).
*   **[RNF-04] UI e Estilização Exclusiva:** A aplicação MUST ser estilizada única e exclusivamente via a biblioteca de utility-classes `nativewind` (TailwindCSS para React Native).
*   **[RNF-05] Iconografia:** O sistema MUST usar a biblioteca `lucide-react-native` para toda e qualquer representação iconográfica.
*   **[RNF-06] UX de Tela Plena (Usabilidade Em Trânsito):** Os botões primários de ação (ex: Tirar Foto, Confirmar) e os touch targets de menus DEVEM ser grandes e de fácil engajamento (mínimo de 48x48dp) limitando a carga cognitiva.
*   **[RNF-07] Cobertura de Testes E2E (Integração Física):** O sistema MUST ser validado via fluxos nativos e declarativos através do framework `Maestro` para assegurar o funcionamento dos modais nativos (GPS/Câmera) em jornada completa.
*   **[RNF-08] Cobertura de Testes Unitários de UI:** A camada de Presentation (Telas/Componentes) MUST ser validada pelo `@testing-library/react-native` utilizando queries de acessibilidade para garantir testes focados no comportamento, não no estado interno.
