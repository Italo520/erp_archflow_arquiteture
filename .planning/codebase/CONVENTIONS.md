# Code Conventions

> Last mapped: 2026-05-27

## Language & Style

### TypeScript
- **Strict mode:** Disabled (`"strict": false` in `tsconfig.json`)
- **Target:** ES2017
- **Module:** ESNext with bundler resolution
- **Path aliases:** `@/*` → `./*`
- **Type assertions:** Used freely (e.g., `as any` for Prisma Json fields)

### Mixed JS/TS Codebase
The codebase uses both JavaScript and TypeScript:
- **TypeScript:** Server actions, lib utilities, newer components
- **JavaScript:** Page files, layout files, some hooks
- No enforcement to convert legacy JS files

## Component Patterns

### Client Components
```tsx
'use client';

import React from 'react';
// imports...

const ComponentName = ({ prop1, prop2 }) => {
    const [state, setState] = React.useState(initialValue);
    // logic...
    return (<div>...</div>);
};

export default ComponentName;
```

- `'use client'` directive for interactive components
- Arrow function components
- `default export` pattern (most components)
- Props destructured in parameters (no interface in many cases)

### Server Components (Pages)
```jsx
import { serverAction } from '@/actions/entity';

export default async function PageName() {
    const data = await serverAction();
    return <ClientComponent data={data} />;
}
```

- Async function components
- Direct server action calls for data fetching
- Pass data to client components as props

### Shadcn/UI Components (`components/ui/`)
```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const variants = cva("base-classes", {
    variants: { ... },
    defaultVariants: { ... },
});

const Component = React.forwardRef<HTMLElement, Props>(
    ({ className, variant, ...props }, ref) => (
        <element ref={ref} className={cn(variants({ variant }), className)} {...props} />
    )
);
Component.displayName = "Component";

export { Component };
```

- `React.forwardRef` pattern
- `cva` for variant styling
- `cn()` utility for class merging (`clsx` + `tailwind-merge`)
- Named exports

## Server Action Patterns

### Standard Action Pattern
```typescript
'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const EntitySchema = z.object({ ... });

export async function createEntity(data: z.input<typeof EntitySchema>) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Não autorizado");
    }

    const validated = EntitySchema.safeParse(data);
    if (!validated.success) throw new Error("Dados inválidos");

    const entity = await prisma.entity.create({
        data: { ...validated.data, ownerId: session.user.id }
    });

    revalidatePath('/path');
    return { success: true, entity };
}
```

### Key Patterns:
1. **Auth check first** — `auth()` called at start of every action
2. **Zod validation** — `safeParse` with throw on failure
3. **Prisma query** — Direct ORM call
4. **Cache invalidation** — `revalidatePath()` after mutations
5. **Return shape** — `{ success: true, ...data }` or throw Error

### Error Handling
- **Server Actions:** `throw new Error("message")` — no try/catch in most actions
- **Some actions** use try/catch and return `{ success: false, error: "message" }`
- **Client side:** Not consistently wrapped in try/catch
- **No centralized error boundary** beyond Next.js defaults

## Validation Patterns

### Zod Schema Convention (`lib/validations.ts`)
```typescript
// Create schema
export const entitySchema = z.object({
    name: z.string().min(2, "Message"),
    optionalField: z.string().optional().nullable(),
    enumField: z.nativeEnum(PrismaEnum).optional().nullable(),
    dateField: z.coerce.date().optional().nullable(),
    numericField: z.number().nonnegative().optional().nullable(),
});

// Update schema (partial + required id)
export const updateEntitySchema = entitySchema.partial().extend({
    id: z.string().uuid(),
});
```

### Prisma Enum Mapping
- All Prisma enums mapped to Zod via `z.nativeEnum(EnumName)`
- Exported as constants (e.g., `PriorityEnum`, `ClientStatusEnum`)

## Naming Conventions

### Variables & Functions
- **camelCase** for variables and functions
- **PascalCase** for React components and TypeScript types
- **UPPER_CASE** not used (even for constants)

### Prisma Schema
- **Models:** PascalCase (e.g., `ProjectMember`, `TimeLog`)
- **Fields:** camelCase (e.g., `createdAt`, `assigneeId`)
- **Database mapping:** `@@map("snake_case")` for table names, `@map("snake_case")` for columns
- **Enums:** PascalCase names, UPPER_CASE values (e.g., `Priority.HIGH`)

### Files
- **Components:** PascalCase (e.g., `ProjectCard.tsx`)
- **Actions/Lib:** camelCase (e.g., `project.ts`, `validations.ts`)
- **CSS:** kebab-case (e.g., `globals.css`)

## Styling Conventions

### Tailwind CSS v4
- CSS variable-based theming in `globals.css`
- HSL color values: `hsl(var(--primary))`
- `@theme` directive for custom design tokens
- `@layer base` for global styles
- `@utility container` for custom utilities

### Class Organization
```tsx
className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors"
```
- Layout → Spacing → Visual → Interactive

### Theme Support
- Dark/light mode via `next-themes` + CSS class strategy
- All colors defined as CSS custom properties
- Components use semantic color names (`bg-background`, `text-foreground`, `bg-card`)

## Data Handling

### JSONB Fields (Prisma)
- Typed as `Json?` in Prisma schema
- Cast to `as any` when writing
- Cast to typed interfaces when reading (e.g., `as unknown as HistoryItem[]`)
- Used for: `attachments`, `comments`, `checklist`, `historico`, `phases`, `budgetBreakdown`

### Dates
- Stored as `DateTime` in Prisma
- Received as strings from forms, converted with `new Date()`
- Displayed with `date-fns` utilities
- `z.coerce.date()` for Zod validation

### IDs
- All entities use UUID v4 (`@id @default(uuid())`)
- Referenced as `z.string().uuid()` in Zod schemas

## Import Conventions
```typescript
// 1. Framework imports
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// 2. Library imports
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { Priority } from "@prisma/client"

// 3. Component imports
import { Button } from "@/components/ui/button"

// 4. Local imports
import { cn } from "@/lib/utils"
```

- Path alias `@/` used consistently
- No barrel exports (direct file imports)
- Prisma client enums imported from `@prisma/client`

## Form Handling

### React Hook Form + Zod Pattern
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entitySchema } from "@/lib/validations";

const form = useForm({
    resolver: zodResolver(entitySchema),
    defaultValues: { ... },
});
```

### Legacy FormData Pattern (some actions)
```typescript
export async function createEntity(formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        // ...
    };
    const validated = Schema.safeParse(rawData);
    // ...
}
```

## Localization

- **Language:** Portuguese (Brazil) for all user-facing strings
- Validation messages in Portuguese: `"Nome deve ter pelo menos 3 caracteres"`
- UI labels in Portuguese: `"Projetos"`, `"Clientes"`, `"Configurações"`
- HTML lang attribute: `"pt-BR"`
- No i18n library (strings hardcoded in components)
- Some Zod validation messages in English (inconsistency in `lib/validations.ts`)
