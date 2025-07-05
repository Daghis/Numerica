import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { HiddenRulesProvider } from './components/HiddenRulesContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HiddenRulesProvider>
      <App />
    </HiddenRulesProvider>
  </StrictMode>,
)
