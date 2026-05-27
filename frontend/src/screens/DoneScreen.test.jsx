import { screen, fireEvent, act } from '@testing-library/react'
import { renderWithProviders } from '../test-utils.jsx'
import DoneScreen from './DoneScreen'

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }))
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}))

const mockPrintWindow = { document: { createElement: vi.fn(() => ({ style: {}, src: '', textContent: '' })), head: { appendChild: vi.fn() }, body: { appendChild: vi.fn() }, close: vi.fn() } }

describe('DoneScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(window, 'open').mockReturnValue(mockPrintWindow)
    sessionStorage.setItem('strip', 'data:image/jpeg;base64,stub')
    sessionStorage.setItem('paid', '1')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    sessionStorage.clear()
    mockNavigate.mockClear()
  })

  it('renders the success message', () => {
    renderWithProviders(<DoneScreen />)
    expect(screen.getByText('Gelukt!')).toBeInTheDocument()
    expect(screen.getByText(/wordt geprint/i)).toBeInTheDocument()
  })

  it('renders "Opnieuw printen" and "Klaar" buttons', () => {
    renderWithProviders(<DoneScreen />)
    expect(screen.getByRole('button', { name: /opnieuw printen/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /klaar/i })).toBeInTheDocument()
  })

  it('shows the countdown label', () => {
    renderWithProviders(<DoneScreen />)
    expect(screen.getByText(/terug naar start/i)).toBeInTheDocument()
  })

  it('auto-navigates to / after 30 seconds', () => {
    renderWithProviders(<DoneScreen />)
    act(() => vi.advanceTimersByTime(30_000))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('"Klaar" clears sessionStorage and navigates to /', () => {
    renderWithProviders(<DoneScreen />)
    fireEvent.click(screen.getByRole('button', { name: /klaar/i }))
    expect(sessionStorage.getItem('strip')).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('redirects to / when not paid', () => {
    sessionStorage.removeItem('paid')
    renderWithProviders(<DoneScreen />)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
