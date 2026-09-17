import { useNavigate } from 'react-router-dom'
import HoldingsUploadForm from '../../../features/upload-holdings-screenshot/ui/HoldingsUploadForm'

function HoldingsUploadPage() {
  const navigate = useNavigate()

  return (
    <main className="page">
      <h1>잔고 스크린샷 업로드</h1>
      <div className="card">
        <HoldingsUploadForm onSuccess={() => navigate('/holdings-review')} />
      </div>
    </main>
  )
}

export default HoldingsUploadPage
