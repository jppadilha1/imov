## 1. StatusSelector — cores por valor

- [x] 1.1 Em `components/StatusSelector.tsx`, adicionar `STATUS_COLORS` map com cores para novo (verde #2e7d32), contatado (azul #1565c0), negociando (laranja #e65100), fechado (cinza #546e7a)
- [x] 1.2 Substituir estilos fixos `chipActive`/`chip` por estilos dinâmicos usando `STATUS_COLORS[opt]` — chip ativo com background sólido, inativo com `+26` opacity (hex) no background

## 2. useProspectoDetail — adicionar updateNotes

- [x] 2.1 Em `hooks/useProspectoDetail.ts`, adicionar método `updateNotes(text: string): Promise<void>` que reconstrói o prospecto com `notes: text` e chama `container.prospectoRepository.save`

## 3. Tela [id].tsx — modo edição

- [x] 3.1 Adicionar import de `TextInput` e `Alert` em `app/(tabs)/list/[id].tsx`
- [x] 3.2 Adicionar state `isEditing` (boolean, inicia `false`) e `notesInput` (string, inicia com `prospecto.notes ?? ''`) na tela
- [x] 3.3 Implementar handler `openMenu` que chama `Alert.alert` com opção "Editar" → `setIsEditing(true)`; conectar ao botão `MoreVertical`
- [x] 3.4 Na seção STATUS: substituir `<StatusSelector>` por chip read-only colorido quando `!isEditing`, e renderizar `<StatusSelector>` interativo quando `isEditing`; status salvo imediatamente ao selecionar via `updateStatus`
- [x] 3.5 Na seção DESCRIÇÃO: sempre exibir a seção; mostrar `<Text>` read-only quando `!isEditing`, mostrar `<TextInput>` multilinha quando `isEditing`
- [x] 3.6 Adicionar botão "Salvar" visível apenas quando `isEditing === true`; ao pressionar: chama `updateNotes(notesInput)` e `setIsEditing(false)`
- [x] 3.7 Destruturar `updateNotes` de `useProspectoDetail` na tela

## 4. SyncProspectosUseCase — sync bidirecional

- [x] 4.1 Em `src/application/use-cases/SyncProspectosUseCase.ts`, adicionar chamada a `pullUpdates` após fazer upload dos items pending
- [x] 4.2 Após `pullUpdates`, persistir cada prospecto retornado no SQLite via `prospectoRepository.save`
- [x] 4.3 Capturar exceções do pull silenciosamente (pull failure é non-fatal)
- [x] 4.4 Em `__tests__/unit/application/use-cases/SyncProspectosUseCase.spec.ts`, adicionar teste: após upload, `pullUpdates` é chamado com userId
