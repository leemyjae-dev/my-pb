import { BrowserRouter } from 'react-router-dom'
import QueryClientProvider from './providers/QueryClientProvider'
import AppRoutes from './routes'

function App() {
  return (
    <QueryClientProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
