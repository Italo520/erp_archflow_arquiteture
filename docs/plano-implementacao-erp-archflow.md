# Plano Mestre de Implementação, Finalização e Entrega do ERP ArchFlow

## Objetivo do documento

Este documento consolida a análise profunda do repositório `Italo520/erp_archflow_arquiteture` e transforma o estado atual do projeto em um plano de execução completo, orientado para implementação por IA e entrega funcional em ambiente real.[cite:15][cite:19]

O foco deste plano é reduzir ambiguidade, explicitar escopo, organizar dependências, definir contratos técnicos e orientar uma IA implementadora com instruções suficientemente precisas para que o projeto seja concluído de ponta a ponta, com banco PostgreSQL local em Docker na fase inicial.[cite:14][cite:15][cite:19]

---

## Estado atual do projeto

### Fase atual

O projeto está em uma fase de **MVP estrutural avançado / pré-produção incompleta**.[cite:15][cite:19]

Isso significa que a base arquitetural existe, o domínio principal do negócio foi modelado com boa profundidade no Prisma, parte relevante das ações de servidor já foi iniciada, várias rotas já existem no App Router, e há indícios de intenção de testes, exportação e notificações.[cite:15][cite:17][cite:18][cite:19]

Ao mesmo tempo, o sistema ainda não pode ser considerado pronto para deploy funcional porque há lacunas em infraestrutura, inconsistências de implementação, ausência de storage real de arquivos, módulos parcialmente conectados, baixa formalização de contratos entre UI e backend, e um conjunto de requisitos críticos que ainda não foram fechados operacionalmente.[cite:14][cite:17][cite:19]

### Classificação objetiva da maturidade

| Área | Situação | Observação |
|---|---|---|
| Modelagem de domínio | Forte | Schema Prisma amplo e aderente ao negócio de arquitetura.[cite:19] |
| App Router / estrutura de pastas | Boa | Rotas organizadas e separação por contexto funcional.[cite:18] |
| Autenticação | Parcialmente funcional | Fluxo básico existe, mas reset de senha ainda está em modo mock/log.[cite:14][cite:16] |
| CRUD principal | Parcial | Existe em Server Actions, porém precisa revisão de consistência e cobertura.[cite:14][cite:19] |
| Kanban / tarefas | Intermediário | Componentes e ações existem, mas requer fechamento de fluxo e vínculo correto por projeto.[cite:18][cite:19] |
| Financeiro | Incompleto | Estrutura de dados existe, experiência operacional ainda não está fechada.[cite:19] |
| Documentos / entregáveis | Incompleto | Schema existe, mas falta storage real e fluxo robusto de aprovação.[cite:19] |
| Testes | Inicial | Ferramentas configuradas, sem evidência de cobertura madura.[cite:15] |
| Deploy | Não pronto | Falta formalização de env, docker local, pipeline e hardening.[cite:15][cite:19] |

### Diagnóstico executivo

O projeto já ultrapassou a fase de prova de conceito. Ele possui uma base séria, com vocação real de produto, especialmente pela riqueza do modelo `Project`, `Client`, `Task`, `Deliverable`, `TimeLog`, `Budget`, `Estimate` e `AuditLog`.[cite:19]

Contudo, ainda não chegou à fase de produto operacional pronto para implantação porque a implementação foi mais forte na camada estrutural do que na camada de fechamento de fluxo, robustez operacional, consistência entre módulos e preparação para ambiente real.[cite:14][cite:17][cite:19]

---

## Análise profunda do repositório

### Stack identificada

O sistema utiliza Next.js com App Router, React 19, NextAuth v5 beta, Prisma, PostgreSQL, Tailwind, Radix UI, React Hook Form, Zod, Recharts, Jest e Playwright.[cite:15][cite:16]

Essa combinação é adequada para um ERP web moderno, especialmente por permitir UI interativa, validação tipada, autenticação integrada, persistência relacional e possibilidade de cobertura automatizada de testes.[cite:15][cite:16]

### Banco de dados e domínio de negócio

O schema Prisma é o ativo mais maduro do projeto. Ele cobre com profundidade as necessidades de um escritório de arquitetura, incluindo clientes PF/PJ, preferências de contato, status de relacionamento, projetos com tipologia arquitetônica, estrutura de fases, tarefas Kanban, atividades, entregáveis com versionamento, logs de tempo, orçamento, estimativa, notificações e trilha de auditoria.[cite:19]

A modelagem demonstra entendimento real do domínio, e isso reduz risco de retrabalho conceitual. O problema atual não é ausência de modelagem, mas sim transformar essa modelagem em fluxos completos, seguros e usáveis na aplicação.[cite:19]

### Autenticação e sessão

A autenticação usa NextAuth com estratégia JWT e callbacks para injetar `id` e `role` na sessão.[cite:16]

