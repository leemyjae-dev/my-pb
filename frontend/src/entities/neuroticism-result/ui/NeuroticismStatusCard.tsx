import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/ui/Button'
import { useNeuroticismResult } from '../model/useNeuroticismResult'

// 와이어프레임 2.3(홈/대시보드 화면)의 IPIP 신경성 검사 상태 카드
function NeuroticismStatusCard() {
  const navigate = useNavigate()
  const { data, isLoading } = useNeuroticismResult()

  return (
    <section className="status-card">
      <h2>IPIP 신경성 검사</h2>
      {isLoading ? (
        <p>불러오는 중...</p>
      ) : data ? (
        <>
          <p>상태: 완료 / {data.sensitivityGrade}</p>
          <p>응시일시: {new Date(data.takenAt).toLocaleString()}</p>
        </>
      ) : (
        <p>상태: 미완료</p>
      )}
      <Button type="button" onClick={() => navigate('/neuroticism-test')}>
        {data ? '재응시' : '응시하기'}
      </Button>
    </section>
  )
}

export default NeuroticismStatusCard
