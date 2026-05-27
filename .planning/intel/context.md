# Contexto do Estado Atual do Repositório - ArchFlow ERP

## Análise do Repositório
O projeto está em uma fase de **MVP estrutural avançado / pré-produção incompleta**. A base arquitetural está bem desenvolvida, mas há lacunas críticas de infraestrutura, armazenamento e integração de fluxos de ponta a ponta.

### Stack Tecnológica Identificada
- **Frontend**: Next.js (App Router), React 19, Tailwind CSS, Radix UI, React Hook Form, Zod, Recharts, dnd-kit.
- **Backend/ORM**: Node.js, Next.js Server Actions, Prisma ORM, NextAuth v5 (beta).
- **Banco de Dados**: PostgreSQL (configurado para Supabase no PRD, mas sem configuração de banco de dados local unificado).
- **Testes**: Jest, Playwright.

### Lacunas Críticas Identificadas
1. **Configuração do Datasource no Prisma**: O arquivo `schema.prisma` possui `provider = "postgresql"` mas não declara o endpoint configurável via `DATABASE_URL` vinda das variáveis de ambiente (`env("DATABASE_URL")`). Isso bloqueia a inicialização local e pipelines de CI/CD.
2. **Ambiente Local**: Ausência de infraestrutura local padronizada com Docker PostgreSQL, dificultando o onboarding e o desenvolvimento local consistente.
3. **Erros Estruturais de Domínio**: O modelo `ProjectKanbanColumn` não possui vínculo com `projectId` (`projectId` está ausente), tornando as colunas globais no banco e impedindo que cada projeto tenha seu próprio pipeline Kanban especializado.
4. **Armazenamento de Arquivos Incompleto**: Entregáveis e documentos dependem de URLs estáticas mockadas. Não há armazenamento local temporário ou serviços em nuvem configurados para o fluxo de uploads.
5. **Autenticação e Recuperação de Senha Incompletos**: Fluxo de reset de senha configurado em console.log, sem acoplamento a um serviço de e-mail de envio real.
6. **Contratos Inconsistentes de Server Actions**: Falta de retorno padronizado e tratamento de erro uniforme entre as Server Actions existentes do projeto.
7. **Ausência de Hardening**: Falta de rate limiting, auditorias de autorização fina nos Server Actions (ex: OWNER, EDITOR, VIEWER) e logging estruturado de erros.
