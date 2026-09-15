import { useMutation } from '@tanstack/react-query'
import { submitKycSurvey } from '../api/submitKycSurveyApi'

export function useSubmitKycSurvey() {
  return useMutation({
    mutationFn: submitKycSurvey,
  })
}
