import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Admin Preview Mode Interceptor
const previewEmail = sessionStorage.getItem('wedtrack_admin_preview');
if (previewEmail) {
  window.__ADMIN_PREVIEW_MODE__ = true;
  window.__ADMIN_PREVIEW_EMAIL__ = previewEmail;
  console.warn(`👁️ ADMIN PREVIEW MODE ACTIVATED: Impersonating ${previewEmail}. Writes are disabled.`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
