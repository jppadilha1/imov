# Contexto da Conversa — ProspectHome MVP

> Este documento registra o raciocínio e decisões tomadas durante a fase de exploração do projeto.

## Cenário do Problema

O usuário (corretor de imóveis) deseja um aplicativo móvel que permita prospectar casas à venda de forma prática: ao dirigir pela cidade, ele simplesmente tira uma foto da fachada de uma casa com placa de venda. O app captura automaticamente a geolocalização (GPS) no momento da foto, salvando tudo localmente. Quando houver conexão com internet, o app sincroniza os dados com a nuvem, resolve o endereço via geocoding reverso, e permite visualizar todos os prospectos em um mapa interativo.

## Requisitos Levantados

1. **Geolocalização**: capturar coordenadas GPS no momento da foto
2. **Câmera**: tirar fotos de fachadas de imóveis rapidamente
3. **Funcionamento Offline**: toda captura funciona sem internet
4. **Autenticação por Usuário**: múltiplos corretores com dados isolados
5. **Mapa com Pins**: visualizar todos os prospectos georreferenciados
6. **Geocoding Reverso**: resolver endereço a partir de lat/lng quando online

## Decisões de Stack

| Componente | Tecnologia | Justificativa |
|-----------|------------|---------------|
| Framework Mobile | **Expo (React Native)** | SDK completo, Android-first, sem config nativa |
| Geolocalização | **expo-location** | Integração nativa via Expo SDK |
| Câmera | **expo-image-picker** | Câmera nativa do Android, UX familiar, mais simples que expo-camera |
| Cache Local | **expo-sqlite** | Leve, confiável, funciona offline |
| Armazenamento de Fotos (local) | **expo-file-system** | Fotos no filesystem, path salvo no SQLite |
| Compressão de Fotos | **expo-image-manipulator** | Redimensionar ~800px, qualidade 70-80% |
| Backend / Auth | **Supabase** | Auth, Postgres, Storage buckets, Edge Functions |
| Mapa | **react-native-maps** | Padrão para mapas em React Native |
| Background Sync | **Foreground sync no MVP** | Sync automático quando app aberto + internet |

## Decisões de Arquitetura

### Armazenamento de Fotos
- **Decisão**: Fotos salvas no filesystem do device via `expo-file-system`, com apenas o **path** armazenado no SQLite.
- **Razão**: SQLite fica leve, fotos acessíveis nativamente, padrão da indústria.
- **Alternativa descartada**: BLOB no SQLite (degrada performance rapidamente).

### Compressão de Fotos
- **Decisão**: Comprimir para ~800px de largura e qualidade 70-80% antes de salvar.
- **Razão**: Reduz de ~5MB para ~200KB por foto. Suficiente para ver fachadas.
- **Ferramenta**: `expo-image-manipulator` (trata orientação EXIF automaticamente).

### Sincronização
- **Decisão**: Sync automático em **foreground** (quando app aberto e com internet).
- **Razão**: Background sync com `expo-task-manager` tem limitações (timeout, consumo de bateria). Para MVP, foreground sync é mais confiável.
- **Futuro (v2)**: Background sync via `expo-task-manager` + WorkManager.

### Autenticação Offline — Dois Níveis de Acesso
- **Decisão**: Separar funcionalidades que precisam de internet das que não precisam.
- **Modo Offline**: Tirar foto, capturar GPS, preencher notas, ver prospectos locais.
- **Modo Online**: Mapa com pins, sincronização, geocoding, login/refresh de token.
- **Token expirado + offline**: App permite uso das funcionalidades offline usando o `user_id` do JWT salvo localmente. Ao voltar online, faz refresh automático.

### Geocoding Reverso
- **Decisão**: Via **Database Trigger** no Supabase que chama uma **Edge Function**.
- **Razão**: Desacoplamento total — app só faz INSERT, Supabase cuida do geocoding nos bastidores via Nominatim (OpenStreetMap, grátis).
- **Alternativa descartada**: Chamar Edge Function direto do app (gera acoplamento).

### Logout com Dados Pendentes
- **Decisão**: Antes de limpar dados locais no logout, **avisar** o usuário se há prospectos não sincronizados.
- **Razão**: Evitar perda de dados capturados offline.

## Modelo de Dados

### SQLite (Local)
```
session
├── user_id: text
├── access_token: text
├── refresh_token: text
├── email: text
└── nome: text

prospectos
├── id: text (uuid)
├── user_id: text
├── foto_path: text
├── latitude: real
├── longitude: real
├── endereco: text? (resolvido via geocoding)
├── notas: text?
├── status: text ("novo" | "contatado" | "negociando")
├── sync_status: text ("pending" | "synced")
├── created_at: text
└── remote_id: text? (id no Supabase após sync)
```

### Supabase (Postgres)
```
corretores (via Supabase Auth profiles)
├── id: uuid (PK)
├── email: text
├── nome: text
└── created_at: timestamp

prospectos
├── id: uuid (PK)
├── corretor_id: uuid (FK → corretores)
├── foto_url: text (URL no Storage bucket)
├── latitude: float8
├── longitude: float8
├── endereco: text?
├── bairro: text?
├── notas: text?
├── status: text
└── created_at: timestamp

Storage bucket: "fotos"
path: {corretor_id}/{prospecto_id}.jpg
```

## Telas do MVP

1. **Login** — email/senha via Supabase Auth
2. **Home/Mapa** — mapa interativo com pins dos prospectos (requer online)
3. **Câmera/Captura** — tira foto + GPS + formulário rápido (funciona offline)
4. **Lista de Prospectos** — lista com status e sync status (funciona offline)
5. **Detalhe do Prospecto** — foto + endereço + notas (acessível via pin no mapa)

## Auto-Avaliação e Correções Aplicadas

| Decisão Original | Correção | Razão |
|-------------------|----------|-------|
| `expo-camera` | → `expo-image-picker` | Mais simples, usa câmera nativa, UX melhor para captura rápida |
| Background sync automático | → Foreground sync (MVP) | Mais confiável, evita timeout e consumo de bateria |
| Edge Function chamada pelo app | → Database Trigger + Edge Function | Desacoplamento total |
| _(não previsto)_ | Aviso de dados pendentes no logout | Evitar perda de dados |
| _(não previsto)_ | Tratamento de orientação EXIF | `expo-image-manipulator` trata automaticamente |

## Padrões de Arquitetura (adicionado após revisão)

### Decisão: Clean Architecture + DDD + SOLID
- **Razão**: Garantir manutenibilidade, testabilidade e escalabilidade mesmo no MVP.
- **Clean Architecture**: 4 camadas — Domain (zero deps), Application (Use Cases), Infrastructure (SQLite/Supabase/Expo), Presentation (React Native telas/hooks).
- **DDD**: Entities (`Prospecto`, `Corretor`), Value Objects (`Coordinates`, `Address`, `PhotoPath`, `ProspectoStatus`, `SyncStatus`), Repository Interfaces no domínio, Use Cases como ações de negócio.
- **SOLID**: Cada módulo com responsabilidade única; interfaces de repositório permitem trocar implementações sem alterar Use Cases; DI container manual (sem framework).
- **DI**: Container manual em `di/container.ts` — wiring simples, sem framework de injeção de dependência.
- **Regra de Dependência**: Presentation → Application → Domain ← Infrastructure. O Domain nunca importa nada de fora.
