<div align="center">

# 🏛️ ArchFlow ERP — Gestão Especializada para Escritórios de Arquitetura

### *Plataforma integrada com arquitetura monolítica moderna em Next.js 16, Server Actions, Prisma ORM e PostgreSQL.*

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![NextAuth](https://img.shields.io/badge/Auth-NextAuth_v5-purple?style=for-the-badge&logo=auth0&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**[ 🇧🇷 Português ](./README.md)** &nbsp;|&nbsp; **[ 🇺🇸 English Version ](./README.en.md)**

---

</div>

## 📌 Visão Geral do Produto

O **ArchFlow ERP** é uma solução completa de software desenvolvida sob medida para resolver os desafios operacionais e financeiros de **escritórios de arquitetura e estúdios de design de interiores**.

Tradicionalmente, a rotina arquitetônica sofre com a dispersão de dados entre planilhas desconexas, mensageiros instantâneos e pastas desorganizadas em nuvem. Essa fragmentação resulta em:
- **Erosão da margem de lucro**: Falta de precisão no apontamento de horas técnicas e disparidade entre horas orçadas e executadas.
- **Ruptura de fluxo entre fases normatizadas**: Dificuldade em rastrear a transição entre *Briefing, Estudo Preliminar (EP), Anteprojeto (AP), Projeto Legal (PL), Projeto Executivo (PE)* e *Acompanhamento de Obra*.
- **Controle frágil de entregáveis**: Histórico disperso de aprovação de pranchas 2D, maquetes 3D e memoriais descritivos.
- **Relacionamento desestruturado com clientes**: Ausência de um dossiê integrado com histórico financeiro e segmentação jurídica (PF/PJ).

O **ArchFlow ERP** integra todas essas dimensões em um monólito modular de alta performance, viabilizado por **Next.js 16 (App Router)**, **Server Actions tipadas**, **Prisma ORM 7** e persistência transacional com **PostgreSQL**.

---

## 📸 Telas Reais do Sistema (Next.js 16 + Tailwind CSS v4 + Radix UI)

As imagens abaixo foram capturadas diretamente da aplicação em execução no ambiente local:

### 🔐 1. Tela de Autenticação & Gestão de Acesso
Controle de acesso com validação rigorosa de credenciais, hashing de senhas com `bcryptjs` e emissão de sessões seguras via NextAuth v5:
![Tela de Autenticação Real](docs/assets/demos/real_04_login.png)

---

### 📊 2. Painel Executivo & Dashboard de Indicadores (KPIs)
Visão consolidada com métricas de faturamento mensal, volume de clientes ativos, projetos em andamento e radar de prazos contratuais:
![Dashboard Executivo Real](docs/assets/demos/real_01_dashboard.png)

---

### 📈 3. Métricas de Produtividade & Análise de Projetos
Monitoramento analítico de esforço despendido pela equipe técnica por fase projetual e status de entrega operacional:
![Métricas e Produtividade Real](docs/assets/demos/real_02_dashboard_charts.png)

---

### 👤 4. Dossiê do Cliente & Gestão de Relacionamento (CRM)
Ficha cadastral completa com segmentação jurídica (PF/PJ), canais preferenciais de atendimento (WhatsApp), total transacionado e projetos vinculados:
![Dossiê do Cliente Real](docs/assets/demos/real_03_client_details.png)

---

## 🎬 Demonstrações em Ação (Fluxos Animados)

As animações abaixo demonstram a experiência dinâmica de navegação e operação dos fluxos principais da aplicação em largura total:

### 🖥️ 1. Cadastro Completo & Parametrização Técnica de Obra: Dashboard ➔ Novo Projeto ➔ Ficha Técnica ➔ Quadro Kanban
Demonstração do fluxo operacional de criação de uma nova obra arquitetônica: entrada de dados cadastrais, seleção de tipologia e especificações técnicas de engenharia (área construída, custo orçado, pavimentos e garagens), validação atômica via Server Actions e inserção reativa no quadro Kanban:
![Cadastro Completo de Obra](docs/assets/demos/01-dashboard-overview.gif)

---

### 🏗️ 2. Gestão de Obras & Workflow Normativo CAU/BR: Alternância Lista/Kanban ➔ Busca ➔ Workspace Técnico ➔ Fases & Tarefas
Fluxo de trabalho de engenharia e arquitetura: transição de visualização entre Lista e Kanban, busca reativa de projetos, e navegação no workspace técnico da obra exibindo as 4 etapas normativas (Levantamento, Estudo Preliminar, Anteprojeto, Projeto Executivo) com checklist e detalhamento de atividades:
![Gestão de Obras e Kanban](docs/assets/demos/02-project-kanban-workflow.gif)

---

### ⏱️ 3. Apontamento de Horas Técnicas & Gestão de Produtividade: Cronômetro ➔ Entrada Manual ➔ Timesheet ➔ Dashboard Executivo
Controle de produtividade e rentabilidade por projeto: apontamento manual de horas técnicas categorizadas (Design/Modelagem 3D, Projetos Executivos, Compatibilização), registro imediato na folha de ponto (Timesheet) e atualização dos indicadores consolidados de produtividade e custo no Dashboard executivo:
![Apontamento de Horas e Produtividade](docs/assets/demos/03-crm-clients-workflow.gif)

---

## ✨ Principais Funcionalidades

- **Gestão Especializada de Projetos de Arquitetura**:
  - Cadastro de metadados técnicos avançados: estilo arquitetônico (*Modernista, Contemporâneo, Minimalista, Industrial, Rústico*), tipologia construtiva (*Alvenaria, Steel Frame, Concreto Armado, Madeira*), área construída, pavimentos, garagens, paisagismo e exigência de licenças ambientais.
  - Controle formal de entregáveis com fluxo de aprovação (*Draft, Pending Review, Approved, Delivered*).
- **Quadro Kanban & Gestão Ágil**:
  - Movimentação fluida de tarefas técnicas via drag & drop (@dnd-kit).
  - Checklists dinâmicos por tarefa e classificação por prioridade (*Low, Medium, High, Urgent*).
- **CRM Integrado & Carteira de Clientes**:
  - Tratamento diferenciado para Pessoa Física (PF) e Pessoa Jurídica (PJ com Razão Social e Inscrição Estadual).
  - Categorias especializadas: Residencial, Comercial, Institucional e Industrial.
  - Geolocalização de projetos e métrica de receita acumulada por cliente (`totalSpent`).
- **Timesheet & Inteligência de Produtividade**:
  - Cronômetro ativo e apontamento manual de horas por categoria de esforço (*Design/Criação, Revisão, Reunião com Cliente, Trâmites Administrativos, Visita à Obra*).
  - Comparativo contínuo entre horas orçadas vs. horas realizadas.
- **Controle Orçamentário & Governança**:
  - Comparativo dinâmico de custo planejado (`plannedCost`) vs. custo efetivo acumulado (`actualCost`).
  - Controle de Acesso Baseado em Papéis (RBAC): `OWNER` (proprietário), `EDITOR` (arquiteto) e `VIEWER` (cliente/consulta).
  - Trilha imutável de auditoria (`AuditLog`) para conformidade e rastreabilidade total.

---

## 🏛️ Arquitetura do Sistema

A aplicação adota o modelo de **Monólito Modular Full Stack** em Next.js 16, unificando apresentação e lógica de negócios com tipagem estrita de ponta a ponta:

```mermaid
flowchart TD
    subgraph UI ["🖥️ Camada de Apresentação (Client-Side & SSR)"]
        NextPages["Next.js 16 App Router\n(Páginas & Layouts Protegidos)"]
        ComponentsUI["Radix UI & Tailwind CSS v4\n(Componentes Acessíveis & Temas)"]
        KanbanDnd["Kanban Interativo\n(@dnd-kit & Touch/Pointer Sensors)"]
        RechartsView["Gráficos de Produtividade\n(Recharts ResponsiveContainer)"]
    end

    subgraph Actions ["⚡ Camada de Aplicação (Server Actions)"]
        ProjectActions["Project Actions\n(CRUD, Fases, Duplicação, Soft-Delete)"]
        ClientActions["Client Actions\n(Dossiê, Validação Documental, CRM)"]
        TaskActions["Task & Kanban Actions\n(Posições, Checklists, Status)"]
        TimeLogActions["TimeLog Actions\n(Apontamento de Horas, Timer)"]
        AuthActions["Auth Actions\n(NextAuth v5, Sessões, RBAC)"]
    end

    subgraph SecurityDomain ["🛡️ Domínio & Segurança"]
        ZodValidator["Validação de Entrada com Zod\n(lib/validations.ts)"]
        RBACGuard["Controle de Acesso RBAC\n(OWNER | EDITOR | VIEWER)"]
        AuditService["Trilha de Auditoria\n(AuditLog Imutável)"]
    end

    subgraph DataAccess ["🗄️ Acesso a Dados & Persistência"]
        PrismaClient["Prisma ORM 7.2\n(Client Tipado & Transações Atômicas)"]
        PostgresDB[(PostgreSQL 16\nSchema Relacional & Campos JSON)]
    end

    subgraph Auxiliary ["📢 Infraestrutura Auxiliar"]
        PusherSocket["Pusher WebSockets\n(Atualizações em Tempo Real)"]
        ResendMail["Resend API\n(Notificações & Redefinição de Senha)"]
    end

    %% Relações
    NextPages --> ComponentsUI
    ComponentsUI --> KanbanDnd
    ComponentsUI --> RechartsView

    ComponentsUI --> Actions
    KanbanDnd --> TaskActions

    ProjectActions --> ZodValidator
    ClientActions --> ZodValidator
    TaskActions --> ZodValidator
    TimeLogActions --> ZodValidator

    ZodValidator --> RBACGuard
    RBACGuard --> PrismaClient
    RBACGuard --> AuditService

    PrismaClient --> PostgresDB
    AuditService --> PostgresDB

    Actions -.-> PusherSocket
    AuthActions -.-> ResendMail
```

---

## 🧩 Padrões de Projeto & Engenharia de Software

O desenvolvimento do ArchFlow ERP aplicou padrões estruturados de engenharia de software para garantir escalabilidade e separação limpa de responsabilidades:

### 1. Server Actions com Validação Defensiva Zod & Retorno Tipado
* **Problema:** Mutações de dados desordenadas no backend geram inconsistências, falhas silenciosas e códigos de erro genéricos.
* **Solução:** Toda mutação transita por um schema estrito do Zod e devolve uma estrutura padronizada `ActionResponse<T>` (`{ success: boolean, data?: T, error?: string }`).

```mermaid
classDiagram
    class ActionResponse~T~ {
        +boolean success
        +T data
        +string error
    }

    class ProjectSchema {
        +string name
        +ArchitecturalStyle architecturalStyle
        +ConstructionType constructionType
        +number totalArea
        +Date deliveryDate
        +parse(data)
    }

    class ProjectActions {
        +createProject(formData) ActionResponse~Project~
        +duplicateProject(id) ActionResponse~Project~
        +deleteProject(id) ActionResponse~void~
    }

    ProjectActions ..> ProjectSchema : valida com
    ProjectActions ..> ActionResponse : retorna
```

---

### 2. Role-Based Access Control (RBAC) & Autorização de Sessão
* **Problema:** Usuários de diferentes níveis (arquitetos parceiros, clientes e titulares do escritório) não podem ter os mesmos privilégios sobre dados financeiros e deleção de projetos.
* **Solução:** Interceptação contextual de sessão via NextAuth v5 com verificação declarativa de roles (`OWNER`, `EDITOR`, `VIEWER`) antes de qualquer mutação crítica.

```mermaid
classDiagram
    class UserRole {
        <<enumeration>>
        OWNER
        EDITOR
        VIEWER
    }

    class PermissionGuard {
        +assertRole(sessionUser, requiredRole) void
        +canEditProject(user, project) boolean
        +canViewFinancials(user) boolean
    }

    class AuditLogService {
        +logAction(userId, action, entity, details) void
    }

    PermissionGuard --> UserRole : avalia
    PermissionGuard ..> AuditLogService : audita desvios
```

---

### 3. Padrão Soft Delete Transacional (Prisma)
* **Problema:** A exclusão física direta de projetos corrompe vínculos históricos de auditoria, faturamento acumulado do cliente e apontamentos de horas da equipe.
* **Solução:** Deleção lógica via coluna temporal `deletedAt`, acompanhada de transação atômica (`prisma.$transaction`) que desativa em cascata tarefas e colunas relacionadas sem destruir a integridade relacional.

```mermaid
classDiagram
    class SoftDeletable {
        +DateTime deletedAt
        +boolean isDeleted()
    }

    class Project {
        +string id
        +string name
        +DateTime deletedAt
        +softDelete()
    }

    class Task {
        +string id
        +DateTime deletedAt
        +cascadeSoftDelete()
    }

    SoftDeletable <|-- Project : implements
    SoftDeletable <|-- Task : implements
    Project o-- Task : desativa em cascata
```

---

### 4. Motor de Time Tracking & Custos (Orçado vs. Realizado)
* **Problema:** Escritórios de arquitetura comumente cobram valores fechados por projeto, mas têm custos internos variáveis por hora trabalhada, perdendo a noção de lucratividade real.
* **Solução:** Mapeamento contínuo de registros de tempo (`TimeLog`) com cálculo automático de custo efetivo (`actualCost`) contrastado com o orçamento aprovado (`plannedCost`).

```mermaid
classDiagram
    class ProjectFinancialEngine {
        +plannedCost: Decimal
        +actualCost: Decimal
        +calculateMargin() Decimal
        +syncFinancials(projectId) void
    }

    class TimeLog {
        +DateTime startTime
        +DateTime endTime
        +TimeLogCategory category
        +calculateHours() float
    }

    ProjectFinancialEngine o-- TimeLog : consolida horas
```

---

## 🗄️ Modelo de Dados (Diagrama ER)

```mermaid
erDiagram
    USER ||--o{ PROJECT : "gerencia (owner)"
    USER ||--o{ TASK : "atribuído a"
    USER ||--o{ TIMELOG : "aponta horas"
    USER ||--o{ CLIENT : "responsável por"
    USER ||--o{ AUDITLOG : "origina"

    CLIENT ||--o{ PROJECT : "contrata"
    CLIENT ||--o{ TIMELOG : "recebe horas"

    PROJECT ||--o{ TASK : "contém"
    PROJECT ||--o{ DELIVERABLE : "produz"
    PROJECT ||--o{ TIMELOG : "acumula custos"
    PROJECT ||--o{ STAGE : "divide-se em"

    STAGE ||--o{ TASK : "organiza"

    USER {
        string id PK
        string full_name
        string email UK
        string password_hash
        Role role
        datetime created_at
    }

    CLIENT {
        string id PK
        string name
        string email UK
        ClientLegalType legal_type
        string document UK
        ClientCategory category
        ClientStatus status
        decimal total_spent
        string contact_preference
    }

    PROJECT {
        string id PK
        string name
        ArchitecturalStyle architectural_style
        ConstructionType construction_type
        float total_area
        decimal planned_cost
        decimal actual_cost
        datetime delivery_date
        datetime deleted_at
    }

    TASK {
        string id PK
        string title
        Priority priority
        json checklist
        datetime due_date
        datetime deleted_at
    }

    TIMELOG {
        string id PK
        datetime start_time
        datetime end_time
        TimeLogCategory category
        string description
    }

    DELIVERABLE {
        string id PK
        string title
        DeliverableType type
        DeliverableStatus status
        string file_url
    }

    AUDITLOG {
        string id PK
        AuditAction action
        string entity_name
        json diff
        datetime created_at
    }
```

---

## 🔄 Diagrama de Sequência (Fluxo de Execução)

O fluxo abaixo descreve o ciclo de vida de uma operação crítica no ArchFlow ERP: a **Criação de um Projeto com Validação Zod, Verificação de Permissões RBAC, Persistência Transacional no Prisma e Auditoria**:

```mermaid
sequenceDiagram
    autonumber
    actor Arquiteto as Arquiteto / Gestor
    participant UI as Interface React (Client)
    participant Action as Project Server Action
    participant Zod as Zod Schema (validations.ts)
    participant Guard as RBAC Guard (auth.ts)
    participant Prisma as Prisma ORM (Client)
    participant DB as PostgreSQL (Database)
    participant Audit as AuditLog Service

    Arquiteto->>UI: Submete formulário com dados técnicos do projeto
    UI->>Action: createProject(formData)
    Action->>Zod: parse(formData)
    Zod-->>Action: dados validados e tipados
    
    Action->>Guard: checkSessionAndRole(session, "EDITOR")
    Guard-->>Action: autorização confirmada

    Action->>Prisma: $transaction([createProject, createDefaultStages, createKanbanColumns])
    Prisma->>DB: INSERT INTO projects, stages, kanban_columns
    DB-->>Prisma: confirmação e IDs gerados
    Prisma-->>Action: Projeto instanciado

    Action->>Audit: recordLog(Action.CREATE, "PROJECT", projectId)
    Audit->>DB: INSERT INTO audit_logs
    DB-->>Audit: OK

    Action->>UI: revalidatePath('/projects') + { success: true, data: project }
    UI-->>Arquiteto: Exibe toast de sucesso e redireciona para o Kanban do Projeto
```

---

## 📐 Princípios SOLID e Clean Architecture na Prática

| Princípio | Aplicação no ArchFlow ERP | Benefício Técnico Obtido |
| :--- | :--- | :--- |
| **S - Single Responsibility** | Separação estrita entre Server Actions de negócio (`actions/`), validação pura (`validations.ts`), componentes de visualização (`components/`) e camada de dados (`prisma.ts`). | Cada módulo possui uma única motivação para modificação, reduzindo acoplamento e efeitos colaterais. |
| **O - Open/Closed** | Esquema extensível de metadados arquitetônicos via Enums e colunas JSON estruturadas para checklists e fases sem necessidade de quebrar contratos de API. | Novos estilos arquitetônicos ou tipos de entregáveis são agregados sem alterar o código existente. |
| **L - Liskov Substitution** | Ações de backend aderem à interface polimórfica uniforme `ActionResponse<T>`, consumidas com previsibilidade no frontend. | Qualquer Server Action pode ser tratada de forma intercambiável pelos interceptores de UI e exibidores de Toast. |
| **I - Interface Segregation** | Componentes de abas segmentados (`ProjectFinancialTab`, `ProjectPhasesTab`, `ProjectDocumentsTab`) consomem apenas as propriedades específicas que utilizam. | Evita re-renderizações desnecessárias e props sobrecarregadas na raiz do componente. |
| **D - Dependency Inversion** | Camadas de serviço dependem de abstrações de dados e de clientes isolados (`lib/prisma.ts`), e não de implementações voláteis de rede. | Testabilidade simplificada com mocks e desacoplamento do motor de banco de dados. |

---

## 🚀 Guia de Instalação e Execução

### Pré-requisitos
- **Node.js**: Versão 20 ou superior (`node -v`)
- **Docker & Docker Compose**: Para execução do container PostgreSQL (`docker --version`)

---

### Passo a Passo

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/Italo520/erp_archflow_arquiteture.git
   cd erp_archflow_arquiteture
   ```

2. **Instalar Dependências**:
   ```bash
   npm install
   ```

3. **Subir o Banco de Dados com Docker**:
   ```bash
   docker compose up -d
   ```
   > *Inicia o container do PostgreSQL 16 na porta configurada.*

4. **Configurar as Variáveis de Ambiente**:
   Crie um arquivo `.env` na raiz do projeto com base no modelo:
   ```env
   # Banco de Dados Relacional (PostgreSQL)
   DATABASE_URL="postgresql://postgres:postgres@localhost:5436/archflow?schema=public"

   # Autenticação (NextAuth.js v5)
   AUTH_SECRET="sua-chave-secreta-openssl"
   NEXTAUTH_URL="http://localhost:3000"

   # (Opcional) WebSockets e E-mail
   PUSHER_APP_ID="seu-app-id"
   PUSHER_KEY="sua-chave"
   PUSHER_SECRET="seu-secret"
   PUSHER_CLUSTER="sa1"
   RESEND_API_KEY="sua-chave-resend"
   ```

5. **Sincronizar e Popular o Banco de Dados**:
   ```bash
   # Gera os tipos do Prisma Client
   npx prisma generate

   # Aplica o schema ao banco PostgreSQL
   npx prisma db push

   # Popula os dados iniciais de demonstração (seed)
   npx prisma db seed
   ```

6. **Iniciar a Aplicação em Modo de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em: `http://localhost:3000`.

---

### 🧪 Execução da Suíte de Testes

O projeto dispõe de testes automatizados com Jest e Playwright:

```bash
# Executar suíte completa de testes unitários e de integração:
npm test

# Executar testes ponta a ponta (E2E) com Playwright:
npx playwright test
```

---

## 🛠️ Tecnologias & Bibliotecas Utilizadas

| Camada / Função | Tecnologias Utilizadas |
| :--- | :--- |
| **Framework Full Stack** | Next.js 16.1.1 (App Router), React 19, TypeScript 5.3+ |
| **Lógica de Servidor & Backend** | Next.js Server Actions nativas com revalidação de cache |
| **Banco de Dados & ORM** | PostgreSQL 16 com Prisma ORM 7.2 |
| **Autenticação & Segurança** | NextAuth.js v5 (Beta), bcryptjs (hashing de senhas), RBAC |
| **Estilização & Design System** | Tailwind CSS v4, PostCSS, Lucide React Icons |
| **Componentes de Interface** | Radix UI Primitives, shadcn/ui pattern, TipTap Editor |
| **Interatividade & Visualização** | @dnd-kit (Kanban drag & drop), Recharts (gráficos analíticos) |
| **Validação de Dados** | Zod (schemas defensivos de formulário e ações) |
| **Mobile & PWA** | @ducanh2912/next-pwa (suporte a Progressive Web App) |
| **Testes Automatizados** | Jest, React Testing Library, ts-jest, Playwright E2E |
| **Containerização** | Docker & Docker Compose v3.8 |

---

## 👨‍💻 Autor

Desenvolvido por **Ítalo**

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE). Consulte o arquivo `LICENSE` para obter mais detalhes.
