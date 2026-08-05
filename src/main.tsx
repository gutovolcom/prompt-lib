import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/fraunces/500.css'
import '@fontsource/fraunces/500-italic.css'
import '@fontsource/fraunces/700.css'
import '@fontsource/courier-prime/400.css'
import '@fontsource/courier-prime/700.css'
import '@fontsource/archivo/400.css'
import '@fontsource/archivo/500.css'
import '@fontsource/archivo/600.css'
import './index.css'
import './lib/gsap'
import App from './App'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Elemento #root não encontrado.')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
