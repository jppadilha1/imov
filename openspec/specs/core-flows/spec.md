# Spec: Fluxos Primordiais do Corretor

Estas especificações definem as garantias comportamentais ligadas às ações centrais do usuário no aplicativo baseadas em interações, usando RFC 2119.

## 1. Princípios Gerais

- A carga cognitiva da interface do corretor no trânsito MUST ser mínima, priorizando botões grandes e legíveis.
- O aplicativo SHALL tratar a criação de um Prospecto apenas com informações triviais obtidas do hardware, sem exigência de digitação (zero teclado para prospecção).

## 2. Cenários (Behavior-Driven)

### 2.1. O Processo de Disparo Base (One-Tap Prospecting)
- **Dado** que o corretor se encontra diante da lista de imóveis retroativa ou mapa do painel principal,
- **Quando** ele acionar o botão central de Nova Captura (Ação Primária),
- **Então** o sistema MUST renderizar de forma instantânea o modal de fotografia.
- **E** o aplicativo MUST estar plenamente pronto para tirar fotos sem engasgar o frame rate da câmera.

### 2.2. Confirmação do Contexto (Hardware Fusion)
- **Dado** que a foto do imóvel foi validada e tirada com sucesso,
- **Quando** a jornada voltar para o contexto do aplicativo,
- **Então** o sistema MUST rastrear ativamente e extrair as coordenadas (GPS) de alta precisão via sensor de hardware.
- **E** nos casos extremos de lentidão do GPS (falta de visada do céu), o sistema SHALL solicitar que o corretor confirme o progresso ou cancele para não gerar dados falhos ou ruidosos.

### 2.3. Feedback Impositivo do Fluxo de Captura
- **Dado** que todos os recursos base (foto extraída, coordenadas cravadas) estão corretos e prontos para encapsulação,
- **Quando** o registro interno for salvo,
- **Então** o sistema MUST emitir um feedback visual óbvio (snack bar, modal, checkmark) confirmando a operação de inserção.
- **E** MUST fechar os painéis auxiliares devolvendo o usuário ao seu trabalho de mapa e dirigibilidade de forma fluida.
