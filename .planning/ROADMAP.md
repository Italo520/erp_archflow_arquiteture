# Roadmap de Desenvolvimento - ArchFlow ERP

Este documento organiza a entrega do projeto em 6 Milestones (Fases) incrementais. Cada fase fecha um conjunto coerente de requisitos do sistema.

---

## Milestone 1: Saneamento Técnico e Infraestrutura Base (v1.0) — [Concluído e Arquivado](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/.planning/milestones/v1.0-ROADMAP.md)

## Milestone 2: Gestão de Projetos e Fluxo de Trabalho (v2.0) — [Concluído e Arquivado](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/.planning/milestones/v2.0-ROADMAP.md)

## Milestone 3: CRM de Clientes, Agenda e Controle de Tempo (v3.0) — [Concluído e Arquivado](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/.planning/milestones/v3.0-ROADMAP.md)

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
- [ ] **Exportação para PDF/XLSX**: Disponibilizar geradores e download de planilhas e resumos in PDF. [REQ-032]

---

## Milestone 6: Hardening, Notificações, Auditoria e Deploy (Fase 4)
*Foco: Aplicar segurança fina de autorizações, notificações no sistema, trilha de auditoria e garantir build pronto.*

### Tarefas
- [ ] **helpers de Autorização em Actions**: Proteger todas as ações verificando sessão e cargo por projeto. [REQ-006, REQ-007, REQ-008, REQ-009]
- [ ] **Painel de Notificações**: Configurar os disparadores e tela de notificações reativas para profissionais e clientes. [REQ-033]
- [ ] **Trilha de Auditoria Física**: Gravar logs detalhados de eventos de alta sensibilidade no banco. [REQ-034]
- [ ] **Garantias de Testes**: Implementar e executar a suíte mínima de testes unitários e de integração das Server Actions críticas.
- [ ] **Blindagem do Build**: Validar a compilação final em modo de produção do Next.js sem erros de lint e TypeScript.
