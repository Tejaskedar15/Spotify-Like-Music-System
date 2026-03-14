import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { MusicProvider } from './context/MusicContext.jsx'
import { LibraryProvider } from './context/LibraryContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LibraryProvider>
        <MusicProvider>
          <App />
        </MusicProvider>
      </LibraryProvider>
    </AuthProvider>
  </StrictMode>,
)
