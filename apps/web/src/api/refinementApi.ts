const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

export type RefinementAnalysisResult = {
  sourceText: string
  refinedStory: string
  acceptanceCriteria: string[]
  gaps: string[]
  provider: string
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

export async function analyzePdf(
  file: File,
): Promise<RefinementAnalysisResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(apiUrl('/api/refinement/analyze'), {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json() as Promise<RefinementAnalysisResult>
}
