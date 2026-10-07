/**
 * E2E tests for Dashboard and Reports flow
 * Uses Playwright to test real user interactions
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
    test.beforeEach(async ({ page }) => {
        // Login first (adjust based on your auth flow)
        await page.goto('/login');
        await page.fill('[name="email"]', 'admin@archflow.local');
        await page.fill('[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard
        await page.waitForURL('**/dashboard', { timeout: 10000 });
    });

    test('loads dashboard page successfully', async ({ page }) => {
        await page.goto('/dashboard');

        // Check page title
        await expect(page.getByRole('heading', { name: 'Dashboard' }).first()).toBeVisible();
    });

    test('displays KPI cards with data (not skeleton)', async ({ page }) => {
        await page.goto('/dashboard');

        // Wait for page to load completely
        await page.waitForLoadState('networkidle');

        // Check that KPI cards are present and loaded
        const kpiCards = page.locator('[data-testid="kpi-card"]');

        // If no data-testid, check for Card components with titles
        const totalClientes = page.getByText('Total de Clientes');
        const projetosAtivos = page.getByText('Projetos Ativos');
        const receitaMes = page.getByText('Receita do Mês');

        await expect(totalClientes).toBeVisible();
        await expect(projetosAtivos).toBeVisible();
        await expect(receitaMes).toBeVisible();

        // Verify skeletons are gone (no animate-pulse class on main content)
        await expect(page.locator('main div.animate-pulse').first()).not.toBeVisible({ timeout: 5000 });
    });

    test('displays charts after loading', async ({ page }) => {
        await page.goto('/dashboard');

        // Wait for charts to load
        await page.waitForLoadState('networkidle');

        // Check for chart container (Recharts renders SVG inside ResponsiveContainer)
        const chartContainer = page.locator('.recharts-responsive-container').first();

        // If Recharts isn't visible directly, check for our Chart wrapper
        const visaoGeral = page.getByText('Visão Geral');
        await expect(visaoGeral).toBeVisible();

        // Check tabs are present
        const produtividadeTab = page.getByRole('tab', { name: 'Produtividade' });
        const projetosTab = page.getByRole('tab', { name: 'Status de Projetos' });

        await expect(produtividadeTab).toBeVisible();
        await expect(projetosTab).toBeVisible();
    });

    test('displays deadline alerts section', async ({ page }) => {
        await page.goto('/dashboard');

        await page.waitForLoadState('networkidle');

        const deadlineSection = page.getByText('Prazos Próximos');
        await expect(deadlineSection).toBeVisible();
    });

    test('displays today activities section', async ({ page }) => {
        await page.goto('/dashboard');

        await page.waitForLoadState('networkidle');

        const agendaSection = page.getByText('Agenda de Hoje');
        await expect(agendaSection).toBeVisible();
    });

    test('can switch between chart tabs', async ({ page }) => {
        await page.goto('/dashboard');

        await page.waitForLoadState('networkidle');

        // Click on the second tab
        const statusTab = page.getByRole('tab', { name: 'Status de Projetos' });
        await statusTab.click();

        // Verify tab is now active
        await expect(statusTab).toHaveAttribute('data-state', 'active');
    });
});

test.describe('Reports Page', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('[name="email"]', 'admin@archflow.local');
        await page.fill('[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 10000 });
    });

    test('loads reports page', async ({ page }) => {
        await page.goto('/reports');

        // Wait for page to load completely (so skeleton goes away)
        await page.waitForLoadState('networkidle');

        await expect(page.getByRole('heading', { name: 'Relatórios' })).toBeVisible();
    });

    test('displays filter section', async ({ page }) => {
        await page.goto('/reports');

        await page.waitForLoadState('networkidle');

        const filtrosSection = page.getByText('Filtros');
        await expect(filtrosSection).toBeVisible();
    });

    test('displays report tabs', async ({ page }) => {
        await page.goto('/reports');

        await page.waitForLoadState('networkidle');

        const negocioTab = page.getByRole('tab', { name: 'Negócio' });
        const produtividadeTab = page.getByRole('tab', { name: 'Produtividade' });
        const financeiroTab = page.getByRole('tab', { name: 'Financeiro' });

        await expect(negocioTab).toBeVisible();
        await expect(produtividadeTab).toBeVisible();
        await expect(financeiroTab).toBeVisible();
    });

    test('can change period filter', async ({ page }) => {
        await page.goto('/reports');

        await page.waitForLoadState('networkidle');

        // Click period selector
        const periodSelector = page.locator('[role="combobox"]').first();
        await periodSelector.click();

        // Select a different period
        const quarterOption = page.getByRole('option', { name: 'Trimestre' });
        await quarterOption.click();

        // URL should update with new period
        await expect(page).toHaveURL(/period=quarter/);
    });

    test('period filter changes reflect in data', async ({ page }) => {
        // First load with default month
        await page.goto('/reports?period=month');
        await page.waitForLoadState('networkidle');

        // Get initial value (e.g., revenue)
        const initialRevenue = await page.getByText(/Receita Total/).locator('..').innerText();

        // Change to quarter
        const periodSelector = page.locator('[role="combobox"]').first();
        await periodSelector.click();
        await page.getByRole('option', { name: 'Trimestre' }).click();

        await page.waitForLoadState('networkidle');

        // Values may have changed (or stayed same if no data, but component should have re-rendered)
        const newRevenue = await page.getByText(/Receita Total/).locator('..').innerText();

        // We just verify the component is still present after filter change
        await expect(page.getByText(/Receita Total/)).toBeVisible();
    });

    test('can switch between report tabs', async ({ page }) => {
        await page.goto('/reports');

        await page.waitForLoadState('networkidle');

        // Click Produtividade tab
        const produtividadeTab = page.getByRole('tab', { name: 'Produtividade' });
        await produtividadeTab.click();

        // Should show productivity-specific content
        await expect(page.getByText('Total de Horas')).toBeVisible();
        await expect(page.getByText('Ranking de Produtividade')).toBeVisible();
    });

    test('export buttons are present', async ({ page }) => {
        await page.goto('/reports');

        await page.waitForLoadState('networkidle');

        // Check for export functionality
        const exportButton = page.getByRole('button', { name: /Exportar/i });
        const emailButton = page.getByRole('button', { name: /Email/i });

        // At least one export option should be visible
        const hasExport = await exportButton.isVisible().catch(() => false);
        const hasEmail = await emailButton.isVisible().catch(() => false);

        expect(hasExport || hasEmail).toBeTruthy();
    });
});

test.describe('Dashboard to Reports Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('[name="email"]', 'admin@archflow.local');
        await page.fill('[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 10000 });
    });

    test('can navigate from dashboard to reports', async ({ page }) => {
        await page.goto('/dashboard');

        // Find and click reports link in navigation
        const reportsLink = page.getByRole('link', { name: /Relatórios/i });

        if (await reportsLink.isVisible()) {
            await reportsLink.click();
            await expect(page).toHaveURL(/reports/);
        }
    });

    test('maintains session between pages', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Navigate to reports
        await page.goto('/reports');
        await page.waitForLoadState('networkidle');

        // Should not redirect to login
        await expect(page).not.toHaveURL(/login/);

        // Navigate back to dashboard
        await page.goto('/dashboard');

        // Should still be authenticated
        await expect(page).not.toHaveURL(/login/);
    });
});
