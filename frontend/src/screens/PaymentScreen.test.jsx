import { screen, fireEvent } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../test-utils.jsx'
import PaymentScreen from './PaymentScreen'

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }))
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}))

function renderAt(path) {
  return renderWithProviders(
    <Routes>
      <Route path="/payment" element={<PaymentScreen />} />
    </Routes>,
    { route: path }
  )
}

describe('PaymentScreen', () => {
  afterEach(() => mockNavigate.mockClear())

  it('renders price and pay button', () => {
    renderAt('/payment')
    expect(screen.getByText(/€3\.00/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /betalen/i })).toBeInTheDocument()
  })

  it('shows "Te betalen" label', () => {
    renderAt('/payment')
    expect(screen.getByText(/te betalen/i)).toBeInTheDocument()
  })

  it('shows success UI when ?payment=success', () => {
    renderAt('/payment?payment=success')
    expect(screen.getByText('Betaling geslaagd!')).toBeInTheDocument()
  })

  it('shows fail UI when ?payment=fail', () => {
    renderAt('/payment?payment=fail')
    expect(screen.getByText('Betaling mislukt')).toBeInTheDocument()
  })

  it('"Opnieuw proberen" resets to idle state', () => {
    renderAt('/payment?payment=fail')
    fireEvent.click(screen.getByRole('button', { name: /opnieuw proberen/i }))
    expect(screen.getByText(/€3\.00/)).toBeInTheDocument()
  })

  it('"← Terug" navigates to /preview from fail state', () => {
    renderAt('/payment?payment=fail')
    fireEvent.click(screen.getByRole('button', { name: /terug/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/preview')
  })

  it('dev mode: no sumupKey skips straight to /done', () => {
    renderAt('/payment')
    fireEvent.click(screen.getByRole('button', { name: /betalen/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/done')
  })
})
