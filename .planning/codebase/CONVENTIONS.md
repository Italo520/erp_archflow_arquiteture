# Convenções de Código

> Último mapeamento: 2026-05-27

## Linguagem e Estilo

### TypeScript
- **Modo strict:** Desabilitado (`"strict": false` em `tsconfig.json`)
- **Target:** ES2017
- **Module:** ESNext com resolução bundler
- **Aliases de caminho:** `@/*` → `./*`
- **Asserções de tipo:** Usadas livremente (ex: `as any` para campos Json do Prisma)

### Codebase Misto JS/TS
O codebase usa tanto JavaScript quanto TypeScript:
- **TypeScript:** Server actions, utilitários da lib, componentes mais recentes
- **JavaScript:** Arquivos de página, arquivos de layout, alguns hooks
- Sem obrigatoriedade de converter arquivos JS legados

## Padrões de Componentes

### Componentes Cliente
```tsx
'use client';

import React from 'react';
// imports...

const NomeDoComponente = ({ prop1, prop2 }) => {
    const [estado, setEstado] = React.useState(valorInicial);
    // lógica...
    return (<div>...</div>);
};

export default NomeDoComponente;
```

- Diretiva `'use client'` para componentes interativos
- Componentes com arrow function
- Padrão `default export` (maioria dos componentes)
- Props desestruturadas nos parâmetros (sem interface em muitos casos)

### Server Components (Páginas)
```jsx
import { serverAction } from '@/actions/entidade';

export default async function NomeDaPagina() {
    const dados = await serverAction();
    return <ComponenteCliente data={dados} />;
}
```

- Componentes com função async
- Chamadas diretas a server actions para busca de dados
- Dados passados para componentes cliente como props

### Componentes Shadcn/UI (`components/ui/`)
```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const variantes = cva("classes-base", {
    variants: { ... },
    defaultVariants: { ... },
});

const Componente = React.forwardRef<HTMLElement, Props>(
    ({ className, variant, ...props }, ref) => (
        <elemento ref={ref} className={cn(variantes({ variant }), className)} {...props} />
    )
);
Componente.displayName = "Componente";

export { Componente };
```

- Padrão `React.forwardRef`
- `cva` para estilização com variantes
- Utilitário `cn()` para merge de classes (`clsx` + `tailwind-merge`)
- Exports nomeados

## Padrões de Server Action

### Padrão de Action Padrão
```typescript
'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const SchemaEntidade = z.object({ ... });

export async function criarEntidade(dados: z.input<typeof SchemaEntidade>) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Não autorizado");
    }

    const validado = SchemaEntidade.safeParse(dados);
    if (!validado.success) throw new Error("Dados inválidos");

    const entidade = await prisma.entidade.create({
        data: { ...validado.data, ownerId: session.user.id }
    });

    revalidatePath('/caminho');
    return { success: true, entidade };
}
```

### Padrões Principais:
1. **Verificação de auth primeiro** — `auth()` chamado no início de toda action
2. **Validação Zod** — `safeParse` com throw em caso de falha
3. **Query Prisma** — Chamada direta ao ORM
4. **Invalidação de cache** — `revalidatePath()` após mutações
5. **Formato de retorno** — `{ success: true, ...dados }` ou throw Error

### Tratamento de Erros
- **Server Actions:** `throw new Error("mensagem")` — sem try/catch na maioria das actions
- **Algumas actions** usam try/catch e retornam `{ success: false, error: "mensagem" }`
- **Lado do cliente:** Sem try/catch sistemático ao redor de chamadas de Server Action
- **Sem error boundary:** Sem React Error Boundary customizado além dos padrões do Next.js

## Padrões de Validação

### Convenção de Schema Zod (`lib/validations.ts`)
```typescript
// Schema de criação
export const schemaEntidade = z.object({
    nome: z.string().min(2, "Mensagem"),
    campoOpcional: z.string().optional().nullable(),
    campoEnum: z.nativeEnum(EnumPrisma).optional().nullable(),
    campoData: z.coerce.date().optional().nullable(),
    campoNumerico: z.number().nonnegative().optional().nullable(),
});

// Schema de atualização (parcial + id obrigatório)
export const schemaAtualizacaoEntidade = schemaEntidade.partial().extend({
    id: z.string().uuid(),
});
```

