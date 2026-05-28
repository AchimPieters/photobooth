import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * Beheert getUserMedia camera-toegang.
 * Werkt op iOS 12 Safari via HTTPS.
 */
export function useCamera() {
  const videoRef      = useRef(null)
  const streamRef     = useRef(null)
  const [ready, setReady]   = useState(false)
  const [error, setError]   = useState(null)

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',       // Selfie-camera
          width:  { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', '')  // iOS vereist dit
        await videoRef.current.play()
        setReady(true)
        setError(null)
      }
    } catch (err) {
      setError(err.name === 'NotAllowedError'
        ? 'camera-denied'
        : 'camera-unavailable')
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setReady(false)
  }, [])

  // Maak foto — tekent huidig videoframe op canvas
  const takePhoto = useCallback(() => {
    const video = videoRef.current
    if (!video || !ready) return null

    const canvas = document.createElement('canvas')
    canvas.width  = video.videoWidth  || video.width  || 1280
    canvas.height = video.videoHeight || video.height || 960
    const ctx = canvas.getContext('2d')

    // Spiegel horizontaal (selfie-mode)
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/jpeg', 0.92)
  }, [ready])

  // Cleanup bij unmount
  useEffect(() => () => stopCamera(), [stopCamera])

  return { videoRef, ready, error, startCamera, stopCamera, takePhoto }
}
