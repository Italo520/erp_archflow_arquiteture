# Requisitos Consolidados de Engenharia e Negócio - ArchFlow ERP

Este documento consolida os requisitos detalhados de engenharia extraídos do PRD e do Plano Mestre de Implementação. Eles orientarão a geração do arquivo `REQUIREMENTS.md` principal na raiz do planejamento.

## Módulo 1 — Infraestrutura Base e Saneamento
- **REQ-001**: O schema Prisma deve obter dinamicamente a conexão do banco de dados através da variável de ambiente `DATABASE_URL`.
- **REQ-002**: Criação de um ambiente local estável através de um arquivo `docker-compose.yml` que instancie um banco PostgreSQL (versão 15 ou superior) com volumes persistentes.
- **REQ-003**: Criação de um arquivo `.env.example` centralizando todas as variáveis de ambiente necessárias para subir o projeto localmente.
- **REQ-004**: Revisar o arquivo de conexão `lib/prisma.ts` para implementar o padrão singleton corretamente no Next.js, mitigando vazamentos de conexões no desenvolvimento.
- **REQ-005**: Saneamento do repositório: configurar corretamente o `.gitignore` para omitir logs, pastas temporárias e segredos de ambiente, removendo arquivos desnecessários existentes.

## Módulo 2 — Autenticação e Autorização (Hardening)
- **REQ-006**: Refatoração do fluxo de autenticação e proteção de rotas com NextAuth v5, implementando restrições de rotas privadas e de dashboard.
- **REQ-007**: Criação de helper centralizado de validação de sessão ativa no servidor (`requireAuth`).
- **REQ-008**: Criação de helper de autorização por projeto (`requireProjectAccess`) restringindo operações sensíveis com base em papéis (roles: OWNER, EDITOR, VIEWER).
- **REQ-009**: Padronização dos fluxos de erro de segurança (401 - Unauthorized, 403 - Forbidden) para exibir feedbacks utilizáveis no frontend.

## Módulo 3 — Carteira de Clientes (CRM)
- **REQ-010**: Cadastro completo de clientes suportando Pessoa Física (PF) e Pessoa Jurídica (PJ).
- **REQ-011**: Validação tipada de CPF e CNPJ tanto no frontend (Zod) quanto nas regras de backend antes da persistência.
- **REQ-012**: Vínculo completo do cliente com suas entidades derivadas: Projetos, Atividades e TimeLogs.
- **REQ-013**: Implementação de listagem de clientes paginada e filtrável por status e categoria, incluindo página de detalhes modular por abas.
- **REQ-014**: Mecanismo de Soft Delete para exclusão segura de registros de clientes.

## Módulo 4 — Gestão de Projetos Arquitetônicos
- **REQ-015**: Mapeamento do modelo de negócio específico de arquitetura no schema Prisma (`architecturalStyle`, `constructionType`, `totalArea`, `numberOfFloors`, etc.).
- **REQ-016**: Implementação de rotas e Server Actions de CRUD para projetos suportando revalidação robusta de caminhos e controle de status.
- **REQ-017**: Mecanismo de duplicação de projetos para permitir que projetos finalizados sirvam como templates estruturais para novos empreendimentos.

## Módulo 5 — Fases, Estágios e Kanban por Projeto
- **REQ-018**: Ajustar o modelo `ProjectKanbanColumn` no Prisma incluindo a restrição `projectId` para permitir pipelines Kanban totalmente independentes por projeto.
- **REQ-019**: Suporte a movimentação drag-and-drop de tarefas entre estágios com persistência reativa no banco de dados.

## Módulo 6 — Gestão de Tarefas
- **REQ-020**: Criação de tarefas vinculadas a projetos e colunas do Kanban com definição de título, descrição, prioridade, responsável e prazos.
- **REQ-021**: Suporte a sub-tarefas (checklist) e seção de comentários com histórico e trilha de modificações.

## Módulo 7 — Atividades e Agenda
- **REQ-022**: Modelagem e exibição de atividades (reuniões, visitas técnicas, revisões) vinculadas a clientes ou projetos.
- **REQ-023**: Calendário interativo de atividades e atualização reativa do campo `lastInteractionAt` no cliente.

## Módulo 8 — Rastreamento de Tempo (Time Tracking)
- **REQ-024**: Lançamento manual de horas trabalhadas associadas a usuários, projetos, tarefas e categorias específicas.
- **REQ-025**: Controle financeiro de logs de tempo (faturável/não faturável e taxas horárias de rateio).

## Módulo 9 — Entregáveis, Documentos e Revisão
- **REQ-026**: Implementação de armazenamento temporário local em disco (`storage/`) com upload/download seguro de arquivos.
- **REQ-027**: Máquina de estados de entregáveis arquitetônicos (`DRAFT` → `PENDING_REVIEW` → `APPROVED` / `REJECTED`).
- **REQ-028**: Versionamento incremental de documentos e logs de revisão do cliente.

## Módulo 10 — Orçamentos, Estimativas e Financeiro
- **REQ-029**: Consolidação do fluxo financeiro do projeto ligando a Estimativa (`Estimate`) inicial ao Orçamento Aprovado (`Budget`).
- **REQ-030**: Cálculo automático de desvio financeiro comparando o Custo Real (`actualCost` derivado de horas e insumos) com o Custo Planejado (`plannedCost`).

## Módulo 11 — Relatórios, Indicadores e Exportações
- **REQ-031**: Eliminação de lógicas duplicadas e consolidação da camada analítica de relatórios.
- **REQ-032**: Geração de arquivos exportáveis em PDF e planilhas Excel para relatórios de projetos, horas e finanças.

## Módulo 12 — Notificações Reativas
- **REQ-033**: Geração de notificações no banco para atribuição de tarefas, novos comentários, prazos e solicitações de aprovação de entregáveis.

## Módulo 13 — Trilha de Auditoria
- **REQ-034**: Registro persistente de ações críticas e sensíveis executadas por usuários no sistema (ex: exclusão de projetos, alteração de orçamentos, aprovação de entregáveis).
