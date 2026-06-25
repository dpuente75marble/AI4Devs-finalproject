const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

export type AuthUser = {
  id: string
  email: string
  name: string
}

export type LoginResponse = {
  user: AuthUser
  message: string
}

export type MeResponse = {
  user: AuthUser
}

export type LogoutResponse = {
  message: string
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

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json() as Promise<LoginResponse>
}

export async function logout(): Promise<LogoutResponse> {
  const response = await fetch(apiUrl('/api/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json() as Promise<LogoutResponse>
}

export async function getMe(): Promise<MeResponse> {
  const response = await fetch(apiUrl('/api/auth/me'), {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json() as Promise<MeResponse>
}
