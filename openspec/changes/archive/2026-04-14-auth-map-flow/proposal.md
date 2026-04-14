## Why

Esta mudança visa iniciar a implementação do fluxo principal do aplicativo ProspectHome, estabelecendo uma base sólida para autenticação e visualização de prospectos em um mapa. O objetivo é criar uma experiência de usuário premium que siga fielmente os designs fornecidos, garantindo ao mesmo tempo uma arquitetura limpa (Clean Architecture) que permita a transição fácil entre dados mockados e o backend final no Supabase.

## What Changes

- Refinamento e verificação da tela de autenticação (Login/Cadastro) baseada no design `authentication_screen/screen.png`. Nota: A tela deve ser unificada (mesma interface mudando campos conforme fluxo).
- Implementação/Verificação da tela de mapa com pins de prospectos mockados, garantindo a fidelidade ao design `mapa_online_com_pins/screen.png` (incluindo Tab Bar e controles flutuantes).
- Criação de uma prévia de prospecto premium (mini modal flutuante customizado) ao tocar em um pin no mapa, substituindo ou aprimorando o callout nativo.
- Verificação e reutilização da infraestrutura de domínio (`Prospecto`, `Corretor`) e moscas existentes.
- Garantia de funcionamento 100% offline com dados mockados.

## Capabilities

### New Capabilities
- `authentication`: Gerenciamento de login e cadastro de usuários, inicialmente com lógica mockada.
- `prospect-viewer`: Visualização de prospectos em um mapa interativo com suporte a prévias e detalhes.

### Modified Capabilities
- Nenhuma.

## Impact

- **UI/UX**: Novas telas e componentes seguindo o sistema de design do projeto.
- **Domínio**: Refinamento de entidades e contratos de repositório para suportar o fluxo de autenticação e visualização de prospectos.
- **Infraestrutura**: Novos repositórios baseados em memória/mocks para desenvolvimento rápido e testes.
