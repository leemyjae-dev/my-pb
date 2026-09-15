import { useMutation, useQueryClient } from '@tanstack/react-query'
import { HOLDINGS_SNAPSHOT_QUERY_KEY } from '../../../entities/holdings-snapshot/model/useHoldingsSnapshot'
import { uploadHoldingsScreenshot } from '../api/uploadHoldingsScreenshotApi'

export function useUploadHoldingsScreenshot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadHoldingsScreenshot,
    // 업로드로 생성된 스냅샷을 "최근 스냅샷" 쿼리 캐시에 바로 채워, 보정 화면 진입 시
    // 백엔드에 스냅샷 단건 조회 API가 없어도(latest만 존재) 바로 표시할 수 있게 한다.
    onSuccess: (data) => {
      queryClient.setQueryData(HOLDINGS_SNAPSHOT_QUERY_KEY, data)
    },
  })
}
