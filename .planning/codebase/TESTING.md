# Testing

> Last mapped: 2026-05-27

## Test Framework Stack

| Tool | Version | Purpose |
|---|---|---|
| **Jest** | ^30.2.0 | Unit/integration test runner |
| **@testing-library/react** | ^16.3.2 | React component testing |
| **@testing-library/user-event** | ^14.6.1 | User interaction simulation |
| **@testing-library/jest-dom** | ^6.9.1 | DOM assertion matchers |
| **ts-jest** | ^29.4.6 | TypeScript support for Jest |
| **jest-mock-extended** | ^4.0.0 | Extended mock functionality |
| **identity-obj-proxy** | ^3.0.0 | CSS module mocking |
| **Playwright** | ^1.58.0 | E2E browser testing |

## Jest Configuration (`jest.config.js`)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
    setupFilesAfterEnup: ['<rootDir>/tests/jest.setup.ts'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
}

module.exports = createJestConfig(customJestConfig)
```

Key points:
- Uses `next/jest` for Next.js integration
- JSDOM environment for component tests
- Path alias support (`@/` → root)
- Setup file: `tests/jest.setup.ts`

## Test Structure

```
tests/
├── jest.setup.ts              # Global test setup & mocks
├── unit/                      # Unit tests
│   ├── actions.test.ts       # Server action tests
│   ├── activities.test.ts    # Activity feature tests
│   ├── dashboard-components.test.tsx  # Dashboard UI tests
│   ├── permissions.test.ts   # Permission logic tests
│   ├── project-filters.test.tsx       # Filter component tests
│   ├── project_architecture.test.ts   # Architecture field tests
│   ├── projects-view.test.tsx         # Projects view tests
│   ├── validations.test.ts  # Zod schema tests
│   ├── actions/              # Action-specific tests
│   ├── components/           # Component-specific tests
│   └── services/             # Service-specific tests
├── integration/              # Integration tests
│   ├── clients.test.ts      # Client CRUD integration
│   ├── projects.test.ts     # Project CRUD integration
│   ├── reports.test.ts      # Report generation tests
│   └── time-tracking.test.ts # Time tracking integration
└── e2e/                      # Playwright E2E tests
```

## Test Categories

### Unit Tests (`tests/unit/`)
- **8 test files** + 3 subdirectories at root level
- Test individual functions, components, and schemas
- Mock Prisma client and auth session
- Examples:
  - `validations.test.ts` — Zod schema validation rules
  - `permissions.test.ts` — Role-based permission functions
  - `actions.test.ts` — Server action logic with mocked DB
  - `dashboard-components.test.tsx` — Dashboard UI rendering

### Integration Tests (`tests/integration/`)
- **4 test files**
- Test feature workflows across multiple layers
- Examples:
  - `clients.test.ts` — Client CRUD flow
  - `projects.test.ts` — Project lifecycle
  - `reports.test.ts` — Report data aggregation (13KB — comprehensive)
  - `time-tracking.test.ts` — Time log operations

### E2E Tests (`tests/e2e/`)
- **Playwright** configured but directory may be sparse
- Config: `playwright.config.ts`
- Base URL: `http://localhost:3000`
- Browser: Chromium only
- Trace: on first retry
- CI settings: 2 retries, 1 worker

## Playwright Configuration (`playwright.config.ts`)

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

## Mocking Patterns

### Prisma Mock (via `jest.setup.ts`)
- Prisma client is mocked globally
- Uses `jest-mock-extended` for deep mocking
- Pattern: `jest.mock('@/lib/prisma')` in setup

### Auth Mock
- `auth()` function mocked to return test session
- Pattern: `jest.mock('@/auth', () => ({ auth: jest.fn() }))`

### Component Test Pattern
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
    it('should render correctly', () => {
        render(<Component prop="value" />);
        expect(screen.getByText('expected text')).toBeInTheDocument();
    });
});
```

## Test Commands

| Command | Purpose |
|---|---|
| `npm test` | Run all Jest tests |
| `npm run test:watch` | Run Jest in watch mode |
| `npx playwright test` | Run E2E tests |

## Coverage

- No coverage threshold configured in `jest.config.js`
- No CI coverage reporting
- Test coverage appears moderate:
  - ✅ Validations, permissions — well tested
  - ✅ Dashboard components — UI tests
  - ✅ Reports — comprehensive integration tests
  - ⚠️ Server actions — partially tested
  - ⚠️ Kanban/DnD — unclear coverage
  - ❌ Auth flow — may lack comprehensive tests
  - ❌ E2E — minimal or empty
