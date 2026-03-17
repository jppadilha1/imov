# ProspectHome MVP — Design de Interfaces

> Especificação de UI/UX para Android-first (Expo/React Native).
> Material Design 3 · Touch-first · Offline-capable.

---

## Mobile Design Commitment

```
📱 MOBILE DESIGN COMMITMENT

Projeto: ProspectHome MVP
Plataforma: Android-first (Expo/React Native)

1. Default que NÃO vou usar:
   └── FAB fixo bottom-right para captura — a captura é a ação MAIS
       frequente, então terá TAB dedicada (melhor discoverability)

2. Foco específico deste projeto:
   └── Captura ultra-rápida (<5s foto+GPS), feedback offline explícito,
       mapa interativo com pins clicáveis

3. Diferenças de plataforma:
   └── Android: Material 3, Roboto, ripple, 48dp targets, bottom nav 80dp,
       system back via predictive back

4. Otimização de performance:
   └── Lista de prospectos (FlatList memoizado, getItemLayout),
       mapa com clustering para muitos pins

5. Desafio único:
   └── Corretor usa o app DIRIGINDO (parado) — precisa capturar com mínimo
       de toques, sem depender de internet em áreas sem cobertura
```

---

## MFRI Assessment (Mobile Feasibility & Risk Index)

| Dimensão | Score | Justificativa |
|---|---|---|
| Platform Clarity | **5** | Android-first, Expo/React Native — definido |
| Accessibility Readiness | **4** | Targets 48dp, labels, contraste semântico |
| Interaction Complexity | **2** | Fluxos simples: foto→salvar, lista, mapa |
| Performance Risk | **3** | Mapa com muitos pins, lista com fotos |
| Offline Dependence | **3** | Captura 100% offline, mapa só online |

**MFRI = (5 + 4) − (2 + 3 + 3) = +1** → Risky — Precisa atenção em performance do mapa e offline UX.

---

## Arquitetura de Navegação

### Decisão: Bottom Navigation (3 tabs) + Stack

```
Justificativa:
├── 3 destinos top-level de importância equivalente
├── Corretor alterna frequentemente: mapa ↔ captura ↔ lista
├── Sessões curtas e frequentes (no campo)
└── 3 tabs = ideal para bottom navigation Android
```

### Estrutura

```
app/
├── _layout.tsx              ── Root Layout (Auth Guard + Providers)
├── (auth)/
│   ├── login.tsx            ── Tela de Login
│   └── register.tsx         ── Tela de Registro
└── (tabs)/
    ├── _layout.tsx          ── Tab Navigator (3 tabs)
    ├── map.tsx              ── Tab 1: Mapa
    ├── capture.tsx          ── Tab 2: Captura (ação primária)
    └── list/
        ├── index.tsx        ── Tab 3: Lista de Prospectos
        └── [id].tsx         ── Detalhe (stack dentro da tab)
```

### Bottom Navigation

```
┌─────────────────────────────────────────┐
│                                         │
│             Content Area                │
│                                         │
├─────────────────────────────────────────┤
│    🗺️         📷          📋           │ ← 80dp height
│   Mapa      Captura      Lista         │
│            (destaque)                   │
└─────────────────────────────────────────┘

Regras:
├── 3 tabs, labels sempre visíveis
├── Tab "Captura" com ícone maior/destaque (ação primária)
├── Active: filled icon + indicator pill (M3)
├── Badge no tab "Lista": contador de pendentes de sync
├── Cada tab preserva seu stack de navegação
```

### Deep Linking

```
prospecthome://login
prospecthome://map
prospecthome://capture
prospecthome://list
prospecthome://list/{id}
```

---

## Telas

### 1. Login

