import { useQuery } from '@tanstack/react-query'
import { isHttpError } from '../../../shared/api/httpClient'
import { getLatestNeuroticismResult } from '../api/neuroticismResultApi'
import type { NeuroticismTestResult } from './types'

// 404(아직 응시 이력 없음)는 에러가 아니라 "결과 없음"(null)으로 취급한다.
export function useNeuroticismResult() {
  return useQuery<NeuroticismTestResult | null>({
    queryKey: ['neuroticism-result', 'latest'],
    queryFn: async () => {
      try {
        return await getLatestNeuroticismResult()
      } catch (error) {
        if (isHttpError(error) && error.status === 404) {
          return null
        }
        throw error
      }
    },
  })
}
