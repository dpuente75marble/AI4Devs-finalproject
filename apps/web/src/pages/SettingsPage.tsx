import { useCallback, useEffect, useState } from 'react'
import {
  createSprintAbsence,
  fetchSprintAbsences,
  type SprintAbsence,
} from '../api/sprintAbsencesApi'
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
const MAX_REASON_LENGTH = 100

const SPRINT_NUMBER_PATTERN = /^Sprint\s+(\d+)$/i

const fieldClassName =
  'rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'

function formatDate(value: string): string {
  return new Date(value).toLocaleString()
}

export function suggestNextSprint(
  records: Pick<SprintCapacity, 'sprint'>[],
): string {
  let maxSprintNumber = 0

  for (const record of records) {
    const match = record.sprint.trim().match(SPRINT_NUMBER_PATTERN)
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

function getProjectsForTeam(teamName: (typeof TEAM_OPTIONS)[number]): string[] {
  return PROJECTS_BY_TEAM[teamName]
}

function combinationKey(
  sprint: string,
  teamName: string,
  projectName: string,
): string {
  return `${sprint.trim()}|${teamName.trim()}|${projectName.trim()}`
}

export function computeAdjustedCapacity(
  availablePoints: number,
  totalAbsenceDays: number,
): number {
  return Math.max(0, availablePoints - totalAbsenceDays)
}

function sumAbsenceDaysForCombination(
  absences: SprintAbsence[],
  sprint: string,
  teamName: string,
  projectName: string,
): number {
  const key = combinationKey(sprint, teamName, projectName)
  return absences
    .filter(
      (absence) =>
        combinationKey(absence.sprint, absence.teamName, absence.projectName) ===
        key,
    )
    .reduce((total, absence) => total + absence.absenceDays, 0)
}

function findCapacityForCombination(
  capacities: SprintCapacity[],
  sprint: string,
  teamName: string,
  projectName: string,
): SprintCapacity | undefined {
  const key = combinationKey(sprint, teamName, projectName)
  return capacities.find(
    (capacity) =>
      combinationKey(capacity.sprint, capacity.teamName, capacity.projectName) ===
      key,
  )
}

export function getAdjustedCapacityDisplay(
  capacities: SprintCapacity[],
  absences: SprintAbsence[],
  absence: Pick<SprintAbsence, 'sprint' | 'teamName' | 'projectName'>,
): string {
  const capacity = findCapacityForCombination(
    capacities,
    absence.sprint,
    absence.teamName,
    absence.projectName,
  )

  if (!capacity) {
    return '—'
  }

  const totalAbsenceDays = sumAbsenceDaysForCombination(
    absences,
    absence.sprint,
    absence.teamName,
    absence.projectName,
  )

  return String(
    computeAdjustedCapacity(capacity.availablePoints, totalAbsenceDays),
  )
}

type CapacityFormState = {
  sprint: string
  teamName: (typeof TEAM_OPTIONS)[number]
  projectName: string
  availablePoints: string
}

type AbsenceFormState = {
  sprint: string
  teamName: (typeof TEAM_OPTIONS)[number]
  projectName: string
  absenceDays: string
  reason: string
}

function createDefaultCapacityForm(capacities: SprintCapacity[]): CapacityFormState {
  return {
    sprint: suggestNextSprint(capacities),
    teamName: DEFAULT_TEAM,
    projectName: DEFAULT_PROJECT,
    availablePoints: '',
  }
}

function createDefaultAbsenceForm(
  capacities: SprintCapacity[],
  absences: SprintAbsence[],
): AbsenceFormState {
  return {
    sprint: suggestNextSprint([...capacities, ...absences]),
    teamName: DEFAULT_TEAM,
    projectName: DEFAULT_PROJECT,
    absenceDays: '',
    reason: '',
  }
}

function validateCapacityForm(form: CapacityFormState): string | null {
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

function validateAbsenceForm(form: AbsenceFormState): string | null {
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

  const absenceDaysRaw = form.absenceDays.trim()
  if (!absenceDaysRaw) {
    return 'Absence days is required.'
  }

  if (!/^\d+$/.test(absenceDaysRaw)) {
    return 'Absence days must be a positive integer.'
  }

  const absenceDays = Number(absenceDaysRaw)
  if (!Number.isInteger(absenceDays) || absenceDays <= 0) {
    return 'Absence days must be greater than 0.'
  }

  const reason = form.reason.trim()
  if (!reason) {
    return 'Reason is required.'
  }

  if (reason.length > MAX_REASON_LENGTH) {
    return `Reason must be at most ${MAX_REASON_LENGTH} characters.`
  }

  return null
}

export default function SettingsPage() {
  const [capacities, setCapacities] = useState<SprintCapacity[]>([])
  const [absences, setAbsences] = useState<SprintAbsence[]>([])
  const [capacityForm, setCapacityForm] = useState<CapacityFormState>(
    createDefaultCapacityForm([]),
  )
  const [absenceForm, setAbsenceForm] = useState<AbsenceFormState>(
    createDefaultAbsenceForm([], []),
  )
  const [loadingCapacities, setLoadingCapacities] = useState(true)
  const [loadingAbsences, setLoadingAbsences] = useState(true)
  const [savingCapacity, setSavingCapacity] = useState(false)
  const [savingAbsence, setSavingAbsence] = useState(false)
  const [capacityErrorMessage, setCapacityErrorMessage] = useState<string | null>(
    null,
  )
  const [capacitySuccessMessage, setCapacitySuccessMessage] = useState<
    string | null
  >(null)
  const [absenceErrorMessage, setAbsenceErrorMessage] = useState<string | null>(
    null,
  )
  const [absenceSuccessMessage, setAbsenceSuccessMessage] = useState<
    string | null
  >(null)

  const loadCapacities = useCallback(async (options?: { resetForm?: boolean }) => {
    setLoadingCapacities(true)
    setCapacityErrorMessage(null)

    try {
      const response = await fetchSprintCapacities()
      setCapacities(response.data)

      if (options?.resetForm) {
        setCapacityForm(createDefaultCapacityForm(response.data))
      }

      return response.data
    } catch (error) {
      setCapacityErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to load sprint capacity configurations. Please try again.',
      )
      return []
    } finally {
      setLoadingCapacities(false)
    }
  }, [])

  const loadAbsences = useCallback(
    async (options?: {
      resetForm?: boolean
      capacitiesSnapshot?: SprintCapacity[]
    }) => {
      setLoadingAbsences(true)
      setAbsenceErrorMessage(null)

      try {
        const response = await fetchSprintAbsences()
        setAbsences(response.data)

        if (options?.resetForm) {
          setAbsenceForm(
            createDefaultAbsenceForm(
              options.capacitiesSnapshot ?? [],
              response.data,
            ),
          )
        }

        return response.data
      } catch (error) {
        setAbsenceErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to load sprint absences. Please try again.',
        )
        return []
      } finally {
        setLoadingAbsences(false)
      }
    },
    [],
  )

  useEffect(() => {
    async function loadInitialData() {
      const loadedCapacities = await loadCapacities({ resetForm: true })
      await loadAbsences({ resetForm: true, capacitiesSnapshot: loadedCapacities })
    }

    void loadInitialData()
  }, [loadAbsences, loadCapacities])

  function handleCapacityTeamChange(teamName: (typeof TEAM_OPTIONS)[number]) {
    const projects = getProjectsForTeam(teamName)
    setCapacityForm((current) => ({
      ...current,
      teamName,
      projectName: projects[0] ?? '',
    }))
    setCapacityErrorMessage(null)
    setCapacitySuccessMessage(null)
  }

  function handleAbsenceTeamChange(teamName: (typeof TEAM_OPTIONS)[number]) {
    const projects = getProjectsForTeam(teamName)
    setAbsenceForm((current) => ({
      ...current,
      teamName,
      projectName: projects[0] ?? '',
    }))
    setAbsenceErrorMessage(null)
    setAbsenceSuccessMessage(null)
  }

  async function handleSaveCapacity() {
    const validationError = validateCapacityForm(capacityForm)
    if (validationError) {
      setCapacitySuccessMessage(null)
      setCapacityErrorMessage(validationError)
      return
    }

    setSavingCapacity(true)
    setCapacityErrorMessage(null)
    setCapacitySuccessMessage(null)

    try {
      await createSprintCapacity({
        sprint: capacityForm.sprint.trim(),
        teamName: capacityForm.teamName,
        projectName: capacityForm.projectName.trim(),
        availablePoints: Number(capacityForm.availablePoints.trim()),
      })
      setCapacitySuccessMessage('Sprint capacity configuration saved successfully.')
      const loadedCapacities = await loadCapacities({ resetForm: true })
      await loadAbsences({ resetForm: true, capacitiesSnapshot: loadedCapacities })
    } catch (error) {
      setCapacityErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to save sprint capacity. Please try again.',
      )
    } finally {
      setSavingCapacity(false)
    }
  }

  async function handleSaveAbsence() {
    const validationError = validateAbsenceForm(absenceForm)
    if (validationError) {
      setAbsenceSuccessMessage(null)
      setAbsenceErrorMessage(validationError)
      return
    }

    setSavingAbsence(true)
    setAbsenceErrorMessage(null)
    setAbsenceSuccessMessage(null)

    try {
      await createSprintAbsence({
        sprint: absenceForm.sprint.trim(),
        teamName: absenceForm.teamName,
        projectName: absenceForm.projectName.trim(),
        absenceDays: Number(absenceForm.absenceDays.trim()),
        reason: absenceForm.reason.trim(),
      })
      setAbsenceSuccessMessage('Sprint absence saved successfully.')
      const loadedCapacities = await loadCapacities()
      await loadAbsences({
        resetForm: true,
        capacitiesSnapshot: loadedCapacities,
      })
    } catch (error) {
      setAbsenceErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to save sprint absence. Please try again.',
      )
    } finally {
      setSavingAbsence(false)
    }
  }

  const capacityProjectOptions = getProjectsForTeam(capacityForm.teamName)
  const absenceProjectOptions = getProjectsForTeam(absenceForm.teamName)

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
              value={capacityForm.sprint}
              disabled={savingCapacity}
              placeholder="Sprint 1"
              className={fieldClassName}
              onChange={(event) => {
                setCapacityForm((current) => ({
                  ...current,
                  sprint: event.target.value,
                }))
                setCapacityErrorMessage(null)
                setCapacitySuccessMessage(null)
              }}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Gerencia
            <select
              value={capacityForm.teamName}
              disabled={savingCapacity}
              className={fieldClassName}
              onChange={(event) => {
                handleCapacityTeamChange(
                  event.target.value as (typeof TEAM_OPTIONS)[number],
                )
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
              value={capacityForm.projectName}
              disabled={savingCapacity}
              className={fieldClassName}
              onChange={(event) => {
                setCapacityForm((current) => ({
                  ...current,
                  projectName: event.target.value,
                }))
                setCapacityErrorMessage(null)
                setCapacitySuccessMessage(null)
              }}
            >
              {capacityProjectOptions.map((project) => (
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
              value={capacityForm.availablePoints}
              disabled={savingCapacity}
              placeholder="40"
              className={fieldClassName}
              onChange={(event) => {
                setCapacityForm((current) => ({
                  ...current,
                  availablePoints: event.target.value,
                }))
                setCapacityErrorMessage(null)
                setCapacitySuccessMessage(null)
              }}
            />
          </label>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => void handleSaveCapacity()}
            disabled={savingCapacity}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {savingCapacity ? 'Saving...' : 'Save Capacity'}
          </button>
        </div>
      </section>

      {capacityErrorMessage && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {capacityErrorMessage}
        </div>
      )}

      {capacitySuccessMessage && (
        <div
          role="status"
          className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"
        >
          {capacitySuccessMessage}
        </div>
      )}

      <section className="mt-6">
        {loadingCapacities ? (
          <p className="text-sm text-gray-600">
            Loading sprint capacity configurations...
          </p>
        ) : capacities.length === 0 && !capacityErrorMessage ? (
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

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Sprint Absences</h2>
        <p className="mt-1 text-sm text-gray-600">
          Register absence days per sprint, gerencia and project to reflect
          reduced availability.
        </p>
        <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          MVP: each absence day reduces capacity by 1 story point.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label
            htmlFor="absence-sprint"
            className="flex flex-col gap-1 text-sm text-gray-700"
          >
            Sprint
            <input
              id="absence-sprint"
              type="text"
              value={absenceForm.sprint}
              disabled={savingAbsence}
              placeholder="Sprint 1"
              className={fieldClassName}
              onChange={(event) => {
                setAbsenceForm((current) => ({
                  ...current,
                  sprint: event.target.value,
                }))
                setAbsenceErrorMessage(null)
                setAbsenceSuccessMessage(null)
              }}
            />
          </label>

          <label
            htmlFor="absence-team"
            className="flex flex-col gap-1 text-sm text-gray-700"
          >
            Gerencia
            <select
              id="absence-team"
              value={absenceForm.teamName}
              disabled={savingAbsence}
              className={fieldClassName}
              onChange={(event) => {
                handleAbsenceTeamChange(
                  event.target.value as (typeof TEAM_OPTIONS)[number],
                )
              }}
            >
              {TEAM_OPTIONS.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </label>

          <label
            htmlFor="absence-project"
            className="flex flex-col gap-1 text-sm text-gray-700"
          >
            Project
            <select
              id="absence-project"
              value={absenceForm.projectName}
              disabled={savingAbsence}
              className={fieldClassName}
              onChange={(event) => {
                setAbsenceForm((current) => ({
                  ...current,
                  projectName: event.target.value,
                }))
                setAbsenceErrorMessage(null)
                setAbsenceSuccessMessage(null)
              }}
            >
              {absenceProjectOptions.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </label>

          <label
            htmlFor="absence-days"
            className="flex flex-col gap-1 text-sm text-gray-700"
          >
            Absence Days
            <input
              id="absence-days"
              type="number"
              min={1}
              step={1}
              value={absenceForm.absenceDays}
              disabled={savingAbsence}
              placeholder="3"
              className={fieldClassName}
              onChange={(event) => {
                setAbsenceForm((current) => ({
                  ...current,
                  absenceDays: event.target.value,
                }))
                setAbsenceErrorMessage(null)
                setAbsenceSuccessMessage(null)
              }}
            />
          </label>

          <label
            htmlFor="absence-reason"
            className="flex flex-col gap-1 text-sm text-gray-700"
          >
            Reason
            <input
              id="absence-reason"
              type="text"
              maxLength={MAX_REASON_LENGTH}
              value={absenceForm.reason}
              disabled={savingAbsence}
              placeholder="Team offsite"
              className={fieldClassName}
              onChange={(event) => {
                setAbsenceForm((current) => ({
                  ...current,
                  reason: event.target.value,
                }))
                setAbsenceErrorMessage(null)
                setAbsenceSuccessMessage(null)
              }}
            />
          </label>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => void handleSaveAbsence()}
            disabled={savingAbsence}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {savingAbsence ? 'Saving...' : 'Save Absence'}
          </button>
        </div>
      </section>

      {absenceErrorMessage && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {absenceErrorMessage}
        </div>
      )}

      {absenceSuccessMessage && (
        <div
          role="status"
          className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"
        >
          {absenceSuccessMessage}
        </div>
      )}

      <section className="mt-6">
        {loadingAbsences ? (
          <p className="text-sm text-gray-600">Loading sprint absences...</p>
        ) : absences.length === 0 && !absenceErrorMessage ? (
          <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
            No sprint absences registered yet. Add an absence to adjust capacity.
          </p>
        ) : absences.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table
              aria-label="Sprint absences"
              className="min-w-full divide-y divide-gray-200 text-sm"
            >
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
                    Absence Days
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Adjusted Capacity
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {absences.map((absence) => (
                  <tr key={absence.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {absence.sprint}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {absence.teamName}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {absence.projectName}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {absence.absenceDays}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{absence.reason}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {getAdjustedCapacityDisplay(capacities, absences, absence)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(absence.createdAt)}
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