```
┌─────────────────────────────────────────┐
│              Status Bar                 │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│           🏠 ProspectHome               │  ← Logo/nome, Display Medium (45sp)
│                                         │
│       Encontre imóveis rapidamente      │  ← Body Large (16sp), OnSurfaceVariant
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  📧  Email                       │  │  ← Outlined TextField, 56dp height
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🔒  Senha                   👁️  │  │  ← Outlined TextField + toggle visibilidade
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │           ENTRAR                  │  │  ← Filled Button, 56dp, Primary
│  └───────────────────────────────────┘  │
│                                         │
│        Não tem conta? Criar conta       │  ← Text Button, 48dp touch target
│                                         │
└─────────────────────────────────────────┘
```

**Decomposição:**
| Aspecto | Decisão |
|---|---|
| Ação primária | Botão "Entrar" na zona do polegar (bottom half) |
| Touch targets | TextField 56dp, Button 56dp, link "Criar conta" 48dp |
| Feedback | Loading spinner no botão + disable durante request |
| Erro | Snackbar com mensagem de erro + haptic error |
| Offline | Desabilitado com OfflineBanner no topo |
| Keyboard | `KeyboardAvoidingView`, textFields acima do teclado |

---

### 2. Registro

```
┌─────────────────────────────────────────┐
│  ←  Criar Conta                         │  ← Top App Bar, Small (64dp)
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  👤  Nome                        │  │  ← Outlined TextField
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  📧  Email                       │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🔒  Senha                   👁️  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🔒  Confirmar Senha         👁️  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │         CRIAR CONTA               │  │  ← Filled Button, 56dp
│  └───────────────────────────────────┘  │
│                                         │
│         Já tem conta? Entrar            │
│                                         │
└─────────────────────────────────────────┘
```

**Decomposição:**
| Aspecto | Decisão |
|---|---|
| Back | ← arrow no Top App Bar + system back (Android) |
| Validação | Inline errors abaixo de cada campo (error state M3) |
| Senha | Mínimo 6 chars, confirmação em tempo real |
| Offline | Desabilitado com OfflineBanner |

---

### 3. Mapa (Tab 1 — Home)

```
┌─────────────────────────────────────────┐
│  ProspectHome                    🔄     │  ← Top App Bar, Small + sync icon
├─────────────────────────────────────────┤
│                                         │
│  🟡  ─────────────────────────────────  │  ← OfflineBanner (se offline)
│  │   Modo Offline — mapa indisponível │  │
│  ──────────────────────────────────────  │
│                                         │
│         ┌──────────────────────┐        │
│         │                      │        │
│         │    📍  📍            │        │
│         │         📍           │        │  ← MapView (react-native-maps)
│         │   📍        📍      │        │
│         │              📍     │        │
│         │       📍    📍      │        │
│         │                      │        │
│         └──────────────────────┘        │
│                                         │
│  Callout (ao tocar pin):                │
│  ┌───────────────────────────────────┐  │
│  │  [foto]  Rua Augusta, 1234       │  │  ← Card com thumbnail + endereço
│  │          Consolação - Novo  🟡    │  │  ← Bairro + status badge
│  │          Ver detalhes →          │  │  ← Navega para Detalhe
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│    🗺️         📷          📋           │
│   Mapa      Captura      Lista         │
└─────────────────────────────────────────┘
```

**Decomposição:**
| Aspecto | Decisão |
|---|---|
| Ação primária | Tocar pin → callout → navega para Detalhe |
| Offline | Banner explícito + map desabilitado, sugere ir para Lista |
| Performance | Clustering para >50 pins (evita render de centenas) |
| Gestos | Pinch-to-zoom (nativo do mapa), tap em pin |
| Callout | Card com thumbnail da foto (48dp height), tap target ≥48dp |
| Sync | Ícone 🔄 no Top App Bar mostra se há sync em andamento |

---

### 4. Captura (Tab 2 — Ação Primária)

