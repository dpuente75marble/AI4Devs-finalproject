import { expect, test, type Page } from '@playwright/test'

const MOCK_SPRINT_ANALYSIS_RESPONSE = [
  {
    sprint: 'Sprint 2',
    teamName: 'Gerencia Riesgo',
    projectName: 'Riesgo',
    demand: 21,
    capacity: 20,
    absences: 0,
    adjustedCapacity: 20,
    utilization: 105,
    status: 'OVERLOADED',
  },
]

async function setupSprintAnalysisApiMocks(page: Page) {
  await page.route('**/api/sprint-analysis', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SPRINT_ANALYSIS_RESPONSE),
      })
      return
    }

    await route.fallback()
  })
}

test.describe('Sprint Analysis page', () => {
  test('shows overloaded sprint analysis from mocked API', async ({ page }) => {
    await setupSprintAnalysisApiMocks(page)
    await page.goto('/sprint-analysis')

    await expect(
      page.getByRole('heading', { name: 'Sprint Analysis', level: 1 }),
    ).toBeVisible()
    await expect(page.getByText('Loading sprint analysis...')).toBeHidden()

    const row = page.getByRole('row').filter({ hasText: 'Sprint 2' })

    await expect(row).toBeVisible()
    await expect(row).toContainText('Gerencia Riesgo')
    await expect(row).toContainText('Riesgo')
    await expect(row).toContainText('21')
    await expect(row).toContainText('20')
    await expect(row).toContainText('0')
    await expect(row).toContainText('105.00%')
    await expect(row).toContainText('OVERLOADED')
  })
})
