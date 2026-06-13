import { expect, test, type Locator, type Page } from '@playwright/test'

type MockAbsence = {
  id: string
  sprint: string
  teamName: string
  projectName: string
  absenceDays: number
  reason: string
  createdAt: string
  updatedAt: string
}

const MOCK_CAPACITY_RESPONSE = {
  data: [
    {
      id: 'capacity-1',
      sprint: 'Sprint 1',
      teamName: 'Gerencia Ahorro',
      projectName: 'Pasarelas',
      availablePoints: 40,
      createdAt: '2026-06-13T10:00:00.000Z',
      updatedAt: '2026-06-13T10:00:00.000Z',
    },
  ],
  total: 1,
}

function absenceSection(page: Page): Locator {
  return page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Sprint Absences', level: 2 }),
  })
}

async function setupSprintAbsencesApiMocks(page: Page) {
  const absences: MockAbsence[] = []
  let nextId = 1

  await page.route('**/api/sprint-capacity', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CAPACITY_RESPONSE),
      })
      return
    }

    await route.fallback()
  })

  await page.route('**/api/sprint-absences', async (route) => {
    const method = route.request().method()

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: absences, total: absences.length }),
      })
      return
    }

    if (method === 'POST') {
      const body = route.request().postDataJSON() as Omit<
        MockAbsence,
        'id' | 'createdAt' | 'updatedAt'
      >
      const timestamp = new Date().toISOString()
      const created: MockAbsence = {
        id: `absence-${nextId++}`,
        ...body,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      absences.push(created)

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      })
      return
    }

    await route.fallback()
  })
}

async function fillAbsenceForm(
  page: Page,
  values: {
    sprint: string
    teamName: string
    projectName: string
    absenceDays: string
    reason: string
  },
) {
  const section = absenceSection(page)
  const teamSelect = section.locator('#absence-team')
  const projectSelect = section.locator('#absence-project')

  await teamSelect.selectOption(values.teamName)
  await expect(teamSelect).toHaveValue(values.teamName)
  await expect(
    projectSelect.locator(`option[value="${values.projectName}"]`),
  ).toHaveCount(1)
  await projectSelect.selectOption(values.projectName)
  await section.locator('#absence-sprint').fill(values.sprint)
  await section.getByLabel('Absence Days').fill(values.absenceDays)
  await section.getByLabel('Reason').fill(values.reason)
}

test.describe('Settings Sprint Absences', () => {
  test('registers absences and calculates adjusted capacity without backend', async ({
    page,
  }) => {
    await setupSprintAbsencesApiMocks(page)
    await page.goto('/settings')

    await expect(
      page.getByRole('heading', { name: 'Sprint Absences', level: 2 }),
    ).toBeVisible()
    await expect(
      page.getByText(
        'MVP: each absence day reduces capacity by 1 story point.',
      ),
    ).toBeVisible()
    await expect(page.getByText('Loading sprint absences...')).toBeHidden()
    await expect(
      page.getByText(
        'No sprint absences registered yet. Add an absence to adjust capacity.',
      ),
    ).toBeVisible()
    await expect(page.getByRole('cell', { name: '40' })).toBeVisible()

    await fillAbsenceForm(page, {
      sprint: 'Sprint 1',
      teamName: 'Gerencia Ahorro',
      projectName: 'Pasarelas',
      absenceDays: '3',
      reason: 'Team offsite',
    })
    await page.getByRole('button', { name: 'Save Absence' }).click()

    const absencesTable = page.getByRole('table', { name: 'Sprint absences' })
    const firstRow = absencesTable.getByRole('row').filter({
      hasText: 'Team offsite',
    })

    await expect(firstRow).toBeVisible()
    await expect(firstRow).toContainText('Sprint 1')
    await expect(firstRow).toContainText('Gerencia Ahorro')
    await expect(firstRow).toContainText('Pasarelas')
    await expect(firstRow).toContainText('3')
    await expect(firstRow).toContainText('37')

    await fillAbsenceForm(page, {
      sprint: 'Sprint 1',
      teamName: 'Gerencia Ahorro',
      projectName: 'Pasarelas',
      absenceDays: '4',
      reason: 'Workshop',
    })
    await page.getByRole('button', { name: 'Save Absence' }).click()

    const secondRow = absencesTable.getByRole('row').filter({
      hasText: 'Workshop',
    })

    await expect(secondRow).toBeVisible()
    await expect(firstRow).toContainText('33')
    await expect(secondRow).toContainText('33')

    const section = absenceSection(page)
    await section.getByLabel('Absence Days').fill('0')
    await page.getByRole('button', { name: 'Save Absence' }).click()
    await expect(
      page.getByRole('alert').filter({
        hasText: 'Absence days must be greater than 0.',
      }),
    ).toBeVisible()

    await section.getByLabel('Absence Days').fill('3')
    await section.getByLabel('Reason').fill('')
    await page.getByRole('button', { name: 'Save Absence' }).click()
    await expect(
      page.getByRole('alert').filter({ hasText: 'Reason is required.' }),
    ).toBeVisible()
  })
})
