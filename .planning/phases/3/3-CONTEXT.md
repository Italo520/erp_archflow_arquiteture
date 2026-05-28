# Phase 3: Trilha de Auditoria Física - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Gravar logs detalhados de eventos de alta sensibilidade no banco (Trilha de Auditoria) [REQ-034] e permitir visualização pelos gestores dos projetos.

*O escopo desta fase também inclui uma dívida da Fase 2: Implementar a tabela de preferências de notificação a nível de usuário (opt-out), conforme solicitado.*

</domain>

<decisions>
## Implementation Decisions

### Abordagem de Interceptação dos Logs
- **Local da Interceptação**: Middleware de Banco (Prisma Extension/Middleware). Garante que todas as ações sejam logadas automaticamente na tabela `AuditLog`, evitando duplicação em Server Actions individuais.
- **Eventos de Alta Sensibilidade**: Apenas ações de Escrita e Deleção (CUD) de entidades críticas (Entregáveis, Finanças, Projetos). Leituras (Selects) serão ignoradas para evitar saturação.

### Exibição e Retenção dos Logs
- **Localização na UI**: Aba "Auditoria" nas Configurações do Projeto (restrito aos proprietários `OWNER` do projeto).
- **Retenção de Logs**: Expurgo automático! Um *cronjob* deletará logs mais antigos que 90 dias para manter a performance do banco saudável.
- **Formato dos Dados**: Campo `changes` no formato JSON (`{ old, new }`), permitindo visualização de "o que era antes" e "como ficou".

### Dívida Técnica / Follow-up da Fase 2
- Criar a tabela `UserNotificationPreference` para permitir que o usuário individual desligue as notificações permitidas pelas regras globais RBAC.
- Adicionar tela de preferência pessoal para o usuário ("Minhas Notificações").

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `prisma.notification.findMany` etc., e `AuditLog` já tem uma estrutura inicial no `schema.prisma`.
- Arquitetura de Tabs em páginas de configuração (como implementado no global settings) pode ser reusada para as abas do Projeto.

### Established Patterns
- Utilização de Server Actions com helpers RBAC (ex: `requireProjectAccess`).

</code_context>

<specifics>
## Specific Ideas
- A UI de Auditoria deve exibir as mudanças em formato Diff (vermelho = deletado/velho, verde = novo) para as propriedades em JSON, assim os arquitetos entendem fácil o que foi alterado em um escopo financeiro ou entregável.

</specifics>

<deferred>
## Deferred Ideas
Nenhuma ideia adiada. O cronjob de 90 dias entrou no MVP conforme requisito.

</deferred>
