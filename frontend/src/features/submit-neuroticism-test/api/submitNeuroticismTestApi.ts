import { httpClient } from '../../../shared/api/httpClient'
import type { NeuroticismTestResult } from '../../../entities/neuroticism-result/model/types'

export interface SubmitNeuroticismTestRequest {
  answers: number[]
}

// POST /api/neuroticism — 10문항 응답 제출, 역채점 반전 후 총점·심리민감도 등급 산출 (FR-2.1~FR-2.4)
export function submitNeuroticismTest(request: SubmitNeuroticismTestRequest) {
  return httpClient.post<NeuroticismTestResult>('/api/neuroticism', request)
}
