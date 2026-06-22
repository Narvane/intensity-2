# Ferramentas

Este documento inventaria as linguagens, frameworks, bibliotecas e serviços externos usados para construir e executar o Intensity. É escrito para desenvolvedores e mantenedores que precisam de referência concreta da stack.

---

## Curta

O Intensity é um **monorepo** com `api/` (Java 21, Spring Boot 3.5, Maven, PostgreSQL 16, Flyway) e `client/` (Node 22, TypeScript 5.7, React 19, Vite 6, Capacitor 7). Produção roda em **VPS com Docker Compose**; CI usa **GitHub Actions** e **GHCR**. Releases mobile passam por **Google Play** e **App Store Connect**.

---

## Média

### Layout do repositório

```
intensity/
├── api/          API REST Java
├── client/       App mobile React + Capacitor
├── docs/         Documentação do produto
└── plano-desenvolvimento-ia.md  Plano de desenvolvimento IA (raiz do repo)
```

### Stack backend

| Ferramenta | Versão / papel |
|------------|----------------|
| Java | 21 |
| Spring Boot | 3.5.x |
| Maven | 3.9+ |
| Hibernate / JPA | ORM |
| Flyway | Migrações de schema |
| PostgreSQL | 16 |
| springdoc-openapi | Docs da API |
| JUnit 5 | Testes |

### Stack cliente

| Ferramenta | Versão / papel |
|------------|----------------|
| Node.js | 22 LTS |
| npm | 10+ |
| TypeScript | 5.7+ |
| React | 19 |
| Vite | 6 |
| Capacitor | 7 |
| Vitest | 3 (testes unitários opcionais) |

### Plugins Capacitor (baseline)

- `@capacitor/app` — ciclo de vida
- `@capacitor/status-bar` — estilo da barra de status
- `@capacitor/splash-screen` — splash de lançamento
- `@capacitor/preferences` — configurações locais

### Infraestrutura e entrega

| Ferramenta | Papel |
|------------|-------|
| Docker | Containers API e Postgres |
| Docker Compose v2 | Orquestração local e produção |
| GitHub Actions | CI: teste, build, push de imagem |
| GHCR | Registry de containers |
| Caddy (ou equivalente) | Reverse proxy TLS na VPS |
| Webhook de deploy | POST trigger na VPS após push de imagem |
| Google Play Console | Android AAB |
| Apple App Store Connect | iOS IPA |

### Superfícies de configuração

| Localização | Conteúdo |
|-------------|----------|
| `api/src/main/resources/application.yml` | Datasource, JWT, portas, profiles |
| VPS `.env` | Segredos (não versionados) |
| `client/.env.development` / `.env.production` | `VITE_API_URL` |
| `client/capacitor.config.ts` | App id, nome de exibição, `webDir` |

### Não usado (baseline)

BaaS, Kubernetes, React Native, KMP, message brokers, CDN, GraphQL, gRPC, WebSockets, serviços de atualização OTA, SDKs de analytics.

---

## Detalhada

### Ferramentas de desenvolvimento

- **JDK 21** — compilar e executar API
- **Docker Desktop / Engine** — PostgreSQL local
- **Navegador moderno** — iteração primária de UI do cliente via Vite
- **Android Studio / Xcode** — builds assinados de loja e debug em dispositivo

### Saídas de build

| Artefato | Saída |
|----------|-------|
| API | Imagem Docker tagueada `latest` + git SHA |
| Bundle web do cliente | Assets estáticos `client/dist/` |
| Android | `.aab` via Gradle |
| iOS | `.ipa` via archive Xcode |

### Pastas de domínio da API (alinhamento DT-12)

```
api/src/.../
├── participante/
├── grupo/
├── convite/      ← módulo de convite
├── caixinha/
└── experiencia/
```

Cada pasta: `controller`, `service`, `repository`, `dto`, `entity`.

### Heurística de pastas do cliente (alinhamento DT-13)

Estrutura cognitiva: `Sistema → Domínio → Contexto → Capacidade → Caso de Uso → Implementação`

Exemplos de caminhos:

```
client/src/.../grupo/convite/GerarConviteUseCase.ts
client/src/.../caixinha/excluir/ExcluirCaixinhaUseCase.ts
client/src/.../sorteio/ExecutarSorteioUseCase.ts
```

### OpenAPI

springdoc expõe `/v3/api-docs` e Swagger UI em profiles não-produção para referência de contrato durante desenvolvimento do cliente.

### Ferramentas específicas de convite

Domínios de deep link configurados em:

- `android/app/src/main/AndroidManifest.xml` (intent filters)
- Entitlement Apple Associated Domains + `apple-app-site-association` na VPS

Sem SaaS de deep-link de terceiros na baseline.

## Decisões assumidas nesta reescrita

- Módulo **`convite/`** adicionado à estrutura de pastas da API.
- Hospedagem de deep link usa VPS existente + arquivo estático Caddy ou endpoint de redirect da API.
