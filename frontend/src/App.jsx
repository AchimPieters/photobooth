import React, { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal }           from 'react-dom'
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
import config, { paperForProduct } from './utils/config'
import { applyPrintPaper } from './utils/papers'

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

// De sessie (mode + gerenderde strip) leeft alleen in het geheugen, maar de
// SumUp-success-callback is een volledige page-load: state gaat verloren. We
// bewaren het daarom kort in localStorage vóór de redirect en herstellen het
// bij terugkeer, zodat DoneScreen de strip kan tonen én printen.
const PENDING_KEY = 'pb_pending_session'

function savePendingSession(session) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({
      mode: session.mode, stripDataUrl: session.stripDataUrl,
    }))
  } catch {} // quota-overschrijding: dan val we na success terug op welcome
}
function readPendingSession() {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function clearPendingSession() {
  localStorage.removeItem(PENDING_KEY)
}

export default function App() {
  const [boot] = useState(() => {
    const result = readPaymentResult()
    if (result === 'success') {
      // Strip + mode terughalen die vóór de redirect zijn bewaard.
      const pending = readPendingSession()
      clearPendingSession()
      if (pending?.stripDataUrl) {
        return { screen: 'done', session: { ...pending, paymentStatus: 'success' } }
      }
    } else {
      // 'fail' of normale start: eventuele restanten opruimen.
      clearPendingSession()
    }
    return { screen: 'welcome', session: null }
  })
  const [screen,    setScreen]    = useState(boot.screen)
  const [session,    setSession]   = useState(boot.session)
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

  // Zodra we op het betaalscherm staan: sessie bewaren zodat de strip de
  // SumUp-redirect overleeft en op DoneScreen geprint kan worden.
  useEffect(() => {
    if (screen === 'payment' && session?.stripDataUrl) savePendingSession(session)
  }, [screen, session])

  // Stem het print-papierformaat (@page) af op het product van de sessie,
  // zodat de SELPHY met het juiste formaat print. Bij geen sessie: strip-default.
  useEffect(() => {
    applyPrintPaper(paperForProduct(session?.mode === 'passport' ? 'passport' : 'strip'))
  }, [session?.mode])

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
    const stripDataUrl = await buildPassportStrip(sessionRef.current?.photo, { paper: paperForProduct('passport') })
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
    clearPendingSession()
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
          productTitle={session.mode === 'passport' ? "Pasfoto's" : 'Fotostrip'}
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

      {/* Verborgen print-container — via een portal als directe body-child.
          Anders zou de @media print-regel `body > * { display:none }` op #root
          ook deze geneste container verbergen (een display:none-ouder kan niet
          door een kind worden opgeheven), en bleef de print leeg. */}
      {createPortal(
        <div id="print-strip" style={{ display: 'none' }}>
          {session?.stripDataUrl && (
            <img src={session.stripDataUrl} alt="strip" />
          )}
        </div>,
        document.body,
      )}

      {showAdmin && <AdminScreen onClose={() => {
        setShowAdmin(false)
        refreshLicense()
        setLang(getSettings().language || 'nl')
      }} />}
    </LangContext.Provider>
  )
}
