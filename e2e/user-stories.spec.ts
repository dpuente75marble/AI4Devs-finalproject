import { expect, test } from '@playwright/test'

test.describe('User Stories page', () => {
  test('renders the CSV import smoke UI without backend', async ({ page }) => {
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
