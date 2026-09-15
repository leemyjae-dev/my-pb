import { httpClient } from '../../../shared/api/httpClient'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

// POST /api/auth/login — 이메일/비밀번호 로그인, access_token/refresh_token 발급 (FR-0.2, FR-0.4)
export function login(request: LoginRequest) {
  return httpClient.post<LoginResponse>('/api/auth/login', request)
}
