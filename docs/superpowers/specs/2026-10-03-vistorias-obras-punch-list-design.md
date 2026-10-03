# Especificação de Design: Módulo de Vistoria Técnica e Lista de Pendências (Punch List)

- **Status**: Aprovado para Planejamento
- **Data**: 03 de Outubro de 2026
- **Autor**: Antigravity & Italo520
- **Módulo**: `Site Inspections & Punch List` (ArchFlow ERP)
- **Localização dos Arquivos**: `app/(dashboard)/projects/[id]/inspections/`, `app/actions/inspection.ts`, `prisma/schema.prisma`

---

## 1. Visão Geral e Motivação

O **ArchFlow ERP** atende escritórios de arquitetura e design de interiores. Durante a fase de execução de obras, uma das maiores fontes de retrabalho, perda de tempo e atrito com clientes e prestadores é a gestão manual de não conformidades (acompanhamento de obra).

Atualmente, arquitetos fotografam problemas pelo celular, transferem para o computador e montam manualmente relatórios no Word ou Canva para enviar por WhatsApp aos empreiteiros e clientes. 

O **Módulo de Vistoria Técnica e Punch List** resolve essa dor ao fornecer:
1. **Interface Mobile-First no Canteiro:** Registro ultrarrápido de não conformidades com acionamento direto da câmera do smartphone (`capture="environment"`), seleção de ambientes por chips e categorização por especialidade.
2. **Ciclo de Comprovação "Antes e Depois":** Todo item nasce com a foto do problema (*Antes*) e é encerrado com a foto da correção inspecionada (*Depois*).
3. **Gerador Automático de Relatórios em PDF:** Emissão em 1 clique de relatórios executivos com identidade visual corporativa, resumo executivo, fotos lado a lado e filtros segmentados por prestador (ex: gerar um PDF exclusivo para o gesseiro ou marceneiro).
4. **Operação 100% Centralizada no Arquiteto:** Sem necessidade de criar contas para empreiteiros externos ou lidar com senhas no canteiro. A comunicação externa ocorre via PDF formal.

---

## 2. Modelo de Dados (Prisma Schema)

Os novos modelos serão adicionados ao `prisma/schema.prisma` com relacionamento direto ao modelo `Project`:

```prisma
// Enums do Módulo de Vistorias
enum InspectionStatus {
  DRAFT       // Vistoria em andamento (em campo)
  COMPLETED   // Vistoria finalizada pelo arquiteto
  SENT        // Relatório emitido e compartilhado
}

enum PunchListStatus {
  PENDING     // Pendente de correção
  IN_PROGRESS // Em execução pelo prestador
  RESOLVED    // Conferido e aprovado pelo arquiteto
  CANCELLED   // Cancelado / Desconsiderado
}

enum PunchListSeverity {
  LOW         // Ajuste estético leve
  MEDIUM      // Correção padrão de acabamento
  HIGH        // Erro com impacto em outras etapas
  CRITICAL    // Risco estrutural ou bloqueio de cronograma
}

// Cabeçalho da Vistoria Técnica
model SiteInspection {
  id               String           @id @default(uuid())
  title            String           // Ex: "Vistoria #03 - Conferência de Gesso e Iluminação"
  date             DateTime         @default(now())
  status           InspectionStatus @default(DRAFT)
  generalNotes     String?          @db.Text
  weatherCondition String?          @map("weather_condition") // Ex: "Ensolarado", "Chuvoso"
  
  projectId        String           @map("project_id")
  project          Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  inspectorId      String           @map("inspector_id")
  inspector        User             @relation(fields: [inspectorId], references: [id])
  
  items            PunchListItem[]
  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt @map("updated_at")

  @@index([projectId])
  @@index([date])
  @@map("site_inspections")
}

// Item Individual de Não Conformidade (Punch List)
model PunchListItem {
  id              String            @id @default(uuid())
  environment     String            // Cômodo/Área: "Cozinha", "Suíte Master", "Fachada"
  contractorTrade String            @map("contractor_trade") // Especialidade: "Gesso", "Elétrica", "Marcenaria"
  contractorName  String?           @map("contractor_name")  // Nome do prestador/empresa
  description     String            @db.Text                 // Descrição do ajuste necessário
  severity        PunchListSeverity @default(MEDIUM)
  status          PunchListStatus   @default(PENDING)
  dueDate         DateTime?         @map("due_date")         // Prazo acordado
  
  // Fotos de Comprovação
  beforePhotoUrl  String            @map("before_photo_url") // Foto do problema
  afterPhotoUrl   String?           @map("after_photo_url")  // Foto da correção
  resolutionNotes String?           @map("resolution_notes") @db.Text
  resolvedAt      DateTime?         @map("resolved_at")

  inspectionId    String            @map("inspection_id")
  inspection      SiteInspection    @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  
  projectId       String            @map("project_id")
  project         Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)

  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  @@index([inspectionId])
  @@index([projectId])
  @@index([status])
  @@index([environment])
  @@index([contractorTrade])
  @@map("punch_list_items")
}
```

---

## 3. Fluxo de Usuário e Arquitetura de Telas

### 3.1. Rota Principal: `app/(dashboard)/projects/[id]/inspections/page.tsx`
* **Sub-Aba 1: Linha do Tempo de Visitas:** Lista cronológica de vistorias com badges de status, contagem de pendências e botão de download imediato de PDF.
* **Sub-Aba 2: Painel Global de Pendências:** Tabela/Grade com filtros rápidos por:
  * Status (`Pendente`, `Em Correção`, `Resolvido`).
  * Ambiente (`Cozinha`, `Suíte`, etc.).
  * Especialidade (`Elétrica`, `Pintura`, `Marmoraria`, etc.).

