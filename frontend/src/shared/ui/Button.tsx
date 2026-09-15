import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

// 여러 화면에서 재사용되는 최소한의 공통 버튼. 디자인 시스템을 구축하지 않는다(오버엔지니어링 금지).
function Button({ type = 'button', ...props }: ButtonProps) {
  return <button type={type} {...props} />
}

export default Button
