# Testes

> Último mapeamento: 2026-05-27

## Stack de Frameworks de Teste

| Ferramenta | Versão | Propósito |
|---|---|---|
| **Jest** | ^30.2.0 | Executor de testes unitários/integração |
| **@testing-library/react** | ^16.3.2 | Testes de componentes React |
| **@testing-library/user-event** | ^14.6.1 | Simulação de interação do usuário |
| **@testing-library/jest-dom** | ^6.9.1 | Matchers de asserção para DOM |
| **ts-jest** | ^29.4.6 | Suporte TypeScript para Jest |
| **jest-mock-extended** | ^4.0.0 | Funcionalidade estendida de mock |
| **identity-obj-proxy** | ^3.0.0 | Mock de módulos CSS |
| **Playwright** | ^1.58.0 | Testes E2E em navegador |

## Configuração do Jest (`jest.config.js`)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
    setupFilesAfterSetup: ['<rootDir>/tests/jest.setup.ts'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
}

module.exports = createJestConfig(customJestConfig)
```

Pontos principais:
- Usa `next/jest` para integração com Next.js
- Ambiente JSDOM para testes de componentes
- Suporte a alias de caminho (`@/` → raiz)
- Arquivo de setup: `tests/jest.setup.ts`

## Estrutura de Testes

```
tests/
├── jest.setup.ts              # Setup global de testes e mocks
├── unit/                      # Testes unitários
│   ├── actions.test.ts       # Testes de server actions
│   ├── activities.test.ts    # Testes da feature de atividades
│   ├── dashboard-components.test.tsx  # Testes de UI do dashboard
│   ├── permissions.test.ts   # Testes de lógica de permissão
│   ├── project-filters.test.tsx       # Testes de componente de filtros
│   ├── project_architecture.test.ts   # Testes de campos de arquitetura
│   ├── projects-view.test.tsx         # Testes de visualização de projetos
│   ├── validations.test.ts  # Testes de schemas Zod
│   ├── actions/              # Testes específicos de actions
│   ├── components/           # Testes específicos de componentes
│   └── services/             # Testes específicos de serviços
├── integration/              # Testes de integração
│   ├── clients.test.ts      # Integração CRUD de clientes
│   ├── projects.test.ts     # Integração CRUD de projetos
│   ├── reports.test.ts      # Testes de geração de relatórios
│   └── time-tracking.test.ts # Integração de rastreamento de tempo
└── e2e/                      # Testes E2E com Playwright
```

## Categorias de Teste

### Testes Unitários (`tests/unit/`)
- **8 arquivos de teste** + 3 subdiretórios no nível raiz
- Testam funções individuais, componentes e schemas
- Mockam cliente Prisma e sessão de autenticação
- Exemplos:
  - `validations.test.ts` — Regras de validação de schemas Zod
  - `permissions.test.ts` — Funções de permissão baseadas em papéis
  - `actions.test.ts` — Lógica de server actions com BD mockado
  - `dashboard-components.test.tsx` — Renderização da UI do dashboard

### Testes de Integração (`tests/integration/`)
- **4 arquivos de teste**
- Testam fluxos de features através de múltiplas camadas
- Exemplos:
  - `clients.test.ts` — Fluxo CRUD de clientes
  - `projects.test.ts` — Ciclo de vida de projetos
  - `reports.test.ts` — Agregação de dados de relatórios (13KB — abrangente)
  - `time-tracking.test.ts` — Operações de registro de tempo

### Testes E2E (`tests/e2e/`)
- **Playwright** configurado mas diretório pode estar escasso
- Configuração: `playwright.config.ts`
- URL base: `http://localhost:3000`
- Navegador: Apenas Chromium
- Trace: na primeira tentativa de retry
- Configurações de CI: 2 retries, 1 worker

## Configuração do Playwright (`playwright.config.ts`)

```typescript
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
});
```

## Padrões de Mock

### Mock do Prisma (via `jest.setup.ts`)
- Cliente Prisma mockado globalmente
- Usa `jest-mock-extended` para mock profundo
- Padrão: `jest.mock('@/lib/prisma')` no setup

### Mock de Autenticação
- Função `auth()` mockada para retornar sessão de teste
- Padrão: `jest.mock('@/auth', () => ({ auth: jest.fn() }))`

### Padrão de Teste de Componente
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('NomeDoComponente', () => {
    it('deve renderizar corretamente', () => {
        render(<Componente prop="valor" />);
        expect(screen.getByText('texto esperado')).toBeInTheDocument();
    });
});
```

## Comandos de Teste

| Comando | Propósito |
|---|---|
| `npm test` | Executar todos os testes Jest |
| `npm run test:watch` | Executar Jest em modo watch |
| `npx playwright test` | Executar testes E2E |

## Cobertura

- Sem threshold de cobertura configurado no `jest.config.js`
- Sem relatório de cobertura no CI
- A cobertura de testes parece moderada:
  - ✅ Validações, permissões — bem testados
  - ✅ Componentes do dashboard — testes de UI
  - ✅ Relatórios — testes de integração abrangentes
  - ⚠️ Server actions — parcialmente testados
  - ⚠️ Kanban/DnD — cobertura incerta
  - ❌ Fluxo de autenticação — pode faltar testes abrangentes
  - ❌ E2E — mínimo ou vazio
