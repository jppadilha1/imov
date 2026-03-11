# ProspectHome — Prompts para Stitch IA

> Prompts otimizados para gerar interfaces mobile no Stitch IA.
> Cada prompt gera uma tela/estado do app ProspectHome.

---

## Contexto global (copiar antes de cada prompt se necessário)

```
App Name: ProspectHome
Platform: Android mobile app (Material Design 3)
Purpose: Real estate prospecting app for brokers — capture house photos with GPS while driving, sync to cloud when online, view prospects on map.
Color Palette: Green seed (#2E7D32). Primary green tones, white surfaces, clean and professional.
Font: Roboto (Android system default)
Style: Clean, modern, Material Design 3 with rounded cards, subtle elevation, green accent color. Professional but not corporate — practical and field-ready.
Bottom Navigation: 3 tabs always visible — Map icon (left), Camera icon (center, highlighted), List icon (right). Labels below each icon.
```

---

## Prompt 1 — Tela de Autenticação (Login / Registro)

```
Idea
A mobile login screen for an Android real estate prospecting app called "ProspectHome".

Theme
Clean, minimal, Material Design 3. White background with green (#2E7D32) accent color. Roboto font. Professional and trustworthy feel, like a modern productivity tool for field workers.

Content
Centered vertically on the screen:
- App logo/icon at the top: a simple green house icon with a magnifying glass, small and elegant.
- App name "ProspectHome" in large text below the icon (bold, 32sp).
- A subtitle in lighter gray: "Prospecte imóveis com agilidade" (Prospect properties with agility).
- Two outlined text fields with rounded corners (Material 3 style):
  - First field: email icon on the left, placeholder "Email".
  - Second field: lock icon on the left, placeholder "Senha", eye toggle icon on the right.
- A large green filled button spanning full width: "ENTRAR" in white text.
- Below the button, a small text link in green: "Não tem conta? Criar conta".
- No bottom navigation bar on this screen (auth screen, not logged in).
- The overall layout is simple, vertically centered, with generous spacing between elements (24dp). The form should feel light and uncluttered, not cramped.
```

---

## Prompt 2 — Tela do Mapa (Home — Estado Online + Estado Offline)

### Prompt 2A — Mapa Online (com pins)

```
Idea
The main home screen of an Android real estate prospecting app called "ProspectHome", showing an interactive map with prospect pins.

Theme
Clean Material Design 3. White top bar, full-screen map below, green (#2E7D32) accent color. The map should feel alive and data-rich with multiple colored pins scattered across a city map.

Content
- Top app bar (small, white background): App name "ProspectHome" on the left, a small green circular sync icon spinning on the right.
- The map takes up the entire content area below the top bar, edge to edge. It shows a realistic city street map (like Google Maps) with 6-8 green map pins scattered across different locations representing houses being prospected.
- One pin is selected/tapped, showing a callout card floating above it:
  - The callout is a small white elevated card with rounded corners (12dp radius).
  - Inside the callout: a small square photo thumbnail on the left (house facade), and on the right the address "Rua Augusta, 1234" in bold, "Consolação" in lighter text below, and a small green badge "Novo" next to it.
  - A subtle "Ver detalhes →" text link at the bottom of the callout.
- Bottom navigation bar at the very bottom (Material Design 3 style, 80dp height, white background, thin top border):
  - 3 items evenly spaced:
    - Left: Map pin icon (filled/active, green with pill indicator), label "Mapa" below.
    - Center: Camera icon (slightly larger, outlined), label "Captura" below.
    - Right: List/document icon (outlined), label "Lista" below.
```

### Prompt 2B — Mapa Offline

```
Idea
The offline state of the map home screen for an Android app called "ProspectHome". The map is unavailable because there is no internet connection.

Theme
Muted, desaturated Material Design 3. The screen should clearly communicate "offline mode" through visual treatment — gray tones replacing the colorful map.

Content
- Top app bar (small, white background): App name "ProspectHome" on the left. On the right, a small gray wifi icon with a diagonal line through it (no connection indicator).
- The entire content area where the map would be is replaced by a flat, static, light gray (#E0E0E0) rectangle filling the full screen, representing a disabled/unavailable map. In the center of this gray area:
  - A large gray wifi-off icon (48dp, color #9E9E9E) with a slash through it.
  - Below it, text in medium gray: "Sem conexão" (No connection) in 16sp.
  - Below that, smaller text: "O mapa requer internet" (Map requires internet) in 14sp, lighter gray.
  - The gray map area is NOT interactive — it just sits there as a placeholder.
- Bottom navigation bar at the very bottom (same as online version):
  - 3 items evenly spaced:
    - Left: Map pin icon (filled/active, green with pill indicator), label "Mapa".
    - Center: Camera icon (outlined), label "Captura".
    - Right: List icon (outlined), label "Lista".
  - The bottom nav is still fully functional even when offline.
```

