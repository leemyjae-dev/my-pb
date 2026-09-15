import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
// httpClient가 토큰에 접근할 수 있도록 authStore의 핸들러 등록을 앱 시작 시 실행한다.
import '../entities/user/model/authStore'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
