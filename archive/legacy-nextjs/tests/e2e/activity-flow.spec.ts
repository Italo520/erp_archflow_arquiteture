import { test, expect } from '@playwright/test';
import { prisma } from '../../lib/prisma';

test.describe('Activity Flow', () => {

    // Setup: Login e limpeza de estado do banco
    test.beforeEach(async ({ page }) => {
        // Deleta qualquer timer ativo no banco para evitar race conditions no front-end
        await prisma.timeLog.deleteMany({
            where: { endTime: null }
        });

        await page.goto('/login');
        // Fill login form - using name attributes
        await page.fill('[name="email"]', 'admin@archflow.local');
        await page.fill('[name="password"]', 'password123');
        await page.getByRole('button', { name: /Login|Entrar/i }).click();

        // Wait for redirect to dashboard
        await expect(page).toHaveURL(/dashboard/);
    });

    test.afterAll(async () => {
        await prisma.$disconnect();
    });

    test('Scenario 1: Create activity in calendar and verify in list', async ({ page }) => {
        await page.goto('/activities');

        // Open Quick Activity Modal
        await page.getByRole('button', { name: /Quick Add/i }).click();

        // Expect Modal
        await expect(page.getByText('Quick Add Activity')).toBeVisible();

        // Fill Form
        await page.getByLabel('Title').fill('E2E Test Meeting');

        // Submit form
        await page.getByRole('button', { name: 'Schedule' }).click();

        // Verify it appears in the list (ActivityList.tsx)
        await expect(page.getByText('E2E Test Meeting')).toBeVisible();
    });

    test('Scenario 2 (Critical): Time Tracking Flow', async ({ page }) => {
        await page.goto('/time-tracking');

        // 1. Select Project
        const projectSelect = page.locator('button:has-text("Project...")');
        await projectSelect.click();
        await page.getByRole('option', { name: /Reforma/i }).first().click();

        // Start Timer (Play button)
        await page.locator('button:has(svg.lucide-play)').click();

        // Wait 2 seconds
        await page.waitForTimeout(2000);

        // Stop Timer (Square/Stop button)
        await page.locator('button:has(svg.lucide-square)').click();

        // Verify Log in Table
        const recentLogsTable = page.locator('table');
        await expect(recentLogsTable).toContainText('Reforma Sampaio & Filhos');

        // Cleanup: Delete the log to keep system clean
        await page.getByRole('button', { name: 'Open menu' }).first().click();
        await page.getByRole('menuitem', { name: /Delete/i }).click();
        await page.getByRole('button', { name: 'Delete' }).click(); // Confirm AlertDialog
    });

    test('Scenario 3: Manual Log Fail', async ({ page }) => {
        await page.goto('/time-tracking');

        // Fill Manual Form (Side panel)
        // Skip Project Selection (Required)
        await page.getByLabel('Description').fill('Missing Project Log');

        await page.getByRole('button', { name: 'Add Entry' }).click();

        // Expect Validation Error (Form should not submit, thus no log is added to the table)
        const recentLogsTable = page.locator('table');
        await expect(recentLogsTable).not.toContainText('Missing Project Log');
    });

});
