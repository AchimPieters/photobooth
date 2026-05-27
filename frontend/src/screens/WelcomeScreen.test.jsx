import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test-utils.jsx'
import WelcomeScreen from './WelcomeScreen'

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }))
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}))

describe('WelcomeScreen', () => {
  afterEach(() => mockNavigate.mockClear())

  it('renders event name and tagline', () => {
    renderWithProviders(<WelcomeScreen />)
    // Default config values from AppProvider
    expect(screen.getByText('Photobooth')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /begin/i })).toBeInTheDocument()
  })

  it('navigates to /camera when "Begin" is tapped', async () => {
    renderWithProviders(<WelcomeScreen />)
    fireEvent.click(screen.getByRole('button', { name: /begin/i }))
    // navigation happens after async session creation; check it was called
    await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/camera'))
  })

  it('navigates to /admin after 5 taps on the logo area', () => {
    renderWithProviders(<WelcomeScreen />)
    const header = screen.getByRole('button', { name: /begin/i }).parentElement.parentElement.firstChild
    for (let i = 0; i < 5; i++) fireEvent.click(header)
    expect(mockNavigate).toHaveBeenCalledWith('/admin')
  })
})
