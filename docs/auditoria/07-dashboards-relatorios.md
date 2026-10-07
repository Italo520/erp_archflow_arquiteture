# 📊 Dossiê de Auditoria e QA: Módulo 07 — Dashboards & Relatórios Financeiros

- **Data da Auditoria**: 06 de Outubro de 2026
- **Status de Conformidade**: ✅ 100% CONCLUÍDO & BLINDADO (Fase 7)
- **Responsáveis**: Italo520 & Antigravity
- **Módulo**: `modules/project/controller/DashboardMetricsController` (Backend) & `views/DashboardView`, `views/ReportsView` (Frontend)
- **Stack Técnica**: Spring Boot 3.4.3 (Java 21), React 19, TypeScript, Recharts, TanStack Router, Vitest 3.x, Happy-DOM, Testing Library
- **Métricas Consolidadas**:
  - Backend: 142 testes passando (100% verde em `mvn test`), sendo 4 testes de `DashboardMetricsControllerTest` cobrindo agregação, soft-delete, BigDecimal e ordenação.
  - Frontend: 71 testes passando em 17 suítes (100% verde em `vitest run`), incluindo `dashboardApi.test.ts` (2/2), `DashboardView.test.tsx` (4/4) e `ReportsView.test.tsx` (4/4).
  - Build: 100% verde (`tsc && vite build`).

---

## 1. Casos de Uso (Use Cases)

### UC-01: Consolidação Executiva de Indicadores (KPIs do Negócio)
- **Atores**: Diretor do Escritório / Arquiteto Titular / Coordenador de Projetos.
- **Pré-condições**: Usuário autenticado no ERP ArchFlow.
- **Fluxo Principal**:
  1. O usuário acessa a tela de Dashboard (`/dashboard`) ou requisita `GET /api/v1/dashboard/metrics`.
  2. O backend consulta os repositórios de Projetos, Clientes, Vistorias e Time Tracking.
  3. Filtra apenas registros ativos (excluindo registros marcados com exclusão lógica `deletedAt != null`).
  4. Calcula o montante total planejado (`totalPlannedCost`) acumulando com precisão `BigDecimal`.
  5. Agrupa a distribuição de projetos por status e compila os 5 projetos cadastrados mais recentemente ordenados por data decrescente.
  6. O sistema exibe os 4 cards de KPI interativos: "Projetos Ativos", "Clientes", "Vistorias Técnicas" e "Atividades & Prazos".
  7. Clicar em qualquer card navega para a visão detalhada correspondente.

---

### UC-02: Visualização Gráfica de Pipeline e Evolução Financeira
- **Atores**: Gestor do Escritório / Equipe de Arquitetura.
- **Fluxo Principal**:
  1. O dashboard renderiza dois gráficos analíticos via Recharts:
     - Gráfico de Linha (Evolução Financeira: Orçado vs Realizado nos últimos 6 meses).
     - Gráfico de Barras (Distribuição quantitativa de projetos por fase do ciclo de vida: Conceitual, Anteprojeto, Executivo, Em Obra, Concluído).
  2. O usuário inspeciona tooltips com valores formatados em moeda nacional (`R$`).
  3. Abaixo dos gráficos, visualiza os projetos em destaque com código de prancha (`PRJ-001`), descrição, badge de fase e link direto para os detalhes do projeto.

---

### UC-03: Relatórios Gerenciais e Análise de Margem por Projeto
- **Atores**: Gestor Financeiro / Administrador.
- **Fluxo Principal**:
  1. O usuário acessa a página de Relatórios (`/reports`).
  2. Visualiza 4 KPIs financeiros consolidados: Faturamento Acumulado, Projetos em Andamento, Horas Apontadas e Clientes Atendidos.
  3. Utiliza o seletor de período para alternar entre "Este Mês", "Este Trimestre" e "Este Ano".
  4. Analisa a tabela analítica com colunas: Projeto, Cliente, Fase Atual, Orçamento Previsto, Custo Realizado, Margem (%) e Status Orçamentário com badge indicativo ("Dentro do Orçamento" ou "Atenção a Custos").
  5. Aciona os botões "Exportar CSV" ou "Gerar PDF Oficial".

---

## 2. Histórias de Usuário (User Stories) & Critérios de Aceitação (BDD / Gherkin)

### US-01: Acompanhamento de KPIs em Tempo Real
> **Como** titular de escritório de arquitetura  
> **Quero** visualizar os principais números do escritório em um único painel  
> **Para que** tome decisões estratégicas sobre capacidade de entrega e prazos

