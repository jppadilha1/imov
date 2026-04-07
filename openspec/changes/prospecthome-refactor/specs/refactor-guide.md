# Spec: Refatoração de Testes e UI

## 1. Centralização de Testes
- O sistema MUST buscar todos os arquivos `.spec.ts/tsx` em `prospecthome/__tests__/unit`.
- O sistema SHALL NOT permitir que novos testes unitários sejam criados fora desta estrutura.

## 2. Fidelidade Visual
- Cada tela na camada de `Presentation` MUST ser comparada com as referências em `docs/stitch_export/`.
- O sistema SHOULD manter a consistência de cores (primária, secundária, estado de erro) em todo o app.

## 3. Estabilidade Mockada
- O app MUST funcionar localmente sem falhas de rede se o `MockAuthGateway` ou `MockSyncGateway` estiverem simulando timeouts ou sucessos.
- O sistema SHALL garantir que o SQLite esteja semeado com dados mínimos para teste da lista/mapa.
