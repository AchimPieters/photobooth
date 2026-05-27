import { createContext, useContext, useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const defaultConfig = {
  eventName: 'Photobooth',
  tagline: 'Tap to start',
  price: 3.00,
  currency: 'EUR',
  accentColor: '#e63946',
  logoUrl: '',
  brandText: '',
  showEmailCapture: true,
  showFilters: true,
  printWidth: '10cm',
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig)
  const [configLoaded, setConfigLoaded] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/config`)
      .then(r => r.json())
      .then(data => {
        setConfig(prev => ({ ...prev, ...data }))
        setConfigLoaded(true)
        applyTheme(data.accentColor || defaultConfig.accentColor)
      })
      .catch(() => {
        setConfigLoaded(true)
        applyTheme(defaultConfig.accentColor)
      })
  }, [])

  function applyTheme(accent) {
    document.documentElement.style.setProperty('--accent', accent)
    document.documentElement.style.setProperty('--accent-dim', accent + 'aa')
  }

  async function updateConfig(patch, pin) {
    const res = await fetch(`${API}/api/config/admin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error('Ongeldige PIN of serverfout')
    const updated = await res.json()
    setConfig(prev => ({ ...prev, ...updated }))
    applyTheme(updated.accentColor)
    return updated
  }

  async function verifyPin(pin) {
    const res = await fetch(`${API}/api/config/admin`, {
      headers: { 'x-admin-pin': pin },
    })
    return res.ok
  }

  async function getSessions(pin) {
    const res = await fetch(`${API}/api/sessions`, {
      headers: { 'x-admin-pin': pin },
    })
    return res.ok ? res.json() : []
  }

  return (
    <AppContext.Provider value={{ config, configLoaded, updateConfig, verifyPin, getSessions, API }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
