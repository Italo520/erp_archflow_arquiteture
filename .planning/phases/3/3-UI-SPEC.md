# UI Specification: Phase 3 - Trilha de Auditoria Física e Preferências de Usuário

## Componentes Necessários

### 1. Painel de Preferências do Usuário (Follow-up Fase 2)
**Local:** Em `Configurações da Conta > Meu Perfil` (ou uma nova aba "Preferências" local).
**Descrição:** Permite ao usuário individual ligar/desligar notificações que foram liberadas para o seu cargo pela matriz RBAC global.
- **Layout:** Lista simples de chaves (toggles).
- **Interação:** Exibe os tipos de notificação (ex: "Atualização de Projetos", "Faturas Pagas"). Se a regra global permitir, exibe um Toggle. Se não permitir, oculta ou exibe um texto de "Restrito pelo administrador".

### 2. Aba "Auditoria" nas Configurações do Projeto
**Local:** Navegação interna de um projeto (`/dashboard/projects/[id]/settings`).
**Descrição:** Visualização de todos os logs do projeto atual. Restrito aos proprietários (OWNER) e administradores do projeto.
- **Header:** Título "Trilha de Auditoria" com filtro de período (Últimos 7 dias, 30 dias).
- **Tabela / Feed Vertical:**
  - **Coluna 1 (Ator):** Quem realizou a ação (Nome + Avatar) e Data/Hora (com timezone local).
  - **Coluna 2 (Ação & Entidade):** O que foi feito (Ex: `UPDATE` no `Deliverable` X).
  - **Coluna 3 (Detalhes / Diff):** O campo `changes` parseado.
    - Se for `CREATE`, exibe um preview condensado do objeto.
    - Se for `UPDATE`, exibe o valor antigo tachado em vermelho e o novo em verde (estilo Git Diff), facilitando identificar fraudes ou modificações acidentais em orçamentos.
    - Se for `DELETE`, exibe alerta de exclusão com as informações chave do registro apagado.

## Design Tokens & Theming
- Cores para Diffs (Updates):
  - Fundo de remoção: `bg-red-50 dark:bg-red-900/20` com texto vermelho.
  - Fundo de adição: `bg-green-50 dark:bg-green-900/20` com texto verde.
- Cores para Ações:
  - CREATE: Verde.
  - DELETE: Destructive/Vermelho.
  - UPDATE: Azul/Primária.
- Fonte `monospace` (JetBrains Mono ou similar) para a exibição dos payloads JSON (os dados alterados).

## Responsividade
- Em mobile, o Diff JSON lado a lado se transforma em lista empilhada (Velho acima do Novo) para caber na tela sem quebrar a layout.
