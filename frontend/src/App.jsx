import React, { useState, useCallback } from 'react'
import WelcomeScreen  from './screens/WelcomeScreen'
import CameraScreen   from './screens/CameraScreen'
import PreviewScreen  from './screens/PreviewScreen'
import PaymentScreen  from './screens/PaymentScreen'
import DoneScreen     from './screens/DoneScreen'

// Lees payment-callback uit URL (SumUp stuurt terug naar deze pagina)
function readPaymentResult() {
  const params = new URLSearchParams(window.location.search)
  const status = params.get('payment')
  if (status) {
    // Verwijder de query-string zonder page reload
    window.history.replaceState({}, '', window.location.pathname)
    return status   // 'success' | 'fail'
  }
  return null
}

export default function App() {
  const [screen,  setScreen]  = useState(() => {
    const result = readPaymentResult()
    if (result === 'success') return 'done'
    if (result === 'fail')    return 'payment'
    return 'welcome'
  })
  const [session, setSession] = useState(null)

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
    // Blijf op payment-scherm
  }, [])

  const restart = useCallback(() => {
    setSession(null)
    setScreen('welcome')
  }, [])

  return (
    <>
      {screen === 'welcome' && (
        <WelcomeScreen onStart={startSession} />
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
    </>
  )
}
