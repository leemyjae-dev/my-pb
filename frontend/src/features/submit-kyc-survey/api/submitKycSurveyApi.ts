import { httpClient } from '../../../shared/api/httpClient'
import type { KycProfileResult } from '../../../entities/kyc-profile/model/types'

export interface SubmitKycSurveyRequest {
  answers: number[]
}

// POST /api/kyc — 10문항 응답 제출, 총점·등급 산출 후 저장 (FR-1.1~FR-1.3)
export function submitKycSurvey(request: SubmitKycSurveyRequest) {
  return httpClient.post<KycProfileResult>('/api/kyc', request)
}
