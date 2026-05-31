import React, { useState, useCallback, useEffect, useRef } from 'react'
import WelcomeScreen              from './screens/WelcomeScreen'
import CameraScreen               from './screens/CameraScreen'
import PreviewScreen              from './screens/PreviewScreen'
import PassportInstructionScreen  from './screens/PassportInstructionScreen'
import PassportCameraScreen       from './screens/PassportCameraScreen'
import PassportPreviewScreen      from './screens/PassportPreviewScreen'
import PaymentScreen              from './screens/PaymentScreen'
import DoneScreen                 from './screens/DoneScreen'
import AdminScreen                from './screens/AdminScreen'
import { buildPassportStrip }     from './utils/passportStrip'
import { getLicenseInfo }         from './utils/license'
import { getSettings, saveSettings } from './utils/settings'
import { LangContext }            from './context/LangContext'
import config                     from './utils/config'

function readPaymentResult() {
  const params = new URLSearchParams(window.location.search)
  const status = params.get('payment')
  if (!status) return null

  window.history.replaceState({}, '', window.location.pathname)

  if (status === 'success') {
    const urlToken    = params.get('token')
    const storedToken = localStorage.getItem('pb_pay_token')
    localStorage.removeItem('pb_pay_token')
    if (!urlToken || !storedToken || urlToken !== storedToken) return 'fail'
    return 'success'
  }
  return status
}

