import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../entities/user/model/authStore'

interface ProtectedRouteProps {
  children: ReactNode
}

// accessToken 보유 여부로 로그인 상태를 판단해, 비로그인 시 로그인 화면으로 리다이렉트한다 (FR-0.3).
// FE-4 이후 보호가 필요한 화면(KYC/IPIP/잔고/대시보드/진단 결과)의 라우트에서 사용한다.
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const accessToken = useAuthStore((state) => state.accessToken)

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
