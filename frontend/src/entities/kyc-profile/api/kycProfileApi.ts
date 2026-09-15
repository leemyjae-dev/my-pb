import { httpClient } from '../../../shared/api/httpClient'
import type { KycProfileResult } from '../model/types'

// GET /api/kyc/latest — 로그인 사용자의 가장 최근 KYC 진단결과 조회 (404면 아직 응시 이력 없음)
export function getLatestKycProfileResult() {
  return httpClient.get<KycProfileResult>('/api/kyc/latest')
}
