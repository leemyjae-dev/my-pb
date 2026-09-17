interface LoadingIndicatorProps {
  label?: string
}

// 여러 화면에서 재사용되는 공통 로딩 상태 표시.
function LoadingIndicator({ label = '불러오는 중...' }: LoadingIndicatorProps) {
  return <p className="text-sm text-slate-500">{label}</p>
}

export default LoadingIndicator
