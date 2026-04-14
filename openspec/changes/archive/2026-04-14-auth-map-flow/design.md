## Context

O ProspectHome está em fase inicial de desenvolvimento. Atualmente, buscamos implementar o "Caminho Feliz" (Happy Path) de autenticação e visualização de dados. A arquitetura do projeto segue o padrão de Clean Architecture e DDD, utilizando o `tsyringe` para injeção de dependência.

## Goals / Non-Goals

**Goals:**
- Implementar o fluxo de Auth (Login/Cadastro) com UI premium.
- Implementar a visualização de mapa com pins e preview card.
- Garantir que a troca de Mock para Supabase seja uma mudança apenas de configuração no container de DI.
- Seguir fielmente os designs extraídos do Stitch.

**Non-Goals:**
- Implementação de integração real com Supabase nesta change (foco em Mocks).
- Recuperação de senha ou fluxos complexos de auth.
- Filtros avançados no mapa.

## Decisions

- **Auth Screens**: Utilizar telas separadas para Login e Registro (conforme `authentication_screen/screen.png`), mantendo a consistência visual em ambas.
- **Custom Map Preview**: Em vez de usar o `Callout` nativo do `react-native-maps` (que é limitado em estilo), implementaremos um componente React customizado que flutua sobre o mapa ao selecionar um pin, seguindo o design premium de `mapa_online_com_pins/screen.png`.
- **Reutilização de Domínio**: Verificação das entidades `Prospecto` e `Corretor` para garantir que atendem aos requisitos da UI (ex: URL da foto, status).
- **Mocking**: Utilizar `MockAuthGateway` e criar/ajustar um `MockProspectoRepository` caso o `SQLite` não seja ideal para o desenvolvimento rápido desta fase.
- **Tab Bar**: Garantir que as Tabs configuradas em `app/(tabs)/_layout.tsx` correspondam exatamente ao rodapé das imagens.

## Risks / Trade-offs

- **Mock Fidelity**: Dados mockados podem não refletir todas as restrições do Supabase (ex: constraints de unicidade de email), mas facilitam o desenvolvimento da UI paralelamente ao backend.
- **Complexidade de DI**: A introdução de múltiplos repositórios e casos de uso aumenta o boilerplate inicial, mas garante a escalabilidade exigida pelos princípios de Clean Architecture.
