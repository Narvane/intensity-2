# Integrações e Comunicação

Este documento descreve como os componentes do Intensity se comunicam — protocolos, fluxos de dados, contratos e direções de dependência. É escrito para arquitetos e engenheiros seniores que integram ou estendem o sistema.

---

## Curta

O cliente mobile conversa com a API via **REST sobre HTTPS** (request/response, iniciado pelo cliente). A API conversa com PostgreSQL via **persistência ORM**. Não há **push do servidor**, **WebSockets** nem **caminho direto cliente-para-banco de dados**. Convites usam links HTTPS resolvidos pelo SO mobile no app. Consistência é **eventual** — clientes atualizam na leitura.

---

## Média

### Mapa de integração

```
Cliente mobile ──REST (HTTPS)──► API ──JPA/Hibernate──► PostgreSQL
     │                              │
     └── sem DB direto              └── único gateway de persistência
```

| Integração | Protocolo | Direção |
|------------|-----------|---------|
| Cliente → API | REST JSON | Cliente inicia |
| API → DB | SQL via ORM | Apenas API |
| Cliente → folha de compartilhamento do SO | Ponte nativa | Compartilhamento de convite de saída |
| Deep link → Cliente | App/Universal Links | Abertura de convite de entrada |

### Modelo de sincronização

**Consistência eventual baseada em pull.** Quando um participante adiciona uma experiência do celular, outros clientes veem na próxima leitura da API. O ritual em celular compartilhado busca o pool de experiências da API imediatamente antes do sorteio.

Sem notificações ao vivo quando dados mudam. Sem sincronização multi-dispositivo durante sorteio — um celular mantém estado de sorteio localmente.

### Fluxos-chave

**Autenticação**

```
Cliente POST /auth/login { email, password }
  ← { token, participantId, displayName }
Cliente armazena token localmente para requisições subsequentes
```

**Login conjunto (Caixa de Experiências)**

```
Cliente POST /auth/grupo { credentials[] }
  ← { token(s), groupId, members[] }
  OU 409 se credenciais abrangem grupos incompatíveis
```

**Ciclo de vida de convite**

```
POST /grupos/{id}/convites        → { code, linkToken, expiresAt }
GET  /convites/validar?code=      → { groupPreview, expiresAt, status }
POST /convites/{id}/aceitar       → { groupId, membership confirmed }
DELETE /convites/{id}             → revogado
```

**Registro de experiência (modo Experiências)**

```
Cliente coleta entrada do assistente localmente
POST /caixinhas/{id}/experiencias { description, intensity, params, reflection }
  ← experiência persistida com selo
```

**Exclusão de caixinha (modo Caixa de Experiências)**

```
DELETE /caixinhas/{id}
  ← 204; remove experiências em cascata no servidor
Cliente atualiza GET /grupos/{id}/caixinhas
```

**Ritual de sorteio (sem escrita na API)**

```
GET /caixinhas/{id}/experiencias → pool
Cliente filtra, randomiza, revela localmente
(sem POST para resultado de sorteio)
```

### Contrato de erro

Erros REST retornam `{ code, message }` com status HTTP apropriado. Cliente mapeia para copy voltada ao usuário. Casos críticos:

| Status | Cenário |
|--------|---------|
| 401 | Token inválido ou expirado |
| 403 | Não é membro do grupo |
| 404 | Caixinha, grupo ou convite não encontrado |
| 409 | Conflito de membresia de grupo no login conjunto |
| 410 | Convite expirado ou revogado |
| 422 | Falha de validação (tamanho do nome, faixa de intensidade) |

---

## Detalhada

### Esboço de recursos REST

| Recurso | Operações |
|---------|-----------|
| `/auth/login` | POST participante único |
| `/auth/grupo` | POST sessão conjunta multi participante |
| `/participantes` | POST registrar |
| `/grupos` | GET listar para participante; POST implícito via auth |
| `/grupos/{id}/membros` | GET; DELETE self (sair) |
| `/grupos/{id}/convites` | POST criar; GET listar ativos |
| `/convites/validar` | GET por código ou token |
| `/convites/{id}/aceitar` | POST |
| `/convites/{id}` | DELETE revogar |
| `/grupos/{id}/caixinhas` | GET listar |
| `/caixinhas` | POST criar |
| `/caixinhas/{id}` | DELETE (cascata) |
| `/caixinhas/{id}/experiencias` | GET listar; POST criar |
| `/experiencias/{id}` | PUT atualizar; DELETE (apenas autor) |

Prefixo de versão `/v1` implícito; mudanças breaking exigem `/v2` conforme decisões técnicas.

### Contrato de link de convite

Formato de deep link (ilustrativo):

```
https://app.intensity.example/join?t={linkToken}
```

SO mobile roteia para app instalado → cliente chama `GET /convites/validar?t=` → tela de prévia.

Caminho por código: usuário insere `AB12CD` → `GET /convites/validar?code=AB12CD`.

Ambos os canais resolvem o mesmo registro de convite.

### Segurança na rede

- TLS em todo lugar em produção
- Bearer token em requisições autenticadas
- Tokens armazenados em armazenamento seguro do cliente (Capacitor Preferences ou wrapper de keystore da plataforma)
- Sem credenciais em links de convite — token é opaco, de propósito único

### Integrações explicitamente ausentes

Gateways de pagamento, SDKs de analytics, serviços de push notification (FCM/APNs), IdP externo (OAuth), pipeline de assets CDN, filas de mensagens, webhooks do cliente.

### Webhook operacional (camada de engenharia)

Deploy da API de produção usa webhook de entrada do CI — documentado na camada de engenharia, não é integração de produto.

## Decisões assumidas nesta reescrita

- Validação de convite é um **GET somente leitura** antes do POST de aceitar.
- Login conjunto retorna **409** quando credenciais pertencem a grupos existentes diferentes.
- Exclusão de caixinha é **REST síncrono** com cascata no servidor.
