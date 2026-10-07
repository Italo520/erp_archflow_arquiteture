# 🗺️ Matriz de Gaps do PRD v3 & Roadmap de Evolução Contínua

- **Data da Elaboração**: 07 de Outubro de 2026
- **Status do Projeto**: 8 Fatias Verticais Core 100% Concluídas e Blindadas (226 Testes Automatizados)
- **Documento de Origem**: [`docs/PRD_COMPLETO_v3.md`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/docs/PRD_COMPLETO_v3.md)
- **Objetivo**: Mapear de forma exaustiva o que já foi entregue vs. funcionalidades avançadas do PRD v3 pendentes de implementação, estruturando-as em um roadmap executável por pilares de negócio.

---

## 📊 1. Diagnóstico Executivo de Cobertura do PRD v3

O **ArchFlow ERP** possui hoje uma fundação full-stack sólida, com paridade técnica em 8 módulos fundamentais (Auth/RBAC, Clientes/CRM, Projetos/Kanban, Atividades/Time Tracking, Vistorias/Punch List, Storage/Documentos, Dashboard/Métricas, Notificações SSE/Settings).

No entanto, uma análise comparativa aprofundada com a visão macro do PRD v3 identifica **4 grandes pilares avançados** que transformam o ERP de uma ferramenta de operação técnica em uma plataforma de gestão empresarial completa:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           ARCHFLOW ERP ROADMAP                            │
├─────────────────────┬─────────────────────┬───────────────────────────────┤
│ [Pilar 1]           │ [Pilar 2]           │ [Pilar 3]                     │
│ Módulo Financeiro   │ Motor de Exportação │ Notificações Omnichannel      │
│ Completo &          │ Binária & Laudos    │ & Envio Real de E-mails       │
│ Tesouraria          │ Oficiais em PDF     │ (SMTP / Recuperação Senha)    │
├─────────────────────┴─────────────────────┴───────────────────────────────┤
│ [Pilar 4] Portal do Cliente & Aprovação Externa de Pranchas (Área do Cliente)│
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ 2. Detalhamento dos 4 Pilares de Evolução Futura

### 💰 Pilar 1: Módulo Financeiro Completo e Tesouraria
> **Situação Atual**: O sistema possui controle de `plannedCost` vs `actualCost` em nível de projeto, agregação no `DashboardMetricsController` e visualização de margem no `ReportsView`.
> **Gap Identificado**: Ausência de controle de contas a pagar, contas a receber, fluxo de caixa diário/mensal e DRE (Demonstrativo do Resultado do Exercício) do escritório.

#### Requisitos Funcionais:
1. **Lançamentos Financeiros:**
   - Registro de receitas (honorários arquitetônicos, medições de obra, consultorias).
   - Registro de despesas operacionais (plotagens, softwares BIM, licenças, subcontratados).
   - Vínculo opcional a um projeto específico ou despesa administrativa global do escritório.
2. **Contas a Pagar e a Receber:**
   - Controle de datas de vencimento, status (`PENDING`, `PAID`, `OVERDUE`, `CANCELLED`) e data de liquidação.
   - Parcelamento de contratos arquitetônicos (ex: 30% entrada, 40% executivo, 30% entrega final).
3. **Demonstrativos & Fluxo de Caixa:**
   - Projeção de fluxo de caixa (entradas previstas vs saídas previstas nos próximos 30/60/90 dias).
   - DRE simplificada por competência e regime de caixa.

#### Modelagem de Dados Proposta (Flyway Migration `V14`):
```sql
CREATE TABLE financial_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- REVENUE, EXPENSE
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);

CREATE TABLE financial_transactions (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) REFERENCES projects(id),
    category_id VARCHAR(36) REFERENCES financial_categories(id),
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- PAYABLE, RECEIVABLE
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, CANCELLED
    due_date DATE NOT NULL,
    payment_date DATE,
    payment_method VARCHAR(50), -- PIX, BOLETO, TRANSFER, CREDIT_CARD
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);
```

---

### 📄 Pilar 2: Motor de Exportação Binária & Laudos Oficiais em PDF
> **Situação Atual**: No frontend em `ReportsView.tsx`, os botões "Exportar CSV" e "Gerar PDF Oficial" são gatilhos de UI locais.
> **Gap Identificado**: Ausência de endpoints no Spring Boot para compilar e emitir documentos binários reais com identidade visual, carimbo do CAU e dados auditados.

#### Requisitos Funcionais:
1. **Laudo Técnico de Vistoria de Obra (PDF Oficial):**
   - Cabeçalho timbrado com logo do escritório, dados do responsável técnico e registro CAU.
   - Sumário da obra, data, clima, responsável presente e observações de campo.
   - Tabela detalhada do Punch List com severidade, descrição, localização do ambiente e fotos anexadas de não-conformidade.
2. **Exportação de Relatórios Gerenciais (PDF e Planilhas Excel/CSV):**
   - Relatório financeiro de projetos com margens e custos detalhados.
   - Extrato de apontamentos de horas (`TimeLogs`) faturáveis por colaborador e por projeto para faturamento.

