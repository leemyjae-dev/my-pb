import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const BASE_CLASSES =
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-primary-600',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-400',
}

// 여러 화면에서 재사용되는 최소한의 공통 버튼. variant(primary/secondary)만 지원한다
// (디자인 시스템을 구축하지 않는다 — 오버엔지니어링 금지). className으로 추가 스타일을 덧붙일 수 있다.
function Button({ type = 'button', variant = 'primary', className = '', ...props }: ButtonProps) {
  const classes = [BASE_CLASSES, VARIANT_CLASSES[variant], className].filter(Boolean).join(' ')
  return <button type={type} className={classes} {...props} />
}

export default Button
