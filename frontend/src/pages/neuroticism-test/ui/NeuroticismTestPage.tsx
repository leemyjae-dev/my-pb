import { useNavigate } from 'react-router-dom'
import NeuroticismTestForm from '../../../features/submit-neuroticism-test/ui/NeuroticismTestForm'

function NeuroticismTestPage() {
  const navigate = useNavigate()

  return (
    <main>
      <h1>IPIP 신경성 검사</h1>
      {/* 제출 성공 시 대시보드("/")로 복귀한다. */}
      <NeuroticismTestForm onSuccess={() => navigate('/')} />
    </main>
  )
}

export default NeuroticismTestPage
