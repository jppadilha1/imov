## Context

O app ProspectHome usa `@react-native-community/netinfo` para detectar conectividade. O hook `useNetwork` já expõe um booleano reativo, mas `INetworkService` (camada de domínio) só declara `isConnected(): Promise<boolean>`. O `useSync` tenta chamar `container.networkService.addListener()` — método que não existe na interface nem na implementação — resultando em erro em runtime.

O `SQLiteProspectoRepository` está completo e funcional, mas o container aponta para `MockProspectoRepository` (flag `useMock = true` hardcoded). O mapa (`map.tsx`) renderiza `MapView` incondicionalmente, sem qualquer fallback offline.

## Goals / Non-Goals

**Goals:**
- Corrigir o bug do `addListener` ausente na interface e implementação do `NetworkService`
- Exibir mensagem estática clara na tela do mapa quando offline, substituindo o `MapView`
- Introduzir constante `USE_REAL_DB` no container para alternar entre repositório mock e SQLite real
- Garantir que `useSync` reaja a transições de rede de forma confiável com o listener corrigido

**Non-Goals:**
- Integração real com Supabase (auth ou sync) — permanece mockado
- Background sync — fora do escopo desta change
- Persistência offline de sessão além do que já existe no `SQLiteSessionRepository`
- Qualquer alteração no schema do SQLite — migrations atuais são suficientes

## Decisions

### 1. `addListener` no domínio vs. na infraestrutura

**Decisão:** Adicionar `addListener(callback: (isConnected: boolean) => void): () => void` à interface `INetworkService` no domínio.

**Alternativa considerada:** Manter `addListener` apenas no `NetworkService` concreto e chamar diretamente da infra no `useSync` — violaria a Dependency Inversion (use case / hook dependeria de implementação concreta).

**Rationale:** Listeners de rede são parte do contrato do serviço. Adicionar ao domínio mantém o `useSync` testável via mock. A assinatura retorna um `unsubscribe` (função cleanup), padrão idêntico ao do NetInfo.

### 2. `USE_REAL_DB` como constante booleana no container

**Decisão:** Substituir o `useMock` genérico por uma constante nomeada `USE_REAL_DB: boolean` que controla especificamente o repositório de prospectos e, futuramente, outros repositórios SQLite. Auth e sync continuam forçadamente mockados.

**Alternativa considerada:** Env var via `expo-constants` / `.env` — adiciona complexidade de build desnecessária para MVP.

**Rationale:** Clareza de intenção. `USE_REAL_DB = false` significa dados em memória (dev/test rápido); `USE_REAL_DB = true` significa SQLite persistido. A separação evita que um único flag global vire "liga tudo ou desliga tudo".

### 3. Placeholder offline no mapa: substituição total vs. banner

**Decisão:** Substituir o `MapView` completamente quando offline, renderizando uma tela de placeholder com ícone `WifiOff` e texto orientativo.

**Alternativa considerada:** Mostrar o mapa com banner no topo — o mapa continua tentando tiles de rede e pode exibir região em branco ou erros. Confuso para o usuário.

**Rationale:** O mapa sem tiles é mais desorientador do que uma tela limpa. O placeholder guia o usuário para a ação possível (capturar). Quando a rede voltar, o `useNetwork` reativa e o mapa é exibido automaticamente via re-render.

### 4. MockSyncGateway permanece sem alteração

**Decisão:** Não criar `SupabaseSyncGateway` nessa change. O `MockSyncGateway` existente já serve como placeholder da integração futura.

**Rationale:** A change é sobre offline-first na UI e na camada de DI. A integração Supabase é uma change separada. Criar um stub incompleto agora só adiciona arquivos mortos.

## Risks / Trade-offs

- **[Risco] `USE_REAL_DB = true` em dev abre o SQLite real no dispositivo** → SQLite inicializa via `SQLiteClient.getDb()` que roda migrations automaticamente. Migrations são idempotentes (`CREATE TABLE IF NOT EXISTS`), sem risco de perda de dados em re-execuções.

- **[Trade-off] `addListener` no `INetworkService` aumenta a superfície da interface de domínio** → O domínio ganha uma dependência conceitual de "eventos de rede". Aceitável porque conectividade é um invariante do negócio (offline-first é um requisito central), não detalhe de infraestrutura.

- **[Risco] `useNetwork` (hook React) e `NetworkService` (infra) detectam rede por caminhos diferentes** → Ambos usam NetInfo. Para consistência, `useNetwork` pode ser refatorado para consumir o `container.networkService.addListener()` no lugar de chamar NetInfo diretamente — mas isso é melhoría futura, não bloqueio.

## Migration Plan

1. Atualizar `INetworkService` com `addListener`
2. Implementar `addListener` em `NetworkService` usando `NetInfo.addEventListener`
3. Adicionar `addListener` mock no `MockNetworkService` (se existir nos testes)
4. Atualizar `useSync` para usar o listener via container (já era a intenção do código atual)
5. Adicionar constante `USE_REAL_DB` no container e condicionar o `prospectoRepository`
6. Modificar `map.tsx` para importar `useNetwork` e renderizar o placeholder quando offline

Rollback: todas as mudanças são aditivas ou substituições de comportamento inativo. Reverter é um simples git revert.
