# Decisões Arquiteturais

Este documento registra as principais escolhas estruturais que moldam o Intensity — com justificativa, trade-offs e restrições conhecidas. É escrito para arquitetos e engenheiros seniores que avaliam ou evoluem o sistema.

---

## Curta

O Intensity coloca **complexidade de produto no cliente mobile** e mantém o **servidor como camada fina de persistência**. Usa uma **API REST orientada a recursos** (não BFF), **dados centralizados** em uma instância de API e comunicação **apenas REST**. **Convites e exclusão de caixinha** estendem o domínio sem mudar essa forma. Ritual de sorteio permanece **local no cliente** sem escrita no servidor.

---

## Média

### Resumo de decisões

| ID | Decisão | Justificativa |
|----|---------|---------------|
| **AD-01** | Cliente é núcleo do produto | Valor é experiencial — UI, ritual, assistente — não lógica de servidor |
| **AD-02** | API de recursos, não BFF | Domínio CRUD simples; telas se orquestram |
| **AD-03** | Dados centralizados, API única | Contribuições individuais de dispositivos separados devem convergir em caixinhas compartilhadas |
| **AD-04** | Apenas REST | Operações discretas; sorteio em um celular; sem sync ao vivo necessário |
| **AD-05** | Simplicidade sobre complexidade | Dois artefatos de app + um DB, conectados por REST |
| **AD-06** | Aceitar custódia de dados no servidor | Trade-off para modelo social; offline futuro como mitigação |
| **AD-07** | Convites como tokens persistidos | Crescimento assíncrono de membresia sem enfraquecer ritual síncrono |
| **AD-08** | Exclusão em cascata imposta pelo servidor | Remoção de caixinha deve ser autoritativa; clientes não podem deixar experiências órfãs |

### AD-07 — Convites como tokens persistidos

**Contexto:** Login conjunto sozinho confunde usuários quando nem todos podem se autenticar juntos.

**Decisão:** Persistir entidades de convite com token de link + código curto, expiração de 7 dias, criação iniciada por membros.

**Consequências:**

- API ganha módulo `convite` e endpoints de validação
- Deep links tornam-se requisito de plataforma mobile
- Membresia de grupo é explícita, não apenas derivada de sessão
- Login na Caixa de Experiências deve validar membresia no mesmo grupo

**Alternativas rejeitadas:** Pareamento apenas por QR efêmero (sem entrada assíncrona); links públicos abertos (risco de privacidade).

### AD-08 — Exclusão em cascata imposta pelo servidor

**Contexto:** Grupos precisam remover caixinhas obsoletas; exclusão apenas no cliente arrisca inconsistência.

**Decisão:** `DELETE /caixinhas/{id}` remove caixinha e todas as experiências em uma transação.

**Consequências:**

- Irreversível — UX de confirmação obrigatória
- Experiências de autores perdidas com a caixinha — trade-off de produto aceitável
- Pool de sorteio reflete exclusão imediatamente no próximo GET

### Trade-offs aceitos

| Ganho | Custo |
|-------|-------|
| Pool de experiências compartilhado entre dispositivos | Servidor guarda credenciais e conteúdo pessoal |
| Arquitetura simples | Instância única de API; caminho de escala manual |
| Simplicidade REST | Sem atualizações ao vivo quando outros contribuem |
| Flexibilidade de convite | Mais regras de domínio e casos extremos |
| Soberania do grupo na exclusão | Perda permanente de dados se confirmado por engano |

### Restrições conhecidas

- Rede obrigatória para operações persistidas
- Ritual de sorteio em dispositivo compartilhado único
- Sem modo offline na baseline
- Sem histórico de sorteio ou trilha de auditoria

### Caminhos de evolução futura

- Modo offline com sync local e resolução de conflitos
- Escalonamento horizontal de API atrás de load balancer
- Push ou polling para "novas experiências na caixinha"
- Soft-delete ou arquivo para caixinhas em vez de cascata dura
- Rate limiting de convite e detecção de abuso

---

## Detalhada

### AD-01 — Cliente como núcleo do produto

O ritual de sorteio/revelação, assistente em cinco etapas, filtros de intensidade e pacotes de sugestão incorporam o produto. O servidor valida e armazena — não orquestra o momento. Essa decisão mantém ciclos de release de loja alinhados com iteração de UX onde o valor vive.

### AD-02 — API de recursos, não BFF

Cada tela compõe suas próprias chamadas (`GET caixinhas`, `GET experiencias`, `POST convite`). Sem DTOs agregados de "tela". BFF rejeitado porque domínio é pequeno e agregação acoplaria releases de servidor a refatorações de UI.

### AD-03 — Dados centralizados

Contribuição assíncrona de muitos celulares em uma caixinha exige fonte única de verdade. Peer-to-peer ou armazenamentos por dispositivo quebrariam o modelo social a menos que pareados com sync pesado — fora de escopo para baseline.

### AD-04 — Apenas REST

Sorteio não produz evento no servidor; contribuidores não precisam de consciência ao vivo durante o ritual. Pull REST antes do sorteio é suficiente. WebSockets rejeitados como custo operacional desnecessário.

### AD-05 — Simplicidade

Exatamente: cliente mobile + API + PostgreSQL. Sem microserviços, sem broker, sem microserviço de convite separado.

### AD-06 — Custódia de dados

Experiências são conteúdo íntimo armazenado centralmente com aviso de transparência (não criptografado na camada de aplicação). Modo offline futuro deslocaria o equilíbrio de custódia — sinalizado como pivô arquitetural, não patch.

### Registro de riscos

| Risco | Mitigação |
|-------|-----------|
| Link de convite compartilhado publicamente | Token opaco; expiração; revogar; sem prévia de conteúdo além de nomes de membros |
| Exclusão acidental de caixinha | Diálogo de confirmação com contagem; sem desfazer por design |
| Incompatibilidade de grupo no login conjunto | 409 com mensagem clara |
| Indisponibilidade de VPS única | Recuperação manual; sem HA baseline |

## Decisões assumidas nesta reescrita

- **AD-07** e **AD-08** são novas decisões que suportam funcionalidades de convite e exclusão de caixinha.
