import { useNavigate } from 'react-router-dom'
import KycSurveyForm from '../../../features/submit-kyc-survey/ui/KycSurveyForm'

function KycSurveyPage() {
  const navigate = useNavigate()

  return (
    <main className="page">
      <h1>투자자성향(KYC) 설문</h1>
      {/* 제출 성공 시 대시보드("/")로 복귀한다. */}
      <KycSurveyForm onSuccess={() => navigate('/')} />
    </main>
  )
}

export default KycSurveyPage
