import { Routes, Route, Navigate } from 'react-router-dom'
import WelcomeScreen from './screens/WelcomeScreen.jsx'
import CameraScreen from './screens/CameraScreen.jsx'
import PreviewScreen from './screens/PreviewScreen.jsx'
import PaymentScreen from './screens/PaymentScreen.jsx'
import DoneScreen from './screens/DoneScreen.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/camera" element={<CameraScreen />} />
      <Route path="/preview" element={<PreviewScreen />} />
      <Route path="/payment" element={<PaymentScreen />} />
      <Route path="/done" element={<DoneScreen />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
