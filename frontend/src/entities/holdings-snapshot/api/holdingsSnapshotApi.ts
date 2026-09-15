import { httpClient } from '../../../shared/api/httpClient'
import type { HoldingsSnapshot } from '../model/types'

// GET /api/holdings/latest — 로그인 사용자의 가장 최근 보유잔고 스냅샷 조회 (404면 아직 업로드 이력 없음)
export function getLatestHoldingsSnapshot() {
  return httpClient.get<HoldingsSnapshot>('/api/holdings/latest')
}