#### Implementação Backend Recomendada:
- **Dependências:** `com.github.librepdf:openpdf` (para geração de PDFs) e `org.apache.poi:poi-ooxml` (para exportação Excel).
- **Endpoints REST:**
  - `GET /api/v1/inspections/{id}/export/pdf`: Retorna binário `application/pdf` do laudo formal.
  - `GET /api/v1/reports/finance/export/csv`: Retorna stream `text/csv` de transações e margens.
  - `GET /api/v1/activities/timelogs/export/excel`: Retorna planilha `.xlsx` com time tracking da equipe.

---

### 📧 Pilar 3: Notificações Omnichannel & Envio Real de E-mails
> **Situação Atual**: O sistema possui canal Server-Sent Events (SSE) nativo e persistência de alertas no banco de dados (`NotificationController`).
> **Gap Identificado**: O envio de e-mails transacionais (como recuperação de senha, convite de novos usuários e notificações de prazos críticos) ainda não está conectado a um provedor SMTP/Resend.

#### Requisitos Funcionais:
1. **Recuperação de Senha Segura (Forgot Password Flow):**
   - `POST /api/v1/auth/forgot-password`: Gera token criptográfico de uso único com validade de 30 minutos e envia link seguro por e-mail.
   - `POST /api/v1/auth/reset-password`: Valida o token e atualiza o hash BCrypt da senha.
2. **Alertas Críticos de Prazo:**
   - Rotina agendada (`@Scheduled` no Spring Boot) executada diariamente às 08h que identifica tarefas e fases a menos de 48h do vencimento e dispara e-mail consolidado para os arquitetos responsáveis.
3. **Disparo de Entregáveis para Clientes:**
   - Notificação ao cliente com link de download quando uma nova prancha for publicada.

#### Implementação Backend Recomendada:
- **Dependência:** `spring-boot-starter-mail` configurável via variáveis de ambiente (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`).
- **Templates:** Thymeleaf HTML templates para e-mails responsivos com design premium.

---

### 🌐 Pilar 4: Portal do Cliente & Aprovação Externa de Pranchas
> **Situação Atual**: O sistema possui os papéis `ADMIN`, `ARCHITECT` e `VIEWER` voltados para a equipe interna do escritório.
> **Gap Identificado**: O cliente do escritório não tem um portal de autoatendimento para aprovar pranchas, consultar o cronograma e abrir solicitações de alteração.

#### Requisitos Funcionais:
1. **Papel de Acesso Externo (`ROLE_CLIENT`):**
   - Cliente autenticado possui visibilidade isolada exclusivamente aos seus projetos vinculados.
2. **Visualizador de Pranchas e Entregáveis:**
   - Visualização de PDFs de plantas baixas, imagens de renders e memoriais descritivos direto no navegador.
3. **Fluxo de Aprovação Formal de Etapas:**
   - O cliente pode clicar em "Aprovar Prancha" ou "Solicitar Revisão", inserindo comentários pontuais que geram automaticamente tarefas para a equipe no Kanban.
4. **Trilha de Auditoria com Data e IP:**
   - Registro imutável de aceite do cliente para resguardo jurídico e contratual do escritório.

---

## 📅 3. Matriz de Priorização, Complexidade e Esforço

| Prioridade | Pilar / Feature | Valor de Negócio | Complexidade Técnica | Dependências |
| :---: | :--- | :---: | :---: | :--- |
| **P1** | **Motor de Exportação PDF de Laudos & CSV** | ⭐⭐⭐⭐⭐ (Alto) | Média (OpenPDF / POI) | Storage de Imagens e Laudos (já prontos) |
| **P2** | **Módulo Financeiro (Contas a Pagar / Receber)** | ⭐⭐⭐⭐⭐ (Alto) | Média/Alta (Flyway V14 + Cálculos) | Entidades `Project` e `Client` (já prontos) |
| **P3** | **Recuperação de Senha & Envio Real de E-mail** | ⭐⭐⭐⭐ (Médio/Alto) | Baixa/Média (`spring-mail`) | Módulo Auth (já pronto) |
| **P4** | **Portal do Cliente (Aprovação de Pranchas)** | ⭐⭐⭐⭐ (Médio/Alto) | Alta (Novas Views + RBAC isolado) | Projetos e Armazenamento (já prontos) |

---

## 🎯 4. Conclusão e Próximos Passos

O **ArchFlow ERP** alcançou maturidade operacional robusta no seu núcleo (Core 100% blindado com 226 testes e 8 módulos funcionais).

Com este catálogo de gaps formalizado e priorizado:
1. A documentação do sistema está em paridade total com o código real.
2. O time de engenharia e os stakeholders possuem clareza absoluta sobre as próximas fatias de negócio a implementar.
3. A governança do projeto no GSD (`.planning/STATE.md`) mantém rastreabilidade viva entre os requisitos do PRD v3 e as futuras entregas.
