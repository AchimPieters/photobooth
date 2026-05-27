import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import WelcomeScreen   from './screens/WelcomeScreen.jsx'
import CameraScreen    from './screens/CameraScreen.jsx'
import FilterScreen    from './screens/FilterScreen.jsx'
import PreviewScreen   from './screens/PreviewScreen.jsx'
import EmailScreen     from './screens/EmailScreen.jsx'
import PaymentScreen   from './screens/PaymentScreen.jsx'
import DoneScreen      from './screens/DoneScreen.jsx'
import AdminPin        from './screens/admin/AdminPin.jsx'
import AdminDashboard  from './screens/admin/AdminDashboard.jsx'

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/"         element={<WelcomeScreen />} />
        <Route path="/camera"   element={<CameraScreen />} />
        <Route path="/filter"   element={<FilterScreen />} />
        <Route path="/preview"  element={<PreviewScreen />} />
        <Route path="/email"    element={<EmailScreen />} />
        <Route path="/payment"  element={<PaymentScreen />} />
        <Route path="/done"     element={<DoneScreen />} />
        <Route path="/admin"    element={<AdminPin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*"         element={<Navigate to="/" />} />
      </Routes>
    </AppProvider>
  )
}
