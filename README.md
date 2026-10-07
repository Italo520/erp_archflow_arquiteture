# ArchFlow ERP - Arquitetura Limpa e Moderna

Sistema Integrado de Gestão Empresarial (ERP) para Escritórios e Empresas de Arquitetura, Urbanismo e Design de Interiores.

---

## 🏛️ Visão Geral da Arquitetura

O sistema é construído sobre uma arquitetura desacoplada, performática e modular:

- **Frontend (`frontend/`):** Aplicação Single Page Application (SPA) construída com **React 19**, **Vite**, **TanStack Router** (roteamento tipado), **TanStack Query** (cache reativo de servidor), **Tailwind CSS** e componentes **Radix UI / Shadcn**.
- **Backend (`backend/`):** API REST robusta desenvolvida em **Java 21**, **Spring Boot 3.4**, **Spring Security (JWT)**, **Spring Data JPA / Hibernate**, com migrações versionadas via **Flyway**.
- **Banco de Dados:** **PostgreSQL 16** containerizado (porta `5436`).
- **Documentação (`docs/`):** Especificações de negócio, PRDs, diagramas e planos de evolução.
- **Arquivo Legado (`archive/legacy-nextjs/`):** Versão monolítica anterior arquivada para consulta histórica e rastreabilidade.

---

## 📁 Estrutura de Diretórios

```
erp_archflow_arquiteture/
├── frontend/                 # Frontend React 19 + Vite (porta 3000)
│   ├── src/
│   │   ├── components/      # UI Kit, Layout, Dialogs, Kanban
│   │   ├── context/         # Contextos globais (tema, auth)
│   │   ├── services/        # Clientes Axios da API REST (/api/v1)
│   │   ├── types/           # Tipagens TypeScript do domínio
│   │   └── views/           # Telas do sistema (Dashboard, Clientes, Projetos, etc.)
│   └── package.json
│
├── backend/                  # API REST Spring Boot (porta 8085)
│   ├── src/
│   │   ├── main/java/com/archflow/
│   │   │   ├── core/        # Segurança, JWT, tratamento global de erros
│   │   │   └── modules/     # Módulos: auth, client, project, activity, inspection, etc.
│   │   └── resources/
│   │       ├── db/migration # Migrações Flyway versionadas (V1 até V13)
│   │       └── application.yml
│   └── pom.xml
│
├── docs/                     # Documentação oficial, PRD e manuais
├── archive/                  # Código legado e histórico
│   └── legacy-nextjs/       # Versão Next.js 16 arquivada
├── docker-compose.yml        # Infraestrutura PostgreSQL local
└── package.json              # Scripts orquestradores da raiz
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js:** v20+ ou v22+
- **Java:** JDK 21
- **Maven:** 3.9+
- **Docker & Docker Compose**

### 1. Iniciar o Banco de Dados (PostgreSQL)
```bash
npm run docker:up
```
O PostgreSQL estará disponível em `localhost:5436` com usuário `postgres` e senha `postgres`.

### 2. Iniciar o Backend (Spring Boot)
```bash
npm run dev:back
```
A API REST inicializará na porta **`8085`** e o Flyway aplicará automaticamente todas as migrações até `V13`.

### 3. Iniciar o Frontend (Vite)
```bash
npm run dev
# ou
npm run dev:front
```
Acesse a aplicação no navegador em **`http://localhost:3000`**. O Vite possui proxy reverso configurado para repassar chamadas `/api` diretamente ao Spring Boot em `localhost:8085`.

---

## 🧪 Testes Automatizados & Blindagem QA

O projeto possui **226 testes automatizados verdes** com zero falhas e zero regressões:

- **Backend (JUnit 5 / MockMvc / Mockito):** `147 testes passando`
  ```bash
  npm run test:back
  # ou: mvn -f backend/pom.xml test
  ```
- **Frontend (Vitest / Testing Library):** `79 testes passando em 19 suítes`
  ```bash
  npm run test:front
  # ou: npm run test --prefix frontend
  ```
- **Build de Produção:**
  ```bash
  npm run build --prefix frontend
  ```

---

## 📚 Dossiês de Auditoria, Rastreabilidade & Roadmap

Todas as fatias verticais implementadas possuem dossiês vivos com especificações de Casos de Uso (UC) e Histórias de Usuário (US) com BDD/Gherkin:

| Módulo | Escopo Funcional | Dossiê de Auditoria |
| :--- | :--- | :--- |
| **01** | Autenticação, RBAC & Usuários | [`docs/auditoria/01-auth-rbac.md`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/docs/auditoria/01-auth-rbac.md) |
| **02** | Clientes & CRM Arquitetônico | [`docs/auditoria/02-clientes-crm.md`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/docs/auditoria/02-clientes-crm.md) |
| **03** | Projetos, Etapas & Kanban | [`docs/auditoria/03-projetos-kanban.md`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/docs/auditoria/03-projetos-kanban.md) |
| **04** | Atividades & Time Tracking Faturável | [`docs/auditoria/04-atividades-timetracking.md`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/docs/auditoria/04-atividades-timetracking.md) |
| **05** | Vistorias de Obra & Punch List | [`docs/auditoria/05-vistorias-punchlist.md`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/docs/auditoria/05-vistorias-punchlist.md) |
| **06** | Armazenamento & Documentos Técnicos | [`docs/auditoria/06-armazenamento-documentos.md`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/docs/auditoria/06-armazenamento-documentos.md) |
| **07** | Dashboards & Relatórios Financeiros | [`docs/auditoria/07-dashboards-relatorios.md`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/docs/auditoria/07-dashboards-relatorios.md) |
| **08** | Notificações SSE & Configurações | [`docs/auditoria/08-notificacoes-configuracoes.md`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/docs/auditoria/08-notificacoes-configuracoes.md) |

Consulte o documento oficial de análise de gaps e planejamento futuro:  
👉 **[Matriz de Gaps do PRD v3 & Roadmap de Evolução Contínua (`docs/GAP_ANALYSIS_ROADMAP.md`)](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/docs/GAP_ANALYSIS_ROADMAP.md)**

---

## 👤 Credenciais de Demonstração (Seed)

| Usuário | E-mail | Senha | Função |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@archflow.com` | `admin123` | OWNER / ADMIN |
| **Mariana Vasconcellos** | `mariana.vasconcellos@archflow.com` | `admin123` | ARCHITECT |
| **Carlos Mendonça** | `carlos.mendonca@archflow.com` | `admin123` | ENGINEER |
| **Júlia Alencar** | `julia.alencar@archflow.com` | `admin123` | DESIGNER |
