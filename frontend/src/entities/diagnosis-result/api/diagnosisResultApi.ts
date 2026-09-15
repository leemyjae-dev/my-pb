import { httpClient } from '../../../shared/api/httpClient'
import type {
  DiagnosisIncompleteResponse,
  DiagnosisResult,
  RiskDiagnosisResult,
} from '../model/types'

// POST /api/diagnosis — 200(DiagnosisIncompleteResponse)/201(RiskDiagnosisResult) 중 하나로
// 응답하므로, 바디에 complete:false가 있는지로 구분해 판별 유니온으로 정규화한다 (FR-4.1~FR-4.6).
export async function requestDiagnosis(): Promise<DiagnosisResult> {
  const response = await httpClient.post<RiskDiagnosisResult | DiagnosisIncompleteResponse>(
    '/api/diagnosis',
  )

  if ('complete' in response && response.complete === false) {
    return { complete: false, missingInputs: response.missingInputs }
  }

  return { complete: true, result: response as RiskDiagnosisResult }
}
