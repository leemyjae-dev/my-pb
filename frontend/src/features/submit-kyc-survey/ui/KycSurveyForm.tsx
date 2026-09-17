import { useState, type FormEvent } from 'react'
import Button from '../../../shared/ui/Button'
import ErrorMessage from '../../../shared/ui/ErrorMessage'
import { useSubmitKycSurvey } from '../model/useSubmitKycSurvey'
import './KycSurveyForm.css'

interface KycQuestion {
  text: string
  // 1~5점 각 선택지의 의미 라벨
  options: readonly [string, string, string, string, string]
}

// 도메인 정의서/PRD에는 KYC 설문의 실제 문항 원문이 없다. 임의로 문항을 창작하지 않고,
// 캡스톤 기획서 별첨1의 10개 평가 항목명을 문항 텍스트로 사용한다.
// (응답 형식은 문서에서 확정된 규칙대로 1~5점 단일 선택)
//
// 각 문항의 1~5점 선택지 라벨: 캡스톤 기획서 별첨1은 1점/5점 양끝 값만 정의하고 있어,
// 2~4점 구간은 그 두 끝값을 기준으로 합리적으로 보간해 채운 것이다(문서 원문이 아닌 임의 보간값).
const QUESTIONS: readonly KycQuestion[] = [
  {
    text: '연령대',
    options: ['60세 이상', '50대', '40대', '30대', '20대 이하'],
  },
  {
    text: '투자 가능 기간',
    options: ['6개월 미만', '6개월~1년', '1~2년', '2~3년', '3년 이상'],
  },
  {
    text: '투자 경험',
    options: ['없음', '1년 미만', '1~3년', '3~5년', '5년 이상'],
  },
  {
    text: '금융상품에 대한 이해도',
    options: ['매우 낮음', '낮음', '보통', '높음', '매우 높음'],
  },
  {
    text: '소득 대비 투자자금 비중',
    options: ['10% 미만', '10~20%', '20~30%', '30~50%', '50% 이상'],
  },
  {
    text: '금융자산 대비 투자자금 비중',
    options: ['10% 미만', '10~20%', '20~30%', '30~50%', '50% 이상'],
  },
  {
    text: '손실 감내 수준',
    options: [
      '원금 손실 불가',
      '최소한(10% 이내) 손실 감내',
      '일정 수준(10~20%) 손실 감내',
      '상당한(20~30%) 손실 감내',
      '원금 초과 손실도 감수',
    ],
  },
  {
    text: '투자 목적',
    options: [
      '원금 보전',
      '안정적 이자수익 추구',
      '예금 이상의 수익 추구',
      '적극적 자본이득 추구',
      '공격적 고수익 추구',
    ],
  },
  {
    text: '손실 경험 시 대응',
    options: ['즉시 전량 매도', '일부 매도', '관망(그대로 유지)', '매수 시점 검토', '추가 매수'],
  },
  {
    text: '본인의 투자성향에 대한 자기인식',
    options: [
      '예금·적금 수준의 안정성 선호',
      '안정적인 투자 선호',
      '위험중립적인 투자 선호',
      '적극적인 투자 선호',
      '원금 손실을 감수하더라도 고수익 추구',
    ],
  },
] as const

interface KycSurveyFormProps {
  onSuccess: () => void
}

// 와이어프레임 2.4(투자자성향 KYC 설문 화면) 기준
function KycSurveyForm({ onSuccess }: KycSurveyFormProps) {
  const [answers, setAnswers] = useState<Array<number | null>>(
    Array(QUESTIONS.length).fill(null),
  )
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const submitMutation = useSubmitKycSurvey()

  const handleAnswerChange = (questionIndex: number, value: number) => {
    setAnswers((prev) =>
      prev.map((answer, index) => (index === questionIndex ? value : answer)),
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (answers.some((answer) => answer === null)) {
      setValidationMessage('모든 문항에 응답해주세요.')
      return
    }

    setValidationMessage(null)
    submitMutation.mutate({ answers: answers as number[] }, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit} className="kyc-survey-form">
      {QUESTIONS.map((question, questionIndex) => (
        <fieldset key={question.text} className="kyc-survey-form__question">
          <legend>
            문항 {questionIndex + 1}. {question.text}
          </legend>
          <div className="flex flex-col gap-2">
            {question.options.map((optionLabel, optionIndex) => {
              const value = optionIndex + 1
              return (
                <label
                  key={value}
                  className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50"
                >
                  <input
                    type="radio"
                    name={`question-${questionIndex}`}
                    value={value}
                    checked={answers[questionIndex] === value}
                    onChange={() => handleAnswerChange(questionIndex, value)}
                    className="accent-primary-600"
                  />
                  <span className="font-medium text-slate-500">{value}점</span>
                  <span>{optionLabel}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}

      {validationMessage && <ErrorMessage>{validationMessage}</ErrorMessage>}
      {submitMutation.isError && <ErrorMessage>{submitMutation.error.message}</ErrorMessage>}

      <Button type="submit" disabled={submitMutation.isPending} className="w-full sm:w-auto">
        제출
      </Button>
    </form>
  )
}

export default KycSurveyForm