```
┌─────────────────────────────────────────┐
│  Nova Captura                           │  ← Top App Bar, Small
├─────────────────────────────────────────┤
│                                         │
│                                         │
│  Estado Inicial:                        │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │           📷                      │  │  ← Ícone grande (96dp)
│  │                                   │  │
│  │     Toque para fotografar         │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │       TIRAR FOTO                  │  │  ← Filled Button, 56dp, Primary
│  └───────────────────────────────────┘  │  ← Na thumb zone!
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  📍 Aguardando GPS...            │  │  ← Status do GPS (Label Medium)
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│    🗺️         📷          📋           │
│   Mapa      Captura      Lista         │
└─────────────────────────────────────────┘

───────── APÓS foto capturada ─────────

┌─────────────────────────────────────────┐
│  Nova Captura                     ✕     │  ← X para descartar
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │    [Preview da foto capturada]    │  │  ← Image, max 60% da tela
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  📍 -23.5505, -46.6333                  │  ← Coordinates (Body Medium)
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  📝  Notas (opcional)            │  │  ← Outlined TextField, multiline
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │          SALVAR                   │  │  ← Filled Button, 56dp
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │        TIRAR OUTRA               │  │  ← Tonal Button, 56dp
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│    🗺️         📷          📋           │
│   Mapa      Captura      Lista         │
└─────────────────────────────────────────┘
```

**Decomposição:**
| Aspecto | Decisão |
|---|---|
| Ação primária | "TIRAR FOTO" na thumb zone — ação em <2 toques |
| Fluxo | Foto → preview + GPS auto → notas opcionais → Salvar |
| Offline | **Funciona 100% offline** — sem banner, sem restrição |
| GPS | Status visível: "Obtendo GPS..." → "📍 -23.xx, -46.xx" |
| Descartar | ✕ no Top App Bar com confirmação ("Descartar foto?") |
| Feedback | Haptic success ao salvar + Snackbar "Prospecto salvo!" |
| Performance | Foto comprimida (800px, 70-80%) antes de salvar |
| Touch targets | Botões 56dp, áreas de toque ≥48dp |

---

### 5. Lista de Prospectos (Tab 3)

```
┌─────────────────────────────────────────┐
│  Prospectos                        🔍   │  ← Top App Bar + busca futura
├─────────────────────────────────────────┤
│                                         │
│  🟡 3 pendentes de sincronização        │  ← Info chip (se houver pendentes)
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  ┌────┐  Rua Augusta, 1234       │  │  ← ProspectoCard
│  │  │foto│  Consolação              │  │  ← Thumbnail 56x56dp + info
│  │  │    │  Novo 🟢   Pending 🟡   │  │  ← Status + SyncBadge
│  │  └────┘  11/03/2026              │  │  ← Data
│  └───────────────────────────────────┘  │
│                                         │  ← 8dp spacing entre cards
│  ┌───────────────────────────────────┐  │
│  │  ┌────┐  -23.5505, -46.6333     │  │  ← Sem endereço = mostra coords
│  │  │foto│                          │  │
│  │  │    │  Contatado 🔵  Synced ✅ │  │
│  │  └────┘  10/03/2026              │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  ┌────┐  Rua Consolação, 567    │  │
│  │  │foto│  Pinheiros               │  │
│  │  │    │  Negociando 🟠 Synced ✅ │  │
│  │  └────┘  09/03/2026              │  │
│  └───────────────────────────────────┘  │
│                                         │
│        (FlatList com pull-to-refresh)   │
│                                         │
├─────────────────────────────────────────┤
│    🗺️         📷         📋 (3)       │  ← Badge de pendentes
│   Mapa      Captura      Lista         │
└─────────────────────────────────────────┘
```

**Decomposição:**
| Aspecto | Decisão |
|---|---|
| Componente de lista | FlatList com `React.memo` + `useCallback` + `keyExtractor={item.id}` |
| Item height | Fixo ~80dp → usar `getItemLayout` para scroll performance |
| Tap target | Card inteiro é clicável (touch ≥48dp), ripple effect |
| Offline | **Funciona offline** — dados locais, fotos do filesystem |
| Pull-to-refresh | Sim — trigger manual de sync (se online) |
| Empty state | Ilustração + "Nenhum prospecto ainda. Capture o primeiro!" |
| Badge | Tab "Lista" mostra contador de pendentes no tab icon |

