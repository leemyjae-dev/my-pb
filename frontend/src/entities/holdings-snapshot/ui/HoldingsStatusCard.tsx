import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/ui/Button'
import { useHoldingsSnapshot } from '../model/useHoldingsSnapshot'

// 와이어프레임 2.3(홈/대시보드 화면)의 잔고 스크린샷 상태 카드.
// confirmedAt이 없으면(업로드는 했지만 자산 항목 보정이 끝나지 않음) "보정 필요" 상태로 안내하고
// 보정 화면으로 보낸다(자연스러운 흐름을 위해 코디네이터 지시로 추가한 중간 상태).
function HoldingsStatusCard() {
  const navigate = useNavigate()
  const { data, isLoading } = useHoldingsSnapshot()

  if (isLoading) {
    return (
      <section className="status-card">
        <h2>잔고 스크린샷</h2>
        <p>불러오는 중...</p>
      </section>
    )
  }

  if (!data) {
    return (
      <section className="status-card">
        <h2>잔고 스크린샷</h2>
        <p>상태: 미완료</p>
        <Button type="button" onClick={() => navigate('/holdings-upload')}>
          업로드하기
        </Button>
      </section>
    )
  }

  if (!data.confirmedAt) {
    return (
      <section className="status-card">
        <h2>잔고 스크린샷</h2>
        <p>상태: 보정 필요</p>
        <p>업로드일시: {new Date(data.createdAt).toLocaleString()}</p>
        <Button type="button" onClick={() => navigate('/holdings-review')}>
          보정하러 가기
        </Button>
      </section>
    )
  }

  return (
    <section className="status-card">
      <h2>잔고 스크린샷</h2>
      <p>상태: 완료</p>
      <p>업로드일시: {new Date(data.createdAt).toLocaleString()}</p>
      <Button type="button" onClick={() => navigate('/holdings-upload')}>
        재업로드
      </Button>
    </section>
  )
}

export default HoldingsStatusCard
