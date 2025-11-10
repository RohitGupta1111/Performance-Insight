import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './component/App.jsx'
import WebVitalsState from './context/webVitalsState.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WebVitalsState>
      <App />
    </WebVitalsState>
  </StrictMode>
)
