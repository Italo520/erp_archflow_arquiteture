# Decisões de Arquitetura e Engenharia (Locked Decisions)

As decisões abaixo foram consolidadas com base no PRD e no Plano Mestre de Implementação. Qualquer desvio dessas decisões constitui uma alteração crítica de escopo e deve ser evitada.

## 1. Stack Tecnológica Core
- **Framework**: Next.js com App Router.
- **Frontend Core**: React 19.
- **ORM**: Prisma ORM.
- **Autenticação**: NextAuth v5 (beta) utilizando fluxo JWT com callbacks para sessão.
- **Estilização**: Tailwind CSS.

## 2. Infraestrutura e Persistência
- **Banco de Dados**: PostgreSQL executado em container local via Docker Compose no desenvolvimento.
- **Datasource**: O `prisma/schema.prisma` deve obter a URL de conexão estritamente via variável de ambiente `DATABASE_URL`.
- **Singleton do Prisma**: Manter e revisar o singleton de conexão em `lib/prisma.ts` para evitar esgotamento de conexões no desenvolvimento Next.js.

## 3. Armazenamento de Arquivos
- **Fase Inicial (MVP Local)**: Utilização de armazenamento local em disco (diretório `storage/` protegido fora de `public`) com rotas seguras de upload/download de arquivos.
- **Fase Futura (Deploy Cloud)**: Substituição por Supabase Storage ou AWS S3 através de uma interface abstrata (`storageProvider`), evitando acoplamento direto de infraestrutura.

## 4. Padronização de Contratos de Server Actions
Toda Server Action implementada ou refatorada no projeto deve, obrigatoriamente, retornar o seguinte formato de objeto tipado:
```ts
export interface ActionResponse<T = any> {
  ok: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]> | string;
}
```
Isso garante previsibilidade na comunicação entre componentes do cliente e ações executadas no servidor.

## 5. Validação de Entradas
- Nenhuma operação de gravação ou atualização no banco de dados deve ocorrer sem passar previamente por esquemas de validação robustos com **Zod** (localizados de forma centralizada em `lib/validations.ts`).

## 6. Controle de Acesso e Autorização
- Validação estrita de escopo nas Server Actions com helpers dedicados:
  - `requireAuth()`: Garante autenticação ativa na sessão.
  - `requireProjectAccess(projectId, allowedRoles)`: Garante permissões específicas por projeto (ex: OWNER, EDITOR, VIEWER).

## 7. Estrutura Kanban Específica por Projeto
- Correção imediata do modelo `ProjectKanbanColumn` no Prisma. As colunas não devem ser globais, mas sim possuir uma chave estrangeira obrigatória vinculando-as ao `Project` (`projectId`).
- Cada projeto possui seu próprio pipeline específico de estágios.
