# Requisitos Ativos do Sistema - ArchFlow ERP

Este documento lista todos os requisitos funcionais ativos do sistema para as próximas etapas de desenvolvimento (Milestone 4 a 6).

---

## 9. Requisitos de Armazenamento e Entregáveis (FILE)
*   **REQ-026**: Roteamento seguro e gravação de arquivos em diretório em disco local (`storage/` fora da pasta pública) no desenvolvimento local.
*   **REQ-027**: Máquina de estados de entregáveis arquitetônicos (`DRAFT`, `PENDING_REVIEW`, `APPROVED`, `APPROVED_WITH_CHANGES`, `REJECTED`, `DELIVERED`).
*   **REQ-028**: Versionamento de arquivos de entregas e registro de feedback detalhado de revisão do cliente.

## 10. Requisitos Financeiros (FIN)
*   **REQ-029**: Orçamento (`Budget`) e Estimativa (`Estimate`) detalhados atrelados a cada projeto.
*   **REQ-030**: Cálculo dinâmico e comparativo automático de Custo Planejado versus Custo Real do projeto baseando-se nas horas apropriadas.

## 11. Requisitos de Relatórios e Exportação (REP)
*   **REQ-031**: Consolidação de rotinas analíticas removendo códigos duplicados de relatórios.
*   **REQ-032**: Geração de arquivos PDF e planilhas Excel (XLSX) detalhando dados financeiros, progresso e horas.

## 12. Requisitos de Notificações e Reatividade (NOTIF)
*   **REQ-033**: Painel de notificações em tempo de execução para alertar profissionais sobre tarefas recebidas, prazos urgentes e entregáveis para revisão.

## 13. Requisitos de Auditoria e Logs (AUDIT)
*   **REQ-034**: Gravação de logs persistentes detalhando ações sensíveis de usuários (criação/exclusão de projetos, movimentações de orçamentos, aprovações).