Há ações para cadastro, login, perfil, solicitação de reset e redefinição de senha. No entanto, o envio de recuperação de senha ainda está mockado por `console.log`, o que caracteriza fluxo incompleto para produção.[cite:14]

### Ações de servidor

O projeto possui uma camada de Server Actions já iniciada para autenticação, projetos e outros módulos. Em `app/actions/project.ts`, há CRUD, gestão de fases, documentos, associação de arquitetos, métricas, timeline, budget status e duplicação de projeto.[cite:19]

Isso é positivo, mas a análise do código mostra mistura de responsabilidades, uso frequente de `(prisma as any)`, pouca padronização de retorno, ausência de contrato único de erro/sucesso e revalidações inconsistentes entre rotas `/dashboard/...` e `/projects/...`.[cite:19]

### Componentização e Kanban

Há componentes dedicados ao Kanban como `KanbanBoard.tsx`, `Column.tsx`, `TaskCard.tsx` e `TaskDetails.tsx`, o que indica que a experiência de tarefas recebeu atenção relevante.[cite:18]

Mesmo assim, existe um problema estrutural importante no modelo `ProjectKanbanColumn`, que não contém `projectId`, tornando as colunas globais em vez de específicas por projeto. Isso é incompatível com a realidade de escritórios de arquitetura, nos quais cada projeto pode ter pipeline diferente.[cite:19]

### Dependências e direção funcional

O `package.json` revela intenções adicionais já planejadas, como exportação em Excel e PDF, PWA, realtime com Pusher, editor rico com Tiptap, Supabase client, drag and drop com `dnd-kit` e gráficos com Recharts.[cite:15]

Isso mostra ambição de produto robusto, mas também sugere risco de dispersão: existem bibliotecas de alto impacto funcional sem evidência suficiente de integração madura no fluxo central da aplicação.[cite:15]

---

## O que já está forte e deve ser preservado

### 1. Modelagem do domínio

A modelagem de dados deve ser preservada como base principal do produto. O schema já contém praticamente todos os agregados centrais de um ERP para arquitetura.[cite:19]

A IA implementadora não deve reinventar o domínio. O correto é **refatorar, completar e operacionalizar** o que já existe, e não substituir a base atual sem justificativa muito forte.[cite:19]

### 2. Direção de arquitetura do frontend

O uso de App Router, route groups e separação por áreas funcionais já aponta para uma estrutura adequada e escalável para o projeto.[cite:15][cite:18]

A implementação futura deve respeitar essa organização, reforçando uma convenção consistente para páginas, Server Actions, componentes de formulário, tabelas, drawers, modais e estados de carregamento.[cite:15][cite:18]

### 3. Escolha de stack

A stack atual é suficiente para levar o produto até produção sem troca de base tecnológica. Não há sinal de que seja necessário migrar framework ou ORM.[cite:15]

O ganho real virá de fechar fluxos, padronizar contratos, corrigir modelagem pontual e completar infraestrutura de execução local e deploy.[cite:15][cite:19]

---

## Lacunas críticas que impedem entrega funcional

### 1. Datasource Prisma incompleto

O schema mostra `datasource db { provider = "postgresql" }` sem `url = env("DATABASE_URL")`, o que é bloqueador direto para execução normal com Prisma em ambiente local e CI/CD.[cite:19]

### 2. Ausência de formalização de ambiente local com Docker

Não há, na evidência analisada, uma padronização explícita de ambiente com `docker-compose.yml`, volume persistente, credenciais documentadas e script de bootstrap local.[cite:15][cite:19]

### 3. Upload real de arquivos não está fechado

O projeto trata entregáveis e documentos como se o arquivo já existisse por URL, mas não há uma implementação final de storage e lifecycle de upload/download/versionamento para arquivos do escritório.[cite:19]

### 4. Fluxo de aprovação de entregáveis está incompleto

O schema prevê revisão, aprovação, rejeição, comentários e versionamento, porém esse fluxo ainda precisa virar experiência de produto completa, com telas, estados, regras e auditoria.[cite:19]

### 5. Inconsistência entre modelo e fluxo operacional

O sistema possui dados ricos, mas parte das rotinas ainda funciona como camada utilitária isolada, sem fechamento de ponta a ponta. Um exemplo é a coexistência de orçamento, estimativa, custo planejado, custo real e rateio de horas sem um fluxo financeiro claramente consolidado na interface.[cite:19]

### 6. Segurança e robustez incompletas

Ainda faltam mecanismos visíveis de hardening de produção, incluindo rate limit, política uniforme de autorização por ação, restrição de escopo por recurso, logging estruturado e fechamento mais forte das superfícies administrativas.[cite:14][cite:16][cite:19]

---

## Princípios de execução para IA implementadora

### Regra 1 — não improvisar arquitetura

