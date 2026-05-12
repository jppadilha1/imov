# Spec: Prospecto Edit Mode

## ADDED Requirements

### Requirement: StatusSelector exibe cor distinta por valor de status
O componente `StatusSelector` em `components/StatusSelector.tsx` SHALL exibir cada chip com cor correspondente ao valor do status: novo=verde (#2e7d32), contatado=azul (#1565c0), negociando=laranja (#e65100), fechado=cinza (#546e7a). Chip ativo usa background sólido da cor; chip inativo usa background semi-transparente da mesma cor.

#### Scenario: Chip com status "novo" exibido
- **WHEN** `StatusSelector` renderiza com qualquer `currentStatus`
- **THEN** o chip "novo" SHALL ter `borderColor` e `color` verde (#2e7d32)
- **THEN** se ativo, background SHALL ser sólido verde; se inativo, background SHALL ser verde com 15% opacity

#### Scenario: Chip com status "contatado" exibido
- **WHEN** `StatusSelector` renderiza com qualquer `currentStatus`
- **THEN** o chip "contatado" SHALL ter `borderColor` e `color` azul (#1565c0)

#### Scenario: Chip com status "negociando" exibido
- **WHEN** `StatusSelector` renderiza com qualquer `currentStatus`
- **THEN** o chip "negociando" SHALL ter `borderColor` e `color` laranja (#e65100)

#### Scenario: Chip com status "fechado" exibido
- **WHEN** `StatusSelector` renderiza com qualquer `currentStatus`
- **THEN** o chip "fechado" SHALL ter `borderColor` e `color` cinza (#546e7a)

### Requirement: Tela de detalhes exibe status como chip read-only em modo visualização
Em `app/(tabs)/list/[id].tsx`, quando `isEditing === false`, o status do prospecto SHALL ser exibido como um único chip colorido read-only (não interativo), usando as mesmas cores de `STATUS_COLORS`. O `StatusSelector` interativo NÃO SHALL ser exibido no modo visualização.

#### Scenario: Modo visualização — chip de status read-only
- **WHEN** `isEditing` é `false`
- **THEN** a tela SHALL exibir um chip com label e cor correspondente ao `prospecto.status.value`
- **THEN** o chip NÃO SHALL responder a toques (read-only)
- **THEN** `StatusSelector` NÃO SHALL ser renderizado

#### Scenario: Modo edição — StatusSelector interativo
- **WHEN** `isEditing` é `true`
- **THEN** a tela SHALL renderizar `StatusSelector` com `currentStatus` e `onChange={updateStatus}`
- **THEN** tocar em um chip SHALL chamar `updateStatus` com o novo valor

### Requirement: Menu MoreVertical abre ActionSheet com opção "Editar"
O botão `MoreVertical` na AppBar de `[id].tsx` SHALL abrir um `Alert.alert` com ao menos a opção "Editar" que ativa o modo edição (`isEditing = true`). Em modo visualização, o botão SHALL ser o único meio de entrar no modo edição.

#### Scenario: MoreVertical pressionado em modo visualização
- **WHEN** usuário pressiona `MoreVertical` com `isEditing === false`
- **THEN** SHALL ser exibido um `Alert.alert` com opção "Editar"
- **THEN** ao escolher "Editar", `isEditing` SHALL ser `true`

#### Scenario: MoreVertical pressionado em modo edição
- **WHEN** usuário pressiona `MoreVertical` com `isEditing === true`
- **THEN** o comportamento é implementation-defined (pode ignorar, pode mostrar "Cancelar edição")

### Requirement: Notes exibido e editável na tela de detalhes
`useProspectoDetail` SHALL expor `updateNotes(text: string): Promise<void>` que reconstrói e persiste o prospecto com novo valor de `notes`. Em `[id].tsx`, notes SHALL ser sempre visível (não condicionalmente): em modo visualização exibe texto read-only; em modo edição exibe `TextInput` multilinha com o conteúdo atual.

#### Scenario: updateNotes persiste no SQLite
- **WHEN** `updateNotes("novo texto")` é chamado
- **THEN** SHALL chamar `container.prospectoRepository.save` com prospecto reconstruído com `notes = "novo texto"`
- **THEN** o state `prospecto` SHALL ser atualizado com o novo valor

#### Scenario: Notes em modo visualização
- **WHEN** `isEditing === false` e `prospecto.notes` tem valor
- **THEN** a tela SHALL exibir o texto das notes como `Text` read-only

#### Scenario: Notes em modo edição — TextInput
- **WHEN** `isEditing === true`
- **THEN** a tela SHALL exibir `TextInput` multilinha com `value` igual a `notesInput` (state local)
- **THEN** digitar no `TextInput` SHALL atualizar apenas `notesInput` (sem salvar imediatamente)

### Requirement: Botão "Salvar" persiste status e notes em modo edição
Em modo edição (`isEditing === true`), a tela SHALL exibir botão "Salvar" que chama `updateNotes(notesInput)` e seta `isEditing = false`. O status é salvo em tempo real ao selecionar no `StatusSelector` (comportamento mantido de `updateStatus`).

#### Scenario: Botão "Salvar" pressionado
- **WHEN** usuário pressiona "Salvar" em modo edição
- **THEN** SHALL chamar `updateNotes(notesInput)`
- **THEN** `isEditing` SHALL ser `false`

#### Scenario: Salvar com notes vazio
- **WHEN** usuário limpa o `TextInput` e pressiona "Salvar"
- **THEN** `updateNotes("")` SHALL ser chamado
- **THEN** `prospecto.notes` SHALL ser `""` no SQLite
