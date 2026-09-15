import { httpClient } from '../../../shared/api/httpClient'

export interface SignupRequest {
  email: string
  password: string
}

export interface SignupResponse {
  id: number
  email: string
  createdAt: string
}

// POST /api/auth/signup — 이메일/비밀번호 회원가입 (FR-0.1)
export function signup(request: SignupRequest) {
  return httpClient.post<SignupResponse>('/api/auth/signup', request)
}