A IA deve implementar usando a arquitetura já existente como base. Não deve reescrever todo o sistema, trocar stack ou introduzir abstrações genéricas sem necessidade clara.[cite:15][cite:19]

### Regra 2 — trabalhar por fluxo fechado

Cada entrega deve ser feita por fluxo completo, e não por arquivos isolados. Um fluxo só é considerado concluído quando inclui:

- schema/migration, quando necessário;
- validação Zod;
- Server Action ou API route padronizada;
- interface de criação/edição/listagem/detalhe, quando aplicável;
- feedback de erro/sucesso;
- autorização;
- testes mínimos do fluxo;
- documentação do comportamento.[cite:14][cite:17][cite:19]

### Regra 3 — manter contratos explícitos

Toda ação deve retornar sempre uma estrutura previsível. O padrão recomendado é:

```ts
{
  ok: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]> | string;
}
```

A IA não deve criar formatos alternados por ação. A previsibilidade do contrato é essencial para evitar deriva entre backend e frontend.

### Regra 4 — preferir refatoração incremental

Ao invés de apagar módulos inteiros, a IA deve:

1. entender o contrato existente;
2. corrigir o que está inconsistente;
3. completar o que falta;
4. remover duplicidades ao final, de forma consciente.

### Regra 5 — zero placeholder silencioso

Qualquer tela incompleta deve ser convertida em uma destas três situações explícitas:

- funcional;
- bloqueada por dependência identificada;
- desativada com aviso técnico claro.

Não deve existir página “semi-pronta” parecendo concluída.

---

## Harness operacional para a IA

### Objetivo do harness

O harness serve para impedir que a IA se perca, derive escopo, duplique lógica ou implemente partes desconectadas do produto. O comportamento esperado é orientado por etapas, critérios de aceite e checkpoints obrigatórios.

### Prompt-base de execução recomendada

```text
Você é responsável por concluir o ERP ArchFlow usando a base existente do repositório.

Regras obrigatórias:
1. Preserve a stack atual: Next.js App Router, Prisma, PostgreSQL, NextAuth, Tailwind, Zod.
2. Não reescreva o projeto do zero.
3. Antes de alterar qualquer fluxo, localize os arquivos existentes já relacionados ao módulo.
4. Implemente sempre por fluxo funcional completo, nunca por pedaços soltos.
5. Toda entrega deve incluir: modelagem, validação, ação, UI, autorização, tratamento de erro e teste mínimo.
6. Não criar campos no banco sem justificar a necessidade no domínio.
7. Não usar any quando houver alternativa viável tipada.
8. Não manter arquivos duplicados com responsabilidades equivalentes.
9. Toda mudança deve respeitar o domínio de escritório de arquitetura.
10. Toda tarefa deve terminar com checklist objetivo de aceite.
```

### Ciclo de execução por tarefa

```text
Para cada tarefa:
1. Ler arquivos atuais do módulo.
2. Descrever o comportamento já existente.
3. Identificar lacuna exata.
4. Propor a mudança mínima necessária.
5. Implementar backend.
6. Implementar frontend.
7. Garantir autorização.
8. Garantir validação.
9. Criar ou ajustar teste.
10. Executar checklist de aceite.
```

### Critério de parada por tarefa

Uma tarefa só termina quando todos os itens abaixo forem verdadeiros:

- fluxo roda localmente;
- persistência funciona no PostgreSQL local;
- não há erro de tipagem introduzido;
- tela principal do fluxo está utilizável;
- caso de erro principal foi tratado;
- regra de autorização foi aplicada;
- documentação da tarefa foi atualizada.

---

## Especificação de ambiente local com PostgreSQL em Docker

### Objetivo

Padronizar o ambiente local inicial usando PostgreSQL em container Docker, com persistência em volume e integração direta com Prisma.[cite:19]

### Arquivos a criar

#### `docker-compose.yml`

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16
    container_name: archflow_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: archflow
      POSTGRES_USER: archflow
      POSTGRES_PASSWORD: archflow
    ports:
      - '5432:5432'
    volumes:
      - archflow_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U archflow -d archflow']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  archflow_postgres_data:
```

#### `.env.example`

```env
DATABASE_URL="postgresql://archflow:archflow@localhost:5432/archflow?schema=public"
NEXTAUTH_SECRET="change-this-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Ajuste obrigatório em `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Bootstrap local esperado

```bash
docker compose up -d
npm install
npx prisma generate
npx prisma migrate dev --name init_local
npm run dev
```

### Regra de operação local

A IA deve sempre assumir que o banco inicial é local em Docker e que qualquer funcionalidade implementada precisa funcionar primeiro nessa configuração antes de qualquer hipótese de cloud ou banco gerenciado.

---

## Arquitetura funcional alvo

### Macrofluxos obrigatórios do produto

