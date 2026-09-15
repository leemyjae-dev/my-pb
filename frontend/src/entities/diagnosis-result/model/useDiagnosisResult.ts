import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { requestDiagnosis } from '../api/diagnosisResultApi'

// 진단은 매번 새로 계산하는 POST라 useQuery가 아닌 useMutation을 쓰되,
// 화면 진입 시 한 번 자동으로 호출되도록 mount 시점에 트리거한다.
export function useDiagnosisResult() {
  const mutation = useMutation({
    mutationFn: requestDiagnosis,
  })
  const { mutate } = mutation

  useEffect(() => {
    mutate()
  }, [mutate])

  return mutation
}
