const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

export type SprintAnalysisStatus = 'HEALTHY' | 'WARNING' | 'OVERLOADED'

export type SprintAnalysisRow = {
  sprint: string
  demand: number
  capacity: number
  absences: number
  adjustedCapacity: number
  utilization: number | null
  status: SprintAnalysisStatus
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

export async function fetchSprintAnalysis(): Promise<SprintAnalysisRow[]> {
  const response = await fetch(apiUrl('/api/sprint-analysis'))

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json() as Promise<SprintAnalysisRow[]>
}

export function formatUtilization(utilization: number | null): string {
  if (utilization === null) {
    return '—'
  }

  return `${utilization.toFixed(2)}%`
}
