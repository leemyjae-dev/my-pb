import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { configureAuthHandlers } from '../../../shared/api/httpClient'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  setTokens: (accessToken: string, refreshToken: string) => void
  clearTokens: () => void
}

// localStorage에 영속화한다: 새로고침해도 로그인 상태가 유지되는 것이 일반적인 기대치이고,
// 시나리오 7(refresh_token 만료 시에만 재로그인)도 탭을 닫아도 세션이 유지됨을 전제로 한다.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      clearTokens: () => set({ accessToken: null, refreshToken: null }),
    }),
    { name: 'auth-storage' },
  ),
)

// shared는 entities를 import할 수 없으므로(FSD 의존 방향), 반대로 이 store가
// httpClient에 토큰 접근 핸들러를 주입한다.
configureAuthHandlers({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  setAccessToken: (accessToken) => useAuthStore.setState({ accessToken }),
  clearTokens: () => useAuthStore.getState().clearTokens(),
})