### ProspectoCard (componente)

```
┌──────────────────────────────────────────┐
│  ┌──────┐                                │
│  │      │  Título (endereço ou coords)   │  → Title Medium (16sp, Medium)
│  │ foto │  Subtítulo (bairro)            │  → Body Medium (14sp)
│  │      │  [Status] [SyncBadge]  Data    │  → Label Medium (12sp)
│  └──────┘                                │
└──────────────────────────────────────────┘

Thumbnail: 56×56dp, corner radius 8dp
Card: Elevated, corner radius 12dp, padding 12dp
Height total: ~80dp
```

### Status Badges

```
🟢 Novo        → PrimaryContainer + OnPrimaryContainer
🔵 Contatado   → SecondaryContainer + OnSecondaryContainer
🟠 Negociando  → TertiaryContainer + OnTertiaryContainer
🟣 Fechado     → SurfaceVariant + OnSurfaceVariant

Sync:
🟡 Pending     → amarelo sutil
✅ Synced       → verde sutil
🔴 Error       → ErrorContainer
```

---

### 6. Detalhe do Prospecto (Stack dentro da tab Lista)

```
┌─────────────────────────────────────────┐
│  ←  Detalhes                   ⋮        │  ← Top App Bar + overflow menu
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │       [Foto em tamanho maior]     │  │  ← Image, aspect ratio ~16:9
│  │                                   │  │     Tap para fullscreen
│  └───────────────────────────────────┘  │
│                                         │
│  📍 Rua Augusta, 1234                   │  ← Headline Small (24sp)
│     Consolação                          │  ← Body Large (16sp), OnSurfaceVariant
│                                         │
│  ──────────────────────────────────     │
│                                         │
│  Status                                 │  ← Label Large
│  ┌────────┬───────────┬──────────┐      │
│  │  Novo  │ Contatado │Negocian. │      │  ← Chips de filter (StatusSelector)
│  └────────┴───────────┴──────────┘      │     32dp height, touch area 48dp
│                                         │
│  Notas                                  │  ← Label Large
│  ┌───────────────────────────────────┐  │
│  │  Casa de esquina, portão azul...  │  │  ← Outlined TextField, multiline
│  └───────────────────────────────────┘  │
│                                         │
│  Informações                            │
│  📅  11/03/2026 às 14:32               │  ← Data de criação
│  📍  -23.5505, -46.6333               │  ← Coordenadas
│  🔄  Sincronizado ✅                   │  ← Sync status
│                                         │
│  ┌───────────────────────────────────┐  │
│  │          SALVAR ALTERAÇÕES        │  │  ← Filled Button, 56dp
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│    🗺️         📷          📋           │
│   Mapa      Captura      Lista         │
└─────────────────────────────────────────┘

Overflow menu ( ⋮ ):
├── Abrir no mapa
└── Excluir prospecto (destructive → confirmation dialog)
```

**Decomposição:**
| Aspecto | Decisão |
|---|---|
| Back | ← arrow + system back → retorna para Lista (preserva posição) |
| Edição | Status via chips, notas via TextField — botão Salvar |
| Overflow | ⋮ menu com "Abrir no mapa" + "Excluir" (com dialog confirmation) |
| Foto | Tap na foto → fullscreen modal com pinch-to-zoom |
| Offline | Funciona offline (dados locais), "Abrir no mapa" requer online |
| Destructive | Excluir: dialog "Tem certeza?" + haptic warning |

---

## Componentes Compartilhados

### OfflineBanner

```
┌─────────────────────────────────────────┐
│  ⚠️  Modo Offline — algumas funções     │  ← SurfaceVariant bg, 48dp height
│      indisponíveis                      │     Body Small (12sp)
└─────────────────────────────────────────┘

Aparece em: Login, Registro, Mapa
NÃO aparece em: Captura, Lista, Detalhe (funcionam offline)
```

