import { useCallback, useEffect, useState } from 'react'
import {
  createSprintCapacity,
  fetchSprintCapacities,
  type SprintCapacity,
} from '../api/sprintCapacityApi'

const TEAM_OPTIONS = ['Gerencia Riesgo', 'Gerencia Ahorro'] as const

const PROJECTS_BY_TEAM: Record<(typeof TEAM_OPTIONS)[number], string[]> = {
  'Gerencia Riesgo': ['Riesgo'],
  'Gerencia Ahorro': ['Ahorro', 'Pasarelas', 'Gestionados'],
}

const DEFAULT_TEAM = TEAM_OPTIONS[0]
const DEFAULT_PROJECT = PROJECTS_BY_TEAM[DEFAULT_TEAM][0]

const SPRINT_NUMBER_PATTERN = /^Sprint\s+(\d+)$/i

const fieldClassName =
  'rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'

function formatDate(value: string): string {
  return new Date(value).toLocaleString()
}

export function suggestNextSprint(
  capacities: Pick<SprintCapacity, 'sprint'>[],
): string {
  let maxSprintNumber = 0

  for (const capacity of capacities) {
    const match = capacity.sprint.trim().match(SPRINT_NUMBER_PATTERN)
    if (!match) {
      continue
    }

    const sprintNumber = Number(match[1])
    if (Number.isInteger(sprintNumber) && sprintNumber > maxSprintNumber) {
      maxSprintNumber = sprintNumber
    }
  }

  return maxSprintNumber === 0 ? 'Sprint 1' : `Sprint ${maxSprintNumber + 1}`
}

type FormState = {
  sprint: string
  teamName: (typeof TEAM_OPTIONS)[number]
  projectName: string
  availablePoints: string
}

function createDefaultForm(capacities: SprintCapacity[]): FormState {
  return {
    sprint: suggestNextSprint(capacities),
    teamName: DEFAULT_TEAM,
    projectName: DEFAULT_PROJECT,
    availablePoints: '',
  }
}

function getProjectsForTeam(teamName: (typeof TEAM_OPTIONS)[number]): string[] {
  return PROJECTS_BY_TEAM[teamName]
}

function validateForm(form: FormState): string | null {
  const sprint = form.sprint.trim()
  if (!sprint) {
    return 'Sprint is required.'
  }

  if (!form.teamName) {
    return 'Gerencia is required.'
  }

  const projectName = form.projectName.trim()
  if (!projectName) {
    return 'Project is required.'
  }

  const allowedProjects = getProjectsForTeam(form.teamName)
  if (!allowedProjects.includes(projectName)) {
    return 'Project is not valid for the selected gerencia.'
  }

  const pointsRaw = form.availablePoints.trim()
  if (!pointsRaw) {
    return 'Available points is required.'
  }

  if (!/^\d+$/.test(pointsRaw)) {
    return 'Available points must be a positive integer.'
  }

  const availablePoints = Number(pointsRaw)
  if (!Number.isInteger(availablePoints) || availablePoints <= 0) {
    return 'Available points must be greater than 0.'
  }

  return null
}

export default function SettingsPage() {
  const [capacities, setCapacities] = useState<SprintCapacity[]>([])
  const [form, setForm] = useState<FormState>(createDefaultForm([]))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadCapacities = useCallback(async (options?: { resetForm?: boolean }) => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetchSprintCapacities()
      setCapacities(response.data)

      if (options?.resetForm) {
        setForm(createDefaultForm(response.data))
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to load sprint capacity configurations. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCapacities({ resetForm: true })
  }, [loadCapacities])

  function handleTeamChange(teamName: (typeof TEAM_OPTIONS)[number]) {
    const projects = getProjectsForTeam(teamName)
    setForm((current) => ({
      ...current,
      teamName,
      projectName: projects[0] ?? '',
    }))
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  async function handleSave() {
    const validationError = validateForm(form)
    if (validationError) {
      setSuccessMessage(null)
      setErrorMessage(validationError)
      return
    }

    setSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await createSprintCapacity({
        sprint: form.sprint.trim(),
        teamName: form.teamName,
        projectName: form.projectName.trim(),
        availablePoints: Number(form.availablePoints.trim()),
      })
      setSuccessMessage('Sprint capacity configuration saved successfully.')
      await loadCapacities({ resetForm: true })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to save sprint capacity. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const projectOptions = getProjectsForTeam(form.teamName)

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        Settings
      </h1>
      <p className="mt-2 text-gray-600">
        Configure workspace preferences and sprint planning inputs.
      </p>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Sprint Capacity</h2>
        <p className="mt-1 text-sm text-gray-600">
          Define available story points per sprint, gerencia and project for
          capacity planning.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Sprint
            <input
              type="text"
              value={form.sprint}
              disabled={saving}
              placeholder="Sprint 1"
              className={fieldClassName}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  sprint: event.target.value,
                }))
                setErrorMessage(null)
                setSuccessMessage(null)
              }}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Gerencia
            <select
              value={form.teamName}
              disabled={saving}
              className={fieldClassName}
              onChange={(event) => {
                handleTeamChange(event.target.value as (typeof TEAM_OPTIONS)[number])
              }}
            >
              {TEAM_OPTIONS.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Project
            <select
              value={form.projectName}
              disabled={saving}
              className={fieldClassName}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  projectName: event.target.value,
                }))
                setErrorMessage(null)
                setSuccessMessage(null)
              }}
            >
              {projectOptions.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Available Points
            <input
              type="number"
              min={1}
              step={1}
              value={form.availablePoints}
              disabled={saving}
              placeholder="40"
              className={fieldClassName}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  availablePoints: event.target.value,
                }))
                setErrorMessage(null)
                setSuccessMessage(null)
              }}
            />
          </label>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Capacity'}
          </button>
        </div>
      </section>

      {errorMessage && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"
        >
          {successMessage}
        </div>
      )}

      <section className="mt-6">
        {loading ? (
          <p className="text-sm text-gray-600">
            Loading sprint capacity configurations...
          </p>
        ) : capacities.length === 0 && !errorMessage ? (
          <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
            No sprint capacity configured yet. Add a configuration to get
            started.
          </p>
        ) : capacities.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Sprint
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Gerencia
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Available Points
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {capacities.map((capacity) => (
                  <tr key={capacity.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {capacity.sprint}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {capacity.teamName}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {capacity.projectName}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {capacity.availablePoints}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(capacity.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  )
}
