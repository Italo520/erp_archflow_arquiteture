# Preocupações e Dívida Técnica

> Último mapeamento: 2026-05-27

## 🔴 Alta Prioridade

### 1. Camada de Serviço Legada Coexistindo com Server Actions
- **Localização:** `services/*.js` (7 arquivos)
- **Problema:** Serviços REST legados baseados em Axios (`services/api.js`, `services/auth.service.js`, etc.) coexistem com as Server Actions mais recentes (`actions/*.ts`, `app/actions/*.ts`). Isso gera confusão sobre qual padrão usar.
- **URL base legada:** Aponta para `localhost:8080` (antigo backend Java)
- **Serviços de auth duplicados:** Existem tanto `services/auth.service.js` quanto `services/authService.js`
- **Risco:** Desenvolvedores podem acidentalmente usar o padrão REST legado ao invés das Server Actions
- **Recomendação:** Auditar uso dos arquivos `services/`, remover os não utilizados, migrar chamadores restantes para Server Actions

### 2. Localizações Duplicadas de Server Actions
- **Localizações:** `actions/*.ts` (nível raiz) e `app/actions/*.ts`
- **Problema:** Server Actions divididas em dois diretórios com entidades sobrepostas (ambos têm `auth.ts`, `project.ts`)
- **Raiz `actions/`:** 4 arquivos (auth, project, task, stage) — mais antigos, mais simples
- **App `app/actions/`:** 10 arquivos — mais recentes, mais abrangentes
- **Risco:** Lógica conflitante, incerto qual actions as páginas devem importar
- **Recomendação:** Consolidar todas as actions em `app/actions/` e remover a pasta raiz `actions/`

### 3. Modo Strict do TypeScript Desabilitado
- **Arquivo:** `tsconfig.json` — `"strict": false`
- **Impacto:** Sem checagem de null, sem tipos de função strict, sem inicialização de propriedades strict
- **Risco:** Erros em runtime por acesso a null/undefined, lacunas na segurança de tipos
- **Evidência:** Uso pesado de casts `as any` para campos Json do Prisma
- **Recomendação:** Habilitar incrementalmente: começar com `strictNullChecks`

### 4. Tratamento de Erros Inconsistente
- **Padrão 1:** `throw new Error("mensagem")` — maioria das actions
- **Padrão 2:** `return { success: false, error }` — algumas funções da lib
- **Lado do cliente:** Sem try/catch sistemático ao redor de chamadas de Server Action
- **Sem error boundary:** Sem React Error Boundary customizado além dos padrões do Next.js
- **Risco:** Rejeições não tratadas, feedback pobre de erros para o usuário
- **Recomendação:** Padronizar com padrão de tipo Result, adicionar error boundaries

## 🟡 Média Prioridade

### 5. Sistema de Permissões Não Integrado
- **Arquivo:** `lib/permissions.ts`
- **Problema:** Funções de permissão bem definidas (`canCreateProject`, `canDeleteProject`, etc.) mas **não são chamadas** na maioria das Server Actions. As actions apenas verificam se `session.user.id` existe.
- **Risco:** Qualquer usuário autenticado pode realizar qualquer operação independente do papel
- **Recomendação:** Integrar verificações de permissão em todas as Server Actions

### 6. Implementação Pusher/WebSocket Incompleta
- **Arquivo:** `hooks/useWebSocket.js`
- **Problemas:**
  - Usa **canais públicos** ao invés de canais privados autenticados (risco de segurança)
  - Variável `channelName` definida mas não usada (linha 33 usa nome diferente)
  - SDK Pusher do servidor disponível (pacote `pusher`) mas não integrado nas Server Actions
  - Notificações do WebSocket não persistidas no banco de dados
  - `markAsRead` atualiza apenas estado do cliente, não o BD
- **Risco:** Notificações podem ser interceptadas; perda de dados ao recarregar página
- **Recomendação:** Implementar push server-side nas actions, usar canais privados com autenticação

### 7. Campos JSONB com Tipagem Frouxa
- **Modelos:** `Task.attachments`, `Task.comments`, `Task.checklist`, `Task.historico`, `Project.phases`, `Budget.budgetBreakdown`
- **Problema:** Armazenados como `Json?` no Prisma, convertidos com `as any` ou `as unknown as InterfaceTipada[]`
- **Risco:** Corrupção de dados, erros de tipo em runtime, difícil de consultar
- **Recomendação:** Considerar normalizar campos JSON críticos em relações próprias, ou adicionar validação em runtime na leitura

