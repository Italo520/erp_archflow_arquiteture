# 🚀 Walkthrough Executivo & Técnico: ArchFlow ERP

Este documento consolida a demonstração operacional e técnica de todas as funcionalidades entregues, testadas e blindadas no **ArchFlow ERP**.

---

## 🏛️ 1. Visão Geral do Sistema

O **ArchFlow ERP** é uma plataforma full-stack especialista para escritórios de arquitetura, integrando CRM, pipeline de projetos, time tracking faturável, vistorias de campo, armazenamento técnico e inteligência de negócios.

---

## 📱 2. Módulos Operacionais e Fluxos de Uso

### 🔐 2.1 Autenticação & RBAC
- Login seguro com geração e validação de tokens JWT.
- Papéis de acesso baseados em funções: `ADMIN`, `ARCHITECT` e `VIEWER`.
- Sessão mantida no frontend com interceptor de autorização automático.

### 👥 2.2 CRM & Gestão de Clientes
- Cadastro completo de clientes Pessoas Físicas (CPF) e Pessoas Jurídicas (CNPJ).
- Classificação por categoria: Residencial, Comercial, Corporativo, etc.
- Ciclo de vida do relacionamento: `PROSPECT`, `ACTIVE`, `INACTIVE`.
- Filtros por texto, categoria e paginação integrada com soft delete.

### 📊 2.3 Projetos & Quadro Kanban Arquitetônico
- Criação de projetos com atributos especializados: estilo arquitetônico, tipo construtivo, área em m², número de pavimentos e cômodos.
- Pipeline com 5 colunas arquitetônicas padrão: Estudo Preliminar, Anteprojeto, Executivo, Compatibilização e Em Obra.
- Gestão de tarefas, prazos e controle orçamentário previsto vs realizado.
- Movimentação fluida via Drag-and-Drop ou controle manual de posições.

### ⏱️ 2.4 Atividades & Time Tracking Faturável
- Registro de tarefas do dia a dia do arquiteto (desenho de plantas, modelagem 3D, reuniões de briefing).
- Apontamento de horas faturáveis (`billable`) e não-faturáveis.
- Sumário de produtividade consolidado por projeto.
- Calendário interativo de compromissos (`ScheduleView`).

### 🏗️ 2.5 Vistorias Técnicas de Obra & Punch List
- Emissão de laudos de vistoria de campo com localização e condições climáticas.
- Gestão de itens de Punch List (não-conformidades e pendências executivas).
- Classificação por severidade: Baixa, Média, Alta, Crítica.
- Fluxo de resolução com registro de evidência fotográfica e data de conclusão.

### 📁 2.6 Armazenamento de Arquivos Técnicos
- Central de documentos com suporte a pranchas executivas (`.dwg`, `.pdf`, `.ifc`, `.jpg`).
- Upload multipart com identificador UUID único para evitar colisões.
- Download seguro com proteção rigorosa contra Directory Traversal.
- Filtragem dinâmica por categorias (Plantas, Modelagem 3D, Contratos, Vistorias, Renders).

### 📈 2.7 Dashboards & Relatórios Financeiros
- Dashboard com 4 KPIs operacionais em tempo real e navegação rápida.
- Gráficos Recharts: Evolução financeira dos últimos 6 meses (Orçado vs Realizado) e distribuição por fases do Kanban.
- Relatórios analíticos com margem líquida por contrato, seletor de períodos (Mês, Trimestre, Ano) e badges de conformidade orçamentária.

### 🔔 2.8 Notificações em Tempo Real & Configurações
- Canal Server-Sent Events (SSE) nativo para alertas instantâneos de prazos e aprovações.
- Componente de sino com popover, contador de pendências e marcação individual/lote de leitura.
- Central de configurações com alternância de temas (Claro, Escuro, Sistema), paletas arquitetônicas ("Azul Ant Design" e "Verde Sálvia") e preferências do escritório.

---

## 🧪 3. Verificação & Execução dos Testes

Para validar a integridade de todas as camadas do sistema:

```bash
# 1. Executar todos os testes do Backend (147 testes)
mvn -f backend/pom.xml test

# 2. Executar todos os testes do Frontend (79 testes)
npm run test --prefix frontend

# 3. Compilar o build de produção do Frontend
npm run build --prefix frontend
```
