# 🔔 Dossiê de Auditoria e QA: Módulo 08 — Notificações & Configurações

- **Data da Auditoria**: 06 de Outubro de 2026
- **Status de Conformidade**: ✅ 100% CONCLUÍDO & BLINDADO (Fase 8 - Final da Varredura)
- **Responsáveis**: Italo520 & Antigravity
- **Módulo**: `modules/notification` (Backend) & `components/layout/NotificationBell`, `views/SettingsView` (Frontend)
- **Stack Técnica**: Spring Boot 3.4.3 (Java 21), Server-Sent Events (SSE), React 19, TypeScript, Vitest 3.x, Happy-DOM, Testing Library
- **Métricas Consolidadas**:
  - Backend: 147 testes passando (100% verde em `mvn test`), sendo 5 testes de `NotificationControllerTest` cobrindo SSE, listagem, leitura e lote.
  - Frontend: 79 testes passando em 19 suítes (100% verde em `vitest run`), incluindo `NotificationBell.test.tsx` (4/4) e `SettingsView.test.tsx` (4/4).
  - Build: 100% verde (`tsc && vite build`).

---

## 1. Casos de Uso (Use Cases)

### UC-01: Notificações em Tempo Real via Server-Sent Events (SSE)
- **Atores**: Arquiteto / Projetista / Usuário do Sistema.
- **Pré-condições**: Usuário logado.
- **Fluxo Principal**:
  1. O cliente estabelece conexão com `GET /api/v1/notifications/stream?userId={id}` com cabeçalho `text/event-stream`.
  2. O backend registra o `SseEmitter` no pool do usuário e envia o evento inicial de conexão (`CONNECTED`).
  3. Quando ocorrem eventos de negócio (nova vistoria agendada, entrega aprovada, prazo de tarefa próximo), o sistema dispara `NEW_NOTIFICATION` para o canal aberto e persiste no banco.
  4. Na desconexão ou timeout, o emissor é removido de forma segura do pool em memória.

---

### UC-02: Gerenciamento e Leitura de Notificações
- **Atores**: Usuário do Sistema.
- **Fluxo Principal**:
  1. O usuário visualiza o componente do sino (`NotificationBell`) com badge de quantidade de itens pendentes.
  2. Ao abrir o popover, pode clicar em uma notificação específica para marcá-la como lida (`PATCH /api/v1/notifications/{id}/read`), registrando `readAt`.
  3. Pode clicar no botão "Marcar lidas" para marcar todas as notificações do usuário em lote (`POST /api/v1/notifications/mark-all-read`).

---

### UC-03: Configurações Globais de Tema, Identidade e Notificações
- **Atores**: Arquiteto / Gestor do Escritório.
- **Fluxo Principal**:
  1. O usuário acessa a tela de Configurações (`/settings`).
  2. Alterne o tema da interface entre Claro, Escuro e Sistema (via `ThemeContext`).
  3. Alterne a paleta de cores entre "Azul Ant Design" e "Verde Sálvia" com reflexo imediato nos tokens de estilo.
  4. Atualiza os dados cadastrais da organização (Nome do escritório, Responsável CAU, e-mail).
  5. Ajusta preferências de notificação (Prazos de tarefas, Aprovação de entregáveis, Novas vistorias).

---

## 2. Histórias de Usuário (User Stories) & Critérios de Aceitação (BDD / Gherkin)

### US-01: Recepção e Leitura de Alertas Operacionais
> **Como** arquiteto do escritório  
> **Quero** ser notificado sobre prazos e aprovações no sistema  
> **Para que** não perca datas críticas de pranchas e laudos de obra

- **Cenário 1 (Consulta de Notificações - ECP Válido)**:
  - **Dado** que possuo 2 notificações pendentes
  - **Quando** a lista é consultada via `GET /api/v1/notifications?userId=user-1`
  - **Então** recebo os 2 itens ordenados por data decrescente.

