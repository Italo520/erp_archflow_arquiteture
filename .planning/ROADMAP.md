# Roadmap de Desenvolvimento - ArchFlow ERP

Este documento organiza a entrega do projeto em 6 Milestones (Fases) incrementais. Cada fase fecha um conjunto coerente de requisitos do sistema.

---

## Milestone 1: Saneamento Técnico e Infraestrutura Base (Fase 0)
*Foco: Garantir que o projeto compile e rode localmente sem erros com PostgreSQL local em Docker.*

### Tarefas
- [ ] **Configuração do Datasource no Prisma**: Adicionar `DATABASE_URL` ao `schema.prisma`. [REQ-001]
- [ ] **Ambiente de Banco com Docker**: Criar `docker-compose.yml` com imagem PostgreSQL e volumes de persistência. [REQ-002]
- [ ] **Configuração de Variáveis de Ambiente**: Criar `.env.example`. [REQ-003]
- [ ] **Singleton de Conexão do ORM**: Revisar e blindar `lib/prisma.ts`. [REQ-004]
- [ ] **Saneamento Geral**: Ajustar `.gitignore`, limpar pastas temporárias e arquivos órfãos. [REQ-005]
- [ ] **Validação do Bootstrap**: Testar `prisma generate`, `migrate dev` e subida local da aplicação.

---

## Milestone 2: Gestão de Projetos e Fluxo de Trabalho (Fase 1 - Parte A)
*Foco: Estabelecer os projetos arquitetônicos e o gerenciamento Kanban isolado por projeto.*

### Tarefas
- [ ] **Campos Arquitetônicos de Projetos**: Atualizar o `schema.prisma` com os campos especializados de arquitetura e rodar migração. [REQ-015]
- [ ] **CRUD de Projetos com Actions**: Refatorar e padronizar rotas e Server Actions de projetos com a assinatura de retorno oficial. [REQ-016]
- [ ] **Isolamento do Kanban**: Criar migration adicionando `projectId` no modelo `ProjectKanbanColumn`. [REQ-018]
- [ ] **UX do Kanban Board**: Ajustar a tela do painel de Kanban para persistir movimentações de cards por drag-and-drop. [REQ-019]
- [ ] **Duplicação de Projetos**: Consolidar a Server Action de clonagem de projetos. [REQ-017]

---

## Milestone 3: CRM de Clientes, Agenda e Controle de Tempo (Fase 1 - Parte B)
*Foco: Fechar o relacionamento de clientes, compromissos de agenda e apropriação de horas trabalhadas.*

### Tarefas
- [ ] **CRM Completo (Clientes PF/PJ)**: Consolidar formulários, listagem e detalhe modular por abas de clientes. [REQ-010, REQ-013]
- [ ] **Validação de Documentos de Clientes**: Incorporar validações de CPF/CNPJ. [REQ-011]
- [ ] **Soft Delete de Clientes**: Implementar a deleção lógica na tabela de clientes. [REQ-014]
- [ ] **Compromissos e Agenda (Atividades)**: Expor calendário mensal/semanal de compromissos técnicos e atualizar reativamente a data de última interação. [REQ-022, REQ-023]
- [ ] **Time Tracking (Logs de Tempo)**: Habilitar o lançamento manual de horas categorizadas e faturáveis. [REQ-024, REQ-025]

---

## Milestone 4: Armazenamento e Entrega de Materiais (Fase 2)
*Foco: Implementar uploads de arquivos locais, versionamento e aprovações de projetos pelo cliente.*

### Tarefas
- [ ] **Armazenamento Seguro em Disco**: Desenvolver rotas e controllers para upload/download de arquivos na pasta oculta `/storage`. [REQ-026]
- [ ] **Máquina de Estados de Entregáveis**: Implementar controle e bloqueio de edição de arquivos baseados nos status (DRAFT, PENDING_REVIEW, APPROVED, REJECTED). [REQ-027]
- [ ] **Histórico de Revisões**: Suportar logs de feedback e incrementos automáticos de versionamento do documento. [REQ-028]

---

## Milestone 5: Planejamento Financeiro, Relatórios e Dashboard (Fase 3)
*Foco: Conectar estimativas a orçamentos de projetos e habilitar relatórios gerenciais exportáveis.*

### Tarefas
- [ ] **Orçamento vs Estimativa**: Fechar as telas e Server Actions que comparam orçamentos operacionais com estimativas de custos. [REQ-029]
- [ ] **Comparação de Custos em Tempo Real**: Calcular e alertar desvios financeiros gerados com base em horas gastas. [REQ-030]
- [ ] **Eliminação de Código Duplicado**: Auditar e centralizar as lógicas analíticas de relatórios. [REQ-031]
- [ ] **Exportação para PDF/XLSX**: Disponibilizar geradores e download de planilhas e resumos em PDF. [REQ-032]

---

## Milestone 6: Hardening, Notificações, Auditoria e Deploy (Fase 4)
*Foco: Aplicar segurança fina de autorizações, notificações no sistema, trilha de auditoria e garantir build pronto.*

### Tarefas
- [ ] **helpers de Autorização em Actions**: Proteger todas as ações verificando sessão e cargo por projeto. [REQ-006, REQ-007, REQ-008, REQ-009]
- [ ] **Painel de Notificações**: Configurar os disparadores e tela de notificações reativas para profissionais e clientes. [REQ-033]
- [ ] **Trilha de Auditoria Física**: Gravar logs detalhados de eventos de alta sensibilidade no banco. [REQ-034]
- [ ] **Garantias de Testes**: Implementar e executar a suíte mínima de testes unitários e de integração das Server Actions críticas.
- [ ] **Blindagem do Build**: Validar a compilação final em modo de produção do Next.js sem erros de lint e TypeScript.
