# Spec: Permissões de Hardware

Estas especificações definem o comportamento do sistema para acesso a hardware de acordo com as palavras-chave do padrão RFC 2119 (MUST, SHALL, SHOULD).

## 1. Princípios Gerais

- O sistema MUST solicitar permissões de hardware no momento em que o contexto exigir, e não silenciosamente no background.
- O sistema SHALL NOT tentar acessar a câmera ou o GPS se a permissão já foi explicitamente negada sem antes orientar o usuário.

## 2. Cenários (Behavior-Driven)

### 2.1. Câmera: Permissão Negada (Fallback)
- **Dado** que o usuário negou a permissão de Câmera previamente,
- **Quando** ele tentar acessar o fluxo de Captura de Prospecto ou tocar no botão de tirar foto,
- **Então** o sistema MUST exibir um modal amigável solicitando a alteração nas configurações do SO.
- **E** o sistema MUST NOT congelar ou crachar a aplicação em cascata.

### 2.2. Geolocalização: Permissão Negada (Fallback)
- **Dado** que o usuário negou a permissão de Geolocalização,
- **Quando** ele tentar acessar o Mapa ou iniciar uma Captura que requer coordenadas imperativas,
- **Então** o sistema MUST exibir um modal amigável (ou um empty state educativo) solicitando a alteração explícita nas configurações do SO.
- **E** o sistema SHALL NOT permitir a conclusão do fluxo de salvar um prospecto sem os dados geográficos precisos.

### 2.3. Solicitação Inicial (Warm-up)
- **Dado** que o usuário instalou o app agora e nunca visualizou os prompts nativos,
- **Quando** ele iniciar o aplicativo pela primeira vez,
- **Então** o sistema SHOULD apresentar uma tela de onboarding ou um aviso em contexto explicando o *porquê* da localização ser vital antes de disparar o prompt opaco do SO.
