# UI Specification: Phase 2 - Painel de Notificações

Este documento descreve a interface do usuário (UI) a ser implementada na fase do Painel de Notificações.

## Componentes Necessários

### 1. Header Notification Badge
**Descrição:** Ícone de sino na barra de navegação principal (`Header`/`Navbar`).
- **Estado Neutro:** Sino simples.
- **Estado Ativo (Não lidas):** Exibe um badge numérico flutuante vermelho ou cor primária (`bg-red-500` ou `bg-primary`) indicando a quantidade.
- **Interação:** Clique no ícone aciona o `NotificationDrawer`.
- **Animações:** Efeito de "pulse" ou "shake" sutil ao receber nova notificação em tempo real (via Toast).

### 2. Notification Drawer (Painel Lateral)
**Descrição:** Um componente *Slide-over* ou *Sheet* do Shadcn UI que desliza a partir do lado direito da tela.
- **Header do Drawer:**
  - Título: "Notificações".
  - Botão de ação: "Marcar todas como lidas" e "Limpar todas".
- **Corpo do Drawer:**
  - Lista de notificações agrupadas por tempo (`Hoje`, `Ontem`, `Mais antigas`).
  - Se vazio: Exibir um *Empty State* amigável (ex: ícone de sino cortado ou dormindo e texto "Tudo limpo por aqui").
- **Footer do Drawer:**
  - Link ou botão sutil "Configurações de Notificação" apontando para o painel de preferências.

### 3. Notification Card (Item Individual)
**Descrição:** Como cada notificação é exibida na lista do Drawer.
- **Layout:** Flex row.
- **Elementos:**
  - Ícone ou Avatar: Representa a origem (ex: logo do sistema, avatar do cliente que aprovou).
  - Conteúdo Principal: Título em negrito e subtítulo/mensagem sutil.
  - Timestamp: Tempo relativo ("há 5 min", "ontem").
  - Indicador de não lido: Uma bolinha azul/primária à esquerda se não lida.
- **Interação:** Todo o card é clicável.
  - Ao clicar, marca como lida e redireciona.

### 4. Toast Alerts (Tempo Real)
**Descrição:** Notificações flutuantes de curta duração no canto da tela (inferior direito ou superior direito).
- **Conteúdo:** Ícone de informação/sucesso, título e link de ação rápida.

### 5. Configurações de Notificações (Notification Settings / RBAC)
**Descrição:** Nova aba na página de configurações do sistema (ex: `/dashboard/settings/notifications`).
- **Estrutura:** Tabela ou matriz de switches.
- **Colunas:** Tipos de Perfil (Proprietário, Editor, Leitor, Cliente).
- **Linhas:** Eventos do Sistema (Alteração de Status de Projeto, Entregável Aprovado, Orçamento Atualizado, etc.).
- **Interação:** Switches em cada célula cruzando Evento x Perfil. Ao alterar, salva automaticamente no backend.

## Design Tokens & Theming
- **Cores:**
  - Unread Badge: `destructive` ou `primary` brand color.
  - Read State Background: Transparente ou `bg-background`.
  - Unread State Background: Fundo muito leve (`bg-primary/5` ou `bg-muted/50`).
- **Tipografia:** Uso da tipografia base do sistema. Títulos em `font-medium`, textos complementares em `text-muted-foreground`.

## Responsividade
- O Slide-over ocupará 100% da largura em mobile (`w-full`), e largura fixa em desktop (`w-[400px]` ou similar).
- O painel de RBAC em mobile se transformará em listas empilhadas por evento, pois matrizes não cabem bem.
