import { useMutation } from '@tanstack/react-query'
import { signup } from '../api/signupApi'

export function useSignup() {
  return useMutation({
    mutationFn: signup,
  })
}