O sistema final deve fechar os seguintes macrofluxos:

1. autenticação e acesso;
2. cadastro e gestão de clientes;
3. criação e gestão de projetos;
4. estruturação por fases e estágios;
5. tarefas e Kanban por projeto;
6. atividades e agenda;
7. time tracking e apropriação de horas;
8. entregáveis e documentos;
9. aprovação e revisão de materiais;
10. orçamento, estimativa e acompanhamento financeiro;
11. relatórios e exportações;
12. notificações;
13. auditoria;
14. configurações do escritório e do usuário.

### Fluxo central do escritório de arquitetura

O fluxo principal de negócio do sistema deve ser tratado assim:

1. cadastrar lead/cliente;
2. registrar projeto;
3. associar equipe;
4. definir fases e estágios do projeto;
5. criar tarefas por estágio;
6. registrar atividades e horas;
7. gerar entregáveis;
8. submeter para revisão/aprovação;
9. controlar custo real versus planejado;
10. emitir relatórios e consolidar histórico.

Toda implementação futura deve reforçar esse encadeamento.

---

## Especificações técnicas por módulo

## Módulo 1 — Infraestrutura base

### Objetivo

Tornar o projeto executável, previsível e estável em ambiente local e posteriormente em deploy.

### Entregas obrigatórias

- criar `docker-compose.yml` para PostgreSQL local;
- criar `.env.example`;
- corrigir `schema.prisma` com `DATABASE_URL`;
- revisar `lib/prisma.ts` e garantir singleton correto;
- criar script de bootstrap local em `README.md`;
- remover arquivos temporários e logs do repositório;
- revisar `.gitignore`.

### Critérios de aceite

- `docker compose up -d` sobe banco com healthcheck verde;
- `npx prisma generate` funciona;
- `npx prisma migrate dev` funciona;
- aplicação sobe localmente sem erro fatal de banco;
- ambiente novo consegue rodar apenas com README e `.env.example`.

---

## Módulo 2 — Autenticação e autorização

### Estado atual

Há base funcional com NextAuth, callbacks JWT/session e ações de signup/signin/reset.[cite:14][cite:16]

### Lacunas

- reset de senha ainda está mockado por log, sem envio real de e-mail.[cite:14]
- autorização parece concentrada no login e sessão, mas precisa ser reforçada em cada Server Action.[cite:14][cite:16]
- falta padronização clara entre perfis globais e papéis por projeto.[cite:16][cite:19]

### Implementação exigida

- manter NextAuth atual;
- criar helper único `requireAuth()`;
- criar helper `requireProjectAccess(projectId, allowedRoles)`;
- aplicar autorização em todas as Server Actions;
- padronizar retornos de `Unauthorized`, `Forbidden` e `NotFound`;
- finalizar fluxo de reset com provider real posteriormente, mas manter modo local funcional via logging controlado em dev;
- revisar páginas públicas e privadas.

### Specs funcionais

- usuário não autenticado não entra em dashboard ou projeto;
- usuário autenticado não acessa login/registro desnecessariamente;
- membro `VIEWER` não edita projeto;
- `EDITOR` pode editar tarefas e atividades;
- `OWNER` controla membros, orçamento e configurações do projeto.

### Critérios de aceite

- todas as ações protegidas validam sessão;
- ações por projeto validam escopo de acesso;
- erros aparecem com feedback utilizável na UI;
- testes mínimos de autorização cobrem OWNER, EDITOR, VIEWER.

---

## Módulo 3 — Clientes

### Objetivo

Transformar o cadastro de clientes em um fluxo completo de CRM operacional para escritório de arquitetura.

### Requisitos funcionais

- cadastro PF/PJ;
- validação de CPF/CNPJ em nível de interface e/ou backend;
- campos de contato e preferência;
- endereço estruturado;
- tags;
- status do relacionamento;
- histórico resumido de interação;
- visualização de projetos associados;
- visualização de horas e valores associados quando aplicável.

### Requisitos técnicos

- separar schema Zod de create/update;
- normalizar telefone e documento;
- impedir duplicidade inconsistente;
- atualizar `lastInteractionAt` automaticamente quando houver atividade vinculada;
- evitar que `totalSpent` seja campo manual se puder ser calculado ou sincronizado.

### UI mínima obrigatória

- listagem paginada/filtrável;
- formulário de criação;
- edição;
- página de detalhe com abas: dados gerais, projetos, atividades, horas, arquivos.

### Critérios de aceite

- criar, editar, listar e detalhar cliente sem inconsistência;
- cliente excluído deve ser soft delete;
- projetos vinculados aparecem corretamente;
- filtros por status e categoria funcionam.

---

## Módulo 4 — Projetos

### Objetivo

Fechar o núcleo do ERP, fazendo com que projetos sejam o centro operacional do sistema.

