import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/ui/Button'
import { useKycProfileResult } from '../model/useKycProfileResult'

// 와이어프레임 2.3(홈/대시보드 화면)의 투자자성향(KYC) 상태 카드
function KycStatusCard() {
  const navigate = useNavigate()
  const { data, isLoading } = useKycProfileResult()

  return (
    <section className="status-card">
      <h2>투자자성향(KYC)</h2>
      {isLoading ? (
        <p>불러오는 중...</p>
      ) : data ? (
        <>
          <p>상태: 완료 / {data.riskGrade}</p>
          <p>응시일시: {new Date(data.takenAt).toLocaleString()}</p>
        </>
      ) : (
        <p>상태: 미완료</p>
      )}
      <Button type="button" onClick={() => navigate('/kyc-survey')}>
        {data ? '재응시' : '응시하기'}
      </Button>
    </section>
  )
}

export default KycStatusCard
