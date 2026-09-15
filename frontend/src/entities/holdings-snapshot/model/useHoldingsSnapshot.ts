import { useQuery } from '@tanstack/react-query'
import { isHttpError } from '../../../shared/api/httpClient'
import { getLatestHoldingsSnapshot } from '../api/holdingsSnapshotApi'
import type { HoldingsSnapshot } from './types'

export const HOLDINGS_SNAPSHOT_QUERY_KEY = ['holdings-snapshot', 'latest'] as const

// 404(아직 업로드 이력 없음)는 에러가 아니라 "결과 없음"(null)으로 취급한다.
export function useHoldingsSnapshot() {
  return useQuery<HoldingsSnapshot | null>({
    queryKey: HOLDINGS_SNAPSHOT_QUERY_KEY,
    queryFn: async () => {
      try {
        return await getLatestHoldingsSnapshot()
      } catch (error) {
        if (isHttpError(error) && error.status === 404) {
          return null
        }
        throw error
      }
    },
  })
}