### Estado atual

O modelo `Project` é rico e `project.ts` já possui várias rotinas úteis.[cite:19]

### Problemas observados

- `status` parece misturar estado textual com fallback para coluna Kanban ao criar projeto, o que indica sobrecarga semântica.[cite:19]
- uso de `phases` em JSON resolve rapidamente, mas exige disciplina forte na manipulação.[cite:19]
- revalidações apontam para caminhos possivelmente inconsistentes entre `/dashboard/projects` e `/projects/...`.[cite:19]

### Refatorações obrigatórias

- separar claramente `status` de projeto e estrutura de Kanban;
- definir enum ou conjunto controlado de status do projeto;
- manter `phases` como JSON apenas se a decisão for consciente e documentada; caso contrário, migrar para entidade relacional futura;
- consolidar rotas e revalidatePath coerentes;
- revisar `duplicateProject` e garantir cópia controlada de dados.

### UI mínima obrigatória

- listagem com filtros por status, cliente, data e visibilidade;
- criação com campos de negócio completos;
- detalhe por abas: visão geral, fases, tarefas, atividades, horas, entregáveis, orçamento, equipe, auditoria;
- edição segura;
- exclusão lógica com confirmação.

### Critérios de aceite

- projeto pode ser criado e editado sem ambiguidade no campo status;
- projeto exibe dados resumidos e operacionais;
- projeto suporta vínculo com cliente, equipe, tarefas, horas e entregáveis;
- projeto excluído não some fisicamente do banco.

---

## Módulo 5 — Fases, estágios e Kanban

### Objetivo

Organizar trabalho por etapas reais de projeto arquitetônico.

### Estado atual

Há modelo `Stage`, campos `phases` no projeto, modelo `ProjectKanbanColumn` e componentes de Kanban.[cite:18][cite:19]

### Problema estrutural principal

`ProjectKanbanColumn` não possui `projectId`, portanto não permite pipelines independentes por projeto.[cite:19]

### Correção obrigatória

Criar migration para ajustar o modelo:

```prisma
model ProjectKanbanColumn {
  id        String   @id @default(uuid())
  title     String
  color     String?
  order     Int      @default(0)
  projectId String   @map("project_id")
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([projectId, title])
  @@map("project_kanban_columns")
}
```

### Decisão arquitetural recomendada

- `phases`: macroetapas do projeto arquitetônico;
- `stages`/colunas Kanban: fluxo operacional das tarefas no projeto;
- `tasks`: unidades executáveis.

### UX esperada

- projeto pode ter template de fases;
- projeto pode ter colunas padrão por template;
- usuário pode mover tarefas por drag-and-drop;
- detalhes da tarefa abrem em drawer/modal lateral;
- progresso do projeto é calculado por fases e tarefas concluídas.

### Critérios de aceite

- cada projeto tem seu próprio Kanban;
- movimentação persiste em banco;
- reordenação não quebra posições;
- colunas podem ser criadas, editadas e removidas com segurança.

---

## Módulo 6 — Tarefas

### Objetivo

Garantir rastreabilidade real do trabalho técnico do escritório.

### Requisitos funcionais

- criar tarefa vinculada a projeto e estágio;
- título, descrição, prioridade, vencimento, responsável;
- checklist;
- comentários;
- anexos;
- histórico;
- aprovação quando aplicável;
- relacionamento com atividade, entregável e horas.

### Requisitos técnicos

- abandonar `any` quando houver tipo possível;
- padronizar shape de comentários/checklist/histórico;
- definir se anexos continuarão em JSON ou virarão entidade relacional futuramente;
- criar política clara para soft delete.

### Critérios de aceite

- tarefa pode ser criada, movida, editada e concluída;
- comentário e checklist persistem corretamente;
- responsável e prazo aparecem no card;
- tarefa se integra com horas e entregáveis.

---

## Módulo 7 — Atividades e agenda

### Objetivo

Controlar compromissos, visitas, reuniões, revisões e ações administrativas.

### Estado atual

O modelo `Activity` é bom e já cobre tipo, duração, horário, local, participantes, notas e anexos.[cite:19]

### Implementação exigida

- calendário mensal/semanal;
- criação de atividade vinculada a cliente, projeto ou tarefa;
- tipos padronizados por enum;
- visualização por agenda e por lista;
- atualização automática do `lastInteractionAt` do cliente;
- integração futura com Google Calendar, mas não obrigatória para o primeiro deploy local.

### Critérios de aceite

- atividade agenda corretamente com data/hora;
- atividade aparece no calendário e nas entidades relacionadas;
- mudança de status funciona;
- cliente e projeto mostram histórico de atividades.

---

## Módulo 8 — Time tracking

### Objetivo

Registrar horas gastas por usuário, projeto, tarefa e categoria para controle operacional e financeiro.

