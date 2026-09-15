import { useNavigate } from 'react-router-dom'
import KycStatusCard from '../../../entities/kyc-profile/ui/KycStatusCard'
import NeuroticismStatusCard from '../../../entities/neuroticism-result/ui/NeuroticismStatusCard'
import HoldingsStatusCard from '../../../entities/holdings-snapshot/ui/HoldingsStatusCard'
import { useAuthStore } from '../../../entities/user/model/authStore'
import Button from '../../../shared/ui/Button'
import './DashboardPage.css'

// 와이어프레임 2.3(홈/대시보드 화면) 기준
function DashboardPage() {
  const navigate = useNavigate()
  const clearTokens = useAuthStore((state) => state.clearTokens)

  const handleLogout = () => {
    clearTokens()
    navigate('/login')
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <h1>나의 진단 현황</h1>
        <Button type="button" onClick={handleLogout}>
          로그아웃
        </Button>
      </header>

      <div className="dashboard-page__cards">
        <KycStatusCard />
        <NeuroticismStatusCard />
        <HoldingsStatusCard />
      </div>

      <Button type="button" onClick={() => navigate('/diagnosis-result')}>
        종합 진단 결과 확인
      </Button>
    </main>
  )
}

export default DashboardPage