- **Cenário 1 (Consulta de Métricas Ativas - ECP Válido)**:
  - **Dado** que existem 3 projetos ativos e 1 projeto deletado logicamente no banco
  - **Quando** o endpoint `GET /api/v1/dashboard/metrics` é chamado
  - **Então** o totalProjects retornado é exatamente 3
  - **E** o projeto deletado não entra na soma nem no cálculo de custos.

- **Cenário 2 (Navegação Interativa nos Cards de KPI - ECP Válido)**:
  - **Dado** que o painel de Dashboard foi renderizado
  - **Quando** o usuário clica no card "Projetos Ativos"
  - **Então** o callback de navegação é acionado para a rota `/projects`.

---

### US-02: Visualização de Gráficos e Projetos Recentes
> **Como** coordenador de projetos  
> **Quero** inspecionar a distribuição de pranchas por fase e projetos recentes  
> **Para que** identifique gargalos operacionais antes da entrega

- **Cenário 1 (Renderização dos Gráficos Analíticos - ECP Válido)**:
  - **Dado** que a tela de Dashboard é carregada
  - **Então** os títulos "Evolução Financeira (Orçado vs Realizado)" e "Projetos por Fase do Kanban" estão visíveis
  - **E** a seção "Projetos em Destaque" apresenta os links de acesso rápido.

---

### US-03: Relatório Financeiro e Margem de Contratos
> **Como** gestor financeiro do escritório  
> **Quero** analisar o custo previsto versus realizado de cada projeto  
> **Para que** garanta rentabilidade positiva nos contratos executivos

- **Cenário 1 (Visualização de Tabela de Margem - ECP Válido)**:
  - **Dado** que estou na tela de relatórios gerenciais
  - **Então** a tabela lista os projetos com orçamento previsto, custo realizado e margem percentual calculada
  - **E** exibe badges de alerta ("Dentro do Orçamento" ou "Atenção a Custos").

- **Cenário 2 (Filtro por Período - Transição de Estados)**:
  - **Dado** que o seletor está inicialmente em "Este Mês"
  - **Quando** o usuário seleciona "Este Trimestre"
  - **Então** o estado do componente reflete o novo período selecionado.

---

## 3. Matriz de Rastreabilidade e Técnicas de QA Aplicadas

| ID | Alvo | Técnica QA | Tipo de Teste | Status |
|:---|:---|:---|:---|:---|
| **TC-DSH-01** | `DashboardMetricsController.getMetrics` | ECP / Fluxo Válido | Backend (Unit / MockMvc) | Aprovado (Passou) |
| **TC-DSH-02** | `DashboardMetricsController.getMetrics` | Soft Delete (Filtro de deletados) | Backend (Unit / MockMvc) | Aprovado (Passou) |
| **TC-DSH-03** | `DashboardMetricsController.getMetrics` | Boundary / Precisão BigDecimal | Backend (Unit / MockMvc) | Aprovado (Passou) |
| **TC-DSH-04** | `DashboardMetricsController.getMetrics` | Ordenação & Limite (5 projetos) | Backend (Unit / MockMvc) | Aprovado (Passou) |
| **TC-DSH-05** | `dashboardApi.getMetrics` | Contrato HTTP / Axios | Frontend (Unit) | Aprovado (Passou) |
| **TC-DSH-06** | `DashboardView` | ECP (Renderização dos 4 KPI cards) | Frontend (Testing Library) | Aprovado (Passou) |
| **TC-DSH-07** | `DashboardView` | Interação / Navegação nos Cards | Frontend (Testing Library) | Aprovado (Passou) |
| **TC-DSH-08** | `DashboardView` | Gráficos e Projetos em Destaque | Frontend (Testing Library) | Aprovado (Passou) |
| **TC-DSH-09** | `ReportsView` | ECP (KPIs financeiros e tabela) | Frontend (Testing Library) | Aprovado (Passou) |
| **TC-DSH-10** | `ReportsView` | Transição de Estados (Seletor de período) | Frontend (Testing Library) | Aprovado (Passou) |
| **TC-DSH-11** | `ReportsView` | Ações de Exportação (CSV e PDF) | Frontend (Testing Library) | Aprovado (Passou) |

---

## 4. Definition of Done (DoD) do Módulo

- [x] Casos de Uso (UC-01 a UC-03) documentados formalmente.
- [x] User Stories com cenários BDD/Gherkin especificados.
- [x] Testes unitários e de integração de Backend implementados para `DashboardMetricsController` (`mvn test`).
- [x] Contrato de API `dashboardApi` e testes implementados no Frontend.
- [x] Testes unitários de Frontend (`DashboardView.test.tsx` e `ReportsView.test.tsx`) implementados e verdes (`vitest`).
- [x] Build de produção do frontend (`npm run build`) validado sem erros TypeScript.
- [x] Estado persistido no GSD (`.planning/STATE.md`).
