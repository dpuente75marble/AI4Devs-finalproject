const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

export type SprintAbsence = {
  id: string
  sprint: string
  teamName: string
  projectName: string
  absenceDays: number
  reason: string
  createdAt: string
  updatedAt: string
}

export type ListSprintAbsencesResponse = {
  data: SprintAbsence[]
  total: number
}

export type CreateSprintAbsencePayload = {
  sprint: string
  teamName: string
  projectName: string
  absenceDays: number
  reason: string
}

function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] }
    if (Array.isArray(body.message)) {
      return body.message.join(', ')
    }
    if (body.message) {
      return body.message
    }
  } catch {
    // ignore JSON parse errors
  }
  return `Request failed with status ${response.status}`
}

export async function fetchSprintAbsences(): Promise<ListSprintAbsencesResponse> {
  const response = await fetch(apiUrl('/api/sprint-absences'), {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json() as Promise<ListSprintAbsencesResponse>
}

export async function createSprintAbsence(
  payload: CreateSprintAbsencePayload,
): Promise<SprintAbsence> {
  const response = await fetch(apiUrl('/api/sprint-absences'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json() as Promise<SprintAbsence>
}
