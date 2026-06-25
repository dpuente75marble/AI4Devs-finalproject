import { expect, test } from '@playwright/test'
import { setupAuthenticatedAuthMocks } from './helpers/auth-api-mocks'

test.describe('User Stories page', () => {
  test('renders the CSV import smoke UI without backend', async ({ page }) => {
    await setupAuthenticatedAuthMocks(page)
    await page.goto('/user-stories')

    await expect(
      page.getByRole('heading', { name: 'User Stories', level: 1 }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Import CSV', level: 2 }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Import CSV' })).toBeVisible()
  })
})
