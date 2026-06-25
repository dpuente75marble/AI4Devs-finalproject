import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { setupAuthenticatedAuthMocks } from './helpers/auth-api-mocks'

const PDF_FIXTURE = path.join(process.cwd(), 'fixtures/requirements.pdf')

const MOCK_REFINEMENT_RESPONSE = {
  sourceText:
    'Business requirement extracted from uploaded PDF:\nrequirements.pdf\n\nThe system must support sprint planning workflows.',
  refinedStory:
    'As a Tech Lead, I want sprint planning workflows, so that the team can deliver predictably.',
  acceptanceCriteria: [
    'Given sprint planning workflows When refinement runs Then a refined user story is generated',
    'Given extracted requirement content When acceptance criteria are produced Then each criterion follows Given/When/Then format',
  ],
  gaps: ['Missing business rule for error handling and failure scenarios'],
  provider: 'mock',
}

async function setupRefinementApiMocks(page: Page) {
  await page.route('**/api/refinement/analyze', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_REFINEMENT_RESPONSE),
      })
      return
    }

    await route.fallback()
  })
}

test.describe('Refinement page', () => {
  test('shows refinement analysis results from mocked API', async ({ page }) => {
    await setupRefinementApiMocks(page)
    await setupAuthenticatedAuthMocks(page)
    await page.goto('/refinement')

    await expect(
      page.getByRole('heading', { name: 'Refinement', level: 1 }),
    ).toBeVisible()
    await expect(
      page.getByText(
        'Upload a PDF and refine requirements using the mock AI provider.',
      ),
    ).toBeVisible()

    await page.getByLabel('PDF file').setInputFiles(PDF_FIXTURE)
    await page.getByRole('button', { name: 'Analyze' }).click()

    await expect(page.getByText('Analyzing PDF requirements...')).toBeHidden()

    await expect(
      page.getByRole('heading', { name: 'Analysis Results', level: 2 }),
    ).toBeVisible()
    await expect(page.getByText('Provider: mock')).toBeVisible()

    const analysisSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Analysis Results', level: 2 }),
    })

    await expect(analysisSection.getByText('Refined Story')).toBeVisible()
    await expect(
      analysisSection.locator('textarea').filter({
        hasText: MOCK_REFINEMENT_RESPONSE.refinedStory,
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Acceptance Criteria', level: 3 }),
    ).toBeVisible()
    await expect(analysisSection.getByText('Criterion 1')).toBeVisible()
    await expect(analysisSection.getByText('Criterion 2')).toBeVisible()
    await expect(
      analysisSection.locator('textarea').filter({
        hasText: MOCK_REFINEMENT_RESPONSE.acceptanceCriteria[0],
      }),
    ).toBeVisible()
    await expect(
      analysisSection.locator('textarea').filter({
        hasText: MOCK_REFINEMENT_RESPONSE.acceptanceCriteria[1],
      }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Gaps', level: 3 })).toBeVisible()
    await expect(analysisSection.getByText('Gap 1')).toBeVisible()
    await expect(
      analysisSection.locator('textarea').filter({
        hasText: MOCK_REFINEMENT_RESPONSE.gaps[0],
      }),
    ).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
  })
})
