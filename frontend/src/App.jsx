import React, { useState, useCallback } from 'react'
import WelcomeScreen  from './screens/WelcomeScreen'
import CameraScreen   from './screens/CameraScreen'
import PreviewScreen  from './screens/PreviewScreen'
import PaymentScreen  from './screens/PaymentScreen'
import DoneScreen     from './screens/DoneScreen'
import AdminScreen    from './screens/AdminScreen'

function readPaymentResult() {
  const params = new URLSearchParams(window.location.search)
  const status = params.get('payment')
  if (!status) return null

  window.history.replaceState({}, '', window.location.pathname)

  if (status === 'success') {
    const urlToken    = params.get('token')
    const storedToken = localStorage.getItem('pb_pay_token')
    localStorage.removeItem('pb_pay_token')
    // Token moet overeenkomen om betaling te accepteren
    if (!urlToken || !storedToken || urlToken !== storedToken) return 'fail'
    return 'success'
  }
  return status
}

export default function App() {
  const [screen,     setScreen]     = useState(() => {
    const result = readPaymentResult()
    if (result === 'success') return 'done'
    if (result === 'fail')    return 'payment'
    return 'welcome'
  })
  const [session,    setSession]    = useState(null)
  const [showAdmin,  setShowAdmin]  = useState(false)

  const startSession = useCallback(() => {
    setSession({ photos: [], stripDataUrl: null, paymentStatus: 'pending' })
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

  return (
    <>
      {screen === 'welcome' && (
        <WelcomeScreen onStart={startSession} onAdmin={() => setShowAdmin(true)} />
      )}
      {screen === 'camera' && (
        <CameraScreen onComplete={onPhotosComplete} onCancel={restart} />
      )}
      {screen === 'preview' && session && (
        <PreviewScreen
          photos={session.photos}
          onPay={onStripReady}
          onRetry={startSession}
        />
      )}
      {screen === 'payment' && session && (
        <PaymentScreen
          stripDataUrl={session.stripDataUrl}
          paymentStatus={session.paymentStatus}
          onSuccess={onPaymentSuccess}
          onFail={onPaymentFail}
          onBack={() => setScreen('preview')}
        />
      )}
      {screen === 'done' && session && (
        <DoneScreen
          stripDataUrl={session.stripDataUrl}
          onRestart={restart}
        />
      )}

      {/* Verborgen print-container */}
      <div id="print-strip" style={{ display: 'none' }}>
        {session?.stripDataUrl && (
          <img src={session.stripDataUrl} alt="Fotostrip" />
        )}
      </div>

      {showAdmin && <AdminScreen onClose={() => setShowAdmin(false)} />}
    </>
  )
}
