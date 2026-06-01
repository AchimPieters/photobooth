/**
   Copyright 2026 Achim Pieters | StudioPieters®

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
   CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

   for more information visit https://www.studiopieters.nl
 **/

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
