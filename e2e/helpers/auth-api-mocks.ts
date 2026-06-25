import type { Page, Route } from '@playwright/test'

export const MOCK_AUTH_USER = {
  id: 'clx000demo000000000000001',
  email: 'pm@deliveryops.local',
  name: 'Demo PM',
}

const MOCK_AUTH_COOKIE =
  'deliveryops_access_token=mock.jwt.token; Path=/; HttpOnly; SameSite=Lax'

const CLEARED_AUTH_COOKIE =
  'deliveryops_access_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax'

const UNAUTHORIZED_BODY = JSON.stringify({
  statusCode: 401,
  message: 'Unauthorized',
})

type AuthMockSession = {
  authenticated: boolean
}

function createAuthMockSession(authenticated = false): AuthMockSession {
  return { authenticated }
}

async function fulfillPreflight(route: Route) {
  await route.fulfill({
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

async function registerMeRoute(page: Page, session: AuthMockSession) {
  await page.route('**/api/auth/me', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback()
      return
    }

    if (session.authenticated) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: MOCK_AUTH_USER }),
      })
      return
    }

    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: UNAUTHORIZED_BODY,
    })
  })
}

async function registerLoginRoute(page: Page, session: AuthMockSession) {
  await page.route('**/api/auth/login', async (route) => {
    const method = route.request().method()

    if (method === 'OPTIONS') {
      await fulfillPreflight(route)
      return
    }

    if (method === 'POST') {
      session.authenticated = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Set-Cookie': MOCK_AUTH_COOKIE,
        },
        body: JSON.stringify({
          user: MOCK_AUTH_USER,
          message: 'Login successful',
        }),
      })
      return
    }

    await route.fallback()
  })
}

async function registerLogoutRoute(page: Page, session: AuthMockSession) {
  await page.route('**/api/auth/logout', async (route) => {
    const method = route.request().method()

    if (method === 'OPTIONS') {
      await fulfillPreflight(route)
      return
    }

    if (method === 'POST') {
      session.authenticated = false
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Set-Cookie': CLEARED_AUTH_COOKIE,
        },
        body: JSON.stringify({ message: 'Logout successful' }),
      })
      return
    }

    await route.fallback()
  })
}

/** Always-authenticated /me mock for non-auth E2E slices. */
export async function setupAuthenticatedAuthMocks(page: Page) {
  await page.route('**/api/auth/me', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: MOCK_AUTH_USER }),
      })
      return
    }

    await route.fallback()
  })
}

/** Session-aware /me mock that returns 401 until login succeeds. */
export async function setupUnauthenticatedAuthMocks(page: Page) {
  const session = createAuthMockSession(false)
  await registerMeRoute(page, session)
}

/** Full login flow: /me 401 → POST login + Set-Cookie → /me 200. */
export async function setupStatefulAuthFlowMocks(page: Page) {
  const session = createAuthMockSession(false)
  await registerMeRoute(page, session)
  await registerLoginRoute(page, session)
  await registerLogoutRoute(page, session)
}

/** Authenticated session with logout that clears cookie and flips /me to 401. */
export async function setupAuthenticatedAuthFlowMocks(page: Page) {
  const session = createAuthMockSession(true)
  await registerMeRoute(page, session)
  await registerLogoutRoute(page, session)
}
