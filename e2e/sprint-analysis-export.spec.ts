import { expect, test, type Page } from '@playwright/test'
import { setupAuthenticatedAuthMocks } from './helpers/auth-api-mocks'

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

const MOCK_EXPORT_BODY = Buffer.from('mock-xlsx')

async function setupSprintAnalysisTableMock(page: Page) {
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

async function setupSprintAnalysisExportMock(
  page: Page,
  options: {
    status?: number
    delayMs?: number
    message?: string
  } = {},
) {
  const { status = 200, delayMs = 250, message = 'Export failed' } = options

  await page.route('**/api/sprint-analysis/export', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback()
      return
    }

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }

    if (status >= 400) {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ statusCode: status, message }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      headers: {
        'Content-Disposition':
          'attachment; filename="sprint-analysis-2026-06-25.xlsx"',
      },
      body: MOCK_EXPORT_BODY,
    })
  })
}

test.describe('Sprint Analysis export', () => {
  test('exports Excel from mocked API with loading state and no error', async ({
    page,
  }) => {
    await setupSprintAnalysisTableMock(page)
    await setupSprintAnalysisExportMock(page)
    await setupAuthenticatedAuthMocks(page)
    await page.goto('/sprint-analysis')

    const exportButton = page.getByRole('button', { name: 'Export Excel' })

    await expect(exportButton).toBeVisible()
    await expect(page.getByText('Loading sprint analysis...')).toBeHidden()

    const exportRequest = page.waitForRequest('**/api/sprint-analysis/export')

    await exportButton.click()

    await exportRequest
    await expect(page.getByRole('button', { name: 'Exporting…' })).toBeVisible()
    await expect(exportButton).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('shows export error banner when export API returns 500', async ({
    page,
  }) => {
    await setupSprintAnalysisTableMock(page)
    await setupSprintAnalysisExportMock(page, {
      status: 500,
      delayMs: 0,
      message: 'Export failed',
    })
    await setupAuthenticatedAuthMocks(page)
    await page.goto('/sprint-analysis')

    await expect(page.getByText('Loading sprint analysis...')).toBeHidden()
    await page.getByRole('button', { name: 'Export Excel' }).click()

    const exportError = page.getByRole('alert')

    await expect(exportError).toBeVisible()
    await expect(exportError).toContainText('Export failed')
  })
})
