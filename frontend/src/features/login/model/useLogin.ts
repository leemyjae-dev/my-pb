import { useMutation } from '@tanstack/react-query'
import { login } from '../api/loginApi'
import { useAuthStore } from '../../../entities/user/model/authStore'

export function useLogin() {
  const setTokens = useAuthStore((state) => state.setTokens)

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
    },
  })
}
