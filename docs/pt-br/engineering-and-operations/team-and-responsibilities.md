# Equipe e Responsabilidades

Este documento descreve quem constrói e mantém o Intensity — papéis, limites de propriedade e expectativas operacionais. É escrito para contribuidores, stakeholders e futuros membros da equipe.

---

## Curta

O Intensity é mantido por um **mantenedor solo** que é dono de backend, frontend, banco de dados, infraestrutura, releases e suporte de ponta a ponta. Não há equipe separada de DevOps, QA ou plataforma. Credenciais de VPS, lojas, GitHub e banco de dados ficam apenas com o mantenedor.

---

## Média

### Modelo operacional

| Aspecto | Modelo |
|---------|--------|
| Tamanho da equipe | Um mantenedor primário |
| Autoridade de decisão | Mantenedor para produto, arquitetura e stack |
| On-call / SLA | Melhor esforço; sem SLA formal |
| Code review | Auto-revisão + revisão externa opcional em PRs |

### Papéis consolidados

O mantenedor cobre simultaneamente:

- **Desenvolvedor backend** — API, lógica de domínio, Flyway, testes
- **Desenvolvedor frontend** — UI React, Capacitor, casos de uso do cliente
- **DBA** — design de schema, migrações, consciência de backup
- **Infra ops** — VPS, Docker, TLS, webhook de deploy
- **Release manager** — submissões de loja, bumps de versão
- **Security ops** — segredos, atualizações de dependências, gerenciamento de allowlist
- **Suporte** — problemas de usuário, resposta a incidentes

### Mapa de propriedade

| Área | Dono | Notas |
|------|------|-------|
| `api/` | Mantenedor | Incluindo novo `convite` e exclusão em cascata |
| `client/` | Mantenedor | Incluindo UX de convite e confirmações de exclusão |
| VPS / Docker | Mantenedor | Uptime de produção |
| Dados PostgreSQL | Mantenedor | Backups via provedor VPS ou snapshot manual |
| GitHub / CI | Mantenedor | Secrets Actions, token de webhook |
| Play Console / App Store | Mantenedor | Chaves de assinatura, metadados de listagem |
| Allowlist de registro | Mantenedor | Portão de e-mail para novos participantes |
| `docs/` | Mantenedor | Sincronização de documentação do produto |

### Custódia de credenciais

**Nunca em builds do cliente ou git:**

- Senhas de banco de dados
- Segredos de assinatura JWT
- Chaves SSH da VPS
- Chaves de assinatura de loja
- Tokens de autenticação de webhook

Armazenados em `.env` da VPS e secrets do GitHub Actions.

### Cadência típica de manutenção

| Atividade | Gatilho |
|-----------|---------|
| Deploy da API | Merge em `master` com mudanças de servidor |
| Release de loja do cliente | Marco de UX ou lote de correções |
| Atualizações de dependências | Avisos de segurança ou revisão agendada |
| VPS / imagem base Docker | Patches de segurança |
| Documentação | Mudança de stack, domínio ou processo |

### Propriedade de funcionalidades de convite e exclusão

| Preocupação | Responsabilidade |
|-------------|------------------|
| Abuso de convite (links spam) | Monitorar; revogar; rate limits futuros |
| Exclusão acidental de caixinha | Confirmação UX — sem recuperação no servidor |
| Renovação de domínio de deep link | Mantenedor renova TLS e arquivos de associação |
| Allowlist para novos membros | Mantenedor atualiza config do servidor |

---

## Detalhada

### O que intencionalmente não tem equipe

- Equipe de QA dedicada — testes manuais pelo mantenedor antes de releases
- Rotação de on-call 24/7
- Equipe de segurança separada — mantenedor segue avisos
- Equipe de customer success — canal de suporte direto mínimo

### Escalar a equipe (futuro)

Se contribuidores entrarem, divisão sugerida:

| Papel | Foco |
|-------|------|
| Produto / cliente | UX, rituais, assistentes |
| Plataforma / API | Regras de domínio, persistência, deploy |
| Compartilhado | Documentação em `docs/`, contrato OpenAPI |

Propriedade de `convite` e exclusão de `caixinha` deve permanecer com um dono de módulo API para preservar consistência transacional.

### Resposta a incidentes (informal)

1. Confirmar escopo (API fora, rejeição de loja, problema de dados)
2. Verificar containers e logs da VPS
3. Reverter imagem da API se deploy recente causou regressão
4. Comunicar a usuários afetados se indisponibilidade prolongada
5. Nota de post-mortem no repo ou docs se sistêmico

### Transferência de conhecimento

Verdade canônica de produto: `docs/en/`. Caminho de onboarding: Camada 1 → 2 → codebase. Entrada de engenharia: Camada 4 + `api/README` se presente.

## Decisões assumidas nesta reescrita

- Modelo de mantenedor solo preservado da documentação anterior.
- Responsabilidade de allowlist e revogação de convite atribuída ao mantenedor.
