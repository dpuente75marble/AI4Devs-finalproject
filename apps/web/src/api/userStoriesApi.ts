const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

export type UserStory = {
  id: string
  externalId: string
  title: string
  description: string
  storyPoints: number
  status: string
  sprint: string | null
  teamName: string | null
  projectName: string | null
  source: string
  createdAt: string
  updatedAt: string
}

export type ListUserStoriesResponse = {
  data: UserStory[]
  total: number
}

export type ImportError = {
  row: number
  message: string
}

export type ImportUserStoriesResponse = {
  imported: number
  failed: number
  errors: ImportError[]
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

export async function fetchUserStories(): Promise<ListUserStoriesResponse> {
  const response = await fetch(apiUrl('/api/user-stories'))

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json() as Promise<ListUserStoriesResponse>
}

export async function importUserStoriesCsv(
  file: File,
): Promise<ImportUserStoriesResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(apiUrl('/api/user-stories/import'), {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json() as Promise<ImportUserStoriesResponse>
}
