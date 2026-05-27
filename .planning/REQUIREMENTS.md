# Requisitos do Sistema - ArchFlow ERP

Este documento lista todos os requisitos detalhados e rastreáveis do sistema. As fases do roadmap devem fechar estes requisitos de forma sequencial.

## 1. Requisitos de Infraestrutura e Saneamento (INFRA)
- **REQ-001**: O schema Prisma deve ler dinamicamente o datasource através de `env("DATABASE_URL")`.
- **REQ-002**: Criação de `docker-compose.yml` para banco de dados local PostgreSQL 16 com volume persistente.
- **REQ-003**: Criação de `.env.example` contendo chaves para banco, autenticação NextAuth e URL local do app.
- **REQ-004**: Garantir o padrão Singleton para o Prisma Client em `lib/prisma.ts`.
- **REQ-005**: Limpeza e saneamento do repositório, configurando o `.gitignore` para ignorar dados temporários de container, builds `.next` e logs.

## 2. Requisitos de Autenticação e Hardening (AUTH)
- **REQ-006**: Proteção de rotas do dashboard `/dashboard/*` e do projeto `/projects/*` exigindo sessão do NextAuth v5.
- **REQ-007**: Criação e aplicação do middleware/helper de verificação de autenticação ativa (`requireAuth`).
- **REQ-008**: Validação de escopo por projeto baseada em cargos utilizando helper `requireProjectAccess` (restrições OWNER, EDITOR, VIEWER).
- **REQ-009**: Exibição elegante de retornos de erro de autorização na UI (Toast e telas de redirecionamento amigáveis).

## 3. Requisitos de Clientes e CRM (CRM)
- **REQ-010**: Cadastro modular de clientes com distinção de Pessoa Física (PF) e Pessoa Jurídica (PJ).
- **REQ-011**: Validação de formato e consistência de CPF e CNPJ no Zod (com máscara no frontend e rejeição no backend).
- **REQ-012**: Visualização de projetos, atividades e apropriação de horas na tela de detalhe do cliente.
- **REQ-013**: Paginação e filtros na listagem de clientes (filtrar por categoria de projeto e status de relacionamento).
- **REQ-014**: Exclusão segura de clientes através de Soft Delete (`deletedAt` preenchido no banco de dados).

## 4. Requisitos de Projetos Arquitetônicos (PROJ)
- **REQ-015**: Inclusão de dados específicos de arquitetura no modelo `Project` do Prisma (estilo arquitetônico, tipo de construção, área total, número de andares, etc.).
- **REQ-016**: Implementação de Server Actions de CRUD completo para projetos, com revalidações de rotas e atualização de progresso.
- **REQ-017**: Recurso de duplicação de projeto para clonar a estrutura de fases e entregáveis como template.

## 5. Requisitos de Estágios e Kanban (KANBAN)
- **REQ-018**: Ajustar estruturalmente o banco via migração do Prisma para adicionar chave estrangeira `projectId` na tabela `ProjectKanbanColumn`.
- **REQ-019**: Painel Kanban por projeto permitindo movimentação de cards com persistência em tempo de execução das colunas e ordenação.

## 6. Requisitos de Tarefas (TASK)
- **REQ-020**: Criação de tarefas atreladas a projetos e estágios do Kanban, contendo título, descrição, prioridade, responsável e prazos de vencimento.
- **REQ-021**: Suporte a checklists interativos de subtarefas e comentários dinâmicos com histórico.

## 7. Requisitos de Agenda e Atividades (ACT)
- **REQ-022**: Criação de atividades (visitas técnicas, reuniões, etc.) associadas a clientes e projetos com data e hora.
- **REQ-023**: Calendário de atividades e atualização reativa do engajamento do cliente (`lastInteractionAt`).

## 8. Requisitos de Time Tracking (TIME)
- **REQ-024**: Lançamento de horas gastas por usuários em tarefas ou projetos arquitetônicos.
- **REQ-025**: Controle financeiro de logs (horas faturáveis vs não faturáveis e definição de taxa horária de rateio).

## 9. Requisitos de Armazenamento e Entregáveis (FILE)
- **REQ-026**: Roteamento seguro e gravação de arquivos em diretório em disco local (`storage/` fora da pasta pública) no desenvolvimento local.
- **REQ-027**: Máquina de estados de entregáveis arquitetônicos (`DRAFT`, `PENDING_REVIEW`, `APPROVED`, `APPROVED_WITH_CHANGES`, `REJECTED`, `DELIVERED`).
- **REQ-028**: Versionamento de arquivos de entregas e registro de feedback detalhado de revisão do cliente.

## 10. Requisitos Financeiros (FIN)
- **REQ-029**: Orçamento (`Budget`) e Estimativa (`Estimate`) detalhados atrelados a cada projeto.
- **REQ-030**: Cálculo dinâmico e comparativo automático de Custo Planejado versus Custo Real do projeto baseando-se nas horas apropriadas.

## 11. Requisitos de Relatórios e Exportação (REP)
- **REQ-031**: Consolidação de rotinas analíticas removendo códigos duplicados de relatórios.
- **REQ-032**: Geração de arquivos PDF e planilhas Excel (XLSX) detalhando dados financeiros, progresso e horas.

## 12. Requisitos de Notificações e Reatividade (NOTIF)
- **REQ-033**: Painel de notificações em tempo de execução para alertar profissionais sobre tarefas recebidas, prazos urgentes e entregáveis para revisão.

## 13. Requisitos de Auditoria e Logs (AUDIT)
- **REQ-034**: Gravação de logs persistentes detalhando ações sensíveis de usuários (criação/exclusão de projetos, movimentações de orçamentos, aprovações).
