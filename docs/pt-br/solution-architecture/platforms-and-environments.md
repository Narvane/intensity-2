# Plataformas e Ambientes

Este documento descreve onde o Intensity roda — plataformas de execução, ambientes de implantação e padrões de uso de dispositivos. É escrito para arquitetos e engenheiros seniores que planejam infraestrutura e distribuição do cliente.

---

## Curta

O Intensity roda em **duas plataformas**: um **cliente mobile** (iOS e Android via Capacitor) e um **servidor centralizado** (API + PostgreSQL). Não há cliente web. **Local** emparelha API em localhost com servidor de desenvolvimento Vite ou builds em emulador; **produção** executa API e banco de dados em Docker em uma VPS enquanto clientes chamam a API HTTPS pública das lojas de apps.

---

## Média

### Plataformas de execução

| Plataforma | Papel | Instâncias |
|------------|-------|------------|
| **Cliente mobile** | UI completa do produto, fluxos, ritual de sorteio, sessão local | Uma instalação por dispositivo do participante |
| **Servidor** | API REST + PostgreSQL co-localizado | Ambiente de produção único |

**Topologia:** muitos clientes mobile → uma API REST → um banco de dados. Sem sincronização peer-to-peer, sem CDN, sem message broker.

### Padrões de uso de dispositivos

| Modo | Padrão de dispositivo |
|------|----------------------|
| **Experiências** | Cada participante usa seu próprio celular para registrar ideias |
| **Caixa de Experiências** | Ritual em grupo (navegar caixinhas, convidar, excluir, sortear, revelar) em **um celular compartilhado**; contribuições podem vir de dispositivos separados |

Aceitação de convite e contribuição individual acontecem em dispositivos pessoais; o ritual de sorteio assume co-presença em uma tela compartilhada.

### Ambientes

| Ambiente | Cliente | API | Banco de dados |
|----------|---------|-----|----------------|
| **Local** | Servidor dev Vite ou build debug Capacitor | `localhost:8080` | PostgreSQL via Docker Compose |
| **Produção** | Builds de loja (AAB/IPA) | HTTPS na VPS | Container PostgreSQL na mesma VPS |

Nenhum ambiente de staging dedicado na arquitetura baseline.

### Requisitos de runtime

- Mobile: iOS e Android na versão atual menos duas versões principais
- Servidor: VPS Linux, Docker 24+, Docker Compose v2
- Rede obrigatória para todas as operações persistidas (sem baseline offline)

---

## Detalhada

### Plataforma mobile

O cliente é um **app híbrido**: UI React em shell WebView Capacitor com assets estáticos embutidos após build. Capacidades nativas usadas minimamente: ciclo de vida do app, barra de status, splash screen, preferências locais (idioma, flag de onboarding).

Distribuição exclusivamente via **Google Play** (AAB) e **Apple App Store** (IPA). Sem sideload ou distribuição PWA web.

Deep links para **URLs de convite** resolvem no app instalado (Universal Links / App Links) ou solicitam instalação da loja se ausente.

### Plataforma servidor

Processo JVM único (Spring Boot) atrás de reverse proxy (Caddy ou equivalente) terminando TLS. PostgreSQL 16 co-localizado na stack Compose em uma VPS.

Escalonamento horizontal não é baseline — arquitetura aceita API de instância única com caminho de evolução futura documentado em decisões arquiteturais.

### Topologia de desenvolvimento local

```
Máquina do desenvolvedor
├── client/     npm run dev → browser :5173
├── api/        spring-boot:run → :8080
└── docker      postgres → :5432

Opcional: Capacitor copy → emulador Android (10.0.2.2:8080) ou dispositivo (IP LAN)
```

Variável de ambiente `VITE_API_URL` aponta cliente para API local ou de produção no build.

### Topologia de produção

```
Lojas de apps → Clientes mobile
                ↓ HTTPS REST
           VPS (Docker Compose)
             ├── reverse proxy :443
             ├── container API :8080
             └── container PostgreSQL
```

Deploy disparado por webhook após CI enviar imagem ao registry.

### O que está explicitamente ausente

Cliente web, BaaS, Kubernetes, VPS de staging, CDN, WebSockets, gRPC, GraphQL, sincronização multi-dispositivo em tempo real durante sorteio.

## Decisões assumidas nesta reescrita

- Deep links de convite são **preocupação de plataforma mobile** (App Links / Universal Links).
- Fluxos de exclusão de caixinha e convite exigem rede; sem fila offline na baseline.
