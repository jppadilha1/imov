## 1. Domain & Infrastructure Verification

- [x] 1.1 Validar se a entidade `Prospecto` e `Corretor` possuem todos os campos necessários para as telas (ex: endereços, status, imagens).
- [x] 1.2 Verificar e ajustar o `MockAuthGateway` para suportar o fluxo unificado.
- [x] 1.3 Criar um `MockProspectoRepository` para fornecer dados estáticos consistentes com o design `mapa_online_com_pins/screen.png`.
- [x] 1.4 Garantir que os testes unitários fundamentais para os repositórios e gateways estejam passando.

## 2. Authentication Screen (Refinement)

- [x] 2.1 Ajustar `app/(auth)/login.tsx` para seguir exatamente o design de `authentication_screen/screen.png`.
- [x] 2.2 Ajustar `app/(auth)/register.tsx` para manter a mesma identidade visual da tela de login.
- [x] 2.3 Validar componentes de UI: Inputs com ícones, Botões, Logo central.

## 3. Map Screen & Tab Bar

- [x] 3.1 Revisar `app/(tabs)/map.tsx` e `_layout.tsx` para garantir que a Tab Bar combine com o design.
- [x] 3.2 Implementar/Ajustar os controles flutuantes (Busca, Zoom +/-, My Location) conforme `mapa_online_com_pins/screen.png`.
- [x] 3.3 Substituir o `Callout` nativo por um componente `ProspectPreviewCard` customizado e flutuante.
- [x] 3.4 Popular o mapa com pins provenientes do `MockProspectoRepository`.

## 4. UI Components & Polish

- [x] 4.1 Criar o componente `ProspectPreviewCard` com suporte a: Imagem, Badge de Status (NOVO), Endereço e Link de Detalhes.
- [x] 4.2 Adicionar animações suaves ao abrir o Preview Card.
- [x] 4.3 Garantir que o cabeçalho "ProspectHome" com ícone de Refresh esteja presente conforme o mockup.

## 5. Dependency Injection & Integration

- [x] 5.1 Atualizar `src/di/container.ts` para injetar os mocks em ambiente de desenvolvimento.
- [x] 5.2 Testar o fluxo completo ponta-a-ponta com dados mockados offline.
