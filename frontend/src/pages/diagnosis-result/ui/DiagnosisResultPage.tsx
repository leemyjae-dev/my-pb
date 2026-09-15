import { useNavigate } from 'react-router-dom'
import { useDiagnosisResult } from '../../../entities/diagnosis-result/model/useDiagnosisResult'
import AssetClassComparisonTable from '../../../entities/diagnosis-result/ui/AssetClassComparisonTable'
import FeedbackMessage from '../../../entities/diagnosis-result/ui/FeedbackMessage'
import type { MissingInput } from '../../../entities/diagnosis-result/model/types'
import Button from '../../../shared/ui/Button'
import './DiagnosisResultPage.css'

const MISSING_INPUT_LABELS: Record<MissingInput, string> = {
  kyc: '투자자성향(KYC) 설문',
  neuroticism: 'IPIP 신경성 검사',
  holdings: '잔고 스크린샷 업로드',
}

const MISSING_INPUT_ROUTES: Record<MissingInput, string> = {
  kyc: '/kyc-survey',
  neuroticism: '/neuroticism-test',
  holdings: '/holdings-upload',
}

// 와이어프레임 2.8(종합 진단 결과 화면). 입력 누락(상태 A)과 결과 표시(상태 B/C)를
// 하나의 화면 안에서 분기한다.
function DiagnosisResultPage() {
  const navigate = useNavigate()
  const diagnosisMutation = useDiagnosisResult()

  if (diagnosisMutation.status === 'pending' || diagnosisMutation.status === 'idle') {
    return (
      <main>
        <h1>종합 진단 결과</h1>
        <p>불러오는 중...</p>
      </main>
    )
  }

  if (diagnosisMutation.status === 'error') {
    return (
      <main>
        <h1>종합 진단 결과</h1>
        <p role="alert">{diagnosisMutation.error.message}</p>
      </main>
    )
  }

  const diagnosis = diagnosisMutation.data

  // 상태 A — 입력 누락 (FR-4.6, 시나리오 6)
  if (!diagnosis.complete) {
    return (
      <main>
        <h1>종합 진단 결과</h1>
        <p>아직 종합 진단을 진행할 수 없습니다.</p>
        <p>다음 항목을 완료해주세요.</p>
        <ul>
          {diagnosis.missingInputs.map((missingInput) => (
            <li key={missingInput}>
              {MISSING_INPUT_LABELS[missingInput]}{' '}
              <Button type="button" onClick={() => navigate(MISSING_INPUT_ROUTES[missingInput])}>
                이동하기
              </Button>
            </li>
          ))}
        </ul>
      </main>
    )
  }

  // 상태 B/C — 결과 표시 (정합/괴리/심리부담, FR-4.2~FR-4.5, 시나리오 5)
  const { result } = diagnosis

  return (
    <main className="diagnosis-result-page">
      <h1>종합 진단 결과</h1>

      <div className="diagnosis-result-page__summary">
        <p>나의 투자자성향: {result.riskGrade}</p>
        <p>심리민감도: {result.sensitivityGrade}</p>
      </div>

      <AssetClassComparisonTable comparisons={result.comparisonResult} />

      <FeedbackMessage
        message={result.feedbackMessage}
        psychologicalBurdenFlag={result.psychologicalBurdenFlag}
      />

      <p>진단 일시: {new Date(result.diagnosedAt).toLocaleString()}</p>
    </main>
  )
}

export default DiagnosisResultPage
