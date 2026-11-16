import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import './generated.css'

/**
 * GitHub Pages caches HTML for ten minutes, so a fresh deploy can look like
 * nothing changed. version.json is fetched past every cache; if the server is
 * on a different build than this bundle, reload once.
 */
async function checkForUpdate() {
  try {
    const res = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return
    const { id } = (await res.json()) as { id?: string }
    if (!id || id === __BUILD_ID__) return
    if (sessionStorage.getItem('round-one.reloaded') === id) return
    sessionStorage.setItem('round-one.reloaded', id)
    location.reload()
  } catch {
    /* offline, or no version file: nothing to do */
  }
}
window.setTimeout(checkForUpdate, 1500)

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
      <Toaster position="bottom-center" />
    </HashRouter>
  </StrictMode>
)
