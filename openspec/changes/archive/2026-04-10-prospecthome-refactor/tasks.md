# ProspectHome Refactor — Tasks

## Fase 1: Centralização de Infraestrutura e Testes

- [x] **1.1 Estrutura Unitária**
  - Criar `prospecthome/__tests__/unit` (com subpastas: `domain`, `application`, `infrastructure`, `presentation`, `mocks`).
  - Mover todos os arquivos `.spec.ts` e `.spec.tsx` espalhados pelo projeto para as respectivas subpastas.
  - Atualizar os caminhos relativos de importação em cada arquivo movido.
  - Executar a bateria de testes via `npm test` para garantir que o redirecionamento não quebrou nada.

- [x] **1.2 Mocks Compartilhados**
  - Criar `__tests__/unit/mocks/MockData.ts` para centralizar dados de teste (ex: prospectos falsos para a lista).
  - Atualizar os testes para consumirem estes mocks centralizados.

---

## Fase 2: Refatoração de UI (Stitch Export Fidelity)

- [x] **2.1 Tela de Autenticação (Login)**
  - Abrir `docs/stitch_export/authentication_screen` e comparar com `app/(auth)/login.tsx`.
  - Ajustar `StyleSheet`: cores primárias, proporção de botões, logotipo e sombras.
  - Validar margens e alinhamentos conforme o design.

- [x] **2.2 Fluxo de Captura**
  - Refatorar `app/(tabs)/capture.tsx` com base em `docs/stitch_export/nova_captura_updated_nav`.
  - Garantir que a barra de navegação superior esteja consistente com a imagem.
  - Implementar feedback visual (loading/sucesso) de acordo com o design.

- [x] **2.3 Lista e Detalhe de Prospectos**
  - Refatorar `app/(tabs)/list/index.tsx` e `ProspectoCard` baseados em `lista_de_prospectos_final_consistency_fix`.
  - Refatorar `app/(tabs)/list/[id].tsx` baseado em `docs/stitch_export/detalhe_do_prospecto`.
  - Ajustar chips de status e sync status (cores e ícones Lucide).

- [x] **2.4 Home / Mapa**
  - Refatorar `app/(tabs)/map.tsx` baseado em `mapa_online_com_pins`.
  - Ajustar visual do Callout e dos markers de clusterização.

---

## Fase 3: Estabilização do Ambiente Mockado

- [x] **3.1 Injeção de Dependências (DI)**
  - Revisar `di/container.ts` para garantir que `MockAuthGateway`, `MockSyncGateway` e `SQLiteProspectoRepository` estejam corretamente configurados no modo dev.
  - Resolver bugs de inicialização do SQLite que impedem a execução em modo offline.

- [x] **3.2 Mocking de Localização**
  - Ajustar o `MockLocationService` para fornecer dados estáveis no simulador se não houver acesso real ao GPS.

---

## Fase 4: Integração em Nuvem e Lançamento (Legacy Tasks)

- [x] **4.1 Setup Supabase e Gateways Reais**
  - Configurar Dashbaord, Auth, Storage e RLS.
  - Implementar e testar Drivers Supabase reais.
  - Atualizar DI para Gateways reais.

- [x] **4.2 Edge Functions & Triggers**
  - Criar Edge Function para Geocoding via Nominatim.
  - Configurar Database Webhooks.

- [x] **4.3 Testes E2E (Maestro) e EAS Build**
  - Criar fluxos Maestro para cenários complexos (offline/online).
  - Configurar EAS e realizar builds de homologação.
