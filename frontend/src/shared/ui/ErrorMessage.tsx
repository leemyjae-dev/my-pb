import type { ReactNode } from 'react'

interface ErrorMessageProps {
  children: ReactNode
}

// 여러 화면에서 재사용되는 공통 오류/안내 메시지 박스 (폼 검증 오류, API 에러 메시지 등).
function ErrorMessage({ children }: ErrorMessageProps) {
  return (
    <p
      role="alert"
      className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {children}
    </p>
  )
}

export default ErrorMessage
