# ProspectHome 🏠📍

O **ProspectHome** é um aplicativo mobile projetado para corretores de imóveis realizarem a prospecção de imóveis em campo de forma ultra-rápida. O foco é a praticidade: o corretor fotografa uma fachada e o app captura automaticamente a localização exata, centralizando tudo em um mapa interativo.

## ⚙️ Arquitetura Híbrida e Sincronização
O projeto utiliza uma abordagem híbrida para garantir que o trabalho não pare, independente da qualidade da conexão:
- **Online-first com Supabase:** Por padrão, os dados são persistidos diretamente na nuvem para disponibilidade imediata.
- **Resiliência com SQLite:** Caso o corretor esteja em uma zona de sombra (sem sinal), o app utiliza o `expo-sqlite` para armazenar o prospecto localmente.
- **Sincronização Inteligente:** O app monitora o estado da rede e realiza o upload dos dados pendentes assim que a conexão é reestabelecida.

## Metodologia: Spec-Driven Development (SDD)
Este projeto foi um "hands-on" prático de metodologias modernas de engenharia:
- **OpenSpec:** A estrutura do projeto e os contratos de dados foram guiados por uma especificação formal.
- **IA-Enhanced Workflow:** Utilizei ferramentas de IA para validar a especificação e acelerar o desenvolvimento de fluxos e componentes, garantindo que o código final fosse fiel à `spec` original.

## Principais Funcionalidades
- **Captura Inteligente:** Foto + GPS automático para reduzir o tempo de digitação.
- **Persistência Local:** Banco SQLite interno para lidar com quedas de conexão.
- **Mapa de Prospecção:** Visualização clara de todos os imóveis registrados em um mapa real.
- **Interface Fluida:** Navegação moderna utilizando `expo-router` e feedback tátil com `expo-haptics`.

## Stacks
- **Framework:** Expo (SDK 54) & React Native.
- **Backend:** Supabase (Auth, Database e Storage).
- **Banco Local:** Expo SQLite.
- **Navegação:** Expo Router (File-based routing).
- **Geolocalização:** Expo Location & React Native Maps.