### 8. JavaScript e TypeScript Misturados
- **Padrão:** Features mais recentes em TS, mais antigas em JS
- **Arquivos JS:** Arquivos de página (`page.jsx`), `Layout.jsx`, `Providers.jsx`, `NotificationBell.jsx`, hooks, services
- **Arquivos TS:** Actions, lib, componentes mais recentes, Kanban
- **Risco:** Segurança de tipos inconsistente, mais difícil de manter
- **Recomendação:** Converter gradualmente `.jsx` → `.tsx`, `.js` → `.ts`

### 9. Strings Hardcoded (Sem i18n)
- **Problema:** Todas as strings de UI em português do Brasil hardcoded nos componentes
- **Idiomas mistos:** Algumas mensagens de validação Zod em inglês (`lib/validations.ts`), UI em português
- **Risco:** Impossível suportar idiomas adicionais sem reescrever componentes
- **Recomendação:** Extrair strings para arquivos de tradução, padronizar idioma para mensagens de validação

### 10. Arquivos de Componentes Grandes
- **`components/Layout.jsx`** — 218 linhas (sidebar + header + drawer mobile)
- **`components/projects/ProjectKanban.tsx`** — 19.570 bytes
- **`components/projects/ProjectForm.tsx`** — 15.381 bytes
- **`components/projects/ProjectsTable.tsx`** — 15.200 bytes
- **`components/activities/ActivityForm.tsx`** — 15.902 bytes
- **Risco:** Difícil de manter, testar e revisar
- **Recomendação:** Extrair sub-componentes, especialmente de `ProjectForm` e `ProjectKanban`

## 🟢 Baixa Prioridade

### 11. Arquivos Temporários/Debug na Raiz
- **Arquivos:** `test_action.ts`, `tmp_check_db.ts`, `tmp_perf_test.ts`, `dev.log`, `dev_server.log`, `dag_tasks.json`
- **Risco:** Poluição, confusão, potencial vazamento de dados
- **Recomendação:** Adicionar ao `.gitignore` ou deletar

### 12. URL de Avatar Hardcoded
- **Arquivo:** `components/Layout.jsx` (linha 200)
- **Problema:** Avatar padrão do usuário é uma URL hardcoded do CDN do Google
- **Risco:** Dependência externa, pode quebrar
- **Recomendação:** Usar fallback local ou avatar baseado em iniciais

### 13. Console Logging em Código de Produção
- **Arquivos:** `actions/project.ts`, `auth.ts`, `lib/db.ts`
- **Problema:** Chamadas `console.log` e `console.error` em todo o código server-side
- **Risco:** Vazamento de informações nos logs de produção
- **Recomendação:** Usar biblioteca de logging estruturado ou remover antes de produção

### 14. NextAuth v5 Beta
- **Versão:** `^5.0.0-beta.30`
- **Problema:** Usando versão beta do NextAuth v5 — API pode mudar antes do release estável
- **Risco:** Breaking changes ao atualizar
- **Recomendação:** Acompanhar release estável do NextAuth v5, fixar versão beta com cuidado

### 15. Sem Configuração de CI/CD
- **Observação:** Diretório `.github/` existe mas nenhum workflow de CI observado
- **Problema:** Sem testes automatizados, linting ou pipeline de deploy
- **Risco:** Regressões, deploys sem teste
- **Recomendação:** Adicionar workflow GitHub Actions para lint, test, build, deploy

## 📊 Resumo da Dívida

| Severidade | Quantidade | Áreas Principais |
|---|---|---|
| 🔴 Alta | 4 | Serviços legados, actions duplicadas, modo strict, tratamento de erros |
| 🟡 Média | 6 | Permissões, WebSocket, tipos JSONB, JS/TS misto, i18n, arquivos grandes |
| 🟢 Baixa | 5 | Arquivos temporários, avatar hardcoded, console.log, NextAuth beta, CI/CD |
| **Total** | **15** | |

## Nenhum Marcador TODO/FIXME/HACK Encontrado
Uma busca por `TODO`, `FIXME`, `HACK`, `XXX` e `REFACTOR` em todos os arquivos `.ts`, `.tsx`, `.js`, `.jsx` retornou **zero resultados**. A dívida técnica é implícita, não marcada no código.