### Estado atual

O modelo `TimeLog` é forte e contempla duração, data, faixa horária, categoria, faturamento e taxa.[cite:19]

### Requisitos funcionais

- lançar horas manualmente;
- iniciar/parar cronômetro opcional em fase posterior;
- vincular a projeto/tarefa/cliente;
- marcar como faturável ou não;
- informar taxa horária quando aplicável;
- exibir consolidado por projeto, usuário e período.

### Requisitos de produto

- total de horas por projeto;
- distribuição por categoria;
- custo realizado estimado;
- base para relatórios e orçamento.

### Critérios de aceite

- lançamento cria registro válido;
- totais por projeto batem com somatório no banco;
- horas aparecem em dashboard e página de projeto;
- filtros por período e categoria funcionam.

---

## Módulo 9 — Entregáveis e documentos

### Objetivo

Fechar o fluxo mais crítico para um escritório de arquitetura: geração, versionamento, revisão, armazenamento e aprovação de materiais.

### Estado atual

O schema de `Deliverable` é maduro, mas a infraestrutura real de arquivo não está concluída.[cite:19]

### Estratégia para a primeira entrega funcional

Como o primeiro alvo é PostgreSQL local em Docker, a recomendação é dividir em duas etapas:

#### Etapa A — ambiente local funcional

- usar armazenamento local temporário em pasta do projeto, por exemplo `storage/` fora de `public`;
- criar rota segura de upload/download;
- registrar metadados no banco;
- suportar versionamento e histórico;
- aceitar PDF, imagem e documentos comuns inicialmente.

#### Etapa B — pós-MVP / deploy cloud

- trocar storage local por S3, Supabase Storage ou Vercel Blob;
- manter contrato abstrato `storageProvider` para evitar retrabalho.

### Fluxo obrigatório

1. criar entregável;
2. fazer upload do arquivo;
3. registrar versão;
4. enviar para revisão;
5. aprovar, aprovar com ajustes ou rejeitar;
6. registrar comentários de revisão;
7. manter trilha histórica;
8. disponibilizar download.

### Regras de negócio

- `DRAFT`: editável;
- `PENDING_REVIEW`: travado para alteração direta sem nova revisão;
- `APPROVED`: aprovado sem pendência;
- `APPROVED_WITH_CHANGES`: aprovado condicionado;
- `REJECTED`: precisa nova versão;
- `DELIVERED`: entregue formalmente ao cliente.

### Critérios de aceite

- upload local funciona;
- download funciona;
- versão incrementa corretamente;
- comentários de revisão ficam registrados;
- status do entregável respeita a máquina de estados.

---

## Módulo 10 — Orçamento, estimativa e financeiro

### Objetivo

Conectar planejamento, execução e custo para viabilizar gestão econômica do escritório.

### Estado atual

Há `Estimate`, `Budget`, `plannedCost`, `actualCost`, `billRate` e `invoiceId`, mas o fluxo ainda precisa ser consolidado na aplicação.[cite:19]

### Escopo mínimo para fechar MVP

- estimativa inicial por projeto;
- orçamento aprovado por projeto;
- acompanhamento de gasto realizado;
- comparação entre planejado e realizado;
- health status básico do orçamento;
- relatórios financeiros por projeto.

### Regras recomendadas

- `Estimate` representa previsão inicial;
- `Budget` representa orçamento operacional aprovado;
- `actualCost` é alimentado por lançamentos ou consolidação;
- `spentAmount` deve poder ser recalculado ou sincronizado;
- `remainingAmount` deve ser derivado, não digitado manualmente quando possível.

### MVP não obrigatório nesta fase

- emissão fiscal real;
- gateway de pagamento;
- conciliação bancária;
- ERP fiscal brasileiro completo.

### Critérios de aceite

- projeto exibe orçamento, estimativa e custo real;
- dashboard financeiro mostra variação;
- status `EXCEEDED` é calculado corretamente quando aplicável.

---

## Módulo 11 — Relatórios e exportações

### Estado atual

Há utilitários de exportação PDF e Excel e indício de ações de relatórios, inclusive com possível duplicidade entre arquivos correlatos.[cite:15][cite:17]

### Implementação exigida

- revisar e consolidar a camada de relatórios;
- eliminar duplicidade de arquivos equivalentes;
- expor relatórios úteis: projetos, horas, atividades, entregáveis, financeiro;
- permitir exportação para PDF e XLSX;
- manter filtros por período, cliente, projeto e responsável.

### Critérios de aceite

- relatórios geram dados coerentes;
- PDF exporta resumo legível;
- Excel exporta tabela útil para operação;
- não existem dois serviços paralelos fazendo a mesma função.

---

## Módulo 12 — Notificações

### Objetivo

Tornar o sistema reativo a eventos importantes do escritório.

