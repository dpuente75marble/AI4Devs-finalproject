const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

export type SprintCapacity = {
  id: string
  sprint: string
  teamName: string
  projectName: string
  availablePoints: number
  createdAt: string
  updatedAt: string
}

export type ListSprintCapacityResponse = {
  data: SprintCapacity[]
  total: number
}

export type CreateSprintCapacityPayload = {
  sprint: string
  teamName: string
  projectName: string
  availablePoints: number
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

export async function fetchSprintCapacities(): Promise<ListSprintCapacityResponse> {
  const response = await fetch(apiUrl('/api/sprint-capacity'))

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json() as Promise<ListSprintCapacityResponse>
}

export async function createSprintCapacity(
  payload: CreateSprintCapacityPayload,
): Promise<SprintCapacity> {
  const response = await fetch(apiUrl('/api/sprint-capacity'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json() as Promise<SprintCapacity>
}
