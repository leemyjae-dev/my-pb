import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/ui/Button'
import LoadingIndicator from '../../../shared/ui/LoadingIndicator'
import { useNeuroticismResult } from '../model/useNeuroticismResult'

// 와이어프레임 2.3(홈/대시보드 화면)의 IPIP 신경성 검사 상태 카드
function NeuroticismStatusCard() {
  const navigate = useNavigate()
  const { data, isLoading } = useNeuroticismResult()

  return (
    <section className="status-card">
      <h2>IPIP 신경성 검사</h2>
      {isLoading ? (
        <LoadingIndicator />
      ) : data ? (
        <div className="space-y-1 text-sm text-slate-600">
          <p>
            상태:{' '}
            <span className="inline-flex rounded-full bg-primary-100 px-2 py-0.5 font-medium text-primary-700">
              완료 / {data.sensitivityGrade}
            </span>
          </p>
          <p>응시일시: {new Date(data.takenAt).toLocaleString()}</p>
        </div>
      ) : (
        <p className="text-sm text-slate-500">상태: 미완료</p>
      )}
      <Button
        type="button"
        variant="secondary"
        onClick={() => navigate('/neuroticism-test')}
        className="mt-auto"
      >
        {data ? '재응시' : '응시하기'}
      </Button>
    </section>
  )
}

export default NeuroticismStatusCard
