const BASE_URL = process.env.BACKEND_URL || "http://localhost:4000"

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }
  return fetch(url, { ...options, headers })
}
