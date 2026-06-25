const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

export type SprintAnalysisStatus = 'HEALTHY' | 'WARNING' | 'OVERLOADED'

export type SprintAnalysisRow = {
  sprint: string
  teamName: string
  projectName: string
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

function parseContentDispositionFilename(
  contentDisposition: string | null,
  fallback = 'sprint-analysis.xlsx',
): string {
  if (!contentDisposition) {
    return fallback
  }

  const filenameStarMatch = contentDisposition.match(
    /filename\*=UTF-8''([^;]+)/i,
  )
  if (filenameStarMatch?.[1]) {
    return decodeURIComponent(filenameStarMatch[1])
  }

  const quotedFilenameMatch = contentDisposition.match(/filename="([^"]+)"/i)
  if (quotedFilenameMatch?.[1]) {
    return quotedFilenameMatch[1]
  }

  const unquotedFilenameMatch = contentDisposition.match(/filename=([^;]+)/i)
  if (unquotedFilenameMatch?.[1]) {
    return unquotedFilenameMatch[1].trim()
  }

  return fallback
}

export async function fetchSprintAnalysis(): Promise<SprintAnalysisRow[]> {
  const response = await fetch(apiUrl('/api/sprint-analysis'))

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json() as Promise<SprintAnalysisRow[]>
}

export async function downloadSprintAnalysisExport(): Promise<{
  blob: Blob
  filename: string
}> {
  const response = await fetch(apiUrl('/api/sprint-analysis/export'))

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  const blob = await response.blob()
  const filename = parseContentDispositionFilename(
    response.headers.get('Content-Disposition'),
  )

  return { blob, filename }
}

export function formatUtilization(utilization: number | null): string {
  if (utilization === null) {
    return '—'
  }

  return `${utilization.toFixed(2)}%`
}
