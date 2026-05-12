## Why

A tela de detalhes do prospecto tem quatro inconsistências que prejudicam o uso real: status sem cores por valor, edição de status sempre visível (deveria ser via menu), sem campo editável de notas, e imagem exibida com path local mesmo após sync — o Supabase tem a URL pública mas ela não volta ao SQLite local.

## What Changes

- **Status com cores por valor**: `StatusSelector` ganha cores distintas por estado (novo=verde, contatado=azul, negociando=laranja, fechado=cinza), espelhando o `ProspectoCard`
- **Modo edição via menu**: tela `[id].tsx` ganha `isEditing` state; `MoreVertical` abre `ActionSheet` com opção "Editar". Em modo visualização: status exibido como chip colorido read-only. Em modo edição: `StatusSelector` interativo + campo de notes editável + botão "Salvar"
- **Notes editável**: `useProspectoDetail` expõe `updateNotes(text)`; detail screen mostra `TextInput` para notes em modo edição, texto read-only em modo visualização
- **Sync bidirecional**: `SyncProspectosUseCase` passa a chamar `pullUpdates` após fazer upload dos items pending — SQLite fica sincronizado com Supabase, garantindo que edições feitas em outro dispositivo aparecem na listagem

## Capabilities

### New Capabilities
- `prospecto-edit-mode`: Modo edição de prospecto na tela de detalhes, acessível via menu MoreVertical — permite alterar status e notes; view mode exibe status colorido como chip read-only

### Modified Capabilities
- `supabase-sync`: `SyncProspectosUseCase` chama `pullUpdates` após upload para manter SQLite sincronizado com Supabase

## Impact

- **Arquivos modificados**: `components/StatusSelector.tsx`, `app/(tabs)/list/[id].tsx`, `hooks/useProspectoDetail.ts`, `src/application/use-cases/SyncProspectosUseCase.ts`
- **Sem novos arquivos**: tudo dentro de componentes e hooks existentes
- **Dependência**: `ActionSheet` via `Alert` (React Native nativo) — zero novas libs
