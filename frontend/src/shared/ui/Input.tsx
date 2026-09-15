import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

// 여러 화면에서 재사용되는 최소한의 공통 입력 필드.
function Input(props: InputProps) {
  return <input {...props} />
}

export default Input