---

## Prompt 3 — Tela de Captura (Câmera + Modal de confirmação)

### Prompt 3A — Estado inicial (antes de tirar foto)

```
Idea
The camera/capture screen of an Android real estate prospecting app. This is the main action screen where the broker takes a photo of a house for sale.

Theme
Clean Material Design 3, white background, green (#2E7D32) accent. The screen should feel inviting and action-oriented — one clear call to action to take a photo. Works 100% offline.

Content
- Top app bar (small): "Nova Captura" title on the left.
- The content area is centered both vertically and horizontally with:
  - A large camera outline icon (72dp) in light gray at the center of the screen.
  - Below it, text "Toque para fotografar" in 16sp, medium gray.
  - Below that, generous spacing, then a large green filled button (full width with 16dp margins, 56dp height, rounded): "TIRAR FOTO" with a small camera icon on the left of the text. This button is positioned in the lower-middle area of the screen (thumb-friendly zone).
  - At the very bottom of the content area, above the nav bar, a small row with a location pin icon and text "📍 Aguardando GPS..." in 12sp green, showing the GPS is being acquired.
- Bottom navigation bar (same 3 tabs):
  - Left: Map pin icon (outlined), label "Mapa".
  - Center: Camera icon (filled/active, green indicator pill), label "Captura".
  - Right: List icon (outlined), label "Lista".
```

### Prompt 3B — Modal após captura (confirmação com foto)

```
Idea
A confirmation modal/bottom sheet that appears after the broker takes a photo in the ProspectHome Android app. The modal overlays the capture screen and shows the photo preview with metadata.

Theme
Material Design 3 bottom sheet / modal card. White background with rounded top corners (28dp radius), slight shadow/elevation. Green (#2E7D32) accent. The modal takes about 75% of the screen height, with a subtle dark scrim behind it.

Content
- At the top of the modal: a small drag handle bar (centered, 32dp wide, 4dp height, rounded, light gray).
- Below the handle: the captured photo preview taking about 40% of the modal height, displayed as a rounded-corner image (12dp radius) with 16dp horizontal margins. The photo shows a house facade.
- Below the photo, a row of metadata:
  - Clock icon + "11/03/2026 14:32" (auto-filled timestamp) in 14sp, medium gray.
  - Pin icon + "-23.5505, -46.6333" (GPS coordinates) in 14sp, medium gray.
- Below the metadata, an outlined multiline text field (Material 3 style):
  - Label: "Descrição do prospecto"
  - Placeholder: "Ex: Casa de esquina, portão azul, 2 andares..."
  - The field is about 3 lines tall.
- Below the text field, two buttons stacked vertically with 8dp gap:
  - Primary: Green filled button, full width: "SALVAR PROSPECTO" with a check icon.
  - Secondary: Outlined button, full width: "DESCARTAR" in gray text.
- The bottom navigation bar is still visible behind/below the modal scrim.
```

---

## Prompt 4 — Tela de Lista + Detalhe do Prospecto

### Prompt 4A — Lista de prospectos