export default function App() {
  const [screen,    setScreen]    = useState(() => {
    const result = readPaymentResult()
    if (result === 'success') return 'done'
    // 'fail' zonder actieve sessie: stuur terug naar welcome (session is null bij herstart)
    return 'welcome'
  })
  const [session,    setSession]   = useState(null)
  const sessionRef = useRef(null)
  const lastActivityRef = useRef(Date.now())
  const [showAdmin,  setShowAdmin] = useState(false)
  const [licensed,   setLicensed]  = useState(false)
  const [licenseInfo, setLicInfo]  = useState(null)
  const [lang, setLang] = useState(() => getSettings().language || 'nl')

  const changeLang = useCallback((l) => {
    setLang(l)
    saveSettings({ language: l })
  }, [])

  const refreshLicense = useCallback(() => {
    getLicenseInfo().then(info => {
      setLicensed(info?.valid ?? false)
      setLicInfo(info)
    })
  }, [])

  useEffect(() => {
    refreshLicense()
    // Hercheck elke minuut zodat een verlopen licentie tijdens een sessie wordt herkend
    const id = setInterval(refreshLicense, 60_000)
    return () => clearInterval(id)
  }, [refreshLicense])
  useEffect(() => { sessionRef.current = session }, [session])

  // — Inactiviteits-reset —
  // Elke interactie werkt een timestamp bij; deze listener staat altijd aan.
  useEffect(() => {
    const bump = () => { lastActivityRef.current = Date.now() }
    const events = ['touchstart', 'mousedown', 'keydown', 'click']
    events.forEach(e => window.addEventListener(e, bump, { passive: true }))
    return () => events.forEach(e => window.removeEventListener(e, bump))
  }, [])

  // Na X sec zonder interactie terug naar het startscherm. Actief op alle
  // schermen behalve welcome (is al de start) en done (heeft een eigen
  // aftel-herstart). Payment is bewust WÉL gedekt: wie bij het betaalscherm
  // wegloopt zonder te betalen, keert ook terug. Een timestamp + interval is
  // robuuster dan een geneste timeout en kan niet vastlopen door re-renders.
  useEffect(() => {
    if (showAdmin) return
    if (screen === 'welcome' || screen === 'done') return

    lastActivityRef.current = Date.now() // teller vers bij binnenkomst scherm
    const secs = Math.max(10, config.inactivityResetSecs || 30)
    const id = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= secs * 1000) {
        clearInterval(id)
        setSession(null)
        setScreen('welcome')
      }
    }, 1000)
    return () => clearInterval(id)
  }, [screen, showAdmin])

  // — Fotostrip flow —
  const startStrip = useCallback(() => {
    setSession({ mode: 'strip', photos: [], stripDataUrl: null, paymentStatus: 'pending' })
    setScreen('camera')
  }, [])

  const onPhotosComplete = useCallback((photos) => {
    setSession(s => ({ ...s, photos }))
    setScreen('preview')
  }, [])

  const onStripReady = useCallback((stripDataUrl) => {
    setSession(s => ({ ...s, stripDataUrl }))
    setScreen('payment')
  }, [])

  // — Pasfoto flow —
  const startPassport = useCallback(() => {
    setSession({ mode: 'passport', photo: null, stripDataUrl: null, paymentStatus: 'pending' })
    setScreen('passport-instructions')
  }, [])

  const onPassportCameraReady = useCallback(() => {
    setScreen('passport-camera')
  }, [])

  const onPassportPhoto = useCallback(async (photoDataUrl) => {
    setSession(s => ({ ...s, photo: photoDataUrl }))
    setScreen('passport-preview')
  }, [])

  const onPassportPay = useCallback(async () => {
    const stripDataUrl = await buildPassportStrip(sessionRef.current?.photo)
    setSession(s => ({ ...s, stripDataUrl }))
    setScreen('payment')
  }, [])

  // — Gedeeld —
  const onPaymentSuccess = useCallback(() => {
    setSession(s => ({ ...s, paymentStatus: 'success' }))
    setScreen('done')
  }, [])

  const onPaymentFail = useCallback(() => {
    setSession(s => ({ ...s, paymentStatus: 'failed' }))
  }, [])

  const restart = useCallback(() => {
    setSession(null)
    setScreen('welcome')
  }, [])

  const paymentPrice = session?.mode === 'passport'
    ? config.passportPrice
    : config.price

  return (
    <LangContext.Provider value={lang}>
      {screen === 'welcome' && (
        <WelcomeScreen
          onStartStrip={startStrip}
          onStartPassport={startPassport}
          onAdmin={() => setShowAdmin(true)}
          licensed={licensed}
          licenseInfo={licenseInfo}
          lang={lang}
          onChangeLang={changeLang}
        />
      )}

      {/* Fotostrip */}
      {screen === 'camera' && (
        <CameraScreen onComplete={onPhotosComplete} onCancel={restart} />
      )}
      {screen === 'preview' && session && (
        <PreviewScreen
          photos={session.photos}
          onPay={onStripReady}
          onRetry={startStrip}
        />
      )}

      {/* Pasfoto */}
      {screen === 'passport-instructions' && (
        <PassportInstructionScreen
          onReady={onPassportCameraReady}
          onBack={restart}
        />
      )}
      {screen === 'passport-camera' && (
        <PassportCameraScreen
          onComplete={onPassportPhoto}
          onBack={() => setScreen('passport-instructions')}
        />
      )}
      {screen === 'passport-preview' && session && (
        <PassportPreviewScreen
          photoDataUrl={session.photo}
          onPay={onPassportPay}
          onRetake={() => setScreen('passport-camera')}
        />
      )}

      {/* Betaling & afsluiting (gedeeld) */}
      {screen === 'payment' && session && (
        <PaymentScreen
          stripDataUrl={session.stripDataUrl}
          paymentStatus={session.paymentStatus}
          price={paymentPrice}
          licensed={licensed}
          onSuccess={onPaymentSuccess}
          onFail={onPaymentFail}
          onBack={() => setScreen(session.mode === 'passport' ? 'passport-preview' : 'preview')}
        />
      )}
      {screen === 'done' && session && (
        <DoneScreen
          stripDataUrl={session.stripDataUrl}
          licensed={licensed}
          onRestart={restart}
        />
      )}

      {/* Verborgen print-container */}
      <div id="print-strip" style={{ display: 'none' }}>
        {session?.stripDataUrl && (
          <img src={session.stripDataUrl} alt="strip" />
        )}
      </div>

      {showAdmin && <AdminScreen onClose={() => {
        setShowAdmin(false)
        refreshLicense()
        setLang(getSettings().language || 'nl')
      }} />}
    </LangContext.Provider>
  )
}
