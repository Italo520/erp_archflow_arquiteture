# Projeto ArchFlow ERP - Especificação do Produto e Engenharia

Este é o documento de referência principal do projeto. Ele estabelece a visão do produto, stack tecnológico, restrições arquiteturais e a definição de concluído para guiar as decisões de implementação.

## Visão do Produto
O **ArchFlow ERP** é uma plataforma SaaS integrada desenvolvida sob medida para escritórios de arquitetura (com foco inicial em times de 5 a 50 profissionais). O objetivo principal é consolidar o relacionamento com o cliente (CRM), a gestão operacional de projetos (Kanban, etapas, tarefas, entregáveis), controle de agenda (atividades) e a apropriação financeira de horas (time logs) em um único ecossistema previsível e profissional, mitigando a fragmentação de ferramentas (planilhas, drives e e-mails soltos).

## Stack Tecnológico Alvo
- **Framework**: Next.js com App Router
- **Runtime**: Node.js 20 LTS
- **Banco de Dados**: PostgreSQL (Executado localmente via Docker em ambiente de desenvolvimento)
- **ORM**: Prisma ORM
- **Autenticação**: NextAuth v5 (beta) utilizando fluxo JWT
- **Componentes & UI**: Tailwind CSS, Radix UI ( shadcn/ui ), dnd-kit (Kanban Board)
- **Validação**: Zod
- **Formulários**: React Hook Form
- **Testes**: Jest (Unitários/Integração) e Playwright (E2E)

## Decisões Estruturais Travadas (Locked Decisions)
1. **Conexão Dinâmica de Banco**: A URL do banco PostgreSQL deve ser alimentada exclusivamente via variável de ambiente `DATABASE_URL` no `schema.prisma`.
2. **Padrão de Resposta de Server Actions**: Toda Server Action no projeto deve retornar o seguinte padrão consistente de contrato:
   ```ts
   export interface ActionResponse<T = any> {
     ok: boolean;
     message?: string;
     data?: T;
     errors?: Record<string, string[]> | string;
   }
   ```
3. **Isolamento de Kanban por Projeto**: O modelo `ProjectKanbanColumn` no Prisma deve possuir associação obrigatória com `projectId`. Colunas de Kanban são específicas e gerenciadas de forma única por cada projeto de arquitetura.
4. **Armazenamento de Arquivos Isolado**: MVP inicial utiliza armazenamento seguro em disco local (pasta `/storage` oculta). O código de storage deve usar contratos abstratos (`storageProvider`) para facilitar a migração transparente para Supabase Storage / S3 no deploy em nuvem.
5. **helpers de Autorização**: As rotinas sensíveis de banco nas Server Actions devem validar permissões usando helpers unificados:
   - `requireAuth()`: Garante autenticação de sessão.
   - `requireProjectAccess(projectId, allowedRoles)`: Restringe acessos baseando-se no escopo do usuário no projeto (OWNER, EDITOR, VIEWER).

## Restrições do Escopo MVP
1. **Sem Multi-Tenancy**: O MVP inicial foca em Single-Office (operação de um único escritório). A infraestrutura para múltiplas organizações é um escopo fora de meta imediata.
2. **Sem Integrações Financeiras Complexas**: Emissões fiscais reais, gateways de pagamento estruturados e conciliação bancária automatizada não fazem parte do MVP.
3. **Não alterar ORM/Framework**: É expressamente proibida a troca de Prisma por qualquer outro ORM ou Next.js por outros frameworks nesta entrega.

## Definition of Done (Critério de Sucesso do Projeto)
O ERP ArchFlow será considerado funcional e pronto para deploy de produção quando:
- [x] O ambiente local subir integralmente com Docker PostgreSQL.
- [x] O fluxo de autenticação, registro e segurança de rotas estiver blindado.
- [x] O gerenciamento de clientes PF/PJ operar com CRM funcional e soft-delete.
- [x] A modelagem e CRUD de projetos de arquitetura funcionar perfeitamente.
- [x] O pipeline Kanban for isolado por projeto com drag-and-drop persistente.
- [x] Tarefas puderem ser comentadas, atribuídas e possuírem checklists integrados.
- [x] Atividades de agenda atualizarem dinamicamente o status de engajamento do cliente.
- [x] Lançamentos manuais de logs de tempo (faturáveis/não faturáveis) consolidarem no dashboard.
- [x] O upload de entregáveis versionados obedecer à máquina de estados de aprovação do cliente.
- [x] O painel financeiro calcular corretamente o desvio entre Estimativa, Orçamento Aprovado e Custo Real de horas.
- [x] Relatórios analíticos operarem com exportação para PDF e planilhas Excel.
- [x] Notificações e trilha de auditoria para ações críticas gravarem com sucesso no banco.
- [x] A suite de testes automatizados unitários, de integração e E2E estiver passando sem erros.
- [x] O build de produção do Next.js compilar sem avisos de tipagem ou conflitos.

---

## Estado Atual do Projeto
*   **Versão Atual**: `v6.0` (Milestone 6 - Concluída e Arquivada em 28 de Maio de 2026)
*   **Situação**: Todas as metas de engenharia, negócios e produto do MVP do ArchFlow ERP foram finalizadas, validadas via testes Jest e compiladas em modo de produção com sucesso absoluto.

## Próximos Passos & Próxima Milestone
*   **Foco**: Escalabilidade técnica e comercial pós-MVP.
*   **Metas**:
    1. **Multi-Tenancy**: Suportar múltiplos escritórios operando com dados isolados (Modelo SaaS Real).
    2. **Integrações de Pagamento**: Conexão com gateways reais (Stripe/Iugu) e emissão de NFs.
    3. **Cloud Deploy**: Migrar de storage local para Supabase Storage / S3 e rodar em ambiente serverless.

