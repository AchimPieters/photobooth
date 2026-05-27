import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import App from './App'

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  )
})

// Mock every screen so routing tests are isolated from screen-level deps
vi.mock('./screens/WelcomeScreen',        () => ({ default: () => <div>WelcomeScreen</div> }))
vi.mock('./screens/CameraScreen',         () => ({ default: () => <div>CameraScreen</div> }))
vi.mock('./screens/FilterScreen',         () => ({ default: () => <div>FilterScreen</div> }))
vi.mock('./screens/PreviewScreen',        () => ({ default: () => <div>PreviewScreen</div> }))
vi.mock('./screens/EmailScreen',          () => ({ default: () => <div>EmailScreen</div> }))
vi.mock('./screens/PaymentScreen',        () => ({ default: () => <div>PaymentScreen</div> }))
vi.mock('./screens/DoneScreen',           () => ({ default: () => <div>DoneScreen</div> }))
vi.mock('./screens/admin/AdminPin',       () => ({ default: () => <div>AdminPin</div> }))
vi.mock('./screens/admin/AdminDashboard', () => ({ default: () => <div>AdminDashboard</div> }))

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider><App /></AppProvider>
    </MemoryRouter>
  )
}

describe('App routing', () => {
  it('renders WelcomeScreen at /',             () => { renderAt('/');                expect(screen.getByText('WelcomeScreen')).toBeInTheDocument() })
  it('renders CameraScreen at /camera',        () => { renderAt('/camera');           expect(screen.getByText('CameraScreen')).toBeInTheDocument() })
  it('renders FilterScreen at /filter',        () => { renderAt('/filter');           expect(screen.getByText('FilterScreen')).toBeInTheDocument() })
  it('renders PreviewScreen at /preview',      () => { renderAt('/preview');          expect(screen.getByText('PreviewScreen')).toBeInTheDocument() })
  it('renders EmailScreen at /email',          () => { renderAt('/email');            expect(screen.getByText('EmailScreen')).toBeInTheDocument() })
  it('renders PaymentScreen at /payment',      () => { renderAt('/payment');          expect(screen.getByText('PaymentScreen')).toBeInTheDocument() })
  it('renders DoneScreen at /done',            () => { renderAt('/done');             expect(screen.getByText('DoneScreen')).toBeInTheDocument() })
  it('renders AdminPin at /admin',             () => { renderAt('/admin');            expect(screen.getByText('AdminPin')).toBeInTheDocument() })
  it('renders AdminDashboard at /admin/dashboard', () => { renderAt('/admin/dashboard'); expect(screen.getByText('AdminDashboard')).toBeInTheDocument() })
  it('redirects unknown routes to /',          () => { renderAt('/nope');             expect(screen.getByText('WelcomeScreen')).toBeInTheDocument() })
})
