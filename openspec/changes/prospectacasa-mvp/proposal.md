# ProspectaCasa MVP — Proposal

## Summary

Aplicativo móvel para corretores de imóveis prospectarem casas à venda de forma rápida e prática. O corretor dirige pela cidade, tira fotos de fachadas com placa de venda, e o app captura automaticamente o GPS. Funciona 100% offline para captura, sincroniza com a nuvem quando há internet, e exibe todos os prospectos em um mapa interativo.

## Problem

Corretores de imóveis passam horas percorrendo bairros em busca de imóveis à venda. Atualmente, registram essas informações de forma manual (caderno, WhatsApp, planilha), perdendo contexto, localização exata, e organização. Não existe uma ferramenta prática que permita:
- Capturar um prospecto com **um toque** (foto + localização)
- Funcionar **sem internet** (áreas sem cobertura)
- Organizar prospectos por **localização no mapa**
- Resolver **endereços automaticamente** a partir do GPS

## Solution

App mobile (Expo/React Native, Android-first) com:
- **Captura offline**: foto + GPS salvos localmente (SQLite + FileSystem)
- **Sync automático**: quando online, dados sobem para Supabase (Postgres + Storage)
- **Geocoding reverso automático**: Supabase Edge Function + Nominatim resolve endereços
- **Mapa interativo**: pins de todos os prospectos, acessível quando online
- **Autenticação**: Supabase Auth (email/senha) com suporte offline

## Architecture Principles

O projeto adota três pilares de engenharia de software para garantir manutenibilidade, testabilidade e escalabilidade:

### Clean Architecture (4 camadas)
- **Domain**: Entidades, Value Objects, interfaces de repositório — zero dependência de frameworks
- **Application**: Use Cases que orquestram regras de negócio
- **Infrastructure**: Implementações concretas (SQLite, Supabase, FileSystem, APIs externas)
- **Presentation**: Telas React Native, hooks, componentes visuais

### Domain-Driven Design (DDD)
- **Entities**: `Prospecto`, `Corretor` — objetos com identidade
- **Value Objects**: `Coordinates`, `Address`, `PhotoPath`, `ProspectoStatus`, `SyncStatus` — imutáveis, sem identidade
- **Repositories**: Interfaces no domínio, implementações na infra
- **Use Cases**: Um por ação de negócio (`CaptureProspecto`, `SyncProspectos`, etc.)

### SOLID
- **S**ingle Responsibility: cada classe/módulo tem uma única razão para mudar
- **O**pen/Closed: interfaces de repositório permitem trocar implementações sem alterar Use Cases
- **L**iskov Substitution: `SQLiteProspectoRepository` e `SupabaseProspectoRepository` implementam a mesma interface
- **I**nterface Segregation: interfaces focadas (ex: `IProspectoReader` vs `IProspectoWriter` se necessário)
- **D**ependency Inversion: Use Cases dependem de abstrações (interfaces), nunca de implementações concretas

## Scope

### In Scope (MVP)
- Login/cadastro com email/senha (Supabase Auth)
- Captura de foto com GPS automático (offline)
- Compressão de fotos (800px, 70-80% quality)
- Armazenamento local (SQLite + FileSystem)
- Sync automático em foreground (quando online)
- Mapa com pins dos prospectos (online)
- Lista de prospectos com status e sync status
- Detalhe do prospecto (foto + endereço + notas)
- Acesso ao detalhe via pin no mapa
- Geocoding reverso via Database Trigger + Edge Function
- Dois níveis de acesso (offline limitado / online completo)
- Aviso de dados pendentes antes de logout

### Out of Scope (Futuro)
- Background sync (v2)
- Suporte iOS
- Compartilhamento de prospectos entre corretores
- Notificações push
- Busca/filtro avançado de prospectos
- Fotos múltiplas por prospecto
- Integração com CRM imobiliário

## Success Criteria

1. Corretor consegue tirar foto e capturar GPS **sem internet** em < 5 segundos
2. Dados sincronizam automaticamente quando o app está aberto e com internet
3. Endereço é resolvido automaticamente após sync
4. Mapa exibe todos os prospectos com pins clicáveis
5. Dados são isolados por corretor (autenticação)
6. Código segue Clean Architecture — Use Cases não conhecem SQLite nem Supabase
