import { useState, type FormEvent } from 'react'
import Button from '../../../shared/ui/Button'
import { useUploadHoldingsScreenshot } from '../model/useUploadHoldingsScreenshot'

interface HoldingsUploadFormProps {
  onSuccess: () => void
}

// 와이어프레임 2.6(잔고 스크린샷 업로드 화면) 기준
function HoldingsUploadForm({ onSuccess }: HoldingsUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const uploadMutation = useUploadHoldingsScreenshot()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!file) {
      return
    }

    uploadMutation.mutate(file, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <p>선택된 파일: {file ? file.name : '없음'}</p>

      {uploadMutation.isPending && <p>인식 중...</p>}
      {uploadMutation.isError && <p role="alert">{uploadMutation.error.message}</p>}

      <Button type="submit" disabled={!file || uploadMutation.isPending}>
        업로드
      </Button>
    </form>
  )
}

export default HoldingsUploadForm
