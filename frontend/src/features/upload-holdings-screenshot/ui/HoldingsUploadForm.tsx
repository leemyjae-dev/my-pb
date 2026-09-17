import { useState, type FormEvent } from 'react'
import Button from '../../../shared/ui/Button'
import ErrorMessage from '../../../shared/ui/ErrorMessage'
import LoadingIndicator from '../../../shared/ui/LoadingIndicator'
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary-700"
        />
        <p className="mt-2 text-sm text-slate-500">선택된 파일: {file ? file.name : '없음'}</p>
      </div>

      {uploadMutation.isPending && <LoadingIndicator label="인식 중..." />}
      {uploadMutation.isError && <ErrorMessage>{uploadMutation.error.message}</ErrorMessage>}

      <Button type="submit" disabled={!file || uploadMutation.isPending} className="w-full sm:w-auto">
        업로드
      </Button>
    </form>
  )
}

export default HoldingsUploadForm
