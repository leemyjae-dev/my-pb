interface FeedbackMessageProps {
  message: string
  psychologicalBurdenFlag: boolean
}

// 정합/괴리에 따른 피드백 메시지 표시. psychologicalBurdenFlag(심리민감도 '높음' + 괴리 결합)가
// true면 심리적 부담 안내를 붉은색 강조 박스로 표시한다 (FR-4.3, FR-4.4).
function FeedbackMessage({ message, psychologicalBurdenFlag }: FeedbackMessageProps) {
  const containerClasses = psychologicalBurdenFlag
    ? 'rounded-lg border border-red-200 bg-red-50 p-4'
    : 'card'

  return (
    <div className={containerClasses}>
      <p className="text-sm text-slate-700">{message}</p>
      {psychologicalBurdenFlag && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700">
          심리적으로 부담을 느끼기 쉬운 상태에서 자산배분 괴리가 함께 발견되었습니다. 신중하게
          확인해주세요.
        </p>
      )}
    </div>
  )
}

export default FeedbackMessage
