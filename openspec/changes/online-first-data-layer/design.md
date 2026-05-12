## Context

Hoje o `DIContainer` injeta `SQLiteProspectoRepository` direto em produção. Use cases (`ListProspectosUseCase`, `useProspectoDetail`, etc) usam essa única fonte. `SyncProspectosUseCase` lida com itens `pending` mas o app nunca lê dados remotos diretamente. Como `pullUpdates` foi adicionada recentemente (change `prospecto-detail-edit`), agora há um caminho de sincronização Supabase→SQLite, mas continua sendo "SQLite é a verdade", apenas com refresh periódico.

A intenção do produto é diferente: **app online = Supabase como fonte de verdade**, com SQLite servindo como (1) cache para leituras offline e (2) fila de escritas pendentes feitas offline.

Constraints: zero breaking changes nos use cases existentes (eles continuam recebendo `IProspectoRepository`); zero novas libs; preserva compatibilidade com modo mock (dev/test).

## Goals / Non-Goals

**Goals:**
- Repositório híbrido transparente: use cases não sabem se estão lendo de Supabase ou SQLite
- Cache automático: toda leitura online grava em SQLite para acesso offline futuro
- Fila offline: escritas offline ficam `pending` e sincronizam ao voltar online
- Trigger automático: ao detectar reconexão, sincroniza pending sem intervenção do usuário
- Mantém modo dev/test com mocks intacto

**Non-Goals:**
- Conflito de versão remoto/local (last-write-wins é aceitável no MVP)
- Delete offline com replicação remota posterior (delete offline é local-only no MVP)
- Sincronização incremental por timestamp (pull traz tudo sempre, simples)
- Detecção de rede em camadas finas (granularidade: por operação, baseado em snapshot atual)

## Decisions

### D1: Padrão Hybrid Repository (wrapper) vs Repositórios separados injetados nos use cases

Opção rejeitada: use cases recebem 2 repositórios + network e decidem em runtime. Resultado: lógica de routing espalhada por todos os use cases, viola DRY.

Opção escolhida: `HybridProspectoRepository implements IProspectoRepository` encapsula `local`, `remote`, `network`. Use cases continuam recebendo `IProspectoRepository` único. Toda lógica de routing fica concentrada em um lugar.

### D2: `SupabaseProspectoRepository` separado vs reaproveitar `SupabaseSyncGateway`

`SupabaseSyncGateway` tem `uploadProspecto` e `pullUpdates` — não é um `IProspectoRepository` completo. Adicionar `findById`, `findAll`, `delete` ao gateway misturaria responsabilidades (gateway era de sync, não de CRUD).

Decisão: criar `SupabaseProspectoRepository` que reusa o mapper `mapRowToProspecto` (extraído pra função utilitária ou duplicado por simplicidade). `SupabaseSyncGateway` continua existindo, mas `pullUpdates` pode ser eventualmente removido pois `findAll` no repositório remoto faz o mesmo.

### D3: Cache write-through em leituras online

Quando `HybridProspectoRepository.findAll()` busca do Supabase, cada resultado é persistido em SQLite (`local.save`). Custo: 1 write SQLite por item, mas garante que dados ficam disponíveis offline imediatamente após primeira visualização online.

Alternativa rejeitada: cache lazy (só popula quando muda). Mais complexo, sem ganho relevante no MVP.

### D4: Network check uma vez por operação (não por item)

`findAll()` checa `network.isConnected()` UMA vez no início e usa esse valor para toda a operação. Se rede cair no meio, operação continua na rota escolhida (offline) e pode falhar — aceitável.

### D5: Hook `useNetworkSync` no root layout

O trigger de sync deve rodar uma única vez por sessão (mount/unmount do listener). Colocar em `app/_layout.tsx` garante isso. O hook:
1. No mount: checa se online, se sim chama `SyncProspectosUseCase.execute()`
2. Subscreve `network.addListener` para reagir a transições offline→online

### D6: Mocks continuam idênticos

`MockProspectoRepository` em dev mode não muda — não precisa de versão híbrida (não há Supabase real para fallback). Modo mock = sempre mock. Modo produção = híbrido.

## Risks / Trade-offs

- **Latência percebida em listagem online** → cada `findAll` faz round-trip Supabase. Mitigation: SQLite cache faz UI parecer rápida em segundas visitas; loading spinner cobre primeira.
- **Inconsistência cache vs remoto** → se usuário fica online com cache desatualizado, lê do remoto e atualiza. Race: durante a operação, dados locais podem ser sobrescritos. Aceitável (last-write-wins).
- **Pending items locais com mesmo ID que remoto** → upload pode dar conflict. Já mitigado pelo `upsert` no `SupabaseSyncGateway.uploadProspecto`.
- **Delete offline** → não propaga remoto. Trade-off conhecido: aceita até a próxima change de "delete sync". Item permanece no Supabase, será recriado em SQLite no próximo pull. **Recomendação**: bloquear delete offline com erro claro, ou aceitar comportamento de "ressurreição" do item.
- **`useNetworkSync` em root layout** → pode disparar sync durante navigation/render. Mitigation: usar `useRef` para garantir único sync em flight; ignorar trigger se já há sync em andamento.
