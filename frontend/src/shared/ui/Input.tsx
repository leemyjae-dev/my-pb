import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

const BASE_CLASSES =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400'

// 여러 화면에서 재사용되는 최소한의 공통 입력 필드.
function Input({ className = '', ...props }: InputProps) {
  const classes = [BASE_CLASSES, className].filter(Boolean).join(' ')
  return <input className={classes} {...props} />
}

export default Input