### Estado atual

O schema cobre vários tipos de notificação e o projeto já possui componente de sineta/notificações.[cite:19]

### Escopo mínimo

Gerar notificação em:

- tarefa atribuída;
- comentário relevante;
- entregável aguardando aprovação;
- prazo próximo;
- atualização crítica de projeto.

### Critérios de aceite

- notificação é criada em evento relevante;
- usuário consegue marcar como lida;
- link de ação direciona para contexto correto;
- contagem de não lidas funciona.

---

## Módulo 13 — Auditoria

### Objetivo

Manter trilha confiável de ações sensíveis.

### Escopo mínimo

Auditar:

- criação, edição e exclusão lógica de projeto;
- alteração de orçamento;
- mudança de status de entregável;
- associação e remoção de membros;
- alteração de tarefa crítica.

### Critérios de aceite

- logs gravados com usuário, ação, entidade, entidadeId e timestamp;
- projeto exibe aba de auditoria;
- ações sensíveis ficam rastreáveis.

---

## Módulo 14 — Configurações

### Objetivo

Finalizar a camada administrativa mínima do produto.

### Escopo mínimo

- perfil do usuário;
- alteração de dados básicos;
- troca de senha autenticada;
- configurações do escritório em escopo inicial simples;
- preferências visuais e operacionais se já houver base.

### Evolução futura

Como o projeto ainda não possui multi-tenancy explícito, recomenda-se que a primeira entrega trate “configurações do escritório” de forma simples, preparando terreno para futura entidade `Organization`.[cite:19]

---

## Decisões estruturais obrigatórias antes do deploy

### 1. Resolver duplicidades

Arquivos com responsabilidade concorrente, especialmente na área de relatórios, devem ser auditados e consolidados.[cite:15][cite:17]

### 2. Padronizar retornos de Server Actions

Todas as actions devem responder no mesmo formato.

### 3. Padronizar validações

Toda entrada do usuário precisa passar por Zod antes de tocar o banco.

### 4. Reduzir uso de `any`

O uso de `(prisma as any)` deve ser tratado como débito técnico e removido progressivamente.[cite:19]

### 5. Consolidar rotas

A IA deve verificar e alinhar o que pertence a `/dashboard/...` e o que pertence a `/projects/...`, para evitar revalidação errada e UX inconsistente.[cite:19]

---

## Plano de execução por fases

## Fase 0 — Saneamento técnico

### Objetivo

Tornar o projeto executável e previsível localmente.

### Tarefas

- adicionar `DATABASE_URL` ao schema Prisma;
- criar `docker-compose.yml`;
- criar `.env.example`;
- revisar `.gitignore`;
- remover arquivos temporários, scripts ad-hoc e logs versionados;
- validar `prisma generate` e `migrate dev`.

### Saída esperada

Projeto sobe localmente com PostgreSQL Docker sem intervenção manual fora da documentação.

## Fase 1 — Fechamento do núcleo operacional

### Objetivo

Fechar clientes, projetos, Kanban, tarefas, atividades e horas.

### Tarefas

- consolidar CRUDs;
- corrigir Kanban por projeto;
- revisar status e fases;
- padronizar telas de listagem, detalhe e edição;
- garantir filtros e revalidações.

### Saída esperada

Escritório consegue operar projetos e trabalho interno no sistema.

## Fase 2 — Entregáveis e revisão

### Objetivo

Fechar documentos, arquivos e fluxo de aprovação.

### Tarefas

- implementar storage local;
- criar upload/download;
- criar versionamento e revisão;
- expor histórico e comentários.

### Saída esperada

Fluxo real de material arquitetônico gerado, revisado e aprovado.

## Fase 3 — Financeiro e relatórios

### Objetivo

Conectar execução ao controle de custo e saída gerencial.

### Tarefas

- consolidar estimate/budget;
- gerar relatórios;
- exportar PDF/XLSX;
- exibir indicadores por projeto.

### Saída esperada

Gestão mínima financeira e analítica do escritório.

## Fase 4 — Hardening para deploy

### Objetivo

Preparar ambiente e qualidade para entrega real.

### Tarefas

- testes críticos;
- revisão de permissões;
- tratamento de erro;
- revisão de performance básica;
- documentação operacional;
- pipeline de build/deploy.

### Saída esperada

Produto apto para deploy controlado.

---

## Backlog priorizado

