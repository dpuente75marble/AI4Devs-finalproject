import { expect, test } from '@playwright/test'
import {
  MOCK_AUTH_USER,
  setupAuthenticatedAuthFlowMocks,
  setupStatefulAuthFlowMocks,
  setupUnauthenticatedAuthMocks,
} from './helpers/auth-api-mocks'

const LOGIN_HEADING = {
  name: 'Sign in to DeliveryOps AI',
  level: 1,
} as const

function isAuthMeResponse(url: string, method: string) {
  return url.includes('/api/auth/me') && method === 'GET'
}

test.describe('Auth login flow', () => {
  test('redirects protected routes to login without a session', async ({
    page,
  }) => {
    await setupUnauthenticatedAuthMocks(page)

    const sessionCheck = page.waitForResponse((response) =>
      isAuthMeResponse(response.url(), response.request().method()),
    )

    await page.goto('/settings')
    const meResponse = await sessionCheck

    expect(meResponse.status()).toBe(401)
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', LOGIN_HEADING)).toBeVisible()
  })

  test('logs in with mocked cookie and /me session hydration', async ({
    page,
  }) => {
    await setupStatefulAuthFlowMocks(page)

    const initialSessionCheck = page.waitForResponse((response) =>
      isAuthMeResponse(response.url(), response.request().method()),
    )

    await page.goto('/login')
    const initialMeResponse = await initialSessionCheck

    expect(initialMeResponse.status()).toBe(401)
    await expect(page.getByRole('heading', LOGIN_HEADING)).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()

    await page.getByLabel('Email').fill(MOCK_AUTH_USER.email)
    await page.getByLabel('Password').fill('DeliveryOps123!')

    const loginResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/auth/login') &&
        response.request().method() === 'POST',
    )
    const hydratedSession = page.waitForResponse((response) =>
      isAuthMeResponse(response.url(), response.request().method()),
    )

    await page.getByRole('button', { name: 'Sign in' }).click()

    const loginResult = await loginResponse
    const meResult = await hydratedSession

    expect(loginResult.status()).toBe(200)
    expect(meResult.status()).toBe(200)

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(
      page.getByText(`Demo PM (${MOCK_AUTH_USER.email})`),
    ).toBeVisible()
  })

  test('logs out and redirects to login', async ({ page }) => {
    await setupAuthenticatedAuthFlowMocks(page)

    const sessionCheck = page.waitForResponse((response) =>
      isAuthMeResponse(response.url(), response.request().method()),
    )

    await page.goto('/dashboard')
    const meResponse = await sessionCheck

    expect(meResponse.status()).toBe(200)
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible()

    const logoutResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/auth/logout') &&
        response.request().method() === 'POST',
    )

    await page.getByRole('button', { name: 'Log out' }).click()
    const logoutResult = await logoutResponse

    expect(logoutResult.status()).toBe(200)

    await page.waitForURL(/\/login$/)
    await expect(page.getByRole('heading', LOGIN_HEADING)).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })
})
