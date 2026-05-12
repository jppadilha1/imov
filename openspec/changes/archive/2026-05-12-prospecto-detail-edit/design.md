## Context

Tela `[id].tsx` tem 4 problemas: (1) `StatusSelector` ignora cor por valor — todos os chips usam verde mesmo, independente do estado; (2) o menu `MoreVertical` não faz nada — status pode ser alterado a qualquer momento sem intenção; (3) notas (`prospecto.notes`) existem no domínio mas não têm campo editável — só aparecem como read-only se existirem; (4) após sync, `photoPath` ainda aponta pro arquivo local enquanto Supabase tem URL pública — a imagem não carrega em dispositivos sem o arquivo.

Constraint: zero novas libs. Tudo com React Native nativo (`Alert`, `TextInput`, `StyleSheet`).

## Goals / Non-Goals

**Goals:**
- Chip de status mostra cor distinta por valor (novo=verde, contatado=azul, negociando=laranja, fechado=cinza)
- Modo visualização: status exibido como chip read-only colorido; `MoreVertical` abre menu com opção "Editar"
- Modo edição: `StatusSelector` interativo + `TextInput` para notes + botão "Salvar"
- Após `uploadProspecto`, `photoPath` local é atualizado com URL pública do Supabase Storage

**Non-Goals:**
- Pull de atualizações remotas (pullUpdates) — não altera lógica de pull
- Edição de outros campos (coordenadas, endereço, data)
- Histórico de mudanças de status

## Decisions

### D1: Edição via `Alert.alert` (ActionSheet nativo)

`Alert.alert` com botões simula ActionSheet sem novas libs. Chama `setIsEditing(true)` no callback. Alternativa (modal customizado) adicionaria complexidade sem benefício real no MVP.

### D2: `isEditing` state local em `[id].tsx`

Estado gerenciado no screen, não no hook. `useProspectoDetail` expõe `updateStatus` e `updateNotes` — ambos salvam imediatamente no SQLite. Em modo edição, `notesInput` é state local acumulado; só persiste no "Salvar". Alternativa (tudo no hook) acoplaria UI state ao hook desnecessariamente.

### D3: `updateNotes` recebe string, salva via `Prospecto.reconstruct`

Mesmo padrão de `updateStatus` já existente: reconstrói a entidade com campo alterado, chama `repository.save`. Nenhuma nova method no domínio necessária.

### D4: `uploadProspecto` retorna `{ remoteId: string; photoUrl: string }`

`SupabaseSyncGateway` já faz upload da foto e obtém URL pública. Hoje descarta esse valor. Mudar retorno de `string` para `{ remoteId, photoUrl }` é breaking change no contrato `ISyncGateway` mas afeta apenas dois implementadores (`SupabaseSyncGateway` e `MockSyncGateway`) e um único caller (`SyncProspectosUseCase`). Alternativa (campo separado no gateway) seria over-engineering.

### D5: `SyncProspectosUseCase` atualiza `photoPath` com URL do Supabase

Após `uploadProspecto` retornar `photoUrl`, o use case reconstrói o prospecto com novo `photoPath` antes de `markSynced`. Isso garante que `ProspectoCard` e detail screen usem a URL remota imediatamente após sync, sem precisar de pullUpdates.

### D6: Cores de status definidas como `Record` em `StatusSelector`

```ts
const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  novo:        { bg: '#e8f5e9', border: '#2e7d32', text: '#2e7d32' },
  contatado:   { bg: '#e3f2fd', border: '#1565c0', text: '#1565c0' },
  negociando:  { bg: '#fff3e0', border: '#e65100', text: '#e65100' },
  fechado:     { bg: '#eceff1', border: '#546e7a', text: '#546e7a' },
};
```

Chip ativo usa background sólido da cor; chip inativo usa background com 15% opacity. Mesmos valores de `ProspectoCard` para consistência visual.

## Risks / Trade-offs

- **`Alert.alert` comportamento diferente iOS/Android** → Mitigation: botões destrutivos ficam no índice certo; testar em ambos. No MVP, variações visuais são aceitáveis.
- **`photoPath` local perdido após sync** → `photoPath` no SQLite é substituído pela URL remota. Sem acesso offline à foto após sync. Risco aceito: MVP assume que após sync o dispositivo mantém conectividade suficiente para carregar imagem da URL.
- **Breaking change em `ISyncGateway`** → Afeta apenas implementadores conhecidos. Nenhuma lib externa depende do contrato. Custo de migração: 3 arquivos.