| Prioridade | Item | Tipo | Bloqueio |
|---|---|---|---|
| P0 | Corrigir datasource Prisma com `DATABASE_URL` | Infra | Bloqueador total |
| P0 | Criar Docker local PostgreSQL | Infra | Bloqueador total |
| P0 | Criar `.env.example` | Infra | Bloqueador total |
| P0 | Remover arquivos temporários e logs | Saneamento | Bloqueador de qualidade |
| P1 | Corrigir `ProjectKanbanColumn` por projeto | Banco/domínio | Alto |
| P1 | Padronizar retorno das Server Actions | Arquitetura | Alto |
| P1 | Consolidar CRUD de projetos | Core | Alto |
| P1 | Consolidar CRUD de clientes | Core | Alto |
| P1 | Fechar tarefas/Kanban | Core | Alto |
| P1 | Fechar atividades e agenda | Core | Alto |
| P1 | Fechar time tracking | Core | Alto |
| P1 | Implementar storage local de arquivos | Core | Alto |
| P1 | Fechar entregáveis com revisão | Core | Alto |
| P2 | Consolidar orçamento e estimativa | Financeiro | Médio |
| P2 | Consolidar relatórios/exportações | Analytics | Médio |
| P2 | Fechar notificações | Produto | Médio |
| P2 | Fechar auditoria visível na UI | Produto | Médio |
| P3 | Integração de e-mail real | Infra | Médio |
| P3 | Integração Google Calendar | Evolução | Baixo |
| P3 | Multi-tenancy / Organization | Evolução estrutural | Alto impacto, não MVP |

---

## Definition of Done do projeto

O projeto só poderá ser considerado funcionalmente entregue quando todos os itens abaixo forem verdadeiros:

- ambiente local sobe com Docker e PostgreSQL;
- autenticação funciona com proteção de rotas e autorização por recurso;
- clientes, projetos, tarefas, atividades e horas operam de ponta a ponta;
- entregáveis podem ser enviados, versionados, revisados e baixados;
- orçamento e estimativa aparecem corretamente por projeto;
- relatórios principais podem ser exportados;
- notificações mínimas funcionam;
- auditoria básica funciona;
- erros críticos são tratados com feedback utilizável;
- há documentação suficiente para outro desenvolvedor subir o sistema;
- build de produção executa sem falhas de tipagem e sem inconsistências graves.

---

## Estratégia de testes

### Camada mínima obrigatória

- testes unitários para validações e helpers;
- testes de integração para Server Actions críticas;
- testes E2E para fluxos centrais.

### Fluxos E2E obrigatórios

1. login e acesso ao dashboard;
2. criação de cliente;
3. criação de projeto;
4. criação de tarefa e movimentação no Kanban;
5. lançamento de horas;
6. upload e aprovação de entregável;
7. atualização de orçamento;
8. geração de relatório.

### Regra para IA implementadora

Nenhum módulo central deve ser marcado como concluído sem pelo menos um teste representativo do fluxo principal.

---

## Estrutura recomendada de saída da IA por tarefa

Cada resposta/commit da IA deve seguir esta ordem:

1. contexto do que existe hoje;
2. problema exato a resolver;
3. arquivos alterados;
4. mudança no banco, se houver;
5. mudança em validação;
6. mudança em action/API;
7. mudança em UI;
8. testes adicionados/ajustados;
9. checklist de aceite.

Esse formato reduz a chance de implementação solta e facilita revisão humana.

---

## Restrições explícitas para evitar deriva

- não migrar para outro ORM;
- não migrar para outro framework;
- não criar microserviços;
- não introduzir mensageria complexa nesta fase;
- não implementar multi-tenancy completo antes de fechar o MVP single-office;
- não acoplar o MVP inicial a serviços pagos obrigatórios;
- não trocar toda a modelagem atual;
- não esconder débito técnico com comentários vagos ou TODOs silenciosos.

---

## Sequência recomendada de implementação imediata

### Sprint 1

- Docker PostgreSQL;
- `.env.example`;
- correção do Prisma datasource;
- limpeza do repositório;
- validação de boot local.

### Sprint 2

- refatoração do módulo de projetos;
- correção do Kanban por projeto;
- fechamento do fluxo de tarefas.

### Sprint 3

- fechamento do módulo de clientes;
- atividades/agenda;
- time tracking.

### Sprint 4

- storage local;
- entregáveis;
- fluxo de revisão e aprovação.

### Sprint 5

- orçamento/estimativa;
- relatórios/exportações;
- dashboard consolidado.

### Sprint 6

- notificações;
- auditoria visível;
- testes E2E centrais;
- hardening para deploy.

---

## Resultado esperado ao final

Ao final da execução deste plano, o ERP ArchFlow deverá operar como um sistema funcional para um escritório de arquitetura em ambiente local e pronto para seguir para deploy controlado, com domínio preservado, fluxos centrais fechados e infraestrutura inicial consistente.[cite:15][cite:19]

O diferencial deste plano é que ele não trata o projeto como protótipo genérico, mas como produto especializado de gestão para arquitetura, respeitando a riqueza do schema já existente e transformando essa base em operação real com especificação suficientemente detalhada para implementação assistida por IA.[cite:19]