### Mapeamento de Enums Prisma
- Todos os enums do Prisma mapeados para Zod via `z.nativeEnum(NomeEnum)`
- Exportados como constantes (ex: `PriorityEnum`, `ClientStatusEnum`)

## Convenções de Nomenclatura

### Variáveis e Funções
- **camelCase** para variáveis e funções
- **PascalCase** para componentes React e tipos TypeScript
- **UPPER_CASE** não utilizado (mesmo para constantes)

### Schema Prisma
- **Modelos:** PascalCase (ex: `ProjectMember`, `TimeLog`)
- **Campos:** camelCase (ex: `createdAt`, `assigneeId`)
- **Mapeamento de banco:** `@@map("snake_case")` para nomes de tabelas, `@map("snake_case")` para colunas
- **Enums:** Nomes em PascalCase, valores em UPPER_CASE (ex: `Priority.HIGH`)

### Arquivos
- **Componentes:** PascalCase (ex: `ProjectCard.tsx`)
- **Actions/Lib:** camelCase (ex: `project.ts`, `validations.ts`)
- **CSS:** kebab-case (ex: `globals.css`)

## Convenções de Estilização

### Tailwind CSS v4
- Temas baseados em variáveis CSS em `globals.css`
- Valores de cor HSL: `hsl(var(--primary))`
- Diretiva `@theme` para tokens de design customizados
- `@layer base` para estilos globais
- `@utility container` para utilitários customizados

### Organização de Classes
```tsx
className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors"
```
- Layout → Espaçamento → Visual → Interativo

### Suporte a Temas
- Modo escuro/claro via `next-themes` + estratégia de classe CSS
- Todas as cores definidas como propriedades CSS customizadas
- Componentes usam nomes de cores semânticas (`bg-background`, `text-foreground`, `bg-card`)

## Manipulação de Dados

### Campos JSONB (Prisma)
- Tipados como `Json?` no schema Prisma
- Convertidos com `as any` ao escrever
- Convertidos para interfaces tipadas ao ler (ex: `as unknown as HistoryItem[]`)
- Usados para: `attachments`, `comments`, `checklist`, `historico`, `phases`, `budgetBreakdown`

### Datas
- Armazenadas como `DateTime` no Prisma
- Recebidas como strings de formulários, convertidas com `new Date()`
- Exibidas com utilitários `date-fns`
- `z.coerce.date()` para validação Zod

### IDs
- Todas as entidades usam UUID v4 (`@id @default(uuid())`)
- Referenciados como `z.string().uuid()` nos schemas Zod

## Convenções de Import
```typescript
// 1. Imports do framework
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// 2. Imports de bibliotecas
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { Priority } from "@prisma/client"

// 3. Imports de componentes
import { Button } from "@/components/ui/button"

// 4. Imports locais
import { cn } from "@/lib/utils"
```

- Alias `@/` usado consistentemente
- Sem barrel exports (imports diretos de arquivo)
- Enums do Prisma importados de `@prisma/client`

## Manipulação de Formulários

### Padrão React Hook Form + Zod
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaEntidade } from "@/lib/validations";

const form = useForm({
    resolver: zodResolver(schemaEntidade),
    defaultValues: { ... },
});
```

### Padrão Legado com FormData (algumas actions)
```typescript
export async function criarEntidade(formData: FormData) {
    const dadosBrutos = {
        nome: formData.get('nome'),
        // ...
    };
    const validado = Schema.safeParse(dadosBrutos);
    // ...
}
```

## Localização

- **Idioma:** Português do Brasil para todas as strings voltadas ao usuário
- Mensagens de validação em português: `"Nome deve ter pelo menos 3 caracteres"`
- Labels da UI em português: `"Projetos"`, `"Clientes"`, `"Configurações"`
- Atributo HTML lang: `"pt-BR"`
- Sem biblioteca de i18n (strings hardcoded nos componentes)
- Algumas mensagens de validação Zod em inglês (inconsistência em `lib/validations.ts`)