- **Cenário 2 (Marcar Individual como Lida - Transição de Estado)**:
  - **Dado** que recebo a notificação "notif-1" com read=false
  - **Quando** envio requisição `PATCH /api/v1/notifications/notif-1/read`
  - **Então** o status da notificação é atualizado para read=true e readAt é registrado.

- **Cenário 3 (Marcar Todas como Lidas em Lote - Transição de Estado)**:
  - **Dado** que possuo múltiplas notificações não lidas
  - **Quando** envio requisição `POST /api/v1/notifications/mark-all-read?userId=user-1`
  - **Então** todas as notificações do usuário passam para read=true.

---

### US-02: Personalização de Tema e Identidade Visual
> **Como** usuário do ArchFlow ERP  
> **Quero** alternar entre os temas claro, escuro e paletas arquitetônicas  
> **Para que** o ambiente de trabalho fique confortável visualmente

- **Cenário 1 (Alternância de Tema de Exibição - Transição de Estado)**:
  - **Dado** que estou na página de configurações com o tema claro ativo
  - **Quando** clico no botão "Escuro"
  - **Então** a função setTheme é chamada com "dark" e o botão escuro assume destaque.

- **Cenário 2 (Alternância de Paleta Cromática - Transição de Estado)**:
  - **Dado** que a paleta atual é "Azul Ant Design"
  - **Quando** clico na opção "Verde Sálvia"
  - **Então** a paleta ativa passa a ser "sage".

---

## 3. Matriz de Rastreabilidade e Técnicas de QA Aplicadas

| ID | Alvo | Técnica QA | Tipo de Teste | Status |
|:---|:---|:---|:---|:---|
| **TC-NTF-01** | `NotificationController.streamNotifications` | ECP / SSE Connection Event | Backend (MockMvc) | Aprovado (Passou) |
| **TC-NTF-02** | `NotificationController.getNotifications` | ECP / Listagem por Usuário | Backend (MockMvc) | Aprovado (Passou) |
| **TC-NTF-03** | `NotificationController.markAsRead` | Transição de Estado (read=true) | Backend (MockMvc) | Aprovado (Passou) |
| **TC-NTF-04** | `NotificationController.markAsRead` | Error Guessing (ID inexistente 404) | Backend (MockMvc) | Aprovado (Passou) |
| **TC-NTF-05** | `NotificationController.markAllAsRead` | Lote / Bulk Update | Backend (MockMvc) | Aprovado (Passou) |
| **TC-NTF-06** | `NotificationBell` | ECP (Renderização do sino e badge) | Frontend (Testing Library) | Aprovado (Passou) |
| **TC-NTF-07** | `NotificationBell` | Transição de Estados (Abre/fecha dropdown) | Frontend (Testing Library) | Aprovado (Passou) |
| **TC-NTF-08** | `NotificationBell` | Interação (Marcar lida individual e todas) | Frontend (Testing Library) | Aprovado (Passou) |
| **TC-NTF-09** | `SettingsView` | ECP (Renderização dos 4 cards de setup) | Frontend (Testing Library) | Aprovado (Passou) |
| **TC-NTF-10** | `SettingsView` | Transição de Estados (Tema Claro/Escuro/Sistema) | Frontend (Testing Library) | Aprovado (Passou) |
| **TC-NTF-11** | `SettingsView` | Transição de Estados (Paleta Azul/Sálvia) | Frontend (Testing Library) | Aprovado (Passou) |

---

## 4. Definition of Done (DoD) do Módulo

- [x] Casos de Uso (UC-01 a UC-03) documentados formalmente.
- [x] User Stories com cenários BDD/Gherkin especificados.
- [x] Testes unitários e de integração de Backend implementados para `NotificationController` (`mvn test`).
- [x] Testes unitários de Frontend (`NotificationBell.test.tsx` e `SettingsView.test.tsx`) implementados e verdes (`vitest`).
- [x] Build de produção do frontend (`npm run build`) validado sem erros TypeScript.
- [x] Conclusão de 100% dos módulos do ArchFlow ERP persistida no GSD (`.planning/STATE.md`).
