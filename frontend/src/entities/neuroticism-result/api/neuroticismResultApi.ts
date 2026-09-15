import { httpClient } from '../../../shared/api/httpClient'
import type { NeuroticismTestResult } from '../model/types'

// GET /api/neuroticism/latest — 로그인 사용자의 가장 최근 IPIP 신경성 검사결과 조회 (404면 아직 응시 이력 없음)
export function getLatestNeuroticismResult() {
  return httpClient.get<NeuroticismTestResult>('/api/neuroticism/latest')
}
