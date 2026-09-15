import { useQuery } from '@tanstack/react-query'
import { isHttpError } from '../../../shared/api/httpClient'
import { getLatestKycProfileResult } from '../api/kycProfileApi'
import type { KycProfileResult } from './types'

// 404(아직 응시 이력 없음)는 에러가 아니라 "결과 없음"(null)으로 취급한다.
export function useKycProfileResult() {
  return useQuery<KycProfileResult | null>({
    queryKey: ['kyc-profile', 'latest'],
    queryFn: async () => {
      try {
        return await getLatestKycProfileResult()
      } catch (error) {
        if (isHttpError(error) && error.status === 404) {
          return null
        }
        throw error
      }
    },
  })
}
