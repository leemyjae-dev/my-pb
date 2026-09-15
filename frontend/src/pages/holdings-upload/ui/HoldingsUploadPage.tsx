import { useNavigate } from 'react-router-dom'
import HoldingsUploadForm from '../../../features/upload-holdings-screenshot/ui/HoldingsUploadForm'

function HoldingsUploadPage() {
  const navigate = useNavigate()

  return (
    <main>
      <h1>잔고 스크린샷 업로드</h1>
      <HoldingsUploadForm onSuccess={() => navigate('/holdings-review')} />
    </main>
  )
}

export default HoldingsUploadPage
