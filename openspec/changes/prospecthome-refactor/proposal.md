# ProspectHome — Refatoração de Fidelidade UI e Testes

## Summary

Esta mudança foca na estabilização do MVP do ProspectHome, priorizando a fidelidade visual da interface com os designs exportados e a organização rigorosa da bateria de testes. Antes de prosseguir para a integração final com o Supabase, garantiremos que a experiência do usuário (UX) esteja impecável e que a base de código esteja sólida e bem testada em um ambiente mockado funcional.

## Problem

A implementação inicial apresentou os seguintes desafios:
- **Dispersão de Testes**: Arquivos `.spec.ts/tsx` estão espalhados pela estrutura de pastas, dificultando a manutenção e a execução focada.
- **Divergência Visual**: As telas atuais não refletem com precisão as especificações de design contidas na pasta `/stitch_export`.
- **Instabilidade das Mocks**: O estado atual das dependências mockadas impede o funcionamento pleno do aplicativo em modo de desenvolvimento local.

## Solution

1.  **Centralização de Testes**: Mover todos os testes unitários e mocks para uma estrutura centralizada em `__tests__/unit`, criando uma base clara para futuros testes de integração.
2.  **Refatoração de UI (Pixel Perfect)**: Atualizar todos os componentes e telas na camada de `Presentation` utilizando as imagens de referência em `/stitch_export` como fonte da verdade.
3.  **Estabilização de Dependências**: Corrigir bugs de compatibilidade entre as bibliotecas do Expo e as implementações mockadas dos Gateways e Serviços.

## Goals

1.  **Organização**: Todos os testes unitários consolidados em `__tests__/unit`.
2.  **Fidelidade**: Telas de Login, Captura, Lista e Detalhes 100% alinhadas ao design `/stitch_export`.
3.  **Funcionalidade Local**: App rodando perfeitamente com dados mockados no SQLite, permitindo simulação completa de fluxos offline.

## Scope

### In Scope
- Reestruturação da pasta `__tests__/` (subpasta `unit`).
- Refatoração de componentes `StyleSheet` para alinhar com o design visual.
- Correção de injeção de dependências no `di/container.ts` para o ambiente mockado.
- Atualização dos hooks de `Presentation` para garantir que o estado da UI reflita o design.

### Out of Scope
- Integrações reais com Supabase (serão tratadas na fase subsequente).
- Testes E2E com Maestro (ficarão para a fase de homologação final).

## Success Criteria

1.  Bateria de testes unitários passando 100% a partir da nova pasta centralizada.
2.  Interface visual indistinguível dos exports de design.
3.  Fluxo de captura fucionando localmente sem erros de dependência.