### SyncBadge

```
 🟡 Pendente    → chip amarelo sutil
 ✅ Sincronizado → chip verde sutil
 🔴 Erro        → chip vermelho + retry icon
```

### StatusSelector (Chips)

```
┌────────┬───────────┬──────────┬─────────┐
│  Novo  │ Contatado │Negocian. │ Fechado │   ← Filter chips (M3)
└────────┴───────────┴──────────┴─────────┘
Height: 32dp, touch area: 48dp
Chip selecionado: filled + check icon
```

---

## Paleta de Cores (Material 3 Seed)

```
Seed Color: #2E7D32 (Green 800 — associa com imóveis/casas)

Light Theme:
├── Primary:            #2E6B30
├── OnPrimary:          #FFFFFF
├── PrimaryContainer:   #B0F4AF
├── Surface:            #FBFDF7
├── SurfaceVariant:     #DEE5D8
├── OnSurface:          #1A1C18
├── OnSurfaceVariant:   #43483E
├── Error:              #BA1A1A

Dark Theme:
├── Primary:            #95D895
├── OnPrimary:          #003A05
├── PrimaryContainer:   #17521B
├── Surface:            #1A1C18
├── SurfaceVariant:     #43483E
├── OnSurface:          #E2E3DC
├── OnSurfaceVariant:   #C3C8BC
├── Error:              #FFB4AB
```

---

## Tipografia

```
Font: Roboto (system default Android)

Display Medium:   45sp  → Logo na tela de Login
Headline Small:   24sp  → Endereço no Detalhe
Title Large:      22sp  → Títulos de seção
Title Medium:     16sp  → Nomes no ProspectoCard
Body Large:       16sp  → Texto principal
Body Medium:      14sp  → Texto secundário
Body Small:       12sp  → Captions, OfflineBanner
Label Large:      14sp  → Botões
Label Medium:     12sp  → Chips, badges
```

---

## Spacing & Grid

```
Base: 8dp grid

4dp   → Spacing interno de componentes
8dp   → Espaçamento mínimo entre elementos
12dp  → Padding interno de cards
16dp  → Margens laterais da tela (phone compact)
24dp  → Espaçamento entre seções
```

---

## Fluxos de Interação

### Fluxo Principal: Capturar Prospecto

```
[Abre app] → [Tab Captura]
    → toca "TIRAR FOTO" (1 toque)
    → câmera nativa abre
    → tira foto (1 toque)
    → volta ao app com preview + GPS automático
    → (opcional) preenche notas
    → toca "SALVAR" (1 toque)
    → haptic success + snackbar "Prospecto salvo!"
    → tela reseta para estado inicial

Total: 3 toques mínimos (abrir foto + capturar + salvar)
Tempo: <5 segundos
Internet: NÃO necessária
```

### Fluxo: Consultar Prospectos no Mapa

```
[Tab Mapa] → mapa carrega com todos os pins (online)
    → toca em um pin
    → callout aparece (foto + endereço)
    → toca "Ver detalhes"
    → navega para tela Detalhe
    → ← back volta para Mapa (preserva zoom/position)
```

### Fluxo: Sync Automático

```
[App aberto + internet disponível]
    → useSync() detecta NetInfo online
    → SyncProspectosUseCase.execute()
    → upload de pendentes (foto + dados)
    → pull de updates (endereços resolvidos)
    → badge na tab Lista atualiza
    → snackbar "3 prospectos sincronizados"
```

### Fluxo: Logout com Pendentes

```
[Toca em avatar/configurações]
    → menu com opção "Sair"
    → Se há pendentes:
        Dialog: "Você tem 3 prospectos não sincronizados.
                Se sair, eles serão perdidos.
                [ Cancelar ]   [ Sair mesmo assim ]"
    → haptic warning no dialog
```
