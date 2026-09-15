// 잔고 스냅샷 원본 이미지(imageUrl)처럼 상대 경로로 내려오는 리소스의 절대 URL을 만들 때도 사용한다.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

export interface HttpError extends Error {
  status: number
}

// entities/features가 상태 코드별로 분기 처리(예: 404를 "아직 없음"으로 처리)할 때 사용하는 타입가드.
export function isHttpError(error: unknown): error is HttpError {
  return error instanceof Error && typeof (error as Partial<HttpError>).status === 'number'
}

// shared는 FSD 최하위 레이어라 entities/user의 authStore를 직접 import할 수 없다.
// 대신 상위 레이어(entities/user)가 앱 초기화 시 이 핸들러를 주입해 토큰에 접근한다.
interface AuthHandlers {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  setAccessToken: (accessToken: string) => void
  clearTokens: () => void
}

let authHandlers: AuthHandlers | null = null

export function configureAuthHandlers(handlers: AuthHandlers): void {
  authHandlers = handlers
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const accessToken = authHandlers?.getAccessToken() ?? null
  // FormData(파일 업로드)는 JSON으로 직렬화하지 않고, Content-Type도 지정하지 않는다.
  // (브라우저가 multipart/form-data boundary를 자동으로 채워야 하기 때문)
  const isFormData = body instanceof FormData

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    const error = new Error(errorBody?.message ?? `요청 실패: ${response.status}`) as HttpError
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

// 동시에 여러 요청이 401을 받아도 재발급은 한 번만 수행하고 결과를 공유한다.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = authHandlers?.getRefreshToken() ?? null
  if (!refreshToken) {
    throw new Error('refresh_token이 없습니다.')
  }

  const { accessToken } = await rawRequest<{ accessToken: string }>('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  })

  authHandlers?.setAccessToken(accessToken)
  return accessToken
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, options)
  } catch (error) {
    const status = (error as Partial<HttpError>).status
    if (status !== 401 || !authHandlers?.getRefreshToken()) {
      throw error
    }

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }
      await refreshPromise
    } catch (refreshError) {
      authHandlers.clearTokens()
      throw refreshError
    }

    return rawRequest<T>(path, options)
  }
}

// entities/features의 api 세그먼트를 통해서만 호출되는 최하위 계층.
export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
