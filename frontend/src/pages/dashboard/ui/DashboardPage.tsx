import { useNavigate } from 'react-router-dom'
import KycStatusCard from '../../../entities/kyc-profile/ui/KycStatusCard'
import NeuroticismStatusCard from '../../../entities/neuroticism-result/ui/NeuroticismStatusCard'
import HoldingsStatusCard from '../../../entities/holdings-snapshot/ui/HoldingsStatusCard'
import { useAuthStore } from '../../../entities/user/model/authStore'
import Button from '../../../shared/ui/Button'

// 와이어프레임 2.3(홈/대시보드 화면) 기준
function DashboardPage() {
  const navigate = useNavigate()
  const clearTokens = useAuthStore((state) => state.clearTokens)

  const handleLogout = () => {
    clearTokens()
    navigate('/login')
  }

  return (
    <main className="page-wide">
      <header className="flex items-center justify-between">
        <h1>나의 진단 현황</h1>
        <Button type="button" variant="secondary" onClick={handleLogout}>
          로그아웃
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KycStatusCard />
        <NeuroticismStatusCard />
        <HoldingsStatusCard />
      </div>

      <Button type="button" onClick={() => navigate('/diagnosis-result')} className="w-full sm:w-auto">
        종합 진단 결과 확인
      </Button>
    </main>
  )
}

export default DashboardPage
