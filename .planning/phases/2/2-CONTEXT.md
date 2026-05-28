# Phase 2: Painel de Notificações - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Configurar os disparadores e tela de notificações reativas para profissionais e clientes. [REQ-033]

</domain>

<decisions>
## Implementation Decisions

### Exibição das Notificações na UI
- Onde exibir: Painel lateral (Slide-over).
- Agrupamento: Por data (Hoje, Ontem).
- Comportamento em tempo real: Toast alert + Incremento no Badge.

### Comportamento de Leitura e Ações
- Marcar como lida: Ao clicar no link de destino ou botão de check.
- Ação ao clicar: Redireciona para a rota relevante.
- Gerenciamento: "Marcar todas como lidas" e "Limpar todas".

### Tipos e Gatilhos de Notificações
- Quais devem ser os gatilhos: Apenas eventos chaves (Status de Entregáveis, Orçamentos, Status de Projetos).
- Diferença entre perfis: Clientes veem apenas atualizações vitais de aprovação e finanças. Arquitetos veem operacionais.
- Controle de preferências de notificação (Op-out): Haverá um painel de configuração (estilo RBAC) para controle de notificações por tipo de usuário.

### the agent's Discretion
As demais decisões visuais, de implementação da central de notificações no banco e os disparos específicos via webhooks/API de tempo real ficam a cargo do desenvolvedor (agent's discretion) usando melhores práticas.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/actions/notification.ts` já existe e foi recentemente refatorado.
- `app/api/v1/notifications/route.ts` já possui suporte para notificações.

### Established Patterns
- Utiliza Server Actions para manipulações.
- Segurança via `requireAuth()` e `requireProjectAccess()`.

### Integration Points
- Será necessário criar o Painel Lateral no Header do Navbar existente.
- A página de Configurações precisará de uma aba nova (Notificações) para gerenciar os toggles por perfil.

</code_context>

<specifics>
## Specific Ideas

- Criar tela/aba de configurações semelhante a um RBAC, listando os tipos de notificações e permitindo que sejam ligados/desligados de acordo com o perfil.

</specifics>

<deferred>
## Deferred Ideas

Nenhuma ideia foi adiada. O painel de configuração foi incluído no escopo da fase.

</deferred>