### 3.2. Fluxo Mobile de Campo (Nova Vistoria):
1. Arquiteto abre a vistoria no smartphone e toca em `[ 📷 Adicionar Pendência ]`.
2. O sistema ativa a câmera traseira do aparelho. O arquiteto tira a foto.
3. Tela de preenchimento rápido:
   * **Ambiente:** Seleciona chips pré-existentes daquele projeto ou digita um novo.
   * **Especialidade:** Seleção rápida via chips (*Pintura, Gesso, Hidráulica, etc.*).
   * **Prestador:** Autocomplete baseado em cadastros prévios da obra.
   * **Severidade:** Botões visuais coloridos (*Baixa, Média, Alta, Crítica*).
   * **Descrição:** Texto descritivo.
4. Salvar ➔ O card aparece na lista com badge amarelo `Pendente`.

### 3.3. Fluxo de Re-vistoria (Antes e Depois):
1. O arquiteto abre o item pendente na visita seguinte.
2. A foto do *Antes* é exibida em destaque para conferência visual no canteiro.
3. Clica em `[ 📸 Registrar Correção ]` e captura a foto da obra corrigida (*Depois*).
4. Insere uma observação de encerramento e clica em **"Aprovar & Resolver"**.
5. O status é atualizado para `RESOLVED` (badge verde) e ambas as fotos ficam associadas permanentemente.

---

## 4. Motor de Relatórios em PDF

### 4.1. Estrutura do Documento
* **Cabeçalho:** Logotipo do ArchFlow/Escritório, dados da obra, cliente, endereço, arquiteto responsável e data da vistoria.
* **Barra de Indicadores (KPIs):** Total de itens, itens pendentes e itens resolvidos.
* **Blocos de Não Conformidade:**
  * Título com `[Ambiente] • [Especialidade]` e badge de severidade.
  * Fotos comparativas: Foto do *Antes* e Foto do *Depois* (ou espaço para assinatura do encarregado se pendente).
  * Descrição do problema, responsável, prazo e notas de resolução.
* **Rodapé:** Termo de responsabilidade técnica e campos para assinatura física/digital do Arquiteto e do Mestre de Obras.

### 4.2. Opções de Exportação (Filtros de Saída):
* **Completo:** Todas as ocorrências da visita.
* **Segmentado por Prestador:** Permite exportar um PDF isolado (ex: apenas itens atribuídos ao gesseiro) para compartilhamento rápido no WhatsApp.
* **Quitação / Entrega:** Exclusivo para itens com status `RESOLVED`, servindo como termo formal de entrega dos ambientes ao cliente.

---

## 5. Regras de Negócio e Server Actions (`app/actions/inspection.ts`)

Todas as Server Actions respeitam os contratos padronizados do ArchFlow ERP:

```ts
export interface ActionResponse<T = any> {
  ok: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]> | string;
}
```

### Principais Ações:
1. `createSiteInspection(projectId: string, data: CreateInspectionInput): Promise<ActionResponse>`
   * Autorização: `requireProjectAccess(projectId, ['OWNER', 'EDITOR'])`.
   * Cria registro com status inicial `DRAFT`.
   * Grava evento no `AuditLog`.

2. `addPunchListItem(inspectionId: string, formData: FormData): Promise<ActionResponse>`
   * Validação com Zod (`environment`, `contractorTrade`, `description`, `severity`, `dueDate`).
   * Validação e upload de imagem via `storageProvider` (`/storage/projects/[id]/inspections/[inspectionId]/`).
   * Criação do item vinculado a `SiteInspection` e `Project`.

3. `resolvePunchListItem(itemId: string, formData: FormData): Promise<ActionResponse>`
   * Validação e upload da foto de resolução (*Depois*).
   * Atualização de status para `RESOLVED`, preenchimento de `resolvedAt` e notas.

4. `completeSiteInspection(inspectionId: string): Promise<ActionResponse>`
   * Transição de `DRAFT` para `COMPLETED`.
   * Disparo de notificação interna no sistema (`NotificationType.PROJECT_UPDATE`).

---

## 6. Estratégia de Testes

* **Testes Unitários / Integração (Jest):**
  * Localização: `tests/actions/inspection.test.ts`.
  * Cobertura de controle de permissões (`requireProjectAccess`), validação com Zod, transições de status e integridade referencial.
* **Testes de Integração de PDF:**
  * Localização: `tests/reports/inspection-pdf.test.ts`.
  * Validação da renderização do buffer e dos filtros segmentados por prestador.
* **Testes End-to-End (Playwright):**
  * Localização: `tests/e2e/inspection-flow.spec.ts`.
  * Fluxo completo: Login ➔ Criação de Vistoria ➔ Adição de Pendência com Foto ➔ Re-vistoria com Foto do Depois ➔ Download do PDF gerado.

---

## 7. Limites de Escopo (Non-Goals)

Para manter o módulo focado, ágil e sem complexidade desnecessária nesta versão:
* Não haverá login obrigatório para terceiros/empreiteiros (opera 100% pelo arquiteto).
* Não haverá controle diário de efetivo de mão de obra (serventes/pedreiros presentes) ou maquinário pesado de construtora civil.