```
Idea
A prospect list screen for an Android real estate prospecting app called "ProspectHome". Shows all captured house prospects as a scrollable list of cards.

Theme
Clean Material Design 3, white background, green (#2E7D32) accent. Cards with subtle elevation. The list should feel organized and scannable — each card shows key info at a glance. Works offline.

Content
- Top app bar (small): "Prospectos" title on the left, a search icon on the right (subtle, gray).
- Below the top bar, a small info chip in light yellow/amber: "🔄 3 pendentes de sincronização" (3 pending sync).
- A scrollable list of prospect cards, 3 or 4 visible, each card:
  - Elevated white card with 12dp rounded corners, full width with 16dp horizontal margins, 8dp vertical gap between cards.
  - Inside each card (horizontal layout):
    - Left: A small square photo thumbnail of a house facade (56x56dp, 8dp rounded corners).
    - Right of the photo:
      - Title (bold, 16sp): The address, e.g. "Rua Augusta, 1234".
      - Subtitle (14sp, gray): Neighborhood, e.g. "Consolação".
      - Bottom row: A small colored status chip (e.g. green "Novo", blue "Contatado", orange "Negociando") and a small sync badge (yellow "Pendente" or green checkmark "Sincronizado"), and the date "11/03/2026" in light gray 12sp on the far right.
  - Show 4 cards with different statuses to illustrate variety:
    - Card 1: "Rua Augusta, 1234" — Novo (green chip) — Pendente (yellow badge)
    - Card 2: "Av. Paulista, 900" — Contatado (blue chip) — Sincronizado (green check)
    - Card 3: "Rua Consolação, 567" — Negociando (orange chip) — Sincronizado (green check)
    - Card 4: coordinates shown instead of address "-23.550, -46.633" — Novo (green chip) — Pendente (yellow badge)
- Bottom navigation bar (same 3 tabs):
  - Left: Map pin icon (outlined), label "Mapa".
  - Center: Camera icon (outlined), label "Captura".
  - Right: List icon (filled/active, green indicator pill), label "Lista". A small red badge with number "3" on the list icon.
```

### Prompt 4B — Detalhe do prospecto (dentro da lista)

```
Idea
The prospect detail screen of an Android app called "ProspectHome". Shows full details of a single captured house prospect. This screen opens when tapping a card in the list, still keeping the bottom navigation visible.

Theme
Material Design 3, white background, green (#2E7D32) accent. Clean and informative layout. The photo is prominent at the top. Professional, practical design for a field worker reviewing their captures.

Content
- Top app bar (small): A back arrow on the left, title "Detalhes" in the center-left, and a three-dot overflow menu icon on the right.
- Below the top bar:
  - A large photo of a house facade, spanning full width with 16dp horizontal margins, rounded corners (12dp), aspect ratio roughly 16:10. The photo is prominent and large.
  - Below the photo (16dp padding):
    - Address in bold 22sp: "Rua Augusta, 1234".
    - Neighborhood in 16sp gray: "Consolação".
  - A thin horizontal divider line.
  - Section "Status" in 14sp medium weight:
    - A horizontal row of 4 filter chips (Material Design 3 style, 32dp height):
      - "Novo" (currently selected — filled green with white check icon)
      - "Contatado" (outlined, unselected)
      - "Negociando" (outlined, unselected)
      - "Fechado" (outlined, unselected)
  - Section "Descrição" in 14sp:
    - Text content: "Casa de esquina, portão azul, 2 andares. Proprietário parece motivado." in 14sp regular.
  - Section "Informações" in 14sp:
    - Row: calendar icon + "11/03/2026 às 14:32" in 14sp gray.
    - Row: pin icon + "-23.5505, -46.6333" in 14sp gray.
    - Row: sync icon + "Sincronizado ✅" in 14sp green.
  - If the device is offline, instead of "Sincronizado", show a tonal button: "🔄 Sincronizar quando online" in amber/yellow, indicating the prospect hasn't been synced yet.
- Bottom navigation bar (same 3 tabs, "Lista" tab active):
  - Left: Map pin icon (outlined), label "Mapa".
  - Center: Camera icon (outlined), label "Captura".
  - Right: List icon (filled/active, green indicator pill), label "Lista".
```

---

## Dicas de Uso no Stitch IA

1. **Cole o "Contexto global" junto com cada prompt** para manter consistência visual
2. **Gere a tela de Auth primeiro** — é a mais simples e estabelece a baseline visual
3. **Para o Mapa, gere 2A e 2B separadamente** — são estados diferentes da mesma tela
4. **Para a Captura, gere 3A primeiro**, depois 3B — a modal é um overlay sobre a tela base
5. **Para a Lista, gere 4A primeiro**, depois 4B — o detalhe é uma navegação a partir da lista
6. Se o Stitch permitir variantes da mesma tela, use 2A/2B e 3A/3B como variantes


**Resultado**: https://stitch.withgoogle.com/projects/12323329451796205356