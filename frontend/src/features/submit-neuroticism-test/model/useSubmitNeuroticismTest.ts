import { useMutation } from '@tanstack/react-query'
import { submitNeuroticismTest } from '../api/submitNeuroticismTestApi'

export function useSubmitNeuroticismTest() {
  return useMutation({
    mutationFn: submitNeuroticismTest,
  })
}
