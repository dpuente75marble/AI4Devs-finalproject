import { expect, test, type Page } from '@playwright/test'

const MOCK_SPRINT_ANALYSIS_RESPONSE = [
  {
    sprint: 'Sprint 4',
    demand: 42,
    capacity: 40,
    absences: 3,
    adjustedCapacity: 37,
    utilization: 113.51,
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

    const row = page.getByRole('row').filter({ hasText: 'Sprint 4' })

    await expect(row).toBeVisible()
    await expect(row).toContainText('42')
    await expect(row).toContainText('40')
    await expect(row).toContainText('3')
    await expect(row).toContainText('37')
    await expect(row).toContainText('113.51%')
    await expect(row).toContainText('OVERLOADED')
  })
})
