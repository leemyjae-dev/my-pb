import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/ui/Button'
import LoadingIndicator from '../../../shared/ui/LoadingIndicator'
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
        <LoadingIndicator />
      </section>
    )
  }

  if (!data) {
    return (
      <section className="status-card">
        <h2>잔고 스크린샷</h2>
        <p className="text-sm text-slate-500">상태: 미완료</p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/holdings-upload')}
          className="mt-auto"
        >
          업로드하기
        </Button>
      </section>
    )
  }

  if (!data.confirmedAt) {
    return (
      <section className="status-card">
        <h2>잔고 스크린샷</h2>
        <div className="space-y-1 text-sm text-slate-600">
          <p>
            상태:{' '}
            <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
              보정 필요
            </span>
          </p>
          <p>업로드일시: {new Date(data.createdAt).toLocaleString()}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/holdings-review')}
          className="mt-auto"
        >
          보정하러 가기
        </Button>
      </section>
    )
  }

  return (
    <section className="status-card">
      <h2>잔고 스크린샷</h2>
      <div className="space-y-1 text-sm text-slate-600">
        <p>
          상태:{' '}
          <span className="inline-flex rounded-full bg-primary-100 px-2 py-0.5 font-medium text-primary-700">
            완료
          </span>
        </p>
        <p>업로드일시: {new Date(data.createdAt).toLocaleString()}</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => navigate('/holdings-upload')}
        className="mt-auto"
      >
        재업로드
      </Button>
    </section>
  )
}

export default HoldingsStatusCard
